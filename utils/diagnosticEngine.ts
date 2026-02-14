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

export function determineTrack(businessType: string | undefined): 'A' | 'B' | 'C' {
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
  decisionData: { level: string; signals: string[] },
  pricingHealth: CompositeScores['pricingHealth'],
  track: 'A' | 'B' | 'C'
): ReportData['pressurePoints'] {
  const points: ReportData['pressurePoints'] = [];

  // 1. Bottleneck stage pressure point
  const redStages = heatmap.filter(s => s.status === 'RED');
  if (redStages.length > 0) {
    points.push({
      title: `Workflow breaks at ${redStages.map(s => s.name).join(' + ')}`,
      finding: redStages.map(s => s.signal).join('. '),
      rootCause: redStages.map(s => {
        if (s.name === 'Lead Gen') return 'No system captures inbound interest';
        if (s.name === 'Triage') return 'Every prospect routes through founder';
        if (s.name === 'Sales') return 'Proposals bottleneck at founder';
        if (s.name === 'Onboarding') return 'Onboarding is manual and founder-dependent';
        if (s.name === 'Fulfillment') return 'Team can\'t execute without constant guidance';
        if (s.name === 'Review') return 'All quality control defaults to founder';
        return 'Process not defined';
      }),
      signal: `${redStages.length} stage(s) in critical state`,
    });
  }

  // 2. Founder dependency
  if (founderRisk.level === 'CRITICAL' || founderRisk.level === 'HIGH') {
    const rootCauses: string[] = [];
    if (data.bus_factor_30_day?.includes('collapses')) rootCauses.push('Business collapses without founder');
    if (data.review_quality_control?.includes('Yes')) rootCauses.push('All deliverables require founder review');
    if (data.sales_commitment?.includes('Yes')) rootCauses.push('All proposals require founder');
    if (data.trust_system_drill_down?.includes('Handle it yourself')) rootCauses.push('Fix-it-myself instinct prevents system building');
    if (rootCauses.length === 0) rootCauses.push('Multiple structural dependencies on founder');

    points.push({
      title: 'Founder Dependency Risk',
      finding: `Founder risk score: ${founderRisk.score}/100 (${founderRisk.level})`,
      rootCause: rootCauses,
      signal: data.bus_factor_30_day || 'Not assessed',
    });
  }

  // 3. Decision overload (if applicable)
  if (decisionData.level === 'HIGH') {
    const rootCauses: string[] = [];
    if (data.micro_decision_frequency?.includes('16+')) rootCauses.push('16+ micro-decisions per day');
    if (data.gatekeeper_protocol?.includes('pauses work')) rootCauses.push('Team stops work for approval');
    const threshold = parseDollars(data.financial_authority_threshold);
    if (threshold <= 100) rootCauses.push(`Team can't authorize more than $${threshold}`);
    if (rootCauses.length === 0) rootCauses.push('Decision volume exceeds sustainable capacity');

    points.push({
      title: 'Cognitive Overload',
      finding: `Decision load: ${decisionData.level}. ${decisionData.signals[0] || ''}`,
      rootCause: rootCauses,
      signal: 'Every decision that routes through you is a decision that could have a documented answer',
    });
  }

  // 4. Rework loop (if significant)
  if (data.rework_loop?.includes('More than 50%')) {
    points.push({
      title: 'Rework Loop',
      finding: 'Over 50% of work gets sent back for revision',
      rootCause: [
        'Standards aren\'t documented — team guesses',
        data.handoff_dependency?.includes('Always') ? 'Handoffs require founder translation' : 'Unclear "definition of done"',
      ],
      signal: 'High rework = hidden time cost + team frustration',
    });
  }

  // 5. Pricing health (if critical)
  if (pricingHealth.level === 'CRITICAL') {
    const rootCauses: string[] = [];
    if (data.pricing_confidence?.includes('Not confident') || data.pricing_confidence?.includes('afraid')) rootCauses.push('Undercharging but afraid to raise prices');
    if (data.pricing_last_raised?.includes('Over 2 years') || data.pricing_last_raised?.includes('never')) rootCauses.push('Prices haven\'t been raised in 2+ years');
    if (data.profitability_gut_check?.includes('Losing money') || data.profitability_gut_check?.includes('barely surviving')) rootCauses.push('Business is not profitable');
    if (data.expense_awareness?.includes('not sure')) rootCauses.push('Operating costs unknown — can\'t price accurately without knowing costs');
    if (rootCauses.length === 0) rootCauses.push('Multiple pricing and profitability warning signs');

    points.push({
      title: 'Pricing May Be Amplifying the Bottleneck',
      finding: `Pricing health score: ${pricingHealth.score}/100 (${pricingHealth.level}). ${pricingHealth.signals[0] || ''}`,
      rootCause: rootCauses,
      signal: 'If the business isn\'t profitable at current capacity, adding more capacity makes the problem worse — not better',
    });
  }

  return points;
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
// EXECUTIVE SUMMARY
// ------------------------------------------------------------------

function generateExecutiveSummary(
  data: IntakeResponse,
  trackLabel: string,
  constraint: ConstraintType,
  bottleneckStage: string,
  frictionCost: FrictionCostEstimate,
  extractionReadiness: ExtractionReadiness,
  delegationMatrix: DelegationItem[]
): string {
  const businessName = data.businessName || 'Your business';
  const constraintLabels: Record<ConstraintType, string> = {
    'COGNITIVE-BOUND': 'cognitive overload',
    'POLICY-BOUND': 'missing structure',
    'TIME-BOUND': 'capacity ceiling',
    'UNKNOWN': 'operational',
  };
  const constraintLabel = constraintLabels[constraint];

  const nowCount = delegationMatrix.filter(d => d.readiness === 'NOW').length;
  const hasFrictionCost = frictionCost.totalRange.high > 0;

  const extractionLabels: Record<ExtractionReadiness['level'], string> = {
    'READY': 'well-positioned',
    'CLOSE': 'getting close to being ready',
    'EARLY': 'in the early stages of readiness',
    'ENTANGLED': 'deeply entangled with the founder',
  };

  let summary = `${businessName} is a ${trackLabel.toLowerCase()} service business facing a ${constraintLabel} constraint. The primary bottleneck sits at the ${bottleneckStage} stage, where work either stalls or defaults back to the founder.`;

  if (hasFrictionCost) {
    summary += ` This is costing roughly ${formatDollarRange(frictionCost.totalRange.low, frictionCost.totalRange.high)} per year in operational friction.`;
  }

  summary += ` The business is ${extractionLabels[extractionReadiness.level]} for founder separation`;

  if (nowCount > 0) {
    summary += `, with ${nowCount} responsibilit${nowCount === 1 ? 'y' : 'ies'} ready for immediate delegation.`;
  } else {
    summary += `, though systems need to be built before delegation can begin.`;
  }

  return summary;
}

// ------------------------------------------------------------------
// MAIN RUN FUNCTION
// ------------------------------------------------------------------

export function runDiagnostic(data: IntakeResponse): DiagnosticResult {
  const track = determineTrack(data.business_type);
  const trackLabel = track === 'A' ? 'Time-Bound' : track === 'B' ? 'Decision-Heavy' : 'Founder-Led';

  // Calculate core scores
  const decisionData = calculateDecisionLoad(data);
  const flowData = calculateFlowFriction(data);
  const contextData = calculateContextSwitching(data);
  const heatmap = generateHeatmap(data);

  // Calculate composite scores (NEW — automated behind the scenes)
  const founderRisk = calculateFounderRisk(data, track);
  const systemHealth = calculateSystemHealth(data);
  const delegationReadiness = calculateDelegationReadiness(data, track);
  const burnoutRisk = calculateBurnoutRisk(data, track);
  const pricingHealth = calculatePricingHealth(data);

  // Determine Primary Constraint (improved logic)
  let constraint: ConstraintType = 'UNKNOWN';
  let solutionCategory = 'General Optimization';

  if (decisionData.level === 'HIGH' && (contextData.level === 'HIGH' || decisionData.score >= 60)) {
    constraint = 'COGNITIVE-BOUND';
    solutionCategory = 'Decision frameworks + documented heuristics';
  } else if (flowData.level === 'HIGH' || systemHealth.level === 'BROKEN') {
    constraint = 'POLICY-BOUND';
    solutionCategory = 'SOPs + delegation criteria + process documentation';
  } else if (founderRisk.level === 'CRITICAL' || founderRisk.level === 'HIGH') {
    constraint = 'TIME-BOUND';
    solutionCategory = 'Founder extraction + capacity building';
  } else {
    // Fall back to what the preview engine determined
    constraint = 'TIME-BOUND';
    solutionCategory = 'Capacity + structure';
  }

  // Find bottleneck stage
  const redStage = heatmap.find(s => s.status === 'RED');
  const yellowStage = heatmap.find(s => s.status === 'YELLOW');
  const bottleneckStage = redStage ? redStage.name : yellowStage ? yellowStage.name : 'None identified';

  // Generate pressure points (dynamic, data-driven)
  const pressurePoints = generatePressurePoints(data, heatmap, founderRisk, decisionData, pricingHealth, track);

  // NEW: Revenue context + friction cost
  const revenueContext = deriveRevenueContext(data);
  const frictionCost = calculateFrictionCost(data, revenueContext);

  // NEW: Extraction readiness + delegation matrix
  const extractionReadiness = calculateExtractionReadiness(data, delegationReadiness, systemHealth, founderRisk);
  const delegationMatrix = generateDelegationMatrix(data);

  // NEW: Enriched pressure points (with cost + opportunity)
  const enrichedPressurePoints = enrichPressurePoints(pressurePoints, frictionCost, revenueContext);

  // NEW: Enriched phases (roadmap with actions + timeframes)
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

  // Success trap narrative
  const successTraps: Record<string, string> = {
    'A': `${data.businessName || 'This business'} was built on excellent, consistent delivery. Clients trust the quality. But that quality is currently locked in the founder — which means growth requires the founder to be present. The thing that made the business successful is the same thing keeping it stuck.`,
    'B': `${data.businessName || 'This business'} grew because the founder cared about quality more than anyone else. Over time, the team learned: "When in doubt, ask the founder." That instinct to protect quality created an invisible bottleneck — everything routes through one person, whether it needs to or not.`,
    'C': `The founder IS ${data.businessName || 'this business'}. Their expertise, reputation, and relationships. That's not a flaw — it's a structural reality. The question isn't whether to change that, it's whether the business can support the founder at the scale they want without burning them out.`,
  };

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

    successTrapNarrative: successTraps[track],
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
    executiveSummary: generateExecutiveSummary(data, trackLabel, constraint, bottleneckStage, frictionCost, extractionReadiness, delegationMatrix),
  };

  return { report };
}
