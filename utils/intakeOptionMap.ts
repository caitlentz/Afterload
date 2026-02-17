// ------------------------------------------------------------------
// INTAKE OPTION MAP — Single source of truth
// Exact strings stored by the single-select intake form.
// Used by previewEngine for strict-equality matching.
// ------------------------------------------------------------------

export const OPT = {
  business_model: {
    STANDARDIZED: 'Standardized service',
    CREATIVE: 'Creative service',
    EXPERT: 'Expert service',
    ADVISORY: 'Advisory/coaching',
    HYBRID: 'Hybrid model',
  },
  revenue_generation: {
    FOUNDER_MAJORITY: 'Founder delivers majority of service',
    TEAM_REVIEWS: 'Team delivers, founder reviews',
    TEAM_INDEPENDENT: 'Team delivers independently',
    MIX: 'Mix of founder + team delivery',
  },
  two_week_absence: {
    REVENUE_DROPS: 'Revenue drops immediately',
    WORK_SLOWS: 'Work slows significantly',
    ESCALATES: 'Team continues but escalates decisions',
    RUNS_NORMALLY: 'Business runs mostly normally',
  },
  final_decisions: {
    ALWAYS_ME: 'Always me',
    MOSTLY_ME: 'Mostly me',
    SHARED: 'Shared with senior team',
    RARELY_ME: 'Rarely me',
  },
  project_stall: {
    APPROVAL: 'Waiting on my approval',
    TEAM_EXECUTION: 'Waiting on team execution',
    CLIENTS: 'Waiting on clients',
    STAFFING: 'Hiring/staffing gaps',
    NOWHERE: 'Nowhere obvious',
  },
  growth_limiter: {
    TIME: 'Not enough time',
    STAFF: 'Not enough qualified staff',
    DEMAND: 'Inconsistent demand',
    PRICING: 'Pricing structure',
    OPS: 'Operational inefficiency',
  },
  process_documentation: {
    IN_HEAD: 'Mostly in my head',
    LIGHT: 'Light documentation',
    NOT_USED: 'Documented but not used',
    FULLY: 'Fully documented and followed',
  },
  roles_handled: {
    ONE_TWO: '1–2',
    THREE_FOUR: '3–4',
    FIVE_SIX: '5–6',
    SEVEN_PLUS: '7+',
  },
  client_relationship: {
    HIRE_ME: 'Clients hire me specifically',
    EXPECT_ME: 'Clients hire the firm but expect me involved',
    ASSIGNED: 'Clients are assigned to team members',
    NO_FOUNDER: 'No founder involvement needed',
  },
  key_member_leaves: {
    REVENUE_DROPS: 'Revenue drops',
    DELIVERY_SLOWS: 'Delivery slows',
    TEMPORARY: 'Temporary disruption',
    MINIMAL: 'Minimal impact',
  },
  pricing_decisions: {
    ONLY_ME: 'Only by me',
    I_APPROVE: 'I approve final pricing',
    SENIOR_TEAM: 'Senior team sets pricing',
    FIXED: 'Fixed pricing structure',
  },
  interruption_frequency: {
    CONSTANTLY: 'Constantly throughout the day',
    MULTIPLE_DAILY: 'Multiple times daily',
    FEW_WEEKLY: 'A few times per week',
    RARELY: 'Rarely',
  },
  hiring_situation: {
    HARD_TO_FIND: 'Actively hiring, hard to find talent',
    OCCASIONALLY: 'Hiring occasionally',
    FULLY_STAFFED: 'Fully staffed',
    OVERSTAFFED: 'Overstaffed',
  },
  free_capacity: {
    DELEGATE_APPROVALS: 'Delegating approvals',
    HIRE: 'Hiring more staff',
    SYSTEMS: 'Better systems',
    RAISE_PRICES: 'Raising prices',
    REDUCE_CLIENTS: 'Reducing client load',
  },
  current_state: {
    CHAOTIC: 'Chaotic and reactive',
    GROWING_STRAINED: 'Growing but strained',
    STABLE_CAPPED: 'Stable but capped',
    PROFITABLE_HEAVY: 'Profitable but founder-heavy',
    UNSURE: 'Unsure',
  },
} as const;

// ------------------------------------------------------------------
// CLEAN DISPLAY VALUES
// Maps stored option → short clean phrase without duplicated prefix.
// Used by generateExposureMetrics to prevent "Label: Label is…" duplication.
// ------------------------------------------------------------------

export const CLEAN: Record<string, Record<string, string>> = {
  revenue_generation: {
    [OPT.revenue_generation.FOUNDER_MAJORITY]: 'Founder delivers majority of service',
    [OPT.revenue_generation.TEAM_REVIEWS]: 'Team delivers, founder reviews',
    [OPT.revenue_generation.TEAM_INDEPENDENT]: 'Team delivers independently',
    [OPT.revenue_generation.MIX]: 'Split between founder and team',
  },
  final_decisions: {
    [OPT.final_decisions.ALWAYS_ME]: 'All decisions route through founder',
    [OPT.final_decisions.MOSTLY_ME]: 'Most decisions route through founder',
    [OPT.final_decisions.SHARED]: 'Shared with senior staff',
    [OPT.final_decisions.RARELY_ME]: 'Team makes most decisions independently',
  },
  process_documentation: {
    [OPT.process_documentation.IN_HEAD]: 'Not systemized (in founder\'s head)',
    [OPT.process_documentation.LIGHT]: 'Partial documentation exists',
    [OPT.process_documentation.NOT_USED]: 'Documented but not followed',
    [OPT.process_documentation.FULLY]: 'Fully documented and followed',
  },
  roles_handled: {
    [OPT.roles_handled.SEVEN_PLUS]: '7+ roles',
    [OPT.roles_handled.FIVE_SIX]: '5\u20136 roles',
    [OPT.roles_handled.THREE_FOUR]: '3\u20134 roles',
    [OPT.roles_handled.ONE_TWO]: '1\u20132 roles',
  },
  interruption_frequency: {
    [OPT.interruption_frequency.CONSTANTLY]: 'Constant throughout the day',
    [OPT.interruption_frequency.MULTIPLE_DAILY]: 'Multiple times daily',
    [OPT.interruption_frequency.FEW_WEEKLY]: 'A few times per week',
    [OPT.interruption_frequency.RARELY]: 'Rarely',
  },
  client_relationship: {
    [OPT.client_relationship.HIRE_ME]: 'Clients hire founder specifically',
    [OPT.client_relationship.EXPECT_ME]: 'Clients expect founder involvement',
    [OPT.client_relationship.ASSIGNED]: 'Clients work directly with team',
    [OPT.client_relationship.NO_FOUNDER]: 'No founder involvement needed',
  },
};

/**
 * Returns a clean display phrase for a given field + stored value.
 * Falls back to the raw value if no mapping exists.
 */
export function cleanDisplay(field: string, value?: string): string {
  if (!value) return '';
  return CLEAN[field]?.[value] ?? value;
}
