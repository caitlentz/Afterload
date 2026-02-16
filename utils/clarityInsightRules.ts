import type { IntakeResponse } from './diagnosticEngine';

// ------------------------------------------------------------------
// CLARITY INSIGHT RULES
// Flags contradictions / high-signal pairings from deep-dive answers.
// Consumed by the full report generator to enrich analysis.
// ------------------------------------------------------------------

export type InsightSeverity = 'HIGH' | 'MEDIUM' | 'LOW';

export type InsightFlag = {
  id: string;
  severity: InsightSeverity;
  label: string;
  detail: string;
  evidenceQuestionIds: string[];
};

// ── Condition matching (shared with previewEngine pattern) ──

type Condition = {
  field: keyof IntakeResponse;
  includes?: string;
  includesAny?: string[];
  numericGte?: number;
  notIncludes?: string;
};

function str(val: unknown): string {
  return (val ?? '').toString();
}

function num(val: unknown): number {
  const n = parseFloat(str(val).replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
}

function matchCondition(data: IntakeResponse, c: Condition): boolean {
  const raw = data[c.field];
  const v = str(raw).toLowerCase();

  if (!v && c.numericGte === undefined) return false;

  if (c.includes && !v.includes(c.includes.toLowerCase())) return false;
  if (c.includesAny && !c.includesAny.some(s => v.includes(s.toLowerCase()))) return false;
  if (c.notIncludes && v.includes(c.notIncludes.toLowerCase())) return false;
  if (c.numericGte !== undefined && num(raw) < c.numericGte) return false;

  return true;
}

// ── Rule definition ──

type InsightRule = {
  id: string;
  severity: InsightSeverity;
  label: string;
  detail: string;
  when: Condition[];
  evidenceQuestionIds: string[];
};

// ------------------------------------------------------------------
// RULE TABLE
// ------------------------------------------------------------------

const INSIGHT_RULES: InsightRule[] = [
  // 1) Tool sprawl + unused stack
  {
    id: 'tool_sprawl',
    severity: 'MEDIUM',
    label: 'Tool sprawl + unused stack',
    detail: 'The business is paying for tools it doesn\'t use, and the overall tool count is high. This creates cost leakage and cognitive overhead.',
    when: [
      { field: 'tool_zombie_check', includes: 'Yes' },
      { field: 'tool_count', numericGte: 10 },
    ],
    evidenceQuestionIds: ['tool_zombie_check', 'tool_zombie_count', 'tool_count'],
  },

  // 2) No intake system + high retrieval tax
  {
    id: 'intake_retrieval_gap',
    severity: 'HIGH',
    label: 'No intake system + high retrieval tax',
    detail: 'Leads live in inboxes/DMs and the team spends 6+ hours per week searching for information. There\'s no single source of truth.',
    when: [
      { field: 'search_friction', includes: '6+' },
      { field: 'lead_gen_intake', includes: 'inbox' },
    ],
    evidenceQuestionIds: ['search_friction', 'lead_gen_intake'],
  },

  // 3) Founder as quality gate
  {
    id: 'founder_quality_gate',
    severity: 'HIGH',
    label: 'Founder as sole quality gate',
    detail: 'The business collapses without the founder, and the founder reviews everything before it reaches the client. The quality gate and the single point of failure are the same person.',
    when: [
      { field: 'bus_factor_30_day', includes: 'collapses' },
      { field: 'review_quality_control', includes: 'I review everything' },
    ],
    evidenceQuestionIds: ['bus_factor_30_day', 'review_quality_control'],
  },

  // 4) Rework loop + founder QC trap
  {
    id: 'rework_qc_trap',
    severity: 'HIGH',
    label: 'Rework loop + founder QC trap',
    detail: 'More than 50% of work is returned for revision, and the founder reviews everything. The QC dependency creates a self-reinforcing rework cycle.',
    when: [
      { field: 'rework_loop', includes: '50%' },
      { field: 'review_quality_control', includes: 'I review everything' },
    ],
    evidenceQuestionIds: ['rework_loop', 'review_quality_control'],
  },

  // 5) Financial stability, human instability
  {
    id: 'cash_vs_burnout',
    severity: 'HIGH',
    label: 'Financial stability, human instability',
    detail: 'Cash reserves look stable, but the founder is burning out or already there. The business is financially sound but operationally unsustainable.',
    when: [
      { field: 'runway_stress_test', includesAny: ['Stable', 'Secure'] },
      { field: 'energy_runway', includesAny: ['already burning out', '6-12 weeks'] },
    ],
    evidenceQuestionIds: ['runway_stress_test', 'energy_runway'],
  },

  // 6) Micro-decision overload + deep work deficit
  {
    id: 'micro_decision_overload',
    severity: 'MEDIUM',
    label: 'Micro-decision overload consuming deep work',
    detail: 'The founder is fielding 16+ micro-decisions per day and can\'t achieve more than an hour of uninterrupted focus. Decision volume is the primary capacity drain.',
    when: [
      { field: 'micro_decision_frequency', includes: '16+' },
      { field: 'deep_work_audit', includesAny: ['Less than 1 hour', '1-1.9 hours'] },
    ],
    evidenceQuestionIds: ['micro_decision_frequency', 'deep_work_audit'],
  },

  // 7) Manual onboarding + handoff dependency
  {
    id: 'onboarding_bottleneck',
    severity: 'MEDIUM',
    label: 'Onboarding bottleneck + handoff dependency',
    detail: 'The founder manages all onboarding and must personally translate client needs to the team. This creates a serial dependency at project start.',
    when: [
      { field: 'onboarding_integration', includes: 'I personally manage' },
      { field: 'handoff_dependency', includes: 'I always have to translate' },
    ],
    evidenceQuestionIds: ['onboarding_integration', 'handoff_dependency'],
  },

  // 8) Revenue leakage awareness
  {
    id: 'revenue_leakage_acknowledged',
    severity: 'MEDIUM',
    label: 'Revenue leakage from operational delays',
    detail: 'The founder acknowledges losing revenue due to operational delays. Combined with tight cash flow, this indicates a structural revenue problem.',
    when: [
      { field: 'revenue_leakage_estimator', includes: 'Yes' },
      { field: 'profitability_gut_check', includesAny: ['cash is always tight', 'Losing money'] },
    ],
    evidenceQuestionIds: ['revenue_leakage_estimator', 'profitability_gut_check'],
  },

  // 9) Pricing fear + never raised
  {
    id: 'pricing_paralysis',
    severity: 'MEDIUM',
    label: 'Pricing fear + stale pricing',
    detail: 'The founder suspects undercharging but fears raising prices, and hasn\'t changed pricing in over a year. Margins are eroding by default.',
    when: [
      { field: 'pricing_confidence', includes: 'afraid to raise' },
      { field: 'pricing_last_raised', includesAny: ['1-2 years ago', 'Over 2 years'] },
    ],
    evidenceQuestionIds: ['pricing_confidence', 'pricing_last_raised'],
  },

  // 10) Collapse on absence + system-avoidance instinct
  {
    id: 'system_avoidance',
    severity: 'HIGH',
    label: 'High bus factor + system-avoidance instinct',
    detail: 'The business collapses without the founder, and the founder\'s instinct is to handle problems personally rather than build systems. The fragility is behavioral.',
    when: [
      { field: 'bus_factor_30_day', includes: 'collapses' },
      { field: 'trust_system_drill_down', includes: 'Handle it yourself' },
    ],
    evidenceQuestionIds: ['bus_factor_30_day', 'trust_system_drill_down'],
  },

  // 11) Wait time lag + team execution stall
  {
    id: 'wait_time_bottleneck',
    severity: 'MEDIUM',
    label: 'Significant pipeline wait time',
    detail: 'Completed work sits 3-5 days or more before the next action. This lag compounds across projects and artificially limits throughput.',
    when: [
      { field: 'wait_time_analysis', includesAny: ['3-5 days', 'clear the deck'] },
    ],
    evidenceQuestionIds: ['wait_time_analysis'],
  },

  // 12) Low-value hours + high service rate
  {
    id: 'admin_rate_mismatch',
    severity: 'MEDIUM',
    label: 'High-rate founder doing low-value work',
    detail: 'The founder charges $150+/hr but spends 6+ hours per week on tasks that could be handled by an admin. That\'s significant implicit cost.',
    when: [
      { field: 'average_service_rate', includesAny: ['$150', '$250'] },
      { field: 'low_value_hours_audit', includesAny: ['6-10 hours', '10+ hours'] },
    ],
    evidenceQuestionIds: ['average_service_rate', 'low_value_hours_audit'],
  },

  // 13) Full proposal control + all-client screening
  {
    id: 'sales_bottleneck',
    severity: 'MEDIUM',
    label: 'Sales pipeline fully founder-dependent',
    detail: 'The founder personally screens every client and writes/approves every proposal. The sales pipeline can\'t function without them.',
    when: [
      { field: 'qualification_triage', includes: 'I personally screen' },
      { field: 'sales_commitment', includes: 'I write/approve everything' },
    ],
    evidenceQuestionIds: ['qualification_triage', 'sales_commitment'],
  },

  // 14) Team gated by approval + high idle time
  {
    id: 'team_idle_approval_gate',
    severity: 'HIGH',
    label: 'Team idle time from approval bottleneck',
    detail: 'Team members wait significant hours weekly for founder approval. This is paid downtime created by centralized authority.',
    when: [
      { field: 'team_idle_time_cost', numericGte: 5 },
      { field: 'gatekeeper_protocol', includes: 'pauses work' },
    ],
    evidenceQuestionIds: ['team_idle_time_cost', 'gatekeeper_protocol'],
  },

  // 15) Context switch penalty + recovery difficulty
  {
    id: 'context_switch_penalty',
    severity: 'LOW',
    label: 'High context-switching penalty',
    detail: 'When interrupted, focus is significantly impaired or the task is abandoned. Combined with short deep-work blocks, the effective working capacity is much lower than hours suggest.',
    when: [
      { field: 'recovery_tax', includesAny: ['Significant effort', 'abandoned'] },
      { field: 'deep_work_audit', includesAny: ['Less than 1 hour', '1-1.9 hours'] },
    ],
    evidenceQuestionIds: ['recovery_tax', 'deep_work_audit'],
  },
];

// ------------------------------------------------------------------
// PUBLIC API
// ------------------------------------------------------------------

export function deriveClarityInsightFlags(answers: IntakeResponse): InsightFlag[] {
  const flags: InsightFlag[] = [];

  for (const rule of INSIGHT_RULES) {
    const allMatch = rule.when.every(c => matchCondition(answers, c));
    if (allMatch) {
      flags.push({
        id: rule.id,
        severity: rule.severity,
        label: rule.label,
        detail: rule.detail,
        evidenceQuestionIds: rule.evidenceQuestionIds,
      });
    }
  }

  // Sort: HIGH first, then MEDIUM, then LOW
  const severityOrder: Record<InsightSeverity, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  flags.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return flags;
}
