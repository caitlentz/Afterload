// Supabase Edge Function: notify-submission
// Sends an email notification to afterchaos@afterload.io when:
//   - A client submits an initial or deep intake
//   - A payment is completed (called from stripe-webhook)
//
// Required Supabase secrets:
//   RESEND_API_KEY — API key from resend.com (free tier: 100 emails/day)
//     OR use SMTP_* secrets if using Supabase built-in SMTP
//
// Called via: POST with JSON body { email, mode, track?, clientName? }

const ADMIN_EMAIL = "afterchaos@afterload.io";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { email, mode, track, clientName } = await req.json();

    if (!email || !mode) {
      return new Response("Missing email or mode", { status: 400 });
    }

    const displayName = clientName || email;
    const timestamp = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      dateStyle: "medium",
      timeStyle: "short",
    });

    let subject: string;
    let body: string;

    if (mode === "payment") {
      subject = `Payment received: ${displayName}`;
      body = [
        `Payment received from ${displayName}`,
        `Email: ${email}`,
        `Type: ${track || "full"}`,
        `Time: ${timestamp}`,
        "",
        `View in admin: https://afterloaddiagnostics.com/?admin=true`,
      ].join("\n");
    } else {
      subject = `New ${mode} intake: ${displayName}${track ? ` [Track ${track}]` : ""}`;
      body = [
        `${displayName} completed a ${mode} intake submission.`,
        "",
        `Email: ${email}`,
        track ? `Track: ${track}` : null,
        `Time: ${timestamp}`,
        "",
        `View in admin: https://afterloaddiagnostics.com/?admin=true`,
      ]
        .filter(Boolean)
        .join("\n");
    }

    // Try Resend first (preferred), fall back to basic fetch to any SMTP relay
    const resendKey = Deno.env.get("RESEND_API_KEY");

    if (resendKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Afterload Notifications <notifications@afterload.io>",
          to: [ADMIN_EMAIL],
          subject,
          text: body,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("Resend error:", err);
        return new Response(`Email send failed: ${err}`, { status: 500 });
      }
    } else {
      // No email service configured — just log
      console.log(`NOTIFICATION (no email service configured):\n  To: ${ADMIN_EMAIL}\n  Subject: ${subject}\n  Body: ${body}`);
    }

    console.log(`Notification sent: ${subject}`);
    return new Response(JSON.stringify({ sent: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("notify-submission error:", err);
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
});
