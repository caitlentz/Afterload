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

  // Initial track-specific
  capacity_utilization?: string;
  absence_impact?: string;
  growth_blocker?: string;
  doc_state?: string;
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

  // Deep Dive Fields
  financial_authority_threshold?: string;
  deep_work_audit?: string;
  recovery_tax?: string;
  runway_stress_test?: string;
  energy_runway?: string;
  low_value_hours_audit?: string;
  admin_rate_estimation?: string;
  revenue_leakage_estimator?: string;
  revenue_leakage_quantification?: string;
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

export function determineTrack(businessType: string | undefined): 'A' | 'B' | 'C' {
  if (!businessType) return 'B'; // Default to Decision-Heavy
  const lower = businessType.toLowerCase();
  if (lower.includes('logistics') || lower.includes('trades') || lower.includes('standardized')) return 'A'; // Time-Bound
  if (lower.includes('coaching') || lower.includes('consulting')) return 'C'; // Founder-Led
  return 'B'; // Decision-Heavy (Creative, Expert)
}

// ------------------------------------------------------------------
// COMPOSITE SCORES
// Automated analysis combining initial + deep dive data.
// These run behind the scenes and give you (the admin) a clear picture.
// ------------------------------------------------------------------

function calculateFounderRisk(data: IntakeResponse, track: 'A' | 'B' | 'C'): CompositeScores['founderRisk'] {
  let score = 0;
  const signals: string[] = [];

  // Bus factor (deep dive)
  if (data.bus_factor_30_day?.includes('collapses')) {
    score += 40;
    signals.push('Business collapses without founder for 30 days');
  } else if (data.bus_factor_30_day?.includes('stalls')) {
    score += 20;
    signals.push('Business stalls without founder');
  }

  // What collapses first (deep dive)
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

  // Deep dive: review dependency
  if (data.review_quality_control?.includes('Yes - I review everything')) { score += 10; signals.push('Founder reviews all deliverables'); }
  if (data.sales_commitment?.includes('Yes - I write/approve everything')) { score += 8; signals.push('Founder writes/approves all proposals'); }
  if (data.qualification_triage?.includes('personally screen')) { score += 8; signals.push('Founder screens every client'); }

  // Trust instinct
  if (data.trust_system_drill_down?.includes('Handle it yourself')) {
    score += 10;
    signals.push('Default instinct: fix it yourself rather than build a system');
  }

  score = Math.min(score, 100);
  const level = score >= 70 ? 'CRITICAL' : score >= 50 ? 'HIGH' : score >= 30 ? 'MODERATE' : 'LOW';
  return { score, level, signals };
}

function calculateSystemHealth(data: IntakeResponse): CompositeScores['systemHealth'] {
  let score = 100; // Start healthy, subtract
  const signals: string[] = [];

  // Documentation
  if (data.doc_state?.includes('Head') || data.doc_state?.includes('head')) {
    score -= 30; signals.push('All processes live in founder\'s head');
  } else if (data.doc_state?.includes('Notes')) {
    score -= 15; signals.push('Documentation is fragmented notes');
  } else if (data.doc_state?.includes('Handbook')) {
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

  // Fulfillment autonomy (deep dive)
  if (data.fulfillment_production?.includes('Always')) {
    score += 20; signals.push('Team is fully autonomous on core delivery');
  } else if (data.fulfillment_production?.includes('Mostly')) {
    score += 15; signals.push('Experienced team members work independently');
  } else if (data.fulfillment_production?.includes('Never')) {
    signals.push('Team can\'t complete work without constant guidance');
  }

  // Doc state — can't delegate what isn't documented
  if (data.doc_state?.includes('Centralized')) {
    score += 15; signals.push('Centralized docs support delegation');
  } else if (data.doc_state?.includes('Head') || data.doc_state?.includes('head')) {
    signals.push('Nothing documented — delegation requires extraction first');
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

  // Energy runway (deep dive)
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

  // Cash runway (deep dive) — not dollars, but stress signal
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

  score = Math.min(score, 100);
  const level = score >= 60 ? 'CRITICAL' : score >= 40 ? 'HIGH' : score >= 20 ? 'MODERATE' : 'LOW';
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

  return points;
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
  const pressurePoints = generatePressurePoints(data, heatmap, founderRisk, decisionData, track);

  // Phases (roadmap)
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

    compositeScores: { founderRisk, systemHealth, delegationReadiness, burnoutRisk },

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
  };

  return { report };
}
