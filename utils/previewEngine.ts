import { IntakeResponse } from './diagnosticEngine';

// ------------------------------------------------------------------
// PREVIEW ENGINE v2
// Generates a 6-section diagnostic preview from 15 universal questions.
// This is the FREE mini report that sells the $1,200 full diagnostic.
// ------------------------------------------------------------------

export type ConstraintDimension = {
  type: string;   // internal key
  label: string;  // display label
  score: number;  // 0-100
};

export type PreviewResult = {
  businessName: string;
  date: string;

  // Section 1: Constraint Snapshot Summary (3-4 sentences)
  constraintSnapshot: string;

  // Section 2: Top Two Constraint Dimensions
  primaryConstraint: { type: string; label: string };
  secondaryConstraint: { type: string; label: string };
  constraintCompoundNarrative: string;

  // Section 3: Structural Exposure Metrics (3-5 bullets)
  exposureMetrics: string[];

  // Section 4: Continuity Risk (one line)
  continuityRisk: string;

  // Section 5: Load Trajectory (one line)
  loadTrajectory: string;

  // Section 6: Structural Tension (one contradiction)
  structuralTension: string;
};

// ------------------------------------------------------------------
// DIMENSION SCORING
// Each answer contributes to one or more of 4 constraint dimensions.
// ------------------------------------------------------------------

type DimensionScores = {
  founderCentralization: number;
  structuralFragility: number;
  decisionBottleneck: number;
  capacityConstraint: number;
};

const DIMENSION_LABELS: Record<string, string> = {
  founderCentralization: 'Revenue Concentration',
  structuralFragility: 'Structural Fragility',
  decisionBottleneck: 'Decision Centralization',
  capacityConstraint: 'Capacity Ceiling',
};

function scoreDimensions(data: IntakeResponse): DimensionScores {
  const s: DimensionScores = {
    founderCentralization: 0,
    structuralFragility: 0,
    decisionBottleneck: 0,
    capacityConstraint: 0,
  };

  // Q1: business_model — light signal
  if (data.business_model?.includes('Advisory') || data.business_model?.includes('coaching')) {
    s.founderCentralization += 5;
  }

  // Q2: revenue_generation
  if (data.revenue_generation?.includes('Founder delivers majority')) {
    s.founderCentralization += 25; s.capacityConstraint += 15;
  } else if (data.revenue_generation?.includes('founder reviews')) {
    s.founderCentralization += 12; s.decisionBottleneck += 8;
  } else if (data.revenue_generation?.includes('Mix of founder')) {
    s.founderCentralization += 10; s.capacityConstraint += 5;
  }

  // Q3: two_week_absence
  if (data.two_week_absence?.includes('Revenue drops immediately')) {
    s.founderCentralization += 25; s.structuralFragility += 20;
  } else if (data.two_week_absence?.includes('Work slows significantly')) {
    s.founderCentralization += 15; s.structuralFragility += 10;
  } else if (data.two_week_absence?.includes('escalates decisions')) {
    s.decisionBottleneck += 12;
  }

  // Q4: final_decisions
  if (data.final_decisions?.includes('Always me')) {
    s.decisionBottleneck += 25; s.founderCentralization += 10;
  } else if (data.final_decisions?.includes('Mostly me')) {
    s.decisionBottleneck += 15; s.founderCentralization += 5;
  } else if (data.final_decisions?.includes('Shared')) {
    s.decisionBottleneck += 5;
  }

  // Q5: project_stall
  if (data.project_stall?.includes('Waiting on my approval')) {
    s.decisionBottleneck += 20;
  } else if (data.project_stall?.includes('Waiting on team execution')) {
    s.capacityConstraint += 10; s.structuralFragility += 5;
  } else if (data.project_stall?.includes('Hiring/staffing')) {
    s.capacityConstraint += 15;
  }

  // Q6: growth_limiter
  if (data.growth_limiter?.includes('Not enough time')) {
    s.capacityConstraint += 20; s.founderCentralization += 10;
  } else if (data.growth_limiter?.includes('Not enough qualified staff')) {
    s.capacityConstraint += 20;
  } else if (data.growth_limiter?.includes('Operational inefficiency')) {
    s.structuralFragility += 15; s.capacityConstraint += 5;
  } else if (data.growth_limiter?.includes('Pricing structure')) {
    s.capacityConstraint += 10;
  } else if (data.growth_limiter?.includes('Inconsistent demand')) {
    s.capacityConstraint += 8;
  }

  // Q7: process_documentation
  if (data.process_documentation?.includes('Mostly in my head')) {
    s.structuralFragility += 25; s.founderCentralization += 10;
  } else if (data.process_documentation?.includes('Light documentation')) {
    s.structuralFragility += 12;
  } else if (data.process_documentation?.includes('Documented but not used')) {
    s.structuralFragility += 15; s.decisionBottleneck += 5;
  }

  // Q8: roles_handled
  if (data.roles_handled?.includes('7+')) {
    s.founderCentralization += 15; s.structuralFragility += 10; s.capacityConstraint += 10;
  } else if (data.roles_handled?.includes('5')) {
    s.founderCentralization += 10; s.capacityConstraint += 8;
  } else if (data.roles_handled?.includes('3')) {
    s.founderCentralization += 5;
  }

  // Q9: client_relationship
  if (data.client_relationship?.includes('Clients hire me specifically')) {
    s.founderCentralization += 20;
  } else if (data.client_relationship?.includes('expect me involved')) {
    s.founderCentralization += 12;
  }

  // Q10: key_member_leaves
  if (data.key_member_leaves?.includes('Revenue drops')) {
    s.structuralFragility += 20; s.capacityConstraint += 10;
  } else if (data.key_member_leaves?.includes('Delivery slows')) {
    s.structuralFragility += 12;
  } else if (data.key_member_leaves?.includes('Temporary disruption')) {
    s.structuralFragility += 5;
  }

  // Q11: pricing_decisions
  if (data.pricing_decisions?.includes('Only by me')) {
    s.decisionBottleneck += 10; s.founderCentralization += 8;
  } else if (data.pricing_decisions?.includes('I approve final')) {
    s.decisionBottleneck += 5;
  }

  // Q12: interruption_frequency
  if (data.interruption_frequency?.includes('Constantly')) {
    s.decisionBottleneck += 20; s.capacityConstraint += 10;
  } else if (data.interruption_frequency?.includes('Multiple times daily')) {
    s.decisionBottleneck += 12; s.capacityConstraint += 5;
  } else if (data.interruption_frequency?.includes('few times per week')) {
    s.decisionBottleneck += 4;
  }

  // Q13: hiring_situation
  if (data.hiring_situation?.includes('hard to find talent')) {
    s.capacityConstraint += 15;
  } else if (data.hiring_situation?.includes('Hiring occasionally')) {
    s.capacityConstraint += 5;
  }

  // Q14: free_capacity (signal for what's most constrained)
  if (data.free_capacity?.includes('Delegating approvals')) {
    s.decisionBottleneck += 8;
  } else if (data.free_capacity?.includes('Hiring more staff')) {
    s.capacityConstraint += 8;
  } else if (data.free_capacity?.includes('Better systems')) {
    s.structuralFragility += 8;
  } else if (data.free_capacity?.includes('Raising prices')) {
    s.capacityConstraint += 5;
  } else if (data.free_capacity?.includes('Reducing client load')) {
    s.founderCentralization += 5; s.capacityConstraint += 5;
  }

  // Q15: current_state
  if (data.current_state?.includes('Chaotic and reactive')) {
    s.structuralFragility += 15; s.capacityConstraint += 10;
  } else if (data.current_state?.includes('Growing but strained')) {
    s.capacityConstraint += 12;
  } else if (data.current_state?.includes('Stable but capped')) {
    s.capacityConstraint += 10; s.structuralFragility += 5;
  } else if (data.current_state?.includes('Profitable but founder-heavy')) {
    s.founderCentralization += 15;
  }

  // Clamp all to 100
  s.founderCentralization = Math.min(100, s.founderCentralization);
  s.structuralFragility = Math.min(100, s.structuralFragility);
  s.decisionBottleneck = Math.min(100, s.decisionBottleneck);
  s.capacityConstraint = Math.min(100, s.capacityConstraint);

  return s;
}

// ------------------------------------------------------------------
// RANK DIMENSIONS → primary + secondary
// ------------------------------------------------------------------
function rankDimensions(scores: DimensionScores): ConstraintDimension[] {
  const entries = (Object.keys(scores) as (keyof DimensionScores)[]).map(key => ({
    type: key,
    label: DIMENSION_LABELS[key],
    score: scores[key],
  }));
  return entries.sort((a, b) => b.score - a.score);
}

// ------------------------------------------------------------------
// SECTION GENERATORS
// ------------------------------------------------------------------

function generateConstraintSnapshot(
  data: IntakeResponse,
  primary: ConstraintDimension,
  secondary: ConstraintDimension,
  businessName: string
): string {
  const parts: string[] = [];

  // Sentence 1: What's concentrated
  if (primary.type === 'founderCentralization') {
    parts.push(`${businessName} operates with revenue generation and client relationships concentrated in the founder.`);
  } else if (primary.type === 'decisionBottleneck') {
    parts.push(`${businessName} runs on a decision model where most approvals and direction flow through a single point.`);
  } else if (primary.type === 'structuralFragility') {
    parts.push(`${businessName} lacks the structural redundancy to absorb disruption — processes, knowledge, and systems are under-formalized.`);
  } else {
    parts.push(`${businessName} is operating at or near its capacity ceiling, with growth constrained by available resources.`);
  }

  // Sentence 2: How growth affects it
  if (data.current_state?.includes('Growing but strained')) {
    parts.push('Current growth is amplifying this pressure rather than resolving it.');
  } else if (data.current_state?.includes('Stable but capped')) {
    parts.push('The business has reached a plateau where this constraint prevents further scaling.');
  } else if (data.current_state?.includes('Chaotic and reactive')) {
    parts.push('Day-to-day operations are reactive, indicating this constraint is already producing friction.');
  } else if (data.current_state?.includes('Profitable but founder-heavy')) {
    parts.push('Profitability is intact, but growth is anchored to the founder\'s personal bandwidth.');
  } else {
    parts.push('As demand increases, this pattern will compound.');
  }

  // Sentence 3: Where strain shows up
  if (data.interruption_frequency?.includes('Constantly')) {
    parts.push('The clearest symptom: constant interruptions for decisions throughout the day.');
  } else if (data.two_week_absence?.includes('Revenue drops immediately')) {
    parts.push('The clearest symptom: revenue stops the moment the founder steps away.');
  } else if (data.project_stall?.includes('Waiting on my approval')) {
    parts.push('The clearest symptom: work stalls waiting on founder approval.');
  } else if (data.process_documentation?.includes('Mostly in my head')) {
    parts.push('The clearest symptom: institutional knowledge lives entirely in the founder\'s head.');
  } else if (data.key_member_leaves?.includes('Revenue drops')) {
    parts.push('The clearest symptom: losing a key team member directly impacts revenue.');
  } else if (data.roles_handled?.includes('7+')) {
    parts.push(`The clearest symptom: the founder is personally handling 7+ operational roles.`);
  } else {
    parts.push(`The ${secondary.label.toLowerCase()} compounds the primary constraint, creating multiple pressure points.`);
  }

  return parts.join(' ');
}

function generateCompoundNarrative(
  primary: ConstraintDimension,
  secondary: ConstraintDimension,
  data: IntakeResponse
): string {
  const p = primary.type;
  const s = secondary.type;

  // Specific compound narratives for common pairs
  if (p === 'founderCentralization' && s === 'decisionBottleneck') {
    return 'Revenue depends on the founder, and so do most decisions. This means stepping back from delivery doesn\'t reduce the load — it just shifts it from execution to oversight.';
  }
  if (p === 'founderCentralization' && s === 'structuralFragility') {
    return 'The founder is the business\'s single point of failure, and there\'s no documented structure to absorb that risk. Delegation isn\'t just a preference issue — there\'s nothing to delegate into.';
  }
  if (p === 'founderCentralization' && s === 'capacityConstraint') {
    return 'Revenue is tied to the founder\'s time, and that time is already maxed. Growth requires structural change, not harder work.';
  }
  if (p === 'decisionBottleneck' && s === 'founderCentralization') {
    return 'Decisions funnel through the founder because authority hasn\'t been distributed. Meanwhile, revenue depends on that same person being available — creating competing demands on a fixed resource.';
  }
  if (p === 'decisionBottleneck' && s === 'structuralFragility') {
    return 'Decisions centralize because standards aren\'t documented. Without written criteria, every judgment call becomes a founder decision.';
  }
  if (p === 'decisionBottleneck' && s === 'capacityConstraint') {
    return 'The decision backlog is consuming capacity that should go toward growth. The team has bandwidth — it\'s waiting for direction.';
  }
  if (p === 'structuralFragility' && s === 'founderCentralization') {
    return 'The business is fragile because its knowledge and processes live in the founder. This isn\'t a systems problem — it\'s an extraction problem.';
  }
  if (p === 'structuralFragility' && s === 'decisionBottleneck') {
    return 'Without documented standards, decisions default to the founder. The fragility creates the bottleneck.';
  }
  if (p === 'structuralFragility' && s === 'capacityConstraint') {
    return 'The business can\'t absorb growth because its structure can\'t absorb disruption. Hiring more people won\'t help if the playbook doesn\'t exist.';
  }
  if (p === 'capacityConstraint' && s === 'founderCentralization') {
    return 'Capacity is maxed, and the founder is doing too much of the work. The constraint won\'t ease until the founder\'s role changes.';
  }
  if (p === 'capacityConstraint' && s === 'decisionBottleneck') {
    return 'The team could take on more if they didn\'t need to wait for decisions. The capacity issue is partly artificial — created by centralized authority.';
  }
  if (p === 'capacityConstraint' && s === 'structuralFragility') {
    return 'Growth is blocked by resource limits, and the lack of documented systems makes it harder to onboard the help that\'s needed.';
  }

  // Fallback
  return `The ${primary.label.toLowerCase()} is compounded by ${secondary.label.toLowerCase()}, creating reinforcing pressure on the business.`;
}

function generateExposureMetrics(data: IntakeResponse): string[] {
  const metrics: string[] = [];

  // Revenue model
  if (data.revenue_generation) {
    metrics.push(`Revenue model: ${data.revenue_generation}`);
  }

  // Decision authority
  if (data.final_decisions) {
    metrics.push(`Decision authority: ${data.final_decisions}`);
  }

  // Documentation maturity
  if (data.process_documentation) {
    metrics.push(`Documentation: ${data.process_documentation}`);
  }

  // Roles
  if (data.roles_handled) {
    metrics.push(`Founder roles: ${data.roles_handled}`);
  }

  // Interruption load
  if (data.interruption_frequency) {
    metrics.push(`Decision interruptions: ${data.interruption_frequency}`);
  }

  // Pricing control
  if (data.pricing_decisions && data.pricing_decisions !== 'Fixed pricing structure') {
    metrics.push(`Pricing authority: ${data.pricing_decisions}`);
  }

  // Client structure
  if (data.client_relationship && (data.client_relationship.includes('hire me specifically') || data.client_relationship.includes('expect me'))) {
    metrics.push(`Client structure: ${data.client_relationship}`);
  }

  return metrics.slice(0, 5); // max 5
}

function generateContinuityRisk(data: IntakeResponse): string {
  const absence = data.two_week_absence || '';
  const keyLeave = data.key_member_leaves || '';

  if (absence.includes('Revenue drops immediately') && keyLeave.includes('Revenue drops')) {
    return 'Both founder absence and key-person departure cause immediate revenue loss — the business has no structural buffer.';
  }
  if (absence.includes('Revenue drops immediately')) {
    return 'A two-week founder absence causes immediate revenue loss. The business has no independence from its operator.';
  }
  if (absence.includes('Work slows significantly') && keyLeave.includes('Revenue drops')) {
    return 'A key departure drops revenue, and founder absence slows everything. The operation depends on specific people, not systems.';
  }
  if (absence.includes('Work slows significantly')) {
    return 'Founder absence slows operations significantly. The team functions, but not independently.';
  }
  if (keyLeave.includes('Revenue drops')) {
    return 'Losing a key team member directly impacts revenue — individual dependency extends beyond just the founder.';
  }
  if (keyLeave.includes('Delivery slows')) {
    return 'A key departure slows delivery. Knowledge transfer and redundancy need attention.';
  }
  if (absence.includes('escalates decisions')) {
    return 'The team can continue operating but escalates decisions to the founder — authority, not capability, is the dependency.';
  }
  return 'The business shows moderate resilience, but structural dependencies exist that could surface under stress.';
}

function generateLoadTrajectory(data: IntakeResponse): string {
  const state = data.current_state || '';
  const limiter = data.growth_limiter || '';

  if (state.includes('Chaotic and reactive')) {
    if (limiter.includes('Not enough time')) {
      return 'If nothing changes, the reactive operating mode will burn through the founder\'s remaining capacity until something breaks — quality, health, or the team.';
    }
    if (limiter.includes('Operational inefficiency')) {
      return 'If nothing changes, operational chaos will continue to consume capacity that should go toward growth.';
    }
    return 'If nothing changes, the reactive pattern will intensify as the business takes on more without structural support.';
  }
  if (state.includes('Growing but strained')) {
    if (limiter.includes('Not enough qualified staff')) {
      return 'If nothing changes, growth will continue outpacing the team\'s ability to deliver — hiring lag becomes a quality and retention risk.';
    }
    if (limiter.includes('Not enough time')) {
      return 'If nothing changes, growth will keep compressing the founder\'s bandwidth until the constraint forces a plateau or a breakdown.';
    }
    return 'If nothing changes, growth will keep straining the current structure until it either plateaus or fractures.';
  }
  if (state.includes('Stable but capped')) {
    return 'If nothing changes, the business will continue performing at its current ceiling — no crisis, but no upside either.';
  }
  if (state.includes('Profitable but founder-heavy')) {
    return 'If nothing changes, profitability will hold as long as the founder does — but the business has no pathway to scale or exit.';
  }
  return 'If nothing changes, the current constraints will gradually tighten as operational demands increase.';
}

function generateStructuralTension(data: IntakeResponse): string {
  // Look for contradictions between answer pairs

  // Team delivers independently but decisions centralized
  if (data.revenue_generation?.includes('Team delivers independently') &&
      (data.final_decisions?.includes('Always me') || data.final_decisions?.includes('Mostly me'))) {
    return 'Team capable of independent delivery, but decision authority remains centralized.';
  }

  // Hiring constrained but pricing unchanged
  if (data.hiring_situation?.includes('hard to find talent') &&
      data.growth_limiter?.includes('Pricing structure')) {
    return 'Hiring constrained, but pricing structure unchanged — the business can\'t attract the talent it needs at current margins.';
  }

  // Documented but not used + stalls on approval
  if (data.process_documentation?.includes('Documented but not used') &&
      data.project_stall?.includes('Waiting on my approval')) {
    return 'Processes documented, but team still waits on founder approval — the bottleneck is authority, not knowledge.';
  }

  // Wants to delegate approvals but decisions are "always me"
  if (data.free_capacity?.includes('Delegating approvals') &&
      data.final_decisions?.includes('Always me')) {
    return 'The founder wants to delegate decisions, but hasn\'t started — the constraint is structural, not aspirational.';
  }

  // Team delivers but key person leaving drops revenue
  if ((data.revenue_generation?.includes('Team delivers') || data.revenue_generation?.includes('independently')) &&
      data.key_member_leaves?.includes('Revenue drops')) {
    return 'Team handles delivery, but losing a key member still drops revenue — concentration has shifted from founder to individuals.';
  }

  // Hiring to solve capacity but growth limited by systems
  if (data.free_capacity?.includes('Hiring more staff') &&
      data.growth_limiter?.includes('Operational inefficiency')) {
    return 'Hiring seen as the solution, but operational inefficiency is the actual limiter — more people won\'t fix broken systems.';
  }

  // Business runs normally without founder but clients hire founder specifically
  if (data.two_week_absence?.includes('Business runs mostly normally') &&
      data.client_relationship?.includes('Clients hire me specifically')) {
    return 'Operations run without the founder, but clients still expect founder involvement — the constraint is perception, not capability.';
  }

  // Processes in head but team delivers
  if (data.process_documentation?.includes('Mostly in my head') &&
      (data.revenue_generation?.includes('Team delivers') || data.revenue_generation?.includes('independently'))) {
    return 'Team delivers service, but processes live in the founder\'s head — the gap between execution and documentation creates hidden risk.';
  }

  // Better systems identified as solution but documentation is "in my head"
  if (data.free_capacity?.includes('Better systems') &&
      data.process_documentation?.includes('Mostly in my head')) {
    return 'Better systems identified as the lever, but no documented processes exist to systematize — the foundation hasn\'t been laid.';
  }

  // Growing but strained + fully staffed
  if (data.current_state?.includes('Growing but strained') &&
      data.hiring_situation?.includes('Fully staffed')) {
    return 'Growing but strained despite being fully staffed — the constraint isn\'t headcount, it\'s how work is structured.';
  }

  // Fallback: construct from primary signals
  if (data.roles_handled?.includes('7+') && data.current_state?.includes('Profitable')) {
    return 'Profitable, but the founder is handling 7+ roles — profitability masks an unsustainable operating model.';
  }

  if (data.interruption_frequency?.includes('Constantly') &&
      data.growth_limiter?.includes('Not enough time')) {
    return 'Not enough time is the stated growth limiter, but constant decision interruptions are consuming the time that exists.';
  }

  return 'The current structure was designed for an earlier stage — what built the business is now constraining it.';
}

// ------------------------------------------------------------------
// MAIN EXPORT
// ------------------------------------------------------------------

export function runPreviewDiagnostic(data: IntakeResponse): PreviewResult {
  const businessName = data.businessName || 'Your Business';
  const scores = scoreDimensions(data);
  const ranked = rankDimensions(scores);

  const primary = ranked[0];
  const secondary = ranked[1];

  return {
    businessName,
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    constraintSnapshot: generateConstraintSnapshot(data, primary, secondary, businessName),
    primaryConstraint: { type: primary.type, label: primary.label },
    secondaryConstraint: { type: secondary.type, label: secondary.label },
    constraintCompoundNarrative: generateCompoundNarrative(primary, secondary, data),
    exposureMetrics: generateExposureMetrics(data),
    continuityRisk: generateContinuityRisk(data),
    loadTrajectory: generateLoadTrajectory(data),
    structuralTension: generateStructuralTension(data),
  };
}
