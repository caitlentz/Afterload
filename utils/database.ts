import { supabase } from './supabase';
import { IntakeResponse } from './diagnosticEngine';
import { PreviewResult } from './previewEngine';

// ------------------------------------------------------------------
// SAVE CLIENT
// Upserts the client record (creates or updates by email)
// ------------------------------------------------------------------
export async function saveClient(email: string, data: Partial<IntakeResponse>) {
  const { error } = await supabase
    .from('clients')
    .upsert(
      {
        email,
        first_name: data.firstName || null,
        business_name: data.businessName || null,
        website: data.website || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    );

  if (error) console.error('saveClient error:', error);
  return !error;
}

// ------------------------------------------------------------------
// SAVE INTAKE RESPONSE
// Stores all answers as JSONB. Mode = 'initial' or 'deep'.
// ------------------------------------------------------------------
export async function saveIntakeResponse(
  email: string,
  mode: 'initial' | 'deep',
  answers: IntakeResponse,
  track?: 'A' | 'B' | 'C'
) {
  // First ensure client exists
  await saveClient(email, answers);

  // Get client ID
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('email', email)
    .single();

  const { data, error } = await supabase
    .from('intake_responses')
    .insert({
      client_id: client?.id || null,
      email,
      mode,
      track: track || null,
      answers,
    })
    .select('id')
    .single();

  if (error) console.error('saveIntakeResponse error:', error);
  return data?.id || null;
}

// ------------------------------------------------------------------
// SAVE DIAGNOSTIC RESULT
// Stores the automated analysis output as JSONB.
// ------------------------------------------------------------------
export async function saveDiagnosticResult(
  email: string,
  resultType: 'preview' | 'full',
  report: PreviewResult | any,
  intakeResponseId?: string
) {
  // Get client ID
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('email', email)
    .single();

  const { error } = await supabase
    .from('diagnostic_results')
    .insert({
      client_id: client?.id || null,
      intake_response_id: intakeResponseId || null,
      email,
      result_type: resultType,
      report,
    });

  if (error) console.error('saveDiagnosticResult error:', error);
  return !error;
}

// ------------------------------------------------------------------
// FETCH ALL CLIENTS (for admin view)
// Uses a SECURITY DEFINER RPC function that bypasses RLS.
// This way the admin dashboard can see all clients without needing
// the service role key on the client side.
// ------------------------------------------------------------------
export async function fetchAllClients() {
  const { data, error } = await supabase.rpc('admin_fetch_all_clients');

  if (error) {
    console.error('fetchAllClients error:', error);
    return [];
  }

  // The RPC returns a jsonb array — Supabase client returns it as parsed JSON
  return (data as any[]) || [];
}

// ------------------------------------------------------------------
// SAVE ADMIN NOTE
// Uses a SECURITY DEFINER RPC to bypass RLS on admin_notes table.
// ------------------------------------------------------------------
export async function saveAdminNote(clientId: string, note: string) {
  const { error } = await supabase.rpc('admin_save_note', {
    p_client_id: clientId,
    p_note: note,
  });

  if (error) console.error('saveAdminNote error:', error);
  return !error;
}

// ------------------------------------------------------------------
// PAYMENT STATUS
// Checks the payments table for this user's deposit & balance status.
// Returns { depositPaid, balancePaid, depositDate, balanceDate }
// ------------------------------------------------------------------
export interface PaymentStatus {
  depositPaid: boolean;
  balancePaid: boolean;
  depositDate: string | null;
  balanceDate: string | null;
  paid: boolean;
  paidDate: string | null;
}

// ------------------------------------------------------------------
// FETCH ALL PAYMENTS (for admin view)
// Uses a SECURITY DEFINER RPC that bypasses RLS.
// ------------------------------------------------------------------
export async function fetchAllPayments() {
  const { data, error } = await supabase.rpc('admin_fetch_all_payments');

  if (error) {
    console.error('fetchAllPayments error:', error);
    return [];
  }
  return (data as any[]) || [];
}

// ------------------------------------------------------------------
// SAVE ADMIN NOTE WITH TAG
// Saves a note with an optional tag (e.g. 'delivered', 'status', 'note')
// Uses the same SECURITY DEFINER RPC as saveAdminNote.
// ------------------------------------------------------------------
export async function saveAdminTaggedNote(clientId: string, note: string, tag: string = 'note') {
  const { error } = await supabase.rpc('admin_save_note', {
    p_client_id: clientId,
    p_note: `[${tag}] ${note}`,
  });

  if (error) console.error('saveAdminTaggedNote error:', error);
  return !error;
}

// ------------------------------------------------------------------
// CHECK REPORT RELEASED
// Queries admin_notes for the [report-released] tag for this client.
// Returns true if the admin has released the report for viewing.
// ------------------------------------------------------------------
export async function checkReportReleased(email: string): Promise<boolean> {
  try {
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (!client) return false;

    const { data: notes, error } = await supabase
      .from('admin_notes')
      .select('note')
      .eq('client_id', client.id);

    if (error || !notes) return false;

    return notes.some((n: any) => n.note?.includes('[report-released]'));
  } catch (e) {
    console.error('checkReportReleased error:', e);
    return false;
  }
}

export async function getPaymentStatus(email: string): Promise<PaymentStatus> {
  const result: PaymentStatus = {
    depositPaid: false,
    balancePaid: false,
    depositDate: null,
    balanceDate: null,
    paid: false,
    paidDate: null,
  };

  try {
    const { data: payments, error } = await supabase
      .from('payments')
      .select('payment_type, status, created_at')
      .eq('email', email.toLowerCase())
      .eq('status', 'succeeded')
      .order('created_at', { ascending: true });

    if (error) {
      // Table might not exist yet — fail gracefully
      console.error('getPaymentStatus error:', error);
      return result;
    }

    if (!payments || payments.length === 0) return result;

    for (const p of payments) {
      if (p.payment_type === 'deposit') {
        result.depositPaid = true;
        result.depositDate = p.created_at;
      }
      if (p.payment_type === 'balance') {
        result.balancePaid = true;
        result.balanceDate = p.created_at;
      }
      if (p.payment_type === 'full') {
        result.paid = true;
        result.paidDate = p.created_at;
      }
    }
  } catch (e) {
    console.error('getPaymentStatus unexpected error:', e);
  }

  return result;
}
