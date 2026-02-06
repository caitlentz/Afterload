// Supabase Edge Function: stripe-webhook
// Receives Stripe webhook events and writes payment status to the payments table.
//
// Required Supabase secrets (set via Dashboard → Edge Functions → Secrets):
//   STRIPE_WEBHOOK_SECRET  — from Stripe Dashboard → Webhooks → Signing secret
//   SUPABASE_SERVICE_ROLE_KEY — from Supabase Dashboard → Settings → API
//   SUPABASE_URL — auto-injected by Supabase

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2024-06-20",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

Deno.serve(async (req: Request) => {
  // Only accept POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  // Verify the webhook signature
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log(`Received Stripe event: ${event.type} (${event.id})`);

  // Handle checkout.session.completed — this fires when a Buy Button payment succeeds
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const email = session.customer_email || session.customer_details?.email || null;
    const amountTotal = session.amount_total || 0; // in cents
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id || null;

    if (!email) {
      console.error("No email found on checkout session:", session.id);
      return new Response("No email on session", { status: 200 }); // 200 so Stripe doesn't retry
    }

    // Determine payment type based on amount
    // $300 deposit = 30000 cents, $900 balance = 90000 cents
    let paymentType: "deposit" | "balance" = "deposit";
    if (amountTotal >= 85000) {
      paymentType = "balance";
    }

    // Idempotency: check if we already processed this event
    const { data: existing } = await supabase
      .from("payments")
      .select("id")
      .eq("stripe_event_id", event.id)
      .maybeSingle();

    if (existing) {
      console.log(`Event ${event.id} already processed, skipping.`);
      return new Response("Already processed", { status: 200 });
    }

    // Look up or create the client
    const emailLower = email.toLowerCase();

    // Try to find existing client
    let { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("email", emailLower)
      .maybeSingle();

    // If no client exists, create one (they might have paid before doing intake)
    if (!client) {
      const { data: newClient } = await supabase
        .from("clients")
        .insert({ email: emailLower })
        .select("id")
        .single();
      client = newClient;
    }

    // Insert payment record
    const { error: insertError } = await supabase.from("payments").insert({
      client_id: client?.id || null,
      email: emailLower,
      stripe_payment_intent_id: paymentIntentId,
      stripe_checkout_session_id: session.id,
      payment_type: paymentType,
      amount_cents: amountTotal,
      currency: session.currency || "usd",
      status: "succeeded",
      stripe_event_id: event.id,
      metadata: {
        stripe_customer_id: session.customer,
        payment_method_types: session.payment_method_types,
        created: session.created,
      },
    });

    if (insertError) {
      console.error("Failed to insert payment:", insertError);
      return new Response("Database error", { status: 500 });
    }

    console.log(
      `✅ Payment recorded: ${paymentType} — $${(amountTotal / 100).toFixed(2)} from ${emailLower}`
    );
  }

  // Handle payment_intent.payment_failed
  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    console.log(`Payment failed: ${paymentIntent.id}`);
    // We could record this too, but for now just log it
  }

  // Handle charge.refunded
  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntentId =
      typeof charge.payment_intent === "string"
        ? charge.payment_intent
        : charge.payment_intent?.id || null;

    if (paymentIntentId) {
      const { error } = await supabase
        .from("payments")
        .update({ status: "refunded", updated_at: new Date().toISOString() })
        .eq("stripe_payment_intent_id", paymentIntentId);

      if (error) {
        console.error("Failed to update refund status:", error);
      } else {
        console.log(`✅ Refund recorded for PI: ${paymentIntentId}`);
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
