export type IntakeResponse = {
  // Contact / Identity Fields
  email?: string;
  website?: string;
  specificType?: string;
  businessType?: string;

  // Initial Intake Fields
  firstName?: string;
  businessName?: string;
  industry?: string;
  team_size?: string;
  role?: string;
  revenue?: string;
  current_revenue_estimate?: string;
  business_type?: string;
  biggest_frustration?: string;
  vent?: string;
  hourly_rate?: string;
  work_hours?: string;
  years_in_business?: string;
  founder_operational_role?: string;
  founder_responsibilities?: string[];
  has_delegation_support?: string;

  // Initial track-specific
  capacity_utilization?: string;
  absence_impact?: string;
  growth_blocker?: string;
  doc_state?: string | string[];
  doc_usage?: string;
  time_theft?: string | string[];
  decision_backlog?: string;
  approval_frequency?: string;
  context_switching?: string;
  mental_energy?: string;
  delegation_blocker?: string;
  project_pile_up?: string;
  revenue_dependency?: string;
  client_expectation?: string;
  delegation_fear?: string;
  identity_attachment?: string;
  team_capability?: string;

  // Clarity Session Fields
  financial_authority_threshold?: string;
  deep_work_audit?: string;
  recovery_tax?: string;
  runway_stress_test?: string;
  energy_runway?: string;
  low_value_hours_audit?: string;
  admin_rate_estimation?: string;
  revenue_leakage_estimator?: string;
  revenue_leakage_quantification?: string;
  // Financial Health (clarity session)
  pricing_confidence?: string;
  pricing_last_raised?: string;
  revenue_range?: string;
  profitability_gut_check?: string;
  expense_awareness?: string;
  average_service_rate?: string;
  lead_gen_intake?: string;
  onboarding_integration?: string;
  review_quality_control?: string;
  delivery_close_out?: string;
  tool_zombie_check?: string;
  tool_zombie_count?: string;
  tool_count?: string;
  search_friction?: string;
  bus_factor_30_day?: string;
  collapse_diagnosis?: string[];
  trust_system_drill_down?: string;
  interruption_source_id?: string;
  strategic_work_id?: string;
  superpower_1?: string;
  superpower_2?: string;

  // New Universal Intake (v2)
  business_model?: string;
  revenue_generation?: string;
  two_week_absence?: string;
  final_decisions?: string;
  project_stall?: string;
  growth_limiter?: string;
  process_documentation?: string;
  roles_handled?: string;
  client_relationship?: string;
  key_member_leaves?: string;
  pricing_decisions?: string;
  interruption_frequency?: string;
  hiring_situation?: string;
  free_capacity?: string;
  current_state?: string;

  // Track Specific
  gatekeeper_protocol?: string;
  handoff_dependency?: string;
  qualification_triage?: string;
  fulfillment_production?: string;
  team_idle_time_cost?: string;
  micro_decision_audit?: string;
  micro_decision_frequency?: string;
  wait_time_analysis?: string;
  rework_loop?: string;
  sales_commitment?: string;

  // Catch-all
  [key: string]: any;
};

export type ConstraintType = 'COGNITIVE-BOUND' | 'POLICY-BOUND' | 'TIME-BOUND' | 'UNKNOWN';

export type HeatmapStage = {
  name: string;
  status: 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';
  signal: string;
};

export type CompositeScores = {
  founderRisk: { score: number; level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'; signals: string[] };
  systemHealth: { score: number; level: 'STRONG' | 'ADEQUATE' | 'FRAGILE' | 'BROKEN'; signals: string[] };
  delegationReadiness: { score: number; level: 'READY' | 'CLOSE' | 'NOT_YET' | 'BLOCKED'; signals: string[] };
  burnoutRisk: { score: number; level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'; signals: string[] };
  pricingHealth: { score: number; level: 'HEALTHY' | 'AT_RISK' | 'CRITICAL' | 'UNKNOWN'; signals: string[] };
};

export type FrictionCostEstimate = {
  lowValueHoursCost: { weeklyHours: number; annualCost: { low: number; high: number } };
  revenueLeakage: { acknowledged: boolean; estimate: { low: number; high: number } };
  toolZombieCost: { monthlyWaste: number; annualWaste: number };
  totalRange: { low: number; high: number };
  confidenceLevel: 'ESTIMATED' | 'ROUGH' | 'DIRECTIONAL';
};

export type ExtractionReadiness = {
  score: number;
  level: 'READY' | 'CLOSE' | 'EARLY' | 'ENTANGLED';
  factors: { label: string; status: 'green' | 'yellow' | 'red'; detail: string }[];
};

export type DelegationItem = {
  responsibility: string;
  readiness: 'NOW' | 'AFTER_SYSTEMS' | 'AFTER_HIRING' | 'FOUNDER_ONLY';
  reasoning: string;
  prerequisite?: string;
};

export type EnrichedPhase = {
  name: string;
  description: string;
  timeframe: string;
  actions: { task: string; whatGoodLooksLike: string }[];
  successCriteria: string;
};

export type EnrichedPressurePoint = {
  title: string;
  finding: string;
  rootCause: string[];
  signal: string;
  costImpact?: string;
  opportunity?: string;
};

export type RevenueScaleContext = {
  range: string;
  midpoint: number;
  scaleLabel: 'MICRO' | 'SMALL' | 'GROWTH' | 'SCALING' | 'ESTABLISHED';
  recommendationContext: string;
};

export type ReportData = {
  businessName: string;
  firstName: string;
  date: string;
  track: 'A' | 'B' | 'C';
  trackLabel: string;
  primaryConstraint: ConstraintType;

  // Executive Dashboard
  decisionLoad: 'HIGH' | 'MODERATE' | 'LOW';
  decisionSignals: string[];
  flowFriction: 'HIGH' | 'MODERATE' | 'LOW';
  flowSignals: string[];
  contextSwitching: 'HIGH' | 'MODERATE' | 'LOW';
  contextSignals: string[];

  // Heatmap
  heatmap: HeatmapStage[];
  bottleneckStage: string;
  bottleneckTitle: string;
  bottleneckPatternDescription: string;

  // Composite Scores (NEW — automated analysis)
  compositeScores: CompositeScores;

  // Findings
  pressurePoints: {
    title: string;
    finding: string;
    rootCause: string[];
    signal: string;
  }[];

  // Diagnosis
  successTrapNarrative: string;
  constraintDescription: string;
  constraintSolutionCategory: string;

  // Phases
  phases: {
    name: string;
    description: string;
    actionItem: string;
  }[];

  // What the founder said (for admin context)
  founderVoice: {
    biggestFrustration?: string;
    strategicWorkMissing?: string;
    superpowers?: string[];
  };

  // Enriched report data (Milestone 1)
  frictionCost: FrictionCostEstimate;
  extractionReadiness: ExtractionReadiness;
  delegationMatrix: DelegationItem[];
  enrichedPhases: EnrichedPhase[];
  enrichedPressurePoints: EnrichedPressurePoint[];
  revenueContext: RevenueScaleContext;
  executiveSummary: string;

  // Multi-constraint profile
  constraintProfile?: {
    cognitive: number;
    structural: number;
    capacity: number;
    shape: 'DOMINANT' | 'COMPOUND' | 'DISTRIBUTED';
    secondaryConstraint?: ConstraintType;
  };

  // Cross-signal analysis
  compoundSignals?: Array<{ title: string; finding: string }>;
  contradictions?: Array<{ title: string; finding: string }>;
};

export type DiagnosticResult = {
  report: ReportData;
};

// ------------------------------------------------------------------
// HELPER FUNCTIONS
// ------------------------------------------------------------------

function parseDollars(val: string | undefined): number {
  if (!val) return 0;
  return parseInt(val.replace(/[^0-9]/g, '')) || 0;
}

/** Handles doc_state as string or string[] after multi-select upgrade */
function docStateIncludes(docState: string | string[] | undefined, search: string): boolean {
  if (!docState) return false;
  if (Array.isArray(docState)) return docState.some(s => s.toLowerCase().includes(search.toLowerCase()));
  return docState.toLowerCase().includes(search.toLowerCase());
}

export function determineTrack(businessType: string | undefined, businessModel?: string): 'A' | 'B' | 'C' {
  // Prefer new business_model (v2 intake) when available
  if (businessModel) {
    const lower = businessModel.toLowerCase();
    if (lower.includes('standardized')) return 'A';
    if (lower.includes('advisory') || lower.includes('coaching')) return 'C';
    return 'B'; // Creative, Expert, Hybrid → Decision-Heavy
  }
  // Fallback to old business_type for existing clients
  if (!businessType) return 'B'; // Default to Decision-Heavy
  const lower = businessType.toLowerCase();
  if (lower.includes('logistics') || lower.includes('trades') || lower.includes('standardized')) return 'A'; // Time-Bound
  if (lower.includes('coaching') || lower.includes('consulting')) return 'C'; // Founder-Led
  return 'B'; // Decision-Heavy (Creative, Expert)
}

// ------------------------------------------------------------------
// COMPOSITE SCORES
// Automated analysis combining initial + clarity session data.
// These run behind the scenes and give you (the admin) a clear picture.
// ------------------------------------------------------------------

function calculateFounderRisk(data: IntakeResponse, track: 'A' | 'B' | 'C'): CompositeScores['founderRisk'] {
  let score = 0;
  const signals: string[] = [];

  // Bus factor (clarity session)
  if (data.bus_factor_30_day?.includes('collapses')) {
    score += 40;
    signals.push('Business collapses without founder for 30 days');
  } else if (data.bus_factor_30_day?.includes('stalls')) {
    score += 20;
    signals.push('Business stalls without founder');
  }

  // What collapses first (clarity session)
  if (data.collapse_diagnosis && Array.isArray(data.collapse_diagnosis)) {
    score += data.collapse_diagnosis.length * 8;
    data.collapse_diagnosis.forEach(d => {
      if (d.includes('Sales')) signals.push('Sales stop without founder');
      if (d.includes('Delivery')) signals.push('Delivery halts without founder');
      if (d.includes('Client')) signals.push('Client relationships depend on founder');
      if (d.includes('Financial')) signals.push('Only founder handles money');
    });
  }

  // Initial intake signals
  if (data.absence_impact?.includes('Everything stops')) { score += 15; }
  else if (data.absence_impact?.includes('Revenue drops')) { score += 10; }
  if (data.revenue_dependency?.includes('Goes to zero')) { score += 15; }
  else if (data.revenue_dependency?.includes('Drops significantly')) { score += 10; }
  if (data.client_expectation?.includes('Only me')) { score += 10; }
  if (data.identity_attachment?.includes('I AM the work')) { score += 8; }

  // Clarity session: review dependency
  if (data.review_quality_control?.includes('Yes - I review everything')) { score += 10; signals.push('Founder reviews all deliverables'); }
  if (data.sales_commitment?.includes('Yes - I write/approve everything')) { score += 8; signals.push('Founder writes/approves all proposals'); }
  if (data.qualification_triage?.includes('personally screen')) { score += 8; signals.push('Founder screens every client'); }

  // Trust instinct
  if (data.trust_system_drill_down?.includes('Handle it yourself')) {
    score += 10;
    signals.push('Default instinct: fix it yourself rather than build a system');
  }

  // Founder operational role (NEW)
  if (data.founder_operational_role?.includes('full-time')) {
    score += 12;
    signals.push('Founder still delivers the core service full-time');
  }

  // No delegation support (NEW)
  if (data.has_delegation_support?.includes('No')) {
    score += 8;
    signals.push('No manager or operations person to delegate to');
  }

  // --- v2 intake signals ---
  if (data.two_week_absence?.includes('Revenue drops immediately')) {
    score += 15; signals.push('Revenue drops immediately if founder steps away');
  } else if (data.two_week_absence?.includes('Work slows significantly')) {
    score += 10; signals.push('Work slows significantly without founder');
  } else if (data.two_week_absence?.includes('Team continues but escalates')) {
    score += 5;
  }

  if (data.client_relationship?.includes('Clients hire me specifically')) {
    score += 10; signals.push('Clients hire the founder specifically');
  } else if (data.client_relationship?.includes('expect me involved')) {
    score += 6;
  }

  if (data.revenue_generation?.includes('Founder delivers majority')) {
    score += 12; signals.push('Founder delivers majority of revenue-generating work');
  } else if (data.revenue_generation?.includes('Team delivers, founder reviews')) {
    score += 6;
  }

  if (data.final_decisions?.includes('Always me')) {
    score += 10; signals.push('All final decisions run through founder');
  } else if (data.final_decisions?.includes('Mostly me')) {
    score += 6;
  }

  if (data.roles_handled?.includes('7+')) {
    score += 10; signals.push('Founder personally handles 7+ roles');
  } else if (data.roles_handled?.includes('5–6')) {
    score += 6; signals.push('Founder personally handles 5-6 roles');
  } else if (data.roles_handled?.includes('3–4')) {
    score += 3;
  }

  score = Math.min(score, 100);
  const level = score >= 70 ? 'CRITICAL' : score >= 50 ? 'HIGH' : score >= 30 ? 'MODERATE' : 'LOW';
  return { score, level, signals };
}

function calculateSystemHealth(data: IntakeResponse): CompositeScores['systemHealth'] {
  let score = 100; // Start healthy, subtract
  const signals: string[] = [];

  // Documentation
  if (docStateIncludes(data.doc_state, 'head') || docStateIncludes(data.doc_state, 'nothing is written')) {
    score -= 30; signals.push('All processes live in founder\'s head');
  } else if (docStateIncludes(data.doc_state, 'Notes') || docStateIncludes(data.doc_state, 'Scattered')) {
    score -= 15; signals.push('Documentation is fragmented notes');
  } else if (docStateIncludes(data.doc_state, 'Handbook') || docStateIncludes(data.doc_state, 'handbook') || docStateIncludes(data.doc_state, 'training manual')) {
    score -= 5;
  }

  // Doc usage
  if (data.doc_usage?.includes('Rarely') || data.doc_usage?.includes('No')) {
    score -= 10; signals.push('Existing docs aren\'t used by team');
  }

  // Tool zombies
  if (data.tool_zombie_check?.includes('Yes')) {
    const count = parseDollars(data.tool_zombie_count);
    if (count >= 3) { score -= 15; signals.push(`${count} unused tools still being paid for`); }
    else if (count >= 1) { score -= 8; signals.push(`${count} zombie tool(s)`); }
  }

  // Tool sprawl
  const toolCount = parseDollars(data.tool_count);
  if (toolCount > 10) { score -= 15; signals.push(`${toolCount} tools in active use — potential fragmentation`); }
  else if (toolCount > 6) { score -= 5; }

  // Search friction
  if (data.search_friction?.includes('6+')) { score -= 15; signals.push('6+ hours/week spent searching for information'); }
  else if (data.search_friction?.includes('3-5')) { score -= 8; signals.push('3-5 hours/week wasted on search friction'); }

  // Lead gen
  if (data.lead_gen_intake?.includes('inbox/DMs')) { score -= 10; signals.push('Leads live in inbox/DMs — no system'); }
  else if (data.lead_gen_intake?.includes('Manual')) { score -= 5; }

  // Onboarding
  if (data.onboarding_integration?.includes('personally manage')) { score -= 10; signals.push('Founder personally manages all onboarding'); }
  else if (data.onboarding_integration?.includes('Partially')) { score -= 5; }

  // Close-out
  if (data.delivery_close_out?.includes('No')) { score -= 8; signals.push('No automated close-out process'); }

  // Expense awareness (NEW)
  if (data.expense_awareness?.includes('not sure')) {
    score -= 5; signals.push('No visibility into operating costs');
  }

  score = Math.max(score, 0);
  const level = score >= 70 ? 'STRONG' : score >= 50 ? 'ADEQUATE' : score >= 30 ? 'FRAGILE' : 'BROKEN';
  return { score, level, signals };
}

function calculateDelegationReadiness(data: IntakeResponse, track: 'A' | 'B' | 'C'): CompositeScores['delegationReadiness'] {
  let score = 0;
  const signals: string[] = [];

  // Trust instinct — system builder vs. doer
  if (data.trust_system_drill_down?.includes('system/process')) {
    score += 25; signals.push('Systems-first mindset — good foundation for delegation');
  }

  // Team capability (initial)
  if (data.team_capability?.includes('Yes') && !data.team_capability?.includes('training')) {
    score += 30; signals.push('Team can already replicate founder work');
  } else if (data.team_capability?.includes('Yes with training')) {
    score += 20; signals.push('Team can get there with training investment');
  } else if (data.team_capability?.includes('Maybe years')) {
    score += 5;
  }

  // Fulfillment autonomy (clarity session)
  if (data.fulfillment_production?.includes('Always')) {
    score += 20; signals.push('Team is fully autonomous on core delivery');
  } else if (data.fulfillment_production?.includes('Mostly')) {
    score += 15; signals.push('Experienced team members work independently');
  } else if (data.fulfillment_production?.includes('Never')) {
    signals.push('Team can\'t complete work without constant guidance');
  }

  // Doc state — can't delegate what isn't documented
  if (docStateIncludes(data.doc_state, 'Centralized')) {
    score += 15; signals.push('Centralized docs support delegation');
  } else if (docStateIncludes(data.doc_state, 'head') || docStateIncludes(data.doc_state, 'nothing is written')) {
    signals.push('Nothing documented — delegation requires extraction first');
  }

  // Has delegation support (NEW)
  if (data.has_delegation_support?.includes('Yes')) {
    score += 15; signals.push('Has a dedicated manager or operations person');
  } else if (data.has_delegation_support?.includes('No')) {
    signals.push('No delegation target exists');
  }

  // Identity attachment (blocker)
  if (data.identity_attachment?.includes('I AM the work') || data.identity_attachment?.includes('Practitioner')) {
    score -= 10; signals.push('Identity attachment may resist delegation');
  }

  // Delegation fear (blocker)
  if (data.delegation_fear?.includes("don't need me") || data.delegation_fear?.includes("They don't need me")) {
    score -= 10; signals.push('Fear of irrelevance blocks delegation');
  }

  // Financial authority
  const threshold = parseDollars(data.financial_authority_threshold);
  if (threshold >= 2000) {
    score += 10; signals.push('Team has meaningful financial autonomy');
  } else if (threshold <= 100) {
    signals.push('Team can\'t spend $100 without approval');
  }

  // --- v2 intake signals ---
  if (data.process_documentation?.includes('Fully documented and followed')) {
    score += 20; signals.push('Processes fully documented and followed — delegation-ready');
  } else if (data.process_documentation?.includes('Documented but not used')) {
    score += 10; signals.push('Docs exist but aren\'t followed — activation needed');
  } else if (data.process_documentation?.includes('Light documentation')) {
    score += 5;
  } else if (data.process_documentation?.includes('Mostly in my head')) {
    signals.push('Processes live in founder\'s head — extraction needed before delegation');
  }

  if (data.final_decisions?.includes('Shared with senior team')) {
    score += 15; signals.push('Decision-making already shared with senior team');
  } else if (data.final_decisions?.includes('Rarely me')) {
    score += 20; signals.push('Founder rarely makes final decisions — strong delegation');
  } else if (data.final_decisions?.includes('Always me')) {
    signals.push('All decisions centralized — delegation path not yet built');
  }

  score = Math.max(Math.min(score, 100), 0);
  const level = score >= 60 ? 'READY' : score >= 40 ? 'CLOSE' : score >= 20 ? 'NOT_YET' : 'BLOCKED';
  return { score, level, signals };
}

function calculateBurnoutRisk(data: IntakeResponse, track: 'A' | 'B' | 'C'): CompositeScores['burnoutRisk'] {
  let score = 0;
  const signals: string[] = [];

  // Energy runway (clarity session)
  if (data.energy_runway?.includes('already burning out')) {
    score += 40; signals.push('Already in burnout');
  } else if (data.energy_runway?.includes('6-12 weeks')) {
    score += 30; signals.push('6-12 week burnout horizon');
  } else if (data.energy_runway?.includes('6 months')) {
    score += 15;
  }

  // Mental energy (initial)
  if (data.mental_energy?.includes('Fried')) {
    score += 25; signals.push('Ends every day cognitively fried');
  } else if (data.mental_energy?.includes('Drained')) {
    score += 15; signals.push('Consistent daily mental drain');
  }

  // Cash runway (clarity session) — not dollars, but stress signal
  if (data.runway_stress_test?.includes('Less than 4 weeks')) {
    score += 20; signals.push('Under 4 weeks of cash reserves — financial stress compounds everything');
  } else if (data.runway_stress_test?.includes('1-3 months')) {
    score += 10; signals.push('Cash flow pressure (1-3 months runway)');
  }

  // Context switching
  if (data.context_switching?.includes('Non-stop') || data.context_switching?.includes('10+')) {
    score += 10; signals.push('Non-stop interruptions drain cognitive reserves');
  }

  // Deep work deficit
  if (data.deep_work_audit?.includes('Less than 1 hour')) {
    score += 10; signals.push('Less than 1 hour of uninterrupted work last week');
  }

  // Recovery tax
  if (data.recovery_tax?.includes('abandoned')) {
    score += 10; signals.push('Interruptions lead to task abandonment');
  }

  // Capacity
  if (data.capacity_utilization?.includes('Overbooked')) {
    score += 10; signals.push('Overbooked schedule');
  }

  // Financial pressure (NEW)
  if (data.profitability_gut_check?.includes('Losing money') || data.profitability_gut_check?.includes('barely surviving')) {
    score += 10; signals.push('Financial pressure compounds operational stress');
  } else if (data.profitability_gut_check?.includes('cash is always tight')) {
    score += 8; signals.push('Cash flow pressure despite revenue');
  }

  // --- v2 intake signals ---
  if (data.interruption_frequency?.includes('Constantly throughout the day')) {
    score += 10; signals.push('Constant interruptions throughout the day');
  } else if (data.interruption_frequency?.includes('Multiple times daily')) {
    score += 6;
  }

  if (data.current_state?.includes('Chaotic and reactive')) {
    score += 25; signals.push('Operating in chaotic, reactive mode');
  } else if (data.current_state?.includes('Growing but strained')) {
    score += 15; signals.push('Growth is straining capacity');
  } else if (data.current_state?.includes('Profitable but founder-heavy')) {
    score += 8;
  }

  if (data.roles_handled?.includes('7+')) {
    score += 10; signals.push('Wearing 7+ hats — cognitive load is extreme');
  } else if (data.roles_handled?.includes('5–6')) {
    score += 6; signals.push('Handling 5-6 roles personally');
  } else if (data.roles_handled?.includes('3–4')) {
    score += 3;
  }

  score = Math.min(score, 100);
  const level = score >= 60 ? 'CRITICAL' : score >= 40 ? 'HIGH' : score >= 20 ? 'MODERATE' : 'LOW';
  return { score, level, signals };
}

// ------------------------------------------------------------------
// PRICING HEALTH
// Determines if pricing is part of the problem or amplifying it.
// ------------------------------------------------------------------

function calculatePricingHealth(data: IntakeResponse): CompositeScores['pricingHealth'] {
  // If no financial data at all, return UNKNOWN
  if (!data.pricing_confidence && !data.profitability_gut_check && !data.pricing_last_raised) {
    return { score: 50, level: 'UNKNOWN', signals: [] };
  }

  let score = 50; // Start neutral
  const signals: string[] = [];

  // Pricing confidence
  if (data.pricing_confidence?.includes('Very confident')) {
    score += 20;
  } else if (data.pricing_confidence?.includes('Somewhat confident')) {
    score += 5;
  } else if (data.pricing_confidence?.includes('Not sure') || data.pricing_confidence?.includes('competitors')) {
    score -= 10; signals.push('Pricing based on competitors, not costs');
  } else if (data.pricing_confidence?.includes('Not confident') || data.pricing_confidence?.includes('afraid to raise')) {
    score -= 20; signals.push('Suspects undercharging but afraid to raise prices');
  }

  // When prices were last raised
  if (data.pricing_last_raised?.includes('6 months')) {
    score += 10;
  } else if (data.pricing_last_raised?.includes('6-12')) {
    score += 5;
  } else if (data.pricing_last_raised?.includes('1-2 years')) {
    score -= 5; signals.push('Prices haven\'t increased in over a year');
  } else if (data.pricing_last_raised?.includes('Over 2 years') || data.pricing_last_raised?.includes('never')) {
    score -= 15; signals.push('Prices stale for 2+ years while costs have risen');
  }

  // Profitability gut check
  if (data.profitability_gut_check?.includes('Comfortably profitable')) {
    score += 15;
  } else if (data.profitability_gut_check?.includes('Breaking even')) {
    score -= 5;
  } else if (data.profitability_gut_check?.includes('cash is always tight')) {
    score -= 15; signals.push('Cash flow issues despite revenue');
  } else if (data.profitability_gut_check?.includes('Losing money') || data.profitability_gut_check?.includes('barely surviving')) {
    score -= 25; signals.push('Business is not currently profitable');
  }

  // Expense awareness
  if (data.expense_awareness?.includes('track them closely')) {
    score += 5;
  } else if (data.expense_awareness?.includes('big ones but not the total')) {
    score -= 5;
  } else if (data.expense_awareness?.includes('not sure')) {
    score -= 10; signals.push('Doesn\'t know operating expenses');
  }

  // Revenue scale + profitability combo penalty
  if (data.revenue_range?.includes('Under $100k') && (data.profitability_gut_check?.includes('cash is always tight') || data.profitability_gut_check?.includes('Losing money'))) {
    score -= 5; signals.push('Low revenue combined with profitability issues — pricing structure needs attention');
  }

  // Revenue leakage (existing question, previously unused)
  if (data.revenue_leakage_estimator?.includes('Yes')) {
    score -= 10; signals.push('Acknowledges lost revenue from operational delays');
  }

  // Low value hours (existing question, previously unused)
  if (data.low_value_hours_audit?.includes('10+')) {
    score -= 5; signals.push('10+ hours/week on admin work');
  } else if (data.low_value_hours_audit?.includes('6-10')) {
    score -= 3;
  }

  score = Math.max(Math.min(score, 100), 0);
  const level = score >= 60 ? 'HEALTHY' : score >= 40 ? 'AT_RISK' : 'CRITICAL';
  return { score, level, signals };
}

// ------------------------------------------------------------------
// SCORING LOGIC (Decision Load, Flow Friction, Context Switching)
// ------------------------------------------------------------------

function calculateDecisionLoad(data: IntakeResponse): { level: 'HIGH' | 'MODERATE' | 'LOW', signals: string[], score: number } {
  let score = 0;
  const signals: string[] = [];

  // Financial authority threshold
  const threshold = parseDollars(data.financial_authority_threshold);
  if (threshold <= 100) { score += 40; signals.push(`Team can't authorize more than $${threshold} without you`); }
  else if (threshold <= 500) { score += 30; signals.push(`Financial authority capped at $${threshold}`); }
  else if (threshold <= 2000) { score += 15; }

  // Gatekeeper protocol
  if (data.gatekeeper_protocol?.includes('pauses work')) { score += 40; signals.push('Team pauses all work for your review'); }
  else if (data.gatekeeper_protocol?.includes('waits for your approval')) { score += 20; signals.push('Non-standard requests wait for approval'); }

  // Micro-decision frequency
  if (data.micro_decision_frequency?.includes('16+')) { score += 50; signals.push('16+ micro-decisions fielded per day'); }
  else if (data.micro_decision_frequency?.includes('6-15')) { score += 30; signals.push('6-15 micro-decisions per day'); }

  // Qualification triage
  if (data.qualification_triage?.includes('personally screen')) { score += 30; signals.push('Founder screens every client'); }

  // Cross-reference: initial intake signals
  if (data.decision_backlog?.includes('10+') || data.decision_backlog?.includes('Lost count')) {
    score += 15; signals.push(`Decision backlog from initial intake: ${data.decision_backlog}`);
  }
  if (data.approval_frequency?.includes('Constantly')) {
    score += 10;
  }

  // --- v2 intake signals ---
  if (data.final_decisions?.includes('Always me')) {
    score += 15; signals.push('All final decisions made by founder');
  } else if (data.final_decisions?.includes('Mostly me')) {
    score += 10; signals.push('Most decisions still route through founder');
  }

  if (data.interruption_frequency?.includes('Constantly throughout the day')) {
    score += 10; signals.push('Constant decision interruptions throughout the day');
  } else if (data.interruption_frequency?.includes('Multiple times daily')) {
    score += 6;
  }

  if (data.pricing_decisions?.includes('Only by me')) {
    score += 10; signals.push('All pricing decisions centralized with founder');
  } else if (data.pricing_decisions?.includes('I approve final pricing')) {
    score += 5;
  }

  if (data.project_stall?.includes('Waiting on my approval')) {
    score += 10; signals.push('Projects stall waiting on founder approval');
  }

  const level = score >= 50 ? 'HIGH' : score >= 25 ? 'MODERATE' : 'LOW';
  return { level, signals, score };
}

function calculateFlowFriction(data: IntakeResponse): { level: 'HIGH' | 'MODERATE' | 'LOW', signals: string[], score: number } {
  let score = 0;
  const signals: string[] = [];

  // Wait time
  if (data.wait_time_analysis?.includes('Variable/Infinite')) { score += 50; signals.push('Work sits until founder "clears the deck"'); }
  else if (data.wait_time_analysis?.includes('3-5 days')) { score += 35; signals.push('3-5 day lag between workflow stages'); }
  else if (data.wait_time_analysis?.includes('24-48 hours')) { score += 15; }

  // Rework
  if (data.rework_loop?.includes('More than 50%')) { score += 40; signals.push('Over half of submitted work gets sent back'); }
  else if (data.rework_loop?.includes('10-30%')) { score += 20; signals.push('Moderate rework rate (10-30%)'); }

  // Handoff dependency
  if (data.handoff_dependency?.includes('Always')) { score += 30; signals.push('Every handoff requires founder translation'); }
  else if (data.handoff_dependency?.includes('Sometimes')) { score += 15; }

  // Cross-reference: initial intake
  if (data.project_pile_up?.includes('Waiting on me')) {
    score += 10; signals.push('Projects pile up waiting on founder (initial intake)');
  }

  // --- v2 intake signals ---
  if (data.project_stall?.includes('Waiting on my approval')) {
    score += 10; signals.push('Projects stall waiting on founder approval');
  } else if (data.project_stall?.includes('Waiting on team execution')) {
    score += 6; signals.push('Projects stall waiting on team execution');
  } else if (data.project_stall?.includes('Hiring/staffing gaps')) {
    score += 8; signals.push('Projects stall due to staffing gaps');
  }

  const level = score >= 40 ? 'HIGH' : score >= 20 ? 'MODERATE' : 'LOW';
  return { level, signals, score };
}

function calculateContextSwitching(data: IntakeResponse): { level: 'HIGH' | 'MODERATE' | 'LOW', signals: string[], score: number } {
  let score = 0;
  const signals: string[] = [];

  // Deep work audit
  if (data.deep_work_audit?.includes('Less than 1 hour')) { score += 40; signals.push('Max uninterrupted block: under 1 hour'); }
  else if (data.deep_work_audit?.includes('1-1.9 hours')) { score += 30; signals.push('Max uninterrupted block: 1-2 hours'); }
  else if (data.deep_work_audit?.includes('2-3.9 hours')) { score += 15; }

  // Recovery tax
  if (data.recovery_tax?.includes('abandoned')) { score += 30; signals.push('Interruption leads to task abandonment'); }
  else if (data.recovery_tax?.includes('Significant effort')) { score += 20; signals.push('Significant recovery effort needed after interruption'); }
  else if (data.recovery_tax?.includes('Takes a few minutes')) { score += 10; }

  // Interruption source
  if (data.interruption_source_id?.includes('Emergency')) { score += 30; signals.push('Primary interrupt: firefighting emergencies'); }
  else if (data.interruption_source_id?.includes('Quick questions')) { score += 20; signals.push('Primary interrupt: constant "quick questions"'); }
  else if (data.interruption_source_id?.includes('Client emails')) { score += 15; signals.push('Primary interrupt: reactive client email'); }

  // Cross-reference: initial intake
  if (data.context_switching?.includes('Non-stop') || data.context_switching?.includes('10+')) {
    score += 15; signals.push(`Initial intake: ${data.context_switching} interruptions/day`);
  }

  // --- v2 intake signals ---
  if (data.interruption_frequency?.includes('Constantly throughout the day')) {
    score += 15; signals.push('Constantly interrupted for decisions throughout the day');
  } else if (data.interruption_frequency?.includes('Multiple times daily')) {
    score += 10; signals.push('Multiple daily decision interruptions');
  } else if (data.interruption_frequency?.includes('A few times per week')) {
    score += 3;
  }

  const level = score >= 40 ? 'HIGH' : score >= 20 ? 'MODERATE' : 'LOW';
  return { level, signals, score };
}

// ------------------------------------------------------------------
// PROCESS HEATMAP
// Now includes signals + "UNKNOWN" for missing data
// ------------------------------------------------------------------

function generateHeatmap(data: IntakeResponse): HeatmapStage[] {
  const map: HeatmapStage[] = [];

  // 1. Lead Gen
  if (data.lead_gen_intake?.includes('CRM')) {
    map.push({ name: 'Lead Gen', status: 'GREEN', signal: 'Leads auto-captured in CRM' });
  } else if (data.lead_gen_intake?.includes('Manual')) {
    map.push({ name: 'Lead Gen', status: 'YELLOW', signal: 'Manual lead entry required' });
  } else if (data.lead_gen_intake?.includes('inbox')) {
    map.push({ name: 'Lead Gen', status: 'RED', signal: 'Leads live in inbox/DMs' });
  } else {
    map.push({ name: 'Lead Gen', status: 'UNKNOWN', signal: 'Needs analysis' });
  }

  // 2. Qualification
  if (data.qualification_triage?.includes('autonomously')) {
    map.push({ name: 'Triage', status: 'GREEN', signal: 'Team qualifies independently' });
  } else if (data.qualification_triage?.includes('initial screening')) {
    map.push({ name: 'Triage', status: 'YELLOW', signal: 'Team screens, founder makes final call' });
  } else if (data.qualification_triage?.includes('personally screen')) {
    map.push({ name: 'Triage', status: 'RED', signal: 'Founder screens every client' });
  } else if (data.qualification_triage?.includes('No formal')) {
    map.push({ name: 'Triage', status: 'RED', signal: 'No screening process' });
  } else {
    map.push({ name: 'Triage', status: 'UNKNOWN', signal: 'Needs analysis' });
  }

  // 3. Sales
  if (data.sales_commitment?.includes('No - team')) {
    map.push({ name: 'Sales', status: 'GREEN', signal: 'Team uses templates independently' });
  } else if (data.sales_commitment?.includes('I approve')) {
    map.push({ name: 'Sales', status: 'YELLOW', signal: 'Founder approves all proposals' });
  } else if (data.sales_commitment?.includes('Yes')) {
    map.push({ name: 'Sales', status: 'RED', signal: 'Founder writes everything' });
  } else {
    map.push({ name: 'Sales', status: 'UNKNOWN', signal: 'Needs analysis' });
  }

  // 4. Onboarding
  if (data.onboarding_integration?.includes('Fully automated')) {
    map.push({ name: 'Onboarding', status: 'GREEN', signal: 'Automated or team-handled' });
  } else if (data.onboarding_integration?.includes('Partially')) {
    map.push({ name: 'Onboarding', status: 'YELLOW', signal: 'Partially automated' });
  } else if (data.onboarding_integration?.includes('personally manage')) {
    map.push({ name: 'Onboarding', status: 'RED', signal: 'Founder manages all onboarding' });
  } else {
    map.push({ name: 'Onboarding', status: 'UNKNOWN', signal: 'Needs analysis' });
  }

  // 5. Fulfillment
  if (data.fulfillment_production?.includes('Always') || data.fulfillment_production?.includes('Mostly')) {
    map.push({ name: 'Fulfillment', status: 'GREEN', signal: 'Team delivers autonomously' });
  } else if (data.fulfillment_production?.includes('Sometimes')) {
    map.push({ name: 'Fulfillment', status: 'YELLOW', signal: 'Occasional clarification needed' });
  } else if (data.fulfillment_production?.includes('Never')) {
    map.push({ name: 'Fulfillment', status: 'RED', signal: 'Constant guidance required' });
  } else {
    map.push({ name: 'Fulfillment', status: 'UNKNOWN', signal: 'Needs analysis' });
  }

  // 6. Review
  if (data.review_quality_control?.includes('No - team')) {
    map.push({ name: 'Review', status: 'GREEN', signal: 'Team handles QC independently' });
  } else if (data.review_quality_control?.includes('Only for specific')) {
    map.push({ name: 'Review', status: 'YELLOW', signal: 'Founder reviews edge cases only' });
  } else if (data.review_quality_control?.includes('Yes')) {
    map.push({ name: 'Review', status: 'RED', signal: 'Founder reviews everything' });
  } else {
    map.push({ name: 'Review', status: 'UNKNOWN', signal: 'Needs analysis' });
  }

  // 7. Close-out
  if (data.delivery_close_out?.includes('Yes')) {
    map.push({ name: 'Close-Out', status: 'GREEN', signal: 'Fully automated close-out' });
  } else if (data.delivery_close_out?.includes('Partially')) {
    map.push({ name: 'Close-Out', status: 'YELLOW', signal: 'Partially automated' });
  } else if (data.delivery_close_out?.includes('No')) {
    map.push({ name: 'Close-Out', status: 'YELLOW', signal: 'Manual close-out process' });
  } else {
    map.push({ name: 'Close-Out', status: 'UNKNOWN', signal: 'Needs analysis' });
  }

  return map;
}

// ------------------------------------------------------------------
// PRESSURE POINTS
// Dynamic — built from actual data, not hardcoded templates
// ------------------------------------------------------------------

function generatePressurePoints(
  data: IntakeResponse,
  heatmap: HeatmapStage[],
  founderRisk: CompositeScores['founderRisk'],
  decisionData: { level: string; signals: string[]; score: number },
  pricingHealth: CompositeScores['pricingHealth'],
  track: 'A' | 'B' | 'C',
  burnoutRisk: CompositeScores['burnoutRisk'],
  delegationReadiness: CompositeScores['delegationReadiness']
): ReportData['pressurePoints'] {
  // Scored ranking: compute an impact score (0-100) for ALL categories,
  // sort by impact, return the top 5.

  type ScoredPoint = ReportData['pressurePoints'][number] & { impactScore: number };
  const scored: ScoredPoint[] = [];

  // --- 1. Workflow Breaks ---
  const redStages = heatmap.filter(s => s.status === 'RED');
  const redCount = redStages.length;
  // severity: each RED stage contributes, 1 RED = 40, 2 = 65, 3+ = 85, scale by count
  const workflowImpact = redCount === 0 ? 10 : Math.min(30 + redCount * 20, 100);
  scored.push({
    impactScore: workflowImpact,
    title: redCount > 0
      ? `Workflow breaks at ${redStages.map(s => s.name).join(' + ')}`
      : 'Workflow friction detected',
    finding: redCount > 0
      ? redStages.map(s => s.signal).join('. ')
      : `${heatmap.filter(s => s.status === 'YELLOW').length} stage(s) showing yellow — no critical breaks yet, but friction is building.`,
    rootCause: redCount > 0
      ? redStages.map(s => {
          if (s.name === 'Lead Gen') return 'No system captures inbound interest';
          if (s.name === 'Triage') return 'Every prospect routes through founder';
          if (s.name === 'Sales') return 'Proposals bottleneck at founder';
          if (s.name === 'Onboarding') return 'Onboarding is manual and founder-dependent';
          if (s.name === 'Fulfillment') return 'Team can\'t execute without constant guidance';
          if (s.name === 'Review') return 'All quality control defaults to founder';
          return 'Process not defined';
        })
      : ['No critical process failures, but yellow stages indicate emerging friction'],
    signal: redCount > 0 ? `${redCount} stage(s) in critical state` : 'No stages in critical state',
  });

  // --- 2. Founder Dependency ---
  scored.push({
    impactScore: founderRisk.score,
    title: 'Founder Dependency Risk',
    finding: `Founder risk score: ${founderRisk.score}/100 (${founderRisk.level})`,
    rootCause: (() => {
      const rc: string[] = [];
      if (data.bus_factor_30_day?.includes('collapses')) rc.push('Business collapses without founder');
      if (data.review_quality_control?.includes('Yes')) rc.push('All deliverables require founder review');
      if (data.sales_commitment?.includes('Yes')) rc.push('All proposals require founder');
      if (data.trust_system_drill_down?.includes('Handle it yourself')) rc.push('Fix-it-myself instinct prevents system building');
      if (rc.length === 0) rc.push('Multiple structural dependencies on founder');
      return rc;
    })(),
    signal: data.bus_factor_30_day || 'Not assessed',
  });

  // --- 3. Cognitive Overload ---
  scored.push({
    impactScore: decisionData.score,
    title: 'Cognitive Overload',
    finding: `Decision load: ${decisionData.level}. ${decisionData.signals[0] || 'Decision routing through founder'}`,
    rootCause: (() => {
      const rc: string[] = [];
      if (data.micro_decision_frequency?.includes('16+')) rc.push('16+ micro-decisions per day');
      if (data.gatekeeper_protocol?.includes('pauses work')) rc.push('Team stops work for approval');
      const threshold = parseDollars(data.financial_authority_threshold);
      if (threshold <= 100) rc.push(`Team can't authorize more than $${threshold}`);
      if (rc.length === 0) rc.push('Decision volume routes through founder');
      return rc;
    })(),
    signal: 'Every decision that routes through you is a decision that could have a documented answer',
  });

  // --- 4. Rework Loop ---
  let reworkImpact = 0;
  if (data.rework_loop?.includes('More than 50%')) reworkImpact = 100;
  else if (data.rework_loop?.includes('25-50%')) reworkImpact = 70;
  else if (data.rework_loop?.includes('10-30%')) reworkImpact = 40;
  // 0 if no rework data or "none"
  scored.push({
    impactScore: reworkImpact,
    title: 'Rework Loop',
    finding: reworkImpact >= 100
      ? 'Over 50% of work gets sent back for revision'
      : reworkImpact >= 70
      ? '25-50% of work gets sent back — standards gap is costing time'
      : reworkImpact >= 40
      ? 'Moderate rework rate (10-30%) — standards documentation would help'
      : 'Low rework rate — team generally meets expectations',
    rootCause: [
      'Standards aren\'t documented — team guesses',
      data.handoff_dependency?.includes('Always') ? 'Handoffs require founder translation' : 'Unclear "definition of done"',
    ],
    signal: reworkImpact >= 70
      ? 'High rework = hidden time cost + team frustration'
      : 'Rework rate is manageable but could be reduced with clearer standards',
  });

  // --- 5. Pricing Risk ---
  // Invert pricing health: lower health = higher risk impact
  const pricingImpact = Math.max(0, 100 - pricingHealth.score);
  scored.push({
    impactScore: pricingImpact,
    title: 'Pricing May Be Amplifying the Bottleneck',
    finding: `Pricing health score: ${pricingHealth.score}/100 (${pricingHealth.level}). ${pricingHealth.signals[0] || ''}`,
    rootCause: (() => {
      const rc: string[] = [];
      if (data.pricing_confidence?.includes('Not confident') || data.pricing_confidence?.includes('afraid')) rc.push('Undercharging but afraid to raise prices');
      if (data.pricing_last_raised?.includes('Over 2 years') || data.pricing_last_raised?.includes('never')) rc.push('Prices haven\'t been raised in 2+ years');
      if (data.profitability_gut_check?.includes('Losing money') || data.profitability_gut_check?.includes('barely surviving')) rc.push('Business is not profitable');
      if (data.expense_awareness?.includes('not sure')) rc.push('Operating costs unknown — can\'t price accurately without knowing costs');
      if (rc.length === 0) rc.push('Pricing indicators suggest room for improvement');
      return rc;
    })(),
    signal: 'If the business isn\'t profitable at current capacity, adding more capacity makes the problem worse — not better',
  });

  // --- 6. Burnout Risk ---
  scored.push({
    impactScore: burnoutRisk.score,
    title: 'Burnout Risk',
    finding: `Burnout risk score: ${burnoutRisk.score}/100 (${burnoutRisk.level}). ${burnoutRisk.signals[0] || ''}`,
    rootCause: burnoutRisk.signals.length > 0 ? burnoutRisk.signals.slice(0, 3) : ['Cumulative operational load'],
    signal: burnoutRisk.level === 'CRITICAL'
      ? 'Burnout is not a personal failure — it\'s a system failure. The business is consuming its most important resource.'
      : 'Current pace may be sustainable short-term, but monitor energy levels',
  });

  // --- 7. Delegation Gap ---
  const delegationGapImpact = founderRisk.score >= 50 ? Math.max(0, 100 - delegationReadiness.score) : Math.max(0, (100 - delegationReadiness.score) * 0.5);
  scored.push({
    impactScore: delegationGapImpact,
    title: 'Delegation Gap',
    finding: `Founder risk is ${founderRisk.level.toLowerCase()} but delegation readiness is only ${delegationReadiness.score}/100 (${delegationReadiness.level}).`,
    rootCause: delegationReadiness.signals.length > 0
      ? delegationReadiness.signals.filter(s => !s.includes('good') && !s.includes('can')).slice(0, 3).concat(
          delegationReadiness.signals.filter(s => !s.includes('good') && !s.includes('can')).length === 0 ? ['Delegation infrastructure not yet in place'] : []
        )
      : ['No clear delegation path exists'],
    signal: 'The gap between dependency and readiness determines how quickly the founder can step back',
  });

  // Sort by impact score descending, return top 5
  scored.sort((a, b) => b.impactScore - a.impactScore);
  const top5 = scored.slice(0, 5);

  // Strip impactScore from the returned objects
  return top5.map(({ impactScore: _impact, ...rest }) => rest);
}

// ------------------------------------------------------------------
// HELPER: Service rate midpoint
// ------------------------------------------------------------------

function parseServiceRateMidpoint(rate: string | undefined): number {
  if (!rate) return 0;
  if (rate.includes('Under $50')) return 35;
  if (rate.includes('$50 - $100')) return 75;
  if (rate.includes('$100 - $150')) return 125;
  if (rate.includes('$150 - $250')) return 200;
  if (rate.includes('$250')) return 325;
  return 0;
}

function parseRevenueMidpoint(range: string | undefined): number {
  if (!range) return 0;
  if (range.includes('Under $100k')) return 75000;
  if (range.includes('$100k - $250k')) return 175000;
  if (range.includes('$250k - $500k')) return 375000;
  if (range.includes('$500k - $1M')) return 750000;
  if (range.includes('Over $1M')) return 1500000;
  return 0;
}

function parseLowValueHours(audit: string | undefined): number {
  if (!audit) return 0;
  if (audit === '0') return 0;
  if (audit.includes('1-5')) return 3;
  if (audit.includes('6-10')) return 8;
  if (audit.includes('10+')) return 12;
  return 0;
}

function formatDollarRange(low: number, high: number): string {
  const fmt = (n: number) => {
    if (n >= 1000) return `$${Math.round(n / 1000)}k`;
    return `$${Math.round(n)}`;
  };
  return `${fmt(low)} – ${fmt(high)}`;
}

// ------------------------------------------------------------------
// REVENUE CONTEXT
// ------------------------------------------------------------------

function deriveRevenueContext(data: IntakeResponse): RevenueScaleContext {
  const range = data.revenue_range || 'Unknown';
  const midpoint = parseRevenueMidpoint(data.revenue_range);

  let scaleLabel: RevenueScaleContext['scaleLabel'] = 'SMALL';
  let recommendationContext = 'small service business';

  if (midpoint <= 0) {
    scaleLabel = 'SMALL';
    recommendationContext = 'service business';
  } else if (midpoint <= 100000) {
    scaleLabel = 'MICRO';
    recommendationContext = 'solo or micro-team operation — every hour and dollar is visible';
  } else if (midpoint <= 250000) {
    scaleLabel = 'SMALL';
    recommendationContext = 'small team operation — big enough to feel stretched, not yet big enough for dedicated roles';
  } else if (midpoint <= 500000) {
    scaleLabel = 'GROWTH';
    recommendationContext = 'growth-stage business — revenue is real, but systems haven\'t caught up';
  } else if (midpoint <= 1000000) {
    scaleLabel = 'SCALING';
    recommendationContext = 'scaling operation — the founder\'s time is now the most expensive resource in the building';
  } else {
    scaleLabel = 'ESTABLISHED';
    recommendationContext = 'established business — operational friction at this scale has outsized cost impact';
  }

  return { range, midpoint, scaleLabel, recommendationContext };
}

// ------------------------------------------------------------------
// ANNUAL FRICTION COST
// ------------------------------------------------------------------

function calculateFrictionCost(data: IntakeResponse, revenueContext: RevenueScaleContext): FrictionCostEstimate {
  const rateMidpoint = parseServiceRateMidpoint(data.average_service_rate);
  const weeklyHours = parseLowValueHours(data.low_value_hours_audit);
  const revenueMidpoint = revenueContext.midpoint;

  // 1. Low-value hours cost
  let lowValueAnnual = { low: 0, high: 0 };
  if (weeklyHours > 0 && rateMidpoint > 0) {
    const base = weeklyHours * rateMidpoint * 48;
    lowValueAnnual = { low: Math.round(base * 0.8), high: Math.round(base * 1.2) };
  }

  // 2. Revenue leakage estimate
  let revenueLeakage = { acknowledged: false, estimate: { low: 0, high: 0 } };
  if (data.revenue_leakage_estimator?.includes('Yes') && revenueMidpoint > 0) {
    revenueLeakage.acknowledged = true;
    // Conservative: 3-8% of revenue lost to operational delays
    revenueLeakage.estimate = {
      low: Math.round(revenueMidpoint * 0.03),
      high: Math.round(revenueMidpoint * 0.08),
    };
  }

  // 3. Tool zombie cost
  const zombieCount = parseDollars(data.tool_zombie_count);
  const monthlyWaste = data.tool_zombie_check?.includes('Yes') ? zombieCount * 50 : 0;
  const annualWaste = monthlyWaste * 12;

  // Total
  const totalLow = lowValueAnnual.low + revenueLeakage.estimate.low + annualWaste;
  const totalHigh = lowValueAnnual.high + revenueLeakage.estimate.high + annualWaste;

  // Confidence
  let confidenceLevel: FrictionCostEstimate['confidenceLevel'] = 'DIRECTIONAL';
  if (rateMidpoint > 0 && revenueMidpoint > 0) confidenceLevel = 'ESTIMATED';
  else if (rateMidpoint > 0 || revenueMidpoint > 0) confidenceLevel = 'ROUGH';

  return {
    lowValueHoursCost: { weeklyHours, annualCost: lowValueAnnual },
    revenueLeakage,
    toolZombieCost: { monthlyWaste, annualWaste },
    totalRange: { low: totalLow, high: totalHigh },
    confidenceLevel,
  };
}

// ------------------------------------------------------------------
// EXTRACTION READINESS
// ------------------------------------------------------------------

function calculateExtractionReadiness(
  data: IntakeResponse,
  delegationReadiness: CompositeScores['delegationReadiness'],
  systemHealth: CompositeScores['systemHealth'],
  founderRisk: CompositeScores['founderRisk']
): ExtractionReadiness {
  // Weighted combination
  const score = Math.round(
    delegationReadiness.score * 0.35 +
    systemHealth.score * 0.35 +
    (100 - founderRisk.score) * 0.30
  );
  const clampedScore = Math.max(Math.min(score, 100), 0);

  const level: ExtractionReadiness['level'] =
    clampedScore >= 60 ? 'READY' :
    clampedScore >= 40 ? 'CLOSE' :
    clampedScore >= 20 ? 'EARLY' : 'ENTANGLED';

  const factors: ExtractionReadiness['factors'] = [];

  // Team capability factor
  if (data.team_capability?.includes('already') || data.team_capability?.includes('replicate')) {
    factors.push({ label: 'Team Capability', status: 'green', detail: 'Team can replicate founder quality' });
  } else if (data.team_capability?.includes('training')) {
    factors.push({ label: 'Team Capability', status: 'yellow', detail: 'Team needs structured training to replicate quality' });
  } else {
    factors.push({ label: 'Team Capability', status: 'red', detail: 'Team cannot yet replicate founder output' });
  }

  // Documentation factor
  if (docStateIncludes(data.doc_state, 'centralized') || docStateIncludes(data.doc_state, 'handbook')) {
    factors.push({ label: 'Documentation', status: 'green', detail: 'Processes are documented and accessible' });
  } else if (docStateIncludes(data.doc_state, 'scattered')) {
    factors.push({ label: 'Documentation', status: 'yellow', detail: 'Documentation exists but is scattered' });
  } else {
    factors.push({ label: 'Documentation', status: 'red', detail: 'Most knowledge lives in the founder\'s head' });
  }

  // Delegation support factor
  if (data.has_delegation_support?.includes('Yes') || data.has_delegation_support?.includes('dedicated')) {
    factors.push({ label: 'Delegation Target', status: 'green', detail: 'Has a manager or ops person to delegate to' });
  } else if (data.has_delegation_support?.includes('Sort of') || data.has_delegation_support?.includes('informally')) {
    factors.push({ label: 'Delegation Target', status: 'yellow', detail: 'Informal delegation support — no dedicated role' });
  } else {
    factors.push({ label: 'Delegation Target', status: 'red', detail: 'No one to delegate to — everything returns to founder' });
  }

  // Identity attachment factor
  if (data.identity_attachment?.includes('I AM') || data.identity_attachment?.includes('identity')) {
    factors.push({ label: 'Identity Attachment', status: 'red', detail: 'Founder\'s identity is deeply tied to the work' });
  } else if (data.delegation_fear?.includes('need me') || data.delegation_fear?.includes('fear')) {
    factors.push({ label: 'Letting Go', status: 'yellow', detail: 'Some resistance to stepping back from delivery' });
  } else {
    factors.push({ label: 'Readiness to Step Back', status: 'green', detail: 'Founder is willing to change their role' });
  }

  // Client expectations factor
  if (data.client_expectation?.includes('Only me') || data.client_expectation?.includes('founder')) {
    factors.push({ label: 'Client Expectations', status: 'red', detail: 'Clients expect the founder specifically' });
  } else {
    factors.push({ label: 'Client Expectations', status: 'green', detail: 'Clients are open to working with the team' });
  }

  return { score: clampedScore, level, factors };
}

// ------------------------------------------------------------------
// DELEGATION MATRIX
// ------------------------------------------------------------------

function generateDelegationMatrix(data: IntakeResponse): DelegationItem[] {
  const responsibilities = data.founder_responsibilities || [];
  if (responsibilities.length === 0) return [];

  const hasDocs = docStateIncludes(data.doc_state, 'centralized') || docStateIncludes(data.doc_state, 'handbook');
  const hasDelegationTarget = data.has_delegation_support?.includes('Yes') || data.has_delegation_support?.includes('dedicated');
  const hasSomeSupport = hasDelegationTarget || data.has_delegation_support?.includes('Sort of') || data.has_delegation_support?.includes('informally');
  const teamReady = data.team_capability?.includes('already') || data.team_capability?.includes('replicate') || data.team_capability?.includes('training');
  const highIdentity = data.identity_attachment?.includes('I AM') || data.identity_attachment?.includes('identity');
  const clientsWantFounder = data.client_expectation?.includes('Only me') || data.client_expectation?.includes('founder');

  return responsibilities.map((responsibility: string): DelegationItem => {
    const lower = responsibility.toLowerCase();

    // Payroll / finances — almost always delegable
    if (lower.includes('payroll') || lower.includes('finances')) {
      if (hasDelegationTarget || hasSomeSupport) {
        return { responsibility, readiness: 'NOW', reasoning: 'Bookkeeping and payroll are highly systemizable. A bookkeeper or payroll service handles this immediately.' };
      }
      return { responsibility, readiness: 'AFTER_HIRING', reasoning: 'Needs a bookkeeper or payroll service. No current delegation target.', prerequisite: 'Hire a bookkeeper or set up automated payroll' };
    }

    // Scheduling / calendar
    if (lower.includes('scheduling') || lower.includes('calendar')) {
      if (hasSomeSupport) {
        return { responsibility, readiness: 'NOW', reasoning: 'Scheduling is a process-driven task. Any team member with access to the booking system can handle this.' };
      }
      return { responsibility, readiness: 'AFTER_SYSTEMS', reasoning: 'Needs a documented scheduling protocol before handing off.', prerequisite: 'Document scheduling rules and preferences' };
    }

    // Inventory / supply management
    if (lower.includes('inventory') || lower.includes('supply')) {
      if (hasSomeSupport && hasDocs) {
        return { responsibility, readiness: 'NOW', reasoning: 'Supply management follows predictable patterns. Document reorder thresholds and delegate.' };
      }
      return { responsibility, readiness: 'AFTER_SYSTEMS', reasoning: 'Needs documented reorder points and supplier contacts before delegation.', prerequisite: 'Create inventory checklist with reorder thresholds' };
    }

    // Marketing / social media
    if (lower.includes('marketing') || lower.includes('social media')) {
      if (hasDelegationTarget && hasDocs) {
        return { responsibility, readiness: 'NOW', reasoning: 'Marketing can be delegated with brand guidelines and a content calendar.' };
      }
      if (hasSomeSupport) {
        return { responsibility, readiness: 'AFTER_SYSTEMS', reasoning: 'Needs brand voice guidelines and a basic content strategy documented first.', prerequisite: 'Document brand voice and content themes' };
      }
      return { responsibility, readiness: 'AFTER_HIRING', reasoning: 'No current team member for this. Consider a part-time marketing assistant or agency.', prerequisite: 'Define brand guidelines, then hire or outsource' };
    }

    // Client communication — depends heavily on client expectations
    if (lower.includes('client communication') || lower.includes('follow-up')) {
      if (clientsWantFounder && highIdentity) {
        return { responsibility, readiness: 'FOUNDER_ONLY', reasoning: 'Clients expect the founder. Transitioning this requires gradually introducing team members to client relationships.' };
      }
      if (hasDelegationTarget && hasDocs) {
        return { responsibility, readiness: 'NOW', reasoning: 'With communication templates and a designated team lead, client communication can transition.' };
      }
      return { responsibility, readiness: 'AFTER_SYSTEMS', reasoning: 'Needs communication templates and response guidelines before team can handle.', prerequisite: 'Create response templates for common scenarios' };
    }

    // Hiring / training / onboarding
    if (lower.includes('hiring') || lower.includes('training') || lower.includes('onboarding')) {
      if (hasDelegationTarget && hasDocs) {
        return { responsibility, readiness: 'AFTER_SYSTEMS', reasoning: 'Hiring criteria and onboarding checklists need to be documented before this can transfer.', prerequisite: 'Document hiring criteria and training checklist' };
      }
      return { responsibility, readiness: 'AFTER_HIRING', reasoning: 'Needs a manager-level role to own this. Premature to delegate without one.', prerequisite: 'Promote or hire a team lead with training authority' };
    }

    // Quality control
    if (lower.includes('quality') || lower.includes('reviewing')) {
      if (teamReady && hasDocs) {
        return { responsibility, readiness: 'AFTER_SYSTEMS', reasoning: 'Quality standards need to be documented as a checklist before the team can self-check.', prerequisite: 'Create a "Definition of Done" checklist for each service type' };
      }
      if (highIdentity) {
        return { responsibility, readiness: 'FOUNDER_ONLY', reasoning: 'Founder\'s quality standards are deeply personal. This is the last thing to delegate — start with a peer review system first.' };
      }
      return { responsibility, readiness: 'AFTER_SYSTEMS', reasoning: 'Team needs clear quality criteria before taking on review.', prerequisite: 'Document quality standards and spot-check process' };
    }

    // Default for anything else
    if (hasDelegationTarget && hasDocs) {
      return { responsibility, readiness: 'NOW', reasoning: 'With current team support and documentation, this can be transitioned.' };
    }
    if (hasSomeSupport) {
      return { responsibility, readiness: 'AFTER_SYSTEMS', reasoning: 'Document the process first, then hand off.', prerequisite: 'Write a brief SOP for this responsibility' };
    }
    return { responsibility, readiness: 'AFTER_HIRING', reasoning: 'No current delegation target for this responsibility.', prerequisite: 'Identify or hire someone to own this' };
  });
}

// ------------------------------------------------------------------
// ENRICHED PHASES (ROADMAP)
// ------------------------------------------------------------------

function generateEnrichedPhases(
  data: IntakeResponse,
  heatmap: HeatmapStage[],
  constraint: ConstraintType,
  revenueContext: RevenueScaleContext,
  bottleneckStage: string
): EnrichedPhase[] {
  const businessName = data.businessName || 'your business';
  const strategicMissing = data.strategic_work_id || 'strategic planning';
  const superpowers = [data.superpower_1, data.superpower_2].filter(Boolean);
  const interruptionSource = data.interruption_source_id || '';
  const isSmallScale = revenueContext.scaleLabel === 'MICRO' || revenueContext.scaleLabel === 'SMALL';

  // Phase 1: Stop the Bleeding (Weeks 1-2)
  const phase1Actions: EnrichedPhase['actions'] = [];

  if (interruptionSource.includes('Quick questions')) {
    phase1Actions.push({
      task: 'Implement the "Three Options Rule" — when your team has a question, they bring three options and a recommendation before asking you.',
      whatGoodLooksLike: 'Team interruptions drop by 40-60%. Questions shift from "what should I do?" to "which of these do you prefer?"'
    });
    phase1Actions.push({
      task: isSmallScale
        ? 'Set a daily 15-minute check-in for non-urgent questions instead of fielding them all day.'
        : 'Establish "Office Hours" — two 30-minute blocks per day where you\'re available for questions. All non-emergencies wait.',
      whatGoodLooksLike: 'You have predictable uninterrupted blocks. Team learns to batch their questions.'
    });
  } else if (interruptionSource.includes('Client emails')) {
    phase1Actions.push({
      task: 'Set defined response windows — clients hear back within 4 business hours, not 15 minutes.',
      whatGoodLooksLike: 'You check email in 2-3 dedicated blocks instead of reactively all day.'
    });
    phase1Actions.push({
      task: isSmallScale
        ? 'Create 5 email templates for the most common client questions.'
        : 'Designate a team member as first-response for client inquiries using documented response templates.',
      whatGoodLooksLike: '80% of client emails are handled without your involvement.'
    });
  } else if (interruptionSource.includes('Emergency')) {
    phase1Actions.push({
      task: 'Define what actually qualifies as an emergency (hint: most "emergencies" aren\'t). Write it down.',
      whatGoodLooksLike: 'A one-page Emergency Criteria doc that the team references before escalating.'
    });
    phase1Actions.push({
      task: 'Create a Triage SOP — who handles what, and what gets escalated to you.',
      whatGoodLooksLike: 'True emergencies still reach you fast. Everything else follows the process.'
    });
  } else if (interruptionSource.includes('Administrative')) {
    phase1Actions.push({
      task: isSmallScale
        ? 'Block a 2-hour "admin batch" once a week. Do all scheduling, invoicing, and paperwork in one sitting.'
        : 'Audit your last week\'s admin tasks. Circle everything a $20/hour assistant could do. Delegate or automate those first.',
      whatGoodLooksLike: 'Admin work goes from scattered throughout the day to a single, contained time block.'
    });
    phase1Actions.push({
      task: 'Automate at least one recurring admin task this week (invoicing, appointment reminders, or follow-ups).',
      whatGoodLooksLike: 'One less thing you manually do every week. Compound this over time.'
    });
  } else {
    // Default
    phase1Actions.push({
      task: 'Identify the single most time-consuming interruption from last week and create one rule to reduce it.',
      whatGoodLooksLike: 'One clear boundary that protects your focus time.'
    });
    phase1Actions.push({
      task: 'Block two 90-minute "deep work" windows on your calendar this week. Treat them like client appointments — non-negotiable.',
      whatGoodLooksLike: 'You have protected time for high-value work that nobody can book over.'
    });
  }

  const phase1: EnrichedPhase = {
    name: 'Stop the Bleeding',
    description: 'Reduce the immediate noise so you can think clearly enough to build systems.',
    timeframe: 'Weeks 1–2',
    actions: phase1Actions,
    successCriteria: 'You have at least 2 uninterrupted hours per day and the team\'s default is to try solving problems before escalating.',
  };

  // Phase 2: Build the Floor (Weeks 3-6)
  const phase2Actions: EnrichedPhase['actions'] = [];
  const docsInHead = docStateIncludes(data.doc_state, 'head') || docStateIncludes(data.doc_state, 'scattered');

  phase2Actions.push({
    task: `Document the "Definition of Done" for ${bottleneckStage}. Start with the 3 most common scenarios your team encounters.`,
    whatGoodLooksLike: `When someone finishes a ${bottleneckStage.toLowerCase()} task, they can check it against a written standard instead of asking you.`,
  });

  if (docsInHead) {
    phase2Actions.push({
      task: isSmallScale
        ? 'Pick one process you do every week and record yourself doing it (video or voice memo). Transcribe it into a simple checklist.'
        : 'Schedule one 30-minute "brain dump" session per week where you document one process. Start with the one your team asks about most.',
      whatGoodLooksLike: 'Within a month, the 4 most-asked-about processes are written down and findable.'
    });
  } else {
    phase2Actions.push({
      task: 'Review existing documentation for the bottleneck stage. Update anything outdated and fill gaps.',
      whatGoodLooksLike: 'Documentation is current, accessible, and the team actually references it.'
    });
  }

  phase2Actions.push({
    task: `Create delegation criteria for ${bottleneckStage}: what decisions the team CAN make independently, and what must still come to you.`,
    whatGoodLooksLike: 'A simple decision tree: "If X, handle it. If Y, flag it. If Z, escalate."'
  });

  const phase2: EnrichedPhase = {
    name: 'Build the Floor',
    description: `Document the standards for ${bottleneckStage} so it doesn't default to you every time.`,
    timeframe: 'Weeks 3–6',
    actions: phase2Actions,
    successCriteria: `${bottleneckStage} tasks move forward without your involvement at least 50% of the time.`,
  };

  // Phase 3: Raise the Ceiling (Weeks 7-12)
  const phase3Actions: EnrichedPhase['actions'] = [];

  phase3Actions.push({
    task: `Assign ownership of ${bottleneckStage} to a specific team member. You shift from doing to reviewing.`,
    whatGoodLooksLike: `That person makes decisions for ${bottleneckStage.toLowerCase()} and only brings you edge cases.`,
  });

  if (strategicMissing !== 'strategic planning') {
    phase3Actions.push({
      task: `Redirect your freed time into ${strategicMissing} — the work you said you\'re "too busy" for.`,
      whatGoodLooksLike: `You spend at least 4 hours/week on ${strategicMissing} instead of operational tasks.`,
    });
  } else {
    phase3Actions.push({
      task: `Use your freed time for strategic work that grows ${businessName} — the stuff that only you can do.`,
      whatGoodLooksLike: `You spend at least 4 hours/week working ON the business instead of IN it.`,
    });
  }

  if (superpowers.length > 0) {
    phase3Actions.push({
      task: `Lean into your superpower${superpowers.length > 1 ? 's' : ''}: ${superpowers.join(' and ')}. This is where ${businessName} actually grows.`,
      whatGoodLooksLike: `Your calendar reflects your strengths — more time on ${superpowers[0]?.toLowerCase() || 'high-impact work'}, less on operations.`,
    });
  }

  const phase3: EnrichedPhase = {
    name: 'Raise the Ceiling',
    description: `Free you up for the work that only you can do — the work that grows ${businessName}.`,
    timeframe: 'Weeks 7–12',
    actions: phase3Actions,
    successCriteria: `You could take a week off and the business would handle ${bottleneckStage.toLowerCase()} without you.`,
  };

  return [phase1, phase2, phase3];
}

// ------------------------------------------------------------------
// ENRICHED PRESSURE POINTS
// ------------------------------------------------------------------

function enrichPressurePoints(
  points: ReportData['pressurePoints'],
  frictionCost: FrictionCostEstimate,
  revenueContext: RevenueScaleContext
): EnrichedPressurePoint[] {
  return points.map((point, idx) => {
    let costImpact: string | undefined;
    let opportunity: string | undefined;

    // Map specific pressure point types to cost/opportunity
    if (point.title.includes('Workflow breaks')) {
      if (frictionCost.totalRange.high > 0) {
        costImpact = `Contributes to an estimated ${formatDollarRange(frictionCost.totalRange.low, frictionCost.totalRange.high)}/year in operational friction`;
      }
      opportunity = 'Fixing the bottleneck stage unlocks capacity without hiring — the team can do more with what you already have.';
    } else if (point.title.includes('Founder Dependency')) {
      opportunity = 'Reducing founder dependency doesn\'t just reduce risk — it frees the founder\'s time for the strategic work that actually grows the business.';
    } else if (point.title.includes('Cognitive Overload')) {
      opportunity = 'Every decision you document as a policy is a decision you never have to make again. The compounding effect is massive.';
    } else if (point.title.includes('Rework Loop')) {
      opportunity = 'Reducing rework means faster delivery, happier clients, and less frustration for you and your team.';
    } else if (point.title.includes('Pricing')) {
      if (frictionCost.revenueLeakage.acknowledged && frictionCost.revenueLeakage.estimate.high > 0) {
        costImpact = `Estimated ${formatDollarRange(frictionCost.revenueLeakage.estimate.low, frictionCost.revenueLeakage.estimate.high)}/year lost to operational delays`;
      }
      opportunity = 'Getting pricing right means every operational improvement you make flows directly to profitability instead of subsidizing undercharging.';
    }

    return {
      title: point.title,
      finding: point.finding,
      rootCause: point.rootCause,
      signal: point.signal,
      costImpact,
      opportunity,
    };
  });
}

// ------------------------------------------------------------------
// CROSS-SIGNAL COMPOUND DETECTION
// Identifies patterns where two signals together reveal something
// neither signal shows alone.
// ------------------------------------------------------------------

function detectCompoundSignals(
  data: IntakeResponse,
  heatmap: HeatmapStage[],
  founderRisk: CompositeScores['founderRisk'],
  delegationReadiness: CompositeScores['delegationReadiness'],
  pricingHealth: CompositeScores['pricingHealth'],
  burnoutRisk: CompositeScores['burnoutRisk'],
  systemHealth: CompositeScores['systemHealth'],
  decisionData: { level: string; signals: string[]; score: number }
): Array<{ title: string; finding: string }> {
  const signals: Array<{ title: string; finding: string }> = [];

  // Fulfillment GREEN + rework >50% = "Fast delivery, no quality standards"
  const fulfillmentStage = heatmap.find(s => s.name === 'Fulfillment');
  if (fulfillmentStage?.status === 'GREEN' && data.rework_loop?.includes('More than 50%')) {
    signals.push({
      title: 'Fast delivery, no quality standards',
      finding: 'The team delivers quickly, but over half of work gets sent back. Speed without standards creates a rework loop that consumes more time than slower, correct delivery would.',
    });
  }

  // High founder risk + high delegation readiness = "Psychological constraint, not structural"
  if (founderRisk.score >= 60 && delegationReadiness.score >= 50) {
    signals.push({
      title: 'Psychological constraint, not structural',
      finding: 'The team and systems are more ready for delegation than the founder\'s behavior reflects. The bottleneck may be identity attachment or trust rather than capability gaps.',
    });
  }

  // Critical pricing + high utilization = "Fully booked, still not profitable"
  if (pricingHealth.level === 'CRITICAL' && data.capacity_utilization?.includes('Overbooked')) {
    signals.push({
      title: 'Fully booked, still not profitable',
      finding: 'The business is at or above capacity but pricing health is critical. More work will not fix this — the unit economics need to change before adding volume.',
    });
  }

  // High burnout + low system health = "Burning out because no systems"
  if (burnoutRisk.score >= 50 && systemHealth.score <= 40) {
    signals.push({
      title: 'Burning out because no systems',
      finding: 'High burnout risk combined with broken or fragile systems. The founder is compensating for missing infrastructure with personal effort — a pattern that accelerates burnout.',
    });
  }

  // High decision load + 'Handle it yourself' trust = "Self-reinforcing bottleneck"
  if (decisionData.score >= 40 && data.trust_system_drill_down?.includes('Handle it yourself')) {
    signals.push({
      title: 'Self-reinforcing bottleneck',
      finding: 'High decision load combined with a fix-it-myself instinct. The founder absorbs decisions that could be delegated, reinforcing the team\'s habit of routing everything upward. Breaking this cycle requires changing the founder\'s default response, not the team\'s behavior.',
    });
  }

  // Low system health + low rework = "Fragile stability"
  const lowRework = !data.rework_loop || data.rework_loop.includes('Less than') || data.rework_loop.includes('none') || data.rework_loop.includes('0');
  if (systemHealth.score <= 40 && lowRework) {
    signals.push({
      title: 'No systems, but team manages — fragile stability',
      finding: 'Systems are broken or absent, yet rework is low. The team has internalized the founder\'s standards through experience rather than documentation. This works until someone leaves, onboarding happens, or volume increases.',
    });
  }

  return signals;
}

// ------------------------------------------------------------------
// CONTRADICTION DETECTION
// Identifies where the founder's self-reported data conflicts
// with what the operational data shows.
// ------------------------------------------------------------------

function detectContradictions(
  data: IntakeResponse,
  founderRisk: CompositeScores['founderRisk'],
  delegationReadiness: CompositeScores['delegationReadiness'],
  burnoutRisk: CompositeScores['burnoutRisk'],
  pricingHealth: CompositeScores['pricingHealth']
): Array<{ title: string; finding: string }> {
  const contradictions: Array<{ title: string; finding: string }> = [];

  // Says delegates well but reviews everything + screens all clients
  if (delegationReadiness.score >= 40 &&
      data.review_quality_control?.includes('Yes') &&
      data.qualification_triage?.includes('personally screen')) {
    contradictions.push({
      title: 'Delegation belief vs. control behavior',
      finding: 'The data suggests delegation readiness, but the founder reviews all deliverables and personally screens every client. The willingness to delegate exists — the behavior hasn\'t followed yet.',
    });
  }

  // Team is capable but can't complete work without questions
  const teamCapable = data.team_capability?.includes('Yes') || data.team_capability?.includes('replicate');
  const teamDependent = data.handoff_dependency?.includes('Always') || data.rework_loop?.includes('More than 50%');
  if (teamCapable && teamDependent) {
    contradictions.push({
      title: 'Capable team, dependent execution',
      finding: 'The founder believes the team can replicate their work, but handoffs require constant translation or rework exceeds 50%. Either the team\'s capability is overestimated, or the missing piece is documented standards — not skill.',
    });
  }

  // Systems exist but everything routes through founder
  const hasDocs = docStateIncludes(data.doc_state, 'centralized') || docStateIncludes(data.doc_state, 'handbook') || docStateIncludes(data.doc_state, 'training manual');
  if (hasDocs && founderRisk.score >= 60) {
    contradictions.push({
      title: 'Systems exist, founder still central',
      finding: 'Documentation is in place, but founder risk remains high. The systems may be outdated, not enforced, or the founder hasn\'t stepped back from the processes that are documented.',
    });
  }

  // Good work-life but burnout risk critical
  const positiveEnergy = data.energy_runway?.includes('6 months') || data.energy_runway?.includes('12+ months') || data.energy_runway?.includes('indefinitely');
  if (positiveEnergy && burnoutRisk.score >= 50) {
    contradictions.push({
      title: 'Feels fine, data says otherwise',
      finding: 'The founder reports sustainable energy, but multiple burnout risk indicators are elevated. This can signal normalization — when burnout becomes the baseline, it stops feeling like burnout.',
    });
  }

  // Claims profitable but pricing is critical
  const claimsProfitable = data.profitability_gut_check?.includes('Comfortably profitable') || data.profitability_gut_check?.includes('Breaking even');
  if (claimsProfitable && pricingHealth.level === 'CRITICAL') {
    contradictions.push({
      title: 'Profitability perception vs. pricing health',
      finding: 'The founder reports profitability, but pricing health indicators are critical. Revenue may be masking thin margins, stale pricing, or untracked costs that erode real profit.',
    });
  }

  return contradictions;
}

// ------------------------------------------------------------------
// EXECUTIVE SUMMARY
// ------------------------------------------------------------------

function generateExecutiveSummary(
  data: IntakeResponse,
  trackLabel: string,
  constraint: ConstraintType,
  bottleneckStage: string,
  frictionCost: FrictionCostEstimate,
  extractionReadiness: ExtractionReadiness,
  delegationMatrix: DelegationItem[],
  constraintProfile?: ReportData['constraintProfile'],
  topPressurePoint?: string
): string {
  const businessName = data.businessName || 'Your business';
  const track = determineTrack(data.business_type, data.business_model);
  const nowCount = delegationMatrix.filter(d => d.readiness === 'NOW').length;
  const hasFrictionCost = frictionCost.totalRange.high > 0;
  const shape = constraintProfile?.shape || 'DOMINANT';

  // --- Sentence 1: Intro framing (varies by constraint profile shape) ---
  const introVariants: Record<string, string[]> = {
    DOMINANT: [
      `${businessName} has a clear, singular constraint driving the majority of its operational friction.`,
      `The diagnostic reveals one dominant pattern running through ${businessName}'s operations.`,
      `${businessName}'s operational bottleneck is concentrated — one constraint is doing most of the damage.`,
      `One constraint explains most of what's slowing ${businessName} down.`,
      `The data points to a single dominant constraint at ${businessName}.`,
    ],
    COMPOUND: [
      `${businessName} is dealing with two overlapping constraints that reinforce each other.`,
      `The diagnostic reveals compound pressure at ${businessName} — two constraints are interacting.`,
      `${businessName}'s bottleneck is not a single issue — two constraints are compounding the friction.`,
      `Two closely scored constraints are creating a feedback loop at ${businessName}.`,
      `${businessName} faces a compound constraint — addressing one without the other will produce limited results.`,
    ],
    DISTRIBUTED: [
      `${businessName}'s operational friction is spread across multiple dimensions — there is no single fix.`,
      `The diagnostic shows distributed pressure at ${businessName} — cognitive, structural, and capacity constraints are all contributing.`,
      `${businessName} doesn't have one bottleneck — it has several, evenly matched. This requires a sequenced approach.`,
      `Friction at ${businessName} is systemic rather than concentrated. The fix is a system, not a single intervention.`,
      `${businessName}'s constraints are distributed — no single dimension dominates, which means progress requires working on multiple fronts.`,
    ],
  };
  const introOptions = introVariants[shape] || introVariants['DOMINANT'];
  const sentence1 = introOptions[Math.abs(businessName.length) % introOptions.length];

  // --- Sentence 2: Primary finding (what the data shows about the bottleneck) ---
  const findingVariants: Record<ConstraintType, string[]> = {
    'COGNITIVE-BOUND': [
      `The primary bottleneck is cognitive: the founder's decision-making capacity is the rate limiter. Work stalls at ${bottleneckStage} because the team can't move forward without approval.`,
      `Decision load is the core issue — too many choices route through one person, and ${bottleneckStage} is where the queue forms.`,
      `The data shows cognitive overload as the primary constraint. The ${bottleneckStage} stage backs up because the founder is the only decision-maker.`,
      `At ${bottleneckStage}, work waits for the founder's judgment. The constraint is not time or systems — it's that decisions aren't externalized.`,
      `The founder's cognitive bandwidth is the ceiling. ${bottleneckStage} is the stage where this becomes visible — work either waits or gets escalated.`,
    ],
    'POLICY-BOUND': [
      `The primary bottleneck is structural: missing processes and undocumented standards cause work to loop back at ${bottleneckStage}.`,
      `Operational friction is driven by absent systems. The ${bottleneckStage} stage lacks documented standards, so work defaults to the founder or gets redone.`,
      `The data shows a policy-bound constraint — the team doesn't lack skill, they lack clarity. ${bottleneckStage} is where this gap is most visible.`,
      `At ${bottleneckStage}, work breaks down because standards aren't written. The constraint is structural, not personal.`,
      `Missing SOPs and unclear handoff criteria cause predictable friction at ${bottleneckStage}. This is a systems problem with a systems fix.`,
    ],
    'TIME-BOUND': [
      `The primary bottleneck is capacity: the founder is too embedded in delivery for the business to grow. ${bottleneckStage} depends on the founder being present.`,
      `The founder's time is the constraint — there aren't enough hours to sustain current involvement at ${bottleneckStage} and grow the business.`,
      `Founder dependency is the core issue. The ${bottleneckStage} stage requires the founder's direct involvement, capping what the business can handle.`,
      `The data shows a time-bound constraint. The founder is the bottleneck at ${bottleneckStage} not because others can't do the work, but because extraction hasn't happened yet.`,
      `At ${bottleneckStage}, capacity is limited by the founder's availability. The business has hit the ceiling of what one person can sustain.`,
    ],
    'UNKNOWN': [
      `The diagnostic identified friction at ${bottleneckStage}, though the primary constraint type needs further investigation.`,
      `Operational friction is present at ${bottleneckStage}. Additional data would sharpen the constraint diagnosis.`,
      `The ${bottleneckStage} stage shows signs of stress, but more data is needed to pinpoint the root constraint.`,
      `Work is slowing at ${bottleneckStage}. The underlying constraint requires deeper analysis to categorize precisely.`,
      `Friction at ${bottleneckStage} is evident, but the constraint pattern doesn't fit a single category cleanly yet.`,
    ],
  };
  const findingOptions = findingVariants[constraint];
  const sentence2 = findingOptions[Math.abs(bottleneckStage.length) % findingOptions.length];

  // --- Sentence 3: Cost/impact ---
  let sentence3: string;
  if (hasFrictionCost) {
    const costRange = formatDollarRange(frictionCost.totalRange.low, frictionCost.totalRange.high);
    const costTemplates = [
      `This friction costs an estimated ${costRange} per year in lost productivity, rework, and operational drag.`,
      `The annual cost of this constraint is estimated at ${costRange} — a combination of time waste, revenue leakage, and tool overhead.`,
      `Operationally, this pattern drains roughly ${costRange} per year from the business.`,
    ];
    sentence3 = costTemplates[Math.abs(constraint.length) % costTemplates.length];
  } else {
    const qualitativeTemplates = [
      'While the friction cost couldn\'t be precisely quantified, the operational drag is visible in stalled work, repeated handoffs, and founder time consumption.',
      'The financial impact isn\'t fully quantifiable with current data, but the operational cost shows up as slower delivery, founder fatigue, and limited growth capacity.',
      'Even without precise dollar figures, the constraint is costing the business in throughput, team autonomy, and the founder\'s ability to focus on strategic work.',
    ];
    sentence3 = qualitativeTemplates[Math.abs(track.length) % qualitativeTemplates.length];
  }

  // --- Sentence 4: Readiness statement ---
  const readinessVariants: Record<ExtractionReadiness['level'], string[]> = {
    'READY': [
      `The business is well-positioned for founder extraction${nowCount > 0 ? `, with ${nowCount} responsibilit${nowCount === 1 ? 'y' : 'ies'} ready for immediate delegation` : ''}. The team, documentation, and willingness are largely in place.`,
      `Extraction readiness is high${nowCount > 0 ? ` — ${nowCount} item${nowCount === 1 ? '' : 's'} can be delegated immediately` : ''}. The foundation exists to start separating the founder from operations.`,
    ],
    'CLOSE': [
      `The business is getting close to founder extraction readiness${nowCount > 0 ? `, with ${nowCount} responsibilit${nowCount === 1 ? 'y' : 'ies'} already delegable` : ''}. A few targeted investments in systems or training will unlock the next level.`,
      `Extraction readiness is close${nowCount > 0 ? ` — ${nowCount} delegation opportunit${nowCount === 1 ? 'y exists' : 'ies exist'} right now` : ''}, with a clear path to full readiness within 60-90 days.`,
    ],
    'EARLY': [
      `Extraction readiness is early-stage — systems and documentation need to be built before meaningful delegation can begin.${nowCount > 0 ? ` That said, ${nowCount} responsibilit${nowCount === 1 ? 'y' : 'ies'} can move now.` : ''}`,
      `The business needs foundational work before the founder can step back.${nowCount > 0 ? ` ${nowCount} item${nowCount === 1 ? '' : 's'} can be delegated in parallel while systems are built.` : ' The roadmap starts with documentation and standards.'}`,
    ],
    'ENTANGLED': [
      `The founder is deeply entangled with operations — extraction requires a deliberate, phased approach.${nowCount > 0 ? ` Even so, ${nowCount} responsibilit${nowCount === 1 ? 'y' : 'ies'} can begin transitioning now.` : ' Every small separation compounds over time.'}`,
      `Founder separation is the long game here. The business currently can't function without the founder's daily involvement.${nowCount > 0 ? ` Starting with ${nowCount} immediate delegation opportunit${nowCount === 1 ? 'y' : 'ies'} creates momentum.` : ' The roadmap prioritizes the highest-leverage extraction points.'}`,
    ],
  };
  const readinessOptions = readinessVariants[extractionReadiness.level];
  const sentence4 = readinessOptions[Math.abs(nowCount) % readinessOptions.length];

  return `${sentence1} ${sentence2} ${sentence3} ${sentence4}`;
}

// ------------------------------------------------------------------
// SUCCESS TRAP NARRATIVE
// Cross-references track x constraint x bottleneck stage for a
// 2-3 sentence narrative instead of a single template.
// ------------------------------------------------------------------

function generateSuccessTrap(
  data: IntakeResponse,
  track: 'A' | 'B' | 'C',
  constraint: ConstraintType,
  bottleneckStage: string
): string {
  const name = data.businessName || 'This business';
  const frustration = data.biggest_frustration;

  // Build the narrative from track x constraint cross-reference
  const trackConstraintNarratives: Record<string, Record<ConstraintType, string>> = {
    A: {
      'COGNITIVE-BOUND': `${name} was built on consistent, reliable delivery — the kind clients trust and refer. But that reliability was built on the founder making every call. Now the volume of decisions has outgrown one person's bandwidth, and ${bottleneckStage} is where it shows. The same quality instinct that built the business is now the bottleneck slowing it down.`,
      'POLICY-BOUND': `${name} scaled on execution speed and delivery consistency. But the processes that got it here were never written down — they lived in the founder's habits. At ${bottleneckStage}, the absence of documented standards means work either loops back or waits. The business outgrew its informal systems without building formal ones.`,
      'TIME-BOUND': `${name} was built on excellent, consistent delivery. Clients trust the quality. But that quality is locked in the founder, and ${bottleneckStage} depends on their direct involvement. Growth now requires the founder to be present for more hours than exist. The thing that made the business successful is the same thing capping it.`,
      'UNKNOWN': `${name} has built a reputation on reliable delivery, but operational friction at ${bottleneckStage} is limiting what comes next. The constraint needs further investigation, but the pattern is clear: what got the business here won't get it further without structural changes.`,
    },
    B: {
      'COGNITIVE-BOUND': `${name} grew because the founder cared about quality more than anyone else. Over time, the team learned the safe default: "When in doubt, ask the founder." That instinct created an invisible decision queue at ${bottleneckStage} — everything routes through one person, whether it needs to or not. The founder's judgment became the business's most oversubscribed resource.`,
      'POLICY-BOUND': `${name} thrived on the founder's ability to navigate complex decisions. But that expertise was never codified into systems. At ${bottleneckStage}, the team lacks documented criteria to move forward independently. The founder's knowledge is the business's greatest asset and its biggest single point of failure.`,
      'TIME-BOUND': `${name} grew because the founder was willing to be deeply involved in every decision. That involvement built quality and trust, but it also made ${bottleneckStage} founder-dependent. The business has outgrown the founder's available hours. Hiring more people doesn't help if they all need the same person to approve their work.`,
      'UNKNOWN': `${name} was built on the founder's expertise and judgment. That strength created the business, but it may also be constraining it — particularly at ${bottleneckStage}. The exact constraint type needs more data, but the founder-dependency pattern is visible.`,
    },
    C: {
      'COGNITIVE-BOUND': `The founder IS ${name}. Their expertise, relationships, and reputation are the product. But the cognitive load of running operations AND being the product has become unsustainable. At ${bottleneckStage}, the founder's decision bandwidth is the rate limiter — not because they're slow, but because they're doing two jobs at once.`,
      'POLICY-BOUND': `The founder IS ${name} — and that's not a flaw, it's the business model. But without documented systems, every operational task at ${bottleneckStage} defaults back to the founder. The founder's time gets consumed by process work instead of the high-value expertise clients actually pay for.`,
      'TIME-BOUND': `The founder IS ${name}. Their expertise, reputation, and client relationships are the business. That's a structural reality, not a problem to fix. The real question is whether ${bottleneckStage} can be supported without the founder's direct involvement — so they can focus on what only they can do, without burning out.`,
      'UNKNOWN': `The founder IS ${name}, and that creates both the business's greatest strength and its most significant constraint. Friction at ${bottleneckStage} is visible, but untangling what to keep founder-owned vs. what to extract requires a closer look.`,
    },
  };

  let narrative = trackConstraintNarratives[track]?.[constraint] || trackConstraintNarratives['B']['UNKNOWN'];

  // Incorporate the founder's own words when available
  if (frustration) {
    // Keep it brief — reference their frustration to make the narrative personal
    const frustrationLower = frustration.toLowerCase();
    if (frustrationLower.includes('time') || frustrationLower.includes('hours') || frustrationLower.includes('busy')) {
      narrative += ` The founder put it plainly: the time pressure is felt every day.`;
    } else if (frustrationLower.includes('team') || frustrationLower.includes('staff') || frustrationLower.includes('people')) {
      narrative += ` The founder's own frustration points to the team dynamic — which tracks with what the data shows.`;
    } else if (frustrationLower.includes('growth') || frustrationLower.includes('stuck') || frustrationLower.includes('plateau')) {
      narrative += ` The founder already feels it — the business has hit a ceiling, and they know it.`;
    } else if (frustrationLower.includes('everything') || frustrationLower.includes('all') || frustrationLower.includes('wearing')) {
      narrative += ` The founder's frustration confirms it: wearing every hat is unsustainable.`;
    } else {
      narrative += ` In the founder's own words, the frustration is real and daily.`;
    }
  }

  return narrative;
}

// ------------------------------------------------------------------
// KEYWORD EXTRACTION FROM FREE-TEXT
// Scans all free-text responses and boosts relevant constraint scores.
// Returns score adjustments for each dimension.
// ------------------------------------------------------------------

type KeywordBoosts = {
  cognitive: number;   // boost to cognitive constraint score
  structural: number;  // boost to structural constraint score
  capacity: number;    // boost to capacity constraint score
  themes: string[];    // detected themes for narrative selection
};

function extractKeywordBoosts(data: IntakeResponse): KeywordBoosts {
  // Gather all free-text fields
  const texts = [
    data.biggest_frustration || '',
    data.vent || '',
    data.strategic_work_id || '',
    data.last_hour_wished_delegated || '',
    data.magic_wand_fix || '',
    data.what_keeps_you_up || '',
  ].join(' ').toLowerCase();

  if (!texts.trim()) return { cognitive: 0, structural: 0, capacity: 0, themes: [] };

  const boosts: KeywordBoosts = { cognitive: 0, structural: 0, capacity: 0, themes: [] };

  // Cognitive keywords — decisions, approvals, mental load
  const cognitivePatterns = [
    /\b(decision|decide|approve|approval|sign.?off|judgment|brain|think|mental|overwhelm|head\b)/gi,
    /\b(every.?thing.*comes.*to.*me|always.*asking|constant.*question)/gi,
    /\b(can'?t.*think|can'?t.*focus|too.*many.*choice|analysis.*paralysis)/gi,
  ];

  // Structural keywords — processes, systems, documentation
  const structuralPatterns = [
    /\b(process|system|sop|documentation|procedure|checklist|template|workflow|automat)/gi,
    /\b(no.*system|no.*process|in.*my.*head|nothing.*written|no.*standard)/gi,
    /\b(reinvent.*wheel|start.*from.*scratch|every.*time.*different|no.*consistency)/gi,
  ];

  // Capacity keywords — time, burnout, hours, delegation
  const capacityPatterns = [
    /\b(time|hours|burnout|exhaust|tired|overwhelm|capacity|bandwidth|too.*much)/gi,
    /\b(can'?t.*keep.*up|falling.*behind|drowning|stretched.*thin|running.*on.*fumes)/gi,
    /\b(delegat|hire|team.*can'?t|nobody.*else|only.*one.*who|always.*me)/gi,
    /\b(pricing|underpric|cheap|afford|money|revenue|profit|rate|charg)/gi,
  ];

  const themes: Set<string> = new Set();

  // Count matches and boost accordingly
  for (const pattern of cognitivePatterns) {
    const matches = texts.match(pattern);
    if (matches && matches.length > 0) {
      boosts.cognitive += Math.min(matches.length * 3, 10);
      themes.add('decisions');
    }
  }

  for (const pattern of structuralPatterns) {
    const matches = texts.match(pattern);
    if (matches && matches.length > 0) {
      boosts.structural += Math.min(matches.length * 3, 10);
      themes.add('systems');
    }
  }

  for (const pattern of capacityPatterns) {
    const matches = texts.match(pattern);
    if (matches && matches.length > 0) {
      boosts.capacity += Math.min(matches.length * 3, 10);
      if (texts.match(/\b(pricing|underpric|cheap|afford|money|revenue|profit|rate|charg)/gi)) {
        themes.add('pricing');
      }
      if (texts.match(/\b(burnout|exhaust|tired|overwhelm|running.*on.*fumes)/gi)) {
        themes.add('burnout');
      }
      if (texts.match(/\b(delegat|hire|team|nobody.*else|only.*one)/gi)) {
        themes.add('delegation');
      }
      themes.add('capacity');
    }
  }

  // Cap total boost per dimension at 10
  boosts.cognitive = Math.min(boosts.cognitive, 10);
  boosts.structural = Math.min(boosts.structural, 10);
  boosts.capacity = Math.min(boosts.capacity, 10);
  boosts.themes = Array.from(themes);

  return boosts;
}

// ------------------------------------------------------------------
// MAIN RUN FUNCTION
// ------------------------------------------------------------------

export function runDiagnostic(data: IntakeResponse): DiagnosticResult {
  const track = determineTrack(data.business_type, data.business_model);
  const trackLabel = track === 'A' ? 'Time-Bound' : track === 'B' ? 'Decision-Heavy' : 'Founder-Led';

  // Calculate core scores
  const decisionData = calculateDecisionLoad(data);
  const flowData = calculateFlowFriction(data);
  const contextData = calculateContextSwitching(data);
  const heatmap = generateHeatmap(data);

  // Calculate composite scores
  const founderRisk = calculateFounderRisk(data, track);
  const systemHealth = calculateSystemHealth(data);
  const delegationReadiness = calculateDelegationReadiness(data, track);
  const burnoutRisk = calculateBurnoutRisk(data, track);
  const pricingHealth = calculatePricingHealth(data);

  // ------------------------------------------------------------------
  // KEYWORD EXTRACTION FROM FREE-TEXT
  // Boost constraint scores based on language patterns in free-text
  // ------------------------------------------------------------------
  const keywordBoosts = extractKeywordBoosts(data);

  // ------------------------------------------------------------------
  // MULTI-CONSTRAINT SCORING
  // Compute three constraint dimension scores (0-100), determine
  // primary constraint from highest, detect compound situations.
  // Keyword boosts from free-text are applied here.
  // ------------------------------------------------------------------
  const cognitiveScore = Math.min(100, (decisionData.score + contextData.score) / 2 + keywordBoosts.cognitive);
  const structuralScore = Math.min(100, (flowData.score + (100 - systemHealth.score)) / 2 + keywordBoosts.structural);
  const capacityScore = Math.min(100, (founderRisk.score + burnoutRisk.score) / 2 + keywordBoosts.capacity);

  // Sort dimensions to find primary and secondary
  const dimensions: Array<{ key: 'cognitive' | 'structural' | 'capacity'; score: number; constraint: ConstraintType }> = [
    { key: 'cognitive', score: cognitiveScore, constraint: 'COGNITIVE-BOUND' },
    { key: 'structural', score: structuralScore, constraint: 'POLICY-BOUND' },
    { key: 'capacity', score: capacityScore, constraint: 'TIME-BOUND' },
  ];
  dimensions.sort((a, b) => b.score - a.score);

  const primary = dimensions[0];
  const secondary = dimensions[1];
  const tertiary = dimensions[2];

  // Determine shape
  const gapTopTwo = primary.score - secondary.score;
  const gapTopBottom = primary.score - tertiary.score;
  let shape: 'DOMINANT' | 'COMPOUND' | 'DISTRIBUTED';
  if (gapTopTwo >= 20) {
    shape = 'DOMINANT';
  } else if (gapTopBottom < 20) {
    shape = 'DISTRIBUTED';
  } else {
    shape = 'COMPOUND';
  }

  const constraint: ConstraintType = primary.score > 0 ? primary.constraint : 'UNKNOWN';
  const secondaryConstraint: ConstraintType | undefined = shape === 'COMPOUND' ? secondary.constraint : undefined;

  // Solution category reflects compound situations
  let solutionCategory: string;
  if (shape === 'COMPOUND') {
    const solutionParts: Record<ConstraintType, string> = {
      'COGNITIVE-BOUND': 'decision frameworks',
      'POLICY-BOUND': 'SOPs + process documentation',
      'TIME-BOUND': 'founder extraction',
      'UNKNOWN': 'general optimization',
    };
    solutionCategory = `${solutionParts[constraint]} + ${solutionParts[secondaryConstraint || 'UNKNOWN']}`;
  } else if (shape === 'DISTRIBUTED') {
    solutionCategory = 'Sequenced approach: decision frameworks, then SOPs, then extraction';
  } else {
    const solutionMap: Record<ConstraintType, string> = {
      'COGNITIVE-BOUND': 'Decision frameworks + documented heuristics',
      'POLICY-BOUND': 'SOPs + delegation criteria + process documentation',
      'TIME-BOUND': 'Founder extraction + capacity building',
      'UNKNOWN': 'General Optimization',
    };
    solutionCategory = solutionMap[constraint];
  }

  const constraintProfile: ReportData['constraintProfile'] = {
    cognitive: Math.round(cognitiveScore),
    structural: Math.round(structuralScore),
    capacity: Math.round(capacityScore),
    shape,
    secondaryConstraint,
  };

  // Find bottleneck stage
  const redStage = heatmap.find(s => s.status === 'RED');
  const yellowStage = heatmap.find(s => s.status === 'YELLOW');
  const bottleneckStage = redStage ? redStage.name : yellowStage ? yellowStage.name : 'None identified';

  // Generate pressure points (scored ranking — top 5)
  const pressurePoints = generatePressurePoints(data, heatmap, founderRisk, decisionData, pricingHealth, track, burnoutRisk, delegationReadiness);

  // Cross-signal analysis
  const compoundSignals = detectCompoundSignals(data, heatmap, founderRisk, delegationReadiness, pricingHealth, burnoutRisk, systemHealth, decisionData);
  const contradictions = detectContradictions(data, founderRisk, delegationReadiness, burnoutRisk, pricingHealth);

  // Revenue context + friction cost
  const revenueContext = deriveRevenueContext(data);
  const frictionCost = calculateFrictionCost(data, revenueContext);

  // Extraction readiness + delegation matrix
  const extractionReadiness = calculateExtractionReadiness(data, delegationReadiness, systemHealth, founderRisk);
  const delegationMatrix = generateDelegationMatrix(data);

  // Enriched pressure points (with cost + opportunity)
  const enrichedPressurePoints = enrichPressurePoints(pressurePoints, frictionCost, revenueContext);

  // Enriched phases (roadmap with actions + timeframes)
  const enrichedPhases = generateEnrichedPhases(data, heatmap, constraint, revenueContext, bottleneckStage);

  // Legacy phases (kept for backward compatibility with existing views)
  const interruptionSource = data.interruption_source_id || '';
  const strategicMissing = data.strategic_work_id || 'Strategic Planning';

  let phase1 = { name: 'Stabilization', description: 'Reduce the immediate noise.', actionItem: 'Implement "Office Hours" protocol for team questions.' };
  if (interruptionSource.includes('Quick questions')) {
    phase1 = { name: 'The 15-Minute Rule', description: 'Batch team questions instead of fielding them live.', actionItem: 'Implement "Three Options Rule" — team brings 3 options, you pick one.' };
  } else if (interruptionSource.includes('Client emails')) {
    phase1 = { name: 'Communication Protocol', description: 'Stop reactive client email.', actionItem: 'Set up client batching protocol — defined response windows, not reactive inboxing.' };
  } else if (interruptionSource.includes('Emergency')) {
    phase1 = { name: 'Triage SOP', description: 'Define what\'s actually an emergency vs. what feels like one.', actionItem: 'Create Emergency Response SOP — true emergency criteria + who handles what.' };
  } else if (interruptionSource.includes('Administrative')) {
    phase1 = { name: 'Admin Extraction', description: 'Get low-value tasks off your plate.', actionItem: 'Audit and delegate or automate admin tasks (scheduling, invoicing, formatting).' };
  }

  const phase2 = {
    name: 'Systemization',
    description: `Document the standards for ${bottleneckStage} so it doesn't default to you.`,
    actionItem: `Write the "Definition of Done" for the ${bottleneckStage} stage. Start with the 3 most common scenarios.`,
  };

  const phase3 = {
    name: 'Ceiling Removal',
    description: `Free you up for ${strategicMissing}.`,
    actionItem: `Assign ownership of ${bottleneckStage} to a team member. You review, not execute.`,
  };

  const phases = [phase1, phase2, phase3];

  // Constraint description
  const constraintDescriptions: Record<ConstraintType, string> = {
    'COGNITIVE-BOUND': 'Your decision-making capacity is the bottleneck. Work piles up waiting for your judgment because standards aren\'t externalized. The fix isn\'t "be faster" — it\'s "document the criteria so others can decide."',
    'POLICY-BOUND': 'The business lacks documented standards and processes. Work loops back, stalls, or gets redone because "the way we do things" isn\'t written down anywhere.',
    'TIME-BOUND': 'You\'ve hit a hard ceiling on hours. The business can\'t grow without changing your role — which means extracting your knowledge so others can carry it.',
    'UNKNOWN': 'We need more data to identify your primary constraint precisely.',
  };

  // Success trap narrative (expanded, cross-referenced)
  const successTrapNarrative = generateSuccessTrap(data, track, constraint, bottleneckStage);

  // Top pressure point title for executive summary context
  const topPressurePointTitle = pressurePoints.length > 0 ? pressurePoints[0].title : undefined;

  const report: ReportData = {
    businessName: data.businessName || 'Your Business',
    firstName: data.firstName || '',
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    track,
    trackLabel,
    primaryConstraint: constraint,

    decisionLoad: decisionData.level,
    decisionSignals: decisionData.signals,
    flowFriction: flowData.level,
    flowSignals: flowData.signals,
    contextSwitching: contextData.level,
    contextSignals: contextData.signals,

    heatmap,
    bottleneckStage,
    bottleneckTitle: `The ${bottleneckStage} Bottleneck`,
    bottleneckPatternDescription: constraintDescriptions[constraint],

    compositeScores: { founderRisk, systemHealth, delegationReadiness, burnoutRisk, pricingHealth },

    pressurePoints,

    successTrapNarrative,
    constraintDescription: constraintDescriptions[constraint],
    constraintSolutionCategory: solutionCategory,

    phases,

    founderVoice: {
      biggestFrustration: data.biggest_frustration,
      strategicWorkMissing: data.strategic_work_id,
      superpowers: [data.superpower_1, data.superpower_2].filter(Boolean) as string[],
    },

    // Enriched report data
    frictionCost,
    extractionReadiness,
    delegationMatrix,
    enrichedPhases,
    enrichedPressurePoints,
    revenueContext,
    executiveSummary: generateExecutiveSummary(data, trackLabel, constraint, bottleneckStage, frictionCost, extractionReadiness, delegationMatrix, constraintProfile, topPressurePointTitle),

    // Multi-constraint profile + cross-signal analysis
    constraintProfile,
    compoundSignals: compoundSignals.length > 0 ? compoundSignals : undefined,
    contradictions: contradictions.length > 0 ? contradictions : undefined,
  };

  return { report };
}
