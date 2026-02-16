import React from 'react';
import { IntakeResponse } from './diagnosticEngine';

// ─── Types ──────────────────────────────────────────────────────────

export type PaymentRecord = {
  id: string;
  email: string;
  payment_type: string;
  amount_cents: number;
  status: string;
  created_at: string;
};

export type ClientStage = 'new' | 'preview_done' | 'deposit_paid' | 'clarity_done' | 'balance_paid' | 'delivered';

export type ClientData = {
  id: string;
  email: string;
  first_name: string | null;
  business_name: string | null;
  created_at: string;
  intake_responses: Array<{
    id: string;
    mode: string;
    track: string;
    answers: IntakeResponse;
    created_at: string;
  }>;
  diagnostic_results: Array<{
    id: string;
    result_type: string;
    report: any;
    created_at: string;
  }>;
  admin_notes: Array<{
    id: string;
    note: string;
    created_at: string;
  }>;
};

// ─── Constants ──────────────────────────────────────────────────────

export const STAGE_CONFIG: Record<ClientStage, { label: string; color: string; order: number }> = {
  new:             { label: 'New Lead',      color: 'bg-gray-100 text-gray-600',   order: 0 },
  preview_done:    { label: 'Preview Done',  color: 'bg-blue-100 text-blue-700',   order: 1 },
  deposit_paid:    { label: 'Deposit Paid',  color: 'bg-emerald-100 text-emerald-700', order: 2 },
  clarity_done:    { label: 'Clarity Done',    color: 'bg-purple-100 text-purple-700', order: 3 },
  balance_paid:    { label: 'Balance Paid',  color: 'bg-amber-100 text-amber-700', order: 4 },
  delivered:       { label: 'Delivered',     color: 'bg-green-100 text-green-700',  order: 5 },
};

export const REPORT_SECTIONS = [
  { key: 'executive_summary', label: 'Executive Summary', getAutoContent: (r: any) => r?.executiveSummary || '' },
  { key: 'primary_constraint', label: 'Primary Constraint', getAutoContent: (r: any) => r?.constraintDescription || '' },
  { key: 'success_trap', label: 'Success Trap', getAutoContent: (r: any) => r?.successTrapNarrative || '' },
  { key: 'pressure_point_0', label: 'Pressure Point 1', getAutoContent: (r: any) => r?.enrichedPressurePoints?.[0]?.finding || '' },
  { key: 'pressure_point_1', label: 'Pressure Point 2', getAutoContent: (r: any) => r?.enrichedPressurePoints?.[1]?.finding || '' },
  { key: 'pressure_point_2', label: 'Pressure Point 3', getAutoContent: (r: any) => r?.enrichedPressurePoints?.[2]?.finding || '' },
  { key: 'phase_0', label: 'Roadmap Phase 1', getAutoContent: (r: any) => r?.enrichedPhases?.[0] ? `${r.enrichedPhases[0].name}: ${r.enrichedPhases[0].description}` : '' },
  { key: 'phase_1', label: 'Roadmap Phase 2', getAutoContent: (r: any) => r?.enrichedPhases?.[1] ? `${r.enrichedPhases[1].name}: ${r.enrichedPhases[1].description}` : '' },
  { key: 'phase_2', label: 'Roadmap Phase 3', getAutoContent: (r: any) => r?.enrichedPhases?.[2] ? `${r.enrichedPhases[2].name}: ${r.enrichedPhases[2].description}` : '' },
  { key: 'additional_notes', label: 'Additional Notes', getAutoContent: () => '' },
];

// ─── Helper Functions ───────────────────────────────────────────────

export function getClientStage(client: any, payments: PaymentRecord[]): ClientStage {
  const clientPayments = payments.filter(p => p.email?.toLowerCase() === client.email?.toLowerCase() && p.status === 'succeeded');
  const hasDeposit = clientPayments.some(p => p.payment_type === 'deposit');
  const hasBalance = clientPayments.some(p => p.payment_type === 'balance');
  const hasClaritySession = client.intake_responses?.some((r: any) => r.mode === 'deep');
  const isDelivered = client.admin_notes?.some((n: any) => n.note?.includes('[delivered]'));

  if (isDelivered) return 'delivered';
  if (hasBalance) return 'balance_paid';
  if (hasClaritySession) return 'clarity_done';
  if (hasDeposit) return 'deposit_paid';
  if (client.intake_responses?.length > 0) return 'preview_done';
  return 'new';
}

export function getBusinessInfo(answers: any) {
  return {
    businessName: answers?.businessName || answers?.business_name || null,
    website: answers?.website || null,
    industryType: answers?.specificType || answers?.business_model || answers?.business_type || null,
    firstName: answers?.firstName || answers?.first_name || null,
    email: answers?.email || null,
  };
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
}

export function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
  });
}

export function formatCents(cents: number) {
  const dollars = cents / 100;
  return dollars % 1 === 0 ? `$${dollars.toFixed(0)}` : `$${dollars.toFixed(2)}`;
}

export function scoreColor(level: string): string {
  if (['CRITICAL', 'HIGH', 'RED', 'BROKEN', 'BLOCKED'].includes(level)) return 'bg-red-100 text-red-700';
  if (['MODERATE', 'YELLOW', 'FRAGILE', 'NOT_YET', 'ADEQUATE'].includes(level)) return 'bg-amber-100 text-amber-700';
  if (['LOW', 'GREEN', 'STRONG', 'READY', 'CLOSE'].includes(level)) return 'bg-green-100 text-green-700';
  return 'bg-gray-100 text-gray-500';
}

// ─── Score Badge Component ──────────────────────────────────────────

export function ScoreBadge({ label, level, score }: { label: string; level: string; score: number }) {
  return React.createElement('div', { className: 'flex items-center justify-between py-2 px-3 bg-white/60 rounded-xl' },
    React.createElement('span', { className: 'text-xs font-medium text-brand-dark/60' }, label),
    React.createElement('div', { className: 'flex items-center gap-2' },
      React.createElement('span', { className: 'text-[10px] font-bold text-brand-dark/40' }, `${score}/100`),
      React.createElement('span', { className: `text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${scoreColor(level)}` }, level)
    )
  );
}
