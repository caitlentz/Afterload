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
    const { data, error } = await supabase.rpc('check_report_released', {
      p_email: email.toLowerCase(),
    });
    if (error) {
      console.error('checkReportReleased RPC error:', error);
      return false;
    }
    return data === true;
  } catch (e) {
    console.error('checkReportReleased error:', e);
    return false;
  }
}

// ------------------------------------------------------------------
// DELETE ADMIN NOTE (e.g., to unmark delivered)
// ------------------------------------------------------------------

export async function deleteAdminNote(noteId: string) {
  const { error } = await supabase.rpc('admin_delete_note', {
    p_note_id: noteId,
  });
  if (error) console.error('deleteAdminNote error:', error);
  return !error;
}

// ------------------------------------------------------------------
// REPORT OVERRIDES (admin editing of report sections)
// ------------------------------------------------------------------

export type ReportOverride = {
  section_key: string;
  custom_content: string;
  updated_at?: string;
};

export async function saveReportOverride(clientId: string, sectionKey: string, content: string) {
  const { error } = await supabase.rpc('admin_save_report_override', {
    p_client_id: clientId,
    p_section_key: sectionKey,
    p_content: content,
  });
  if (error) console.error('saveReportOverride error:', error);
  return !error;
}

export async function deleteReportOverride(clientId: string, sectionKey: string) {
  const { error } = await supabase.rpc('admin_delete_report_override', {
    p_client_id: clientId,
    p_section_key: sectionKey,
  });
  if (error) console.error('deleteReportOverride error:', error);
  return !error;
}

export async function fetchReportOverrides(clientId: string): Promise<ReportOverride[]> {
  const { data, error } = await supabase.rpc('admin_get_report_overrides', {
    p_client_id: clientId,
  });
  if (error) {
    console.error('fetchReportOverrides error:', error);
    return [];
  }
  return (data as ReportOverride[]) || [];
}

export async function fetchReportOverridesByEmail(email: string): Promise<ReportOverride[]> {
  const { data, error } = await supabase.rpc('get_report_overrides_by_email', {
    p_email: email.toLowerCase(),
  });
  if (error) {
    console.error('fetchReportOverridesByEmail error:', error);
    return [];
  }
  return (data as ReportOverride[]) || [];
}

// ------------------------------------------------------------------
// PAYMENT STATUS
// ------------------------------------------------------------------

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
    // Use SECURITY DEFINER RPC to bypass RLS — the anon key cannot read
    // the payments table directly, but this function can.
    const { data, error } = await supabase.rpc('check_payment_status', {
      lookup_email: email,
    });

    if (error) {
      console.error('getPaymentStatus RPC error:', error);
      return result;
    }

    if (!data) return result;

    result.depositPaid = data.deposit_paid || false;
    result.balancePaid = data.balance_paid || false;
    result.depositDate = data.deposit_date || null;
    result.balanceDate = data.balance_date || null;

    // "paid" = full payment OR deposit + balance
    if (data.full_paid) {
      result.paid = true;
      result.paidDate = data.full_date;
    } else if (data.deposit_paid && data.balance_paid) {
      result.paid = true;
      result.paidDate = data.balance_date;
    }
  } catch (e) {
    console.error('getPaymentStatus unexpected error:', e);
  }

  return result;
}

// ------------------------------------------------------------------
// FETCH INTAKE BY EMAIL
// Returns the most recent intake answers for a client (for returning
// users who no longer have intakeData in memory).
// Uses SECURITY DEFINER RPC to bypass RLS on intake_responses.
// ------------------------------------------------------------------
export async function fetchIntakeByEmail(email: string): Promise<IntakeResponse | null> {
  try {
    const { data, error } = await supabase.rpc('fetch_intake_by_email', {
      p_email: email.toLowerCase(),
    });
    if (error) {
      console.error('fetchIntakeByEmail RPC error:', error);
      return null;
    }
    return (data as IntakeResponse) || null;
  } catch (e) {
    console.error('fetchIntakeByEmail error:', e);
    return null;
  }
}
