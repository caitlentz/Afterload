import { IntakeResponse } from './diagnosticEngine';
import { normalizeIntake } from './normalizeIntake';
import { OPT, cleanDisplay } from './intakeOptionMap';
import type { InsightFlag } from './clarityInsightRules';
import {
  scoreDimensions,
  rankDimensions,
  calculateFounderDependencyScore,
  interpretFounderDependencyScore,
  resolveConstraintLabel,
  selectPrimarySecondaryDimensions,
  detectConstraintCategory,
} from './previewScoring';
import type { DimensionScores } from './previewScoring';
export { getPreviewEligibility } from './normalizeIntake';
export type { PreviewEligibility } from './normalizeIntake';
export { scoreDimensions, rankDimensions } from './previewScoring';
export type { DimensionScores } from './previewScoring';

// ------------------------------------------------------------------
// PREVIEW ENGINE v3
// Generates a 6-section diagnostic preview from 15 universal questions.
// This is the FREE mini report that sells the $1,200 full diagnostic.
//
// v3 changes:
// - All matching uses strict equality (=== OPT.*) — no fuzzy .includes()
// - Exposure metrics use cleanDisplay() to prevent label duplication
// - Expanded compound narratives + structural tensions
// - PreviewResult includes metadata for deepDiveBuilder consumption
// ------------------------------------------------------------------

export type ConstraintDimension = {
  type: keyof DimensionScores;   // internal key
  label: string;  // display label
  score: number;  // 0-100
};

export type PreviewMetadata = {
  track: 'A' | 'B' | 'C' | 'UNIVERSAL';
  scores: DimensionScores;
  ranked: Array<{ type: string; label: string; score: number }>;
  primary: { type: string; label: string; score: number };
  secondary: { type: string; label: string; score: number };
  insightFlags?: InsightFlag[];
};

export type PreviewResult = {
  businessName: string;
  date: string;
  founderDependencyScore: number;
  founderDependencyLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  founderDependencyLabel: string;

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

  // Metadata for deepDiveBuilder consumption
  metadata: PreviewMetadata;
};

// ------------------------------------------------------------------
// PLAIN-ENGLISH TRANSLATOR
// Converts raw single-select option strings into human copy.
// Unmapped values fall through as-is.
// ------------------------------------------------------------------

type PlainEnglishMap = Record<string, Record<string, string>>;

const PREVIEW_PLAIN_EN: PlainEnglishMap = {
  revenue_generation: {
    [OPT.revenue_generation.FOUNDER_MAJORITY]: 'Most delivery depends on the founder',
    [OPT.revenue_generation.TEAM_REVIEWS]: 'Team delivers, founder still reviews most work',
    [OPT.revenue_generation.TEAM_INDEPENDENT]: 'Team delivers without founder involvement',
    [OPT.revenue_generation.MIX]: 'Delivery is split between founder and team',
  },
  two_week_absence: {
    [OPT.two_week_absence.REVENUE_DROPS]: 'Revenue drops fast if the founder steps away',
    [OPT.two_week_absence.WORK_SLOWS]: 'Work slows significantly without the founder',
    [OPT.two_week_absence.ESCALATES]: 'Team can run, but escalates decisions upward',
    [OPT.two_week_absence.RUNS_NORMALLY]: 'Business runs mostly normally without the founder',
  },
  final_decisions: {
    [OPT.final_decisions.ALWAYS_ME]: 'Nearly all decisions route through the founder',
    [OPT.final_decisions.MOSTLY_ME]: 'Most decisions still route through the founder',
    [OPT.final_decisions.SHARED]: 'Decision authority is shared with senior staff',
    [OPT.final_decisions.RARELY_ME]: 'The team makes most decisions without escalation',
  },
  project_stall: {
    [OPT.project_stall.APPROVAL]: 'Projects stall waiting for founder approval',
    [OPT.project_stall.TEAM_EXECUTION]: 'Projects stall waiting on team execution',
    [OPT.project_stall.STAFFING]: 'Projects stall due to staffing gaps',
  },
  growth_limiter: {
    [OPT.growth_limiter.TIME]: 'Founder time is the limiter',
    [OPT.growth_limiter.STAFF]: 'Team capacity is the limiter',
    [OPT.growth_limiter.OPS]: 'Operational friction is the limiter',
    [OPT.growth_limiter.PRICING]: 'Pricing / margins are the limiter',
    [OPT.growth_limiter.DEMAND]: 'Demand volatility is the limiter',
  },
  process_documentation: {
    [OPT.process_documentation.IN_HEAD]: 'Processes live in the founder\'s head (not systemized)',
    [OPT.process_documentation.LIGHT]: 'Some documentation exists, but it\'s incomplete',
    [OPT.process_documentation.NOT_USED]: 'Docs exist, but the team doesn\'t run on them',
    [OPT.process_documentation.FULLY]: 'Processes are documented and consistently followed',
  },
  roles_handled: {
    [OPT.roles_handled.SEVEN_PLUS]: 'Founder is carrying 7+ roles',
    [OPT.roles_handled.FIVE_SIX]: 'Founder is carrying 5\u20136 roles',
    [OPT.roles_handled.THREE_FOUR]: 'Founder is carrying 3\u20134 roles',
    [OPT.roles_handled.ONE_TWO]: 'Founder is carrying 1\u20132 roles',
  },
  client_relationship: {
    [OPT.client_relationship.HIRE_ME]: 'Clients hire the founder specifically',
    [OPT.client_relationship.EXPECT_ME]: 'Clients expect founder involvement',
    [OPT.client_relationship.ASSIGNED]: 'Clients work directly with the team',
    [OPT.client_relationship.NO_FOUNDER]: 'No founder involvement in client work',
  },
  key_member_leaves: {
    [OPT.key_member_leaves.REVENUE_DROPS]: 'Revenue drops if a key person leaves',
    [OPT.key_member_leaves.DELIVERY_SLOWS]: 'Delivery slows if a key person leaves',
    [OPT.key_member_leaves.TEMPORARY]: 'Temporary disruption if a key person leaves',
    [OPT.key_member_leaves.MINIMAL]: 'Minimal impact if a key person leaves',
  },
  pricing_decisions: {
    [OPT.pricing_decisions.ONLY_ME]: 'Pricing decisions are founder-only',
    [OPT.pricing_decisions.I_APPROVE]: 'Founder approves final pricing',
    [OPT.pricing_decisions.SENIOR_TEAM]: 'Senior team sets pricing',
    [OPT.pricing_decisions.FIXED]: 'Fixed pricing structure in place',
  },
  interruption_frequency: {
    [OPT.interruption_frequency.CONSTANTLY]: 'Constant decision interruptions throughout the day',
    [OPT.interruption_frequency.MULTIPLE_DAILY]: 'Multiple decision interruptions per day',
    [OPT.interruption_frequency.FEW_WEEKLY]: 'A few decision interruptions per week',
    [OPT.interruption_frequency.RARELY]: 'Rarely interrupted for decisions',
  },
  hiring_situation: {
    [OPT.hiring_situation.HARD_TO_FIND]: 'Hiring is hard (talent is scarce)',
    [OPT.hiring_situation.OCCASIONALLY]: 'Hiring happens occasionally',
    [OPT.hiring_situation.FULLY_STAFFED]: 'Currently fully staffed',
    [OPT.hiring_situation.OVERSTAFFED]: 'Currently overstaffed',
  },
  free_capacity: {
    [OPT.free_capacity.DELEGATE_APPROVALS]: 'Delegating approvals would free capacity fastest',
    [OPT.free_capacity.HIRE]: 'Hiring would free capacity fastest',
    [OPT.free_capacity.SYSTEMS]: 'Better systems would free capacity fastest',
    [OPT.free_capacity.RAISE_PRICES]: 'Raising prices would relieve pressure fastest',
    [OPT.free_capacity.REDUCE_CLIENTS]: 'Reducing client load would relieve pressure fastest',
  },
  current_state: {
    [OPT.current_state.CHAOTIC]: 'Operating in a chaotic, reactive mode',
    [OPT.current_state.GROWING_STRAINED]: 'Growing, but strain is increasing',
    [OPT.current_state.STABLE_CAPPED]: 'Stable, but capped at a ceiling',
    [OPT.current_state.PROFITABLE_HEAVY]: 'Profitable, but founder-heavy',
    [OPT.current_state.UNSURE]: 'Current state is unclear',
  },
};

function previewPlain(field: string, value?: string): string {
  if (!value) return '';
  return PREVIEW_PLAIN_EN[field]?.[value] ?? value;
}

// ------------------------------------------------------------------
// EXPOSURE METRIC LINE BUILDER
// Uses cleanDisplay() to prevent "Label: Label is…" duplication.
// ------------------------------------------------------------------

function exposureLine(label: string, field: string, value?: string): string | null {
  if (!value) return null;
  return `${label}: ${cleanDisplay(field, value)}`;
}

// ------------------------------------------------------------------
// COMPOUND NARRATIVE RULES
// Keyed on primary.type + secondary.type, with optional answer gates.
// First match wins. All 12 pair permutations have dedicated fallbacks.
// ------------------------------------------------------------------

type CompoundRule = {
  primary: string;
  secondary: string;
  when?: Array<{ field: keyof IntakeResponse; eq?: string; anyOf?: string[] }>;
  narrative: string;
};

function matchCompoundWhen(
  data: IntakeResponse,
  conditions: Array<{ field: keyof IntakeResponse; eq?: string; anyOf?: string[] }>
): boolean {
  return conditions.every(c => {
    const v = (data[c.field] ?? '').toString();
    if (c.eq) return v === c.eq;
    if (c.anyOf) return c.anyOf.includes(v);
    return false;
  });
}

const COMPOUND_RULES: CompoundRule[] = [
  // ── founderCentralization + decisionBottleneck ──
  {
    primary: 'founderCentralization',
    secondary: 'decisionBottleneck',
    when: [{ field: 'revenue_generation', anyOf: [OPT.revenue_generation.TEAM_REVIEWS, OPT.revenue_generation.TEAM_INDEPENDENT] }],
    narrative: 'The team can deliver, but most decisions still route through the founder. Delegation exists in execution — not in authority.',
  },
  {
    primary: 'founderCentralization',
    secondary: 'decisionBottleneck',
    when: [{ field: 'interruption_frequency', eq: OPT.interruption_frequency.CONSTANTLY }],
    narrative: 'Revenue depends on the founder, and constant decision interruptions fragment the time available for delivery. The two constraints reinforce each other.',
  },

  // ── founderCentralization + structuralFragility ──
  {
    primary: 'founderCentralization',
    secondary: 'structuralFragility',
    when: [{ field: 'two_week_absence', eq: OPT.two_week_absence.REVENUE_DROPS }],
    narrative: 'Revenue stops when the founder steps away, and no documented structure exists to absorb that gap. The single point of failure has no backup.',
  },
  {
    primary: 'founderCentralization',
    secondary: 'structuralFragility',
    when: [{ field: 'process_documentation', eq: OPT.process_documentation.IN_HEAD }],
    narrative: 'The founder carries the institutional knowledge, and none of it has been extracted into systems. The dependency and the fragility are the same problem.',
  },

  // ── founderCentralization + capacityConstraint ──
  {
    primary: 'founderCentralization',
    secondary: 'capacityConstraint',
    when: [{ field: 'growth_limiter', eq: OPT.growth_limiter.TIME }],
    narrative: 'Revenue is tied to the founder\'s time, and that time is the stated growth limiter. The constraint won\'t move until the founder\'s role does.',
  },
  {
    primary: 'founderCentralization',
    secondary: 'capacityConstraint',
    when: [{ field: 'roles_handled', eq: OPT.roles_handled.SEVEN_PLUS }],
    narrative: 'The founder is carrying 7+ roles while also being the primary revenue driver. Capacity can\'t scale because one person is the bottleneck across every function.',
  },

  // ── decisionBottleneck + founderCentralization ──
  {
    primary: 'decisionBottleneck',
    secondary: 'founderCentralization',
    when: [{ field: 'client_relationship', eq: OPT.client_relationship.HIRE_ME }],
    narrative: 'Decisions funnel through the founder, and clients expect that same person involved. Authority and client relationships are both concentrated in one role.',
  },
  {
    primary: 'decisionBottleneck',
    secondary: 'founderCentralization',
    when: [{ field: 'project_stall', eq: OPT.project_stall.APPROVAL }],
    narrative: 'Projects stall on founder approval, and the founder is also the one clients hire. Removing the bottleneck means redefining the founder\'s entire role.',
  },

  // ── decisionBottleneck + structuralFragility ──
  {
    primary: 'decisionBottleneck',
    secondary: 'structuralFragility',
    when: [{ field: 'process_documentation', eq: OPT.process_documentation.LIGHT }],
    narrative: 'Partial documentation exists, but not the decision criteria the team needs. Every judgment call still routes to the founder because the docs don\'t cover when and how to decide.',
  },
  {
    primary: 'decisionBottleneck',
    secondary: 'structuralFragility',
    when: [{ field: 'process_documentation', eq: OPT.process_documentation.NOT_USED }],
    narrative: 'Processes are documented, but the team doesn\'t run on them — so decisions still centralize. The infrastructure exists; the adoption doesn\'t.',
  },

  // ── decisionBottleneck + capacityConstraint ──
  {
    primary: 'decisionBottleneck',
    secondary: 'capacityConstraint',
    when: [{ field: 'interruption_frequency', anyOf: [OPT.interruption_frequency.CONSTANTLY, OPT.interruption_frequency.MULTIPLE_DAILY] }],
    narrative: 'Frequent decision interruptions are consuming capacity that should go toward output. The bottleneck is artificial — created by centralized authority, not by actual workload limits.',
  },
  {
    primary: 'decisionBottleneck',
    secondary: 'capacityConstraint',
    when: [{ field: 'growth_limiter', eq: OPT.growth_limiter.TIME }],
    narrative: 'Time is the growth limiter, and the decision queue is consuming much of it. Clearing the bottleneck would free the capacity the business needs to scale.',
  },

  // ── structuralFragility + founderCentralization ──
  {
    primary: 'structuralFragility',
    secondary: 'founderCentralization',
    when: [{ field: 'process_documentation', eq: OPT.process_documentation.IN_HEAD }],
    narrative: 'All institutional knowledge lives in the founder\'s head. The fragility and the dependency are the same problem — extraction hasn\'t started.',
  },
  {
    primary: 'structuralFragility',
    secondary: 'founderCentralization',
    when: [{ field: 'key_member_leaves', eq: OPT.key_member_leaves.REVENUE_DROPS }],
    narrative: 'Revenue depends on specific people, not systems. Both founder absence and key-person departure are existential risks because no structural buffer exists.',
  },

  // ── structuralFragility + decisionBottleneck ──
  {
    primary: 'structuralFragility',
    secondary: 'decisionBottleneck',
    when: [{ field: 'process_documentation', eq: OPT.process_documentation.IN_HEAD }],
    narrative: 'Processes live in the founder\'s head, so every edge case becomes a founder decision. The fragility directly creates the bottleneck.',
  },
  {
    primary: 'structuralFragility',
    secondary: 'decisionBottleneck',
    when: [{ field: 'final_decisions', anyOf: [OPT.final_decisions.ALWAYS_ME, OPT.final_decisions.MOSTLY_ME] }],
    narrative: 'Without documented standards, decisions default to whoever built the thing. That person is always the founder.',
  },

  // ── structuralFragility + capacityConstraint ──
  {
    primary: 'structuralFragility',
    secondary: 'capacityConstraint',
    when: [{ field: 'hiring_situation', eq: OPT.hiring_situation.HARD_TO_FIND }],
    narrative: 'The business can\'t scale because it can\'t onboard effectively — no playbook exists for new hires to follow, and finding qualified talent is already difficult.',
  },
  {
    primary: 'structuralFragility',
    secondary: 'capacityConstraint',
    when: [{ field: 'growth_limiter', eq: OPT.growth_limiter.OPS }],
    narrative: 'Operational inefficiency is the stated limiter, and fragile systems are the root cause. More resources won\'t help until the systems they\'d work inside are built.',
  },

  // ── capacityConstraint + founderCentralization ──
  {
    primary: 'capacityConstraint',
    secondary: 'founderCentralization',
    when: [{ field: 'hiring_situation', eq: OPT.hiring_situation.HARD_TO_FIND }],
    narrative: 'Capacity is maxed and hiring is difficult. The founder carries too much of the load, and the talent market isn\'t providing relief fast enough.',
  },
  {
    primary: 'capacityConstraint',
    secondary: 'founderCentralization',
    when: [{ field: 'revenue_generation', eq: OPT.revenue_generation.FOUNDER_MAJORITY }],
    narrative: 'The founder delivers most of the revenue, and capacity is the ceiling. Growth is mathematically impossible without changing the delivery model.',
  },

  // ── capacityConstraint + decisionBottleneck ──
  {
    primary: 'capacityConstraint',
    secondary: 'decisionBottleneck',
    when: [{ field: 'interruption_frequency', anyOf: [OPT.interruption_frequency.CONSTANTLY, OPT.interruption_frequency.MULTIPLE_DAILY] }],
    narrative: 'Frequent decision interruptions are consuming capacity that should go toward output. The bottleneck is artificial — created by centralized authority, not by actual workload limits.',
  },
  {
    primary: 'capacityConstraint',
    secondary: 'decisionBottleneck',
    when: [{ field: 'free_capacity', eq: OPT.free_capacity.DELEGATE_APPROVALS }],
    narrative: 'Capacity is the constraint, and delegating approvals is the identified lever. The team has bandwidth — it\'s gated by the approval queue.',
  },

  // ── capacityConstraint + structuralFragility ──
  {
    primary: 'capacityConstraint',
    secondary: 'structuralFragility',
    when: [{ field: 'growth_limiter', eq: OPT.growth_limiter.OPS }],
    narrative: 'Capacity is capped, and operational friction is the primary drag. More people won\'t help until the systems they\'d work inside are built.',
  },
  {
    primary: 'capacityConstraint',
    secondary: 'structuralFragility',
    when: [{ field: 'process_documentation', eq: OPT.process_documentation.IN_HEAD }],
    narrative: 'Growth is blocked by resource limits, and no documented systems exist to onboard the help that\'s needed. The capacity problem and the documentation gap feed each other.',
  },
];

function generateCompoundNarrative(
  primary: ConstraintDimension,
  secondary: ConstraintDimension,
  data: IntakeResponse
): string {
  if (detectConstraintCategory(data) === 'STRATEGIC') {
    return 'Operational foundations are healthy; the next bottleneck is strategic growth design, not delegation or process repair.';
  }

  const p = primary.type;
  const s = secondary.type;

  // 1) Check rule table (answer-gated variants first)
  for (const rule of COMPOUND_RULES) {
    if (rule.primary === p && rule.secondary === s) {
      if (!rule.when || matchCompoundWhen(data, rule.when)) {
        return rule.narrative;
      }
    }
  }

  // 2) Pair fallbacks (no answer gates — covers all 12 permutations)
  if (p === 'founderCentralization' && s === 'decisionBottleneck') {
    return 'Revenue depends on the founder, and so do most decisions. Stepping back from delivery doesn\'t reduce the load — it shifts it from execution to oversight.';
  }
  if (p === 'founderCentralization' && s === 'structuralFragility') {
    return 'The founder is the business\'s single point of failure, and there\'s no documented structure to absorb that risk. Delegation isn\'t a preference issue — there\'s nothing to delegate into.';
  }
  if (p === 'founderCentralization' && s === 'capacityConstraint') {
    return 'Revenue is tied to the founder\'s time, and that time is already maxed. Growth requires structural change, not harder work.';
  }
  if (p === 'decisionBottleneck' && s === 'founderCentralization') {
    return 'Decisions funnel through the founder because authority hasn\'t been distributed. Meanwhile, revenue depends on that same person being available — competing demands on a fixed resource.';
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

  // 3) Generic fallback (should rarely fire given all 12 pairs are covered)
  return `The ${primary.label.toLowerCase()} is compounded by ${secondary.label.toLowerCase()}, creating reinforcing pressure on the business.`;
}

// ------------------------------------------------------------------
// STRUCTURAL TENSION RULES
// Keyed on answer-pair conditions. First match wins.
// All conditions use strict equality (eq / anyOf) — no fuzzy matching.
// ------------------------------------------------------------------

type TensionRule = {
  when: Array<{ field: keyof IntakeResponse; eq?: string; anyOf?: string[] }>;
  tension: string;
};

function matchTensionWhen(
  data: IntakeResponse,
  conditions: Array<{ field: keyof IntakeResponse; eq?: string; anyOf?: string[] }>
): boolean {
  return conditions.every(c => {
    const v = (data[c.field] ?? '').toString();
    if (c.eq) return v === c.eq;
    if (c.anyOf) return c.anyOf.includes(v);
    return false;
  });
}

const TENSION_RULES: TensionRule[] = [
  // ── ORIGINAL RULES (converted to strict equality) ──

  // Team delivers independently but decisions centralized
  {
    when: [
      { field: 'revenue_generation', eq: OPT.revenue_generation.TEAM_INDEPENDENT },
      { field: 'final_decisions', anyOf: [OPT.final_decisions.ALWAYS_ME, OPT.final_decisions.MOSTLY_ME] },
    ],
    tension: 'Team capable of independent delivery, but decision authority remains centralized.',
  },

  // Team delivers (founder reviews) but decisions still "always me"
  {
    when: [
      { field: 'revenue_generation', eq: OPT.revenue_generation.TEAM_REVIEWS },
      { field: 'final_decisions', eq: OPT.final_decisions.ALWAYS_ME },
    ],
    tension: 'The founder already reviews team output — yet all final decisions still route through the same person. The review layer doubles as a decision bottleneck.',
  },

  // Hiring constrained + pricing unchanged
  {
    when: [
      { field: 'hiring_situation', eq: OPT.hiring_situation.HARD_TO_FIND },
      { field: 'growth_limiter', eq: OPT.growth_limiter.PRICING },
    ],
    tension: 'Hiring is constrained, but pricing hasn\'t changed — the business can\'t attract the talent it needs at current margins.',
  },

  // Documented but not used + stalls on approval
  {
    when: [
      { field: 'process_documentation', eq: OPT.process_documentation.NOT_USED },
      { field: 'project_stall', eq: OPT.project_stall.APPROVAL },
    ],
    tension: 'Processes are documented, but the team still waits on founder approval — the bottleneck is authority, not knowledge.',
  },

  // Light documentation + shared decisions
  {
    when: [
      { field: 'process_documentation', eq: OPT.process_documentation.LIGHT },
      { field: 'final_decisions', eq: OPT.final_decisions.SHARED },
    ],
    tension: 'Decision authority is shared, but documentation is incomplete — the team has authority without the reference material to use it consistently.',
  },

  // Processes in head + decisions always me
  {
    when: [
      { field: 'process_documentation', eq: OPT.process_documentation.IN_HEAD },
      { field: 'final_decisions', eq: OPT.final_decisions.ALWAYS_ME },
    ],
    tension: 'All decisions route through the founder, and no documented criteria exist for anyone else to use. The concentration is total.',
  },

  // Processes in head + decisions mostly me
  {
    when: [
      { field: 'process_documentation', eq: OPT.process_documentation.IN_HEAD },
      { field: 'final_decisions', eq: OPT.final_decisions.MOSTLY_ME },
    ],
    tension: 'Most decisions still flow through the founder, and the knowledge base to support delegation hasn\'t been built. Authority centralizes by default.',
  },

  // Founder delivers majority + clients hire founder specifically
  {
    when: [
      { field: 'revenue_generation', eq: OPT.revenue_generation.FOUNDER_MAJORITY },
      { field: 'client_relationship', eq: OPT.client_relationship.HIRE_ME },
    ],
    tension: 'Clients hire the founder, and the founder does most of the delivery. Both the relationship and the execution are concentrated in one person.',
  },

  // Team delivers + clients still expect founder (two variants)
  {
    when: [
      { field: 'revenue_generation', eq: OPT.revenue_generation.TEAM_INDEPENDENT },
      { field: 'client_relationship', eq: OPT.client_relationship.EXPECT_ME },
    ],
    tension: 'The team handles delivery independently, but clients still expect founder involvement — the constraint is perception, not capability.',
  },
  {
    when: [
      { field: 'revenue_generation', eq: OPT.revenue_generation.TEAM_REVIEWS },
      { field: 'client_relationship', eq: OPT.client_relationship.EXPECT_ME },
    ],
    tension: 'The team handles delivery with founder review, but clients expect more founder involvement than the review layer provides.',
  },

  // Revenue drops on absence + revenue drops on key departure
  {
    when: [
      { field: 'two_week_absence', eq: OPT.two_week_absence.REVENUE_DROPS },
      { field: 'key_member_leaves', eq: OPT.key_member_leaves.REVENUE_DROPS },
    ],
    tension: 'Both founder absence and key-person departure impact revenue. Dependency extends beyond the founder to specific individuals — no structural buffer exists.',
  },

  // Work slows on absence + delivery slows on key departure
  {
    when: [
      { field: 'two_week_absence', eq: OPT.two_week_absence.WORK_SLOWS },
      { field: 'key_member_leaves', eq: OPT.key_member_leaves.DELIVERY_SLOWS },
    ],
    tension: 'Both founder absence and key-person departure slow operations. The business depends on specific people rather than documented systems.',
  },

  // Revenue drops on absence + delivery slows on key departure
  {
    when: [
      { field: 'two_week_absence', eq: OPT.two_week_absence.REVENUE_DROPS },
      { field: 'key_member_leaves', eq: OPT.key_member_leaves.DELIVERY_SLOWS },
    ],
    tension: 'Founder absence stops revenue, and losing a key team member slows delivery. The operation has two different single points of failure.',
  },

  // Wants to delegate approvals but decisions are "always me"
  {
    when: [
      { field: 'free_capacity', eq: OPT.free_capacity.DELEGATE_APPROVALS },
      { field: 'final_decisions', eq: OPT.final_decisions.ALWAYS_ME },
    ],
    tension: 'The founder wants to delegate decisions but hasn\'t started — the constraint is structural, not aspirational.',
  },

  // Team delivers but key person leaving drops revenue
  {
    when: [
      { field: 'revenue_generation', anyOf: [OPT.revenue_generation.TEAM_REVIEWS, OPT.revenue_generation.TEAM_INDEPENDENT] },
      { field: 'key_member_leaves', eq: OPT.key_member_leaves.REVENUE_DROPS },
    ],
    tension: 'Team handles delivery, but losing a key member still impacts revenue — concentration has shifted from founder to individuals.',
  },

  // Hiring to solve capacity but growth limited by systems
  {
    when: [
      { field: 'free_capacity', eq: OPT.free_capacity.HIRE },
      { field: 'growth_limiter', eq: OPT.growth_limiter.OPS },
    ],
    tension: 'Hiring seen as the solution, but operational inefficiency is the actual limiter — more people won\'t fix broken systems.',
  },

  // Growth limited by staff + delegating approvals as capacity lever
  {
    when: [
      { field: 'growth_limiter', eq: OPT.growth_limiter.STAFF },
      { field: 'free_capacity', eq: OPT.free_capacity.DELEGATE_APPROVALS },
    ],
    tension: 'Staffing is the stated limiter, but the founder sees delegating approvals as the biggest capacity lever. The team may be more capable than current authority structures allow.',
  },

  // Growth limited by time + better systems as lever
  {
    when: [
      { field: 'growth_limiter', eq: OPT.growth_limiter.TIME },
      { field: 'free_capacity', eq: OPT.free_capacity.SYSTEMS },
    ],
    tension: 'Not enough time is the stated limiter, and better systems is the identified lever — but systems require the same time that\'s currently missing to build.',
  },

  // Growth limited by time + hiring as lever
  {
    when: [
      { field: 'growth_limiter', eq: OPT.growth_limiter.TIME },
      { field: 'free_capacity', eq: OPT.free_capacity.HIRE },
    ],
    tension: 'Time is the limiter, and hiring is the identified solution — but new hires require onboarding time from a founder who has none to spare.',
  },

  // Business runs normally without founder but clients hire founder specifically
  {
    when: [
      { field: 'two_week_absence', eq: OPT.two_week_absence.RUNS_NORMALLY },
      { field: 'client_relationship', eq: OPT.client_relationship.HIRE_ME },
    ],
    tension: 'Operations run without the founder, but clients still expect founder involvement — the constraint is perception, not capability.',
  },

  // Processes in head but team delivers independently
  {
    when: [
      { field: 'process_documentation', eq: OPT.process_documentation.IN_HEAD },
      { field: 'revenue_generation', eq: OPT.revenue_generation.TEAM_INDEPENDENT },
    ],
    tension: 'Team delivers service independently, but processes live in the founder\'s head — the gap between execution and documentation creates hidden risk.',
  },

  // Processes in head but team delivers with review
  {
    when: [
      { field: 'process_documentation', eq: OPT.process_documentation.IN_HEAD },
      { field: 'revenue_generation', eq: OPT.revenue_generation.TEAM_REVIEWS },
    ],
    tension: 'Team delivers but founder reviews everything — and no documented processes exist to guide either side. The review gate is the only quality control.',
  },

  // Better systems identified but documentation is "in my head"
  {
    when: [
      { field: 'free_capacity', eq: OPT.free_capacity.SYSTEMS },
      { field: 'process_documentation', eq: OPT.process_documentation.IN_HEAD },
    ],
    tension: 'Better systems identified as the lever, but no documented processes exist to systematize — the foundation hasn\'t been laid.',
  },

  // Constant interruptions + time as growth limiter
  {
    when: [
      { field: 'interruption_frequency', eq: OPT.interruption_frequency.CONSTANTLY },
      { field: 'growth_limiter', eq: OPT.growth_limiter.TIME },
    ],
    tension: 'Not enough time is the stated growth limiter, but constant decision interruptions are consuming the time that exists.',
  },

  // Frequent interruptions + projects stall on approval
  {
    when: [
      { field: 'interruption_frequency', anyOf: [OPT.interruption_frequency.CONSTANTLY, OPT.interruption_frequency.MULTIPLE_DAILY] },
      { field: 'project_stall', eq: OPT.project_stall.APPROVAL },
    ],
    tension: 'The founder is interrupted constantly for decisions, and projects stall waiting on approval. The interruptions and the bottleneck are the same problem.',
  },

  // Frequent interruptions + projects stall on team execution
  {
    when: [
      { field: 'interruption_frequency', anyOf: [OPT.interruption_frequency.CONSTANTLY, OPT.interruption_frequency.MULTIPLE_DAILY] },
      { field: 'project_stall', eq: OPT.project_stall.TEAM_EXECUTION },
    ],
    tension: 'The founder is interrupted frequently for decisions, but projects stall on team execution — the team needs both direction and capacity.',
  },

  // Growing but strained + fully staffed
  {
    when: [
      { field: 'current_state', eq: OPT.current_state.GROWING_STRAINED },
      { field: 'hiring_situation', eq: OPT.hiring_situation.FULLY_STAFFED },
    ],
    tension: 'Growing but strained despite being fully staffed — the constraint isn\'t headcount, it\'s how work is structured.',
  },

  // Profitable + 7+ roles
  {
    when: [
      { field: 'current_state', eq: OPT.current_state.PROFITABLE_HEAVY },
      { field: 'roles_handled', eq: OPT.roles_handled.SEVEN_PLUS },
    ],
    tension: 'Profitable, but the founder is handling 7+ roles — profitability masks an unsustainable operating model.',
  },

  // ── NEW TENSIONS (8 additions per spec) ──

  // Shared decisions + still stalls waiting approval
  {
    when: [
      { field: 'final_decisions', eq: OPT.final_decisions.SHARED },
      { field: 'project_stall', eq: OPT.project_stall.APPROVAL },
    ],
    tension: 'Decision authority is nominally shared, but projects still stall on founder approval — shared in theory, centralized in practice.',
  },

  // Docs exist/not used + founder review gate
  {
    when: [
      { field: 'process_documentation', eq: OPT.process_documentation.NOT_USED },
      { field: 'revenue_generation', eq: OPT.revenue_generation.TEAM_REVIEWS },
    ],
    tension: 'Documentation exists but isn\'t followed, and the founder reviews all output anyway. The docs are a formality — the founder is the real quality system.',
  },

  // Few interruptions + "not enough time" limiter
  {
    when: [
      { field: 'interruption_frequency', eq: OPT.interruption_frequency.FEW_WEEKLY },
      { field: 'growth_limiter', eq: OPT.growth_limiter.TIME },
    ],
    tension: 'Decision interruptions are low, but time is still the growth limiter — the capacity drain is coming from somewhere other than decision load.',
  },

  // Stable but capped + team execution stalls (idle/lag signal)
  {
    when: [
      { field: 'current_state', eq: OPT.current_state.STABLE_CAPPED },
      { field: 'project_stall', eq: OPT.project_stall.TEAM_EXECUTION },
    ],
    tension: 'The business is stable but capped, and projects stall on team execution — the ceiling is delivery capacity, not demand.',
  },

  // Team delivers + founder screens all clients / writes all proposals (founder controls sales)
  {
    when: [
      { field: 'revenue_generation', anyOf: [OPT.revenue_generation.TEAM_REVIEWS, OPT.revenue_generation.TEAM_INDEPENDENT] },
      { field: 'pricing_decisions', eq: OPT.pricing_decisions.ONLY_ME },
    ],
    tension: 'The team delivers the work, but the founder controls all pricing. Revenue generation is delegated, but revenue decisions are not.',
  },

  // Business runs without founder + clients expect founder
  {
    when: [
      { field: 'two_week_absence', eq: OPT.two_week_absence.RUNS_NORMALLY },
      { field: 'client_relationship', eq: OPT.client_relationship.EXPECT_ME },
    ],
    tension: 'The business runs fine without the founder, but clients still expect involvement. The operational dependency is resolved — the perception dependency is not.',
  },

  // Stable but capped + not enough time
  {
    when: [
      { field: 'current_state', eq: OPT.current_state.STABLE_CAPPED },
      { field: 'growth_limiter', eq: OPT.growth_limiter.TIME },
    ],
    tension: 'Stable but capped, and founder time is the stated limiter. The plateau isn\'t a market problem — it\'s a capacity problem wearing a stability mask.',
  },

  // Rarely interrupted + projects stall on approval
  {
    when: [
      { field: 'interruption_frequency', eq: OPT.interruption_frequency.RARELY },
      { field: 'project_stall', eq: OPT.project_stall.APPROVAL },
    ],
    tension: 'Decision interruptions are rare, but projects still stall on approval. The founder isn\'t being pulled in — the team is waiting for scheduled checkpoints that come too slowly.',
  },
];

// ------------------------------------------------------------------
// SECTION GENERATORS — all use strict equality
// ------------------------------------------------------------------

function mostVisibleSignal(data: IntakeResponse): string | null {
  if (data.interruption_frequency === OPT.interruption_frequency.CONSTANTLY) {
    return `Most visible signal: ${previewPlain('interruption_frequency', data.interruption_frequency)}.`;
  }
  if (data.two_week_absence === OPT.two_week_absence.REVENUE_DROPS) {
    return `Most visible signal: ${previewPlain('two_week_absence', data.two_week_absence)}.`;
  }
  if (data.project_stall === OPT.project_stall.APPROVAL) {
    return `Most visible signal: ${previewPlain('project_stall', data.project_stall)}.`;
  }
  if (data.process_documentation === OPT.process_documentation.IN_HEAD) {
    return `Most visible signal: ${previewPlain('process_documentation', data.process_documentation)}.`;
  }
  if (data.key_member_leaves === OPT.key_member_leaves.REVENUE_DROPS) {
    return `Most visible signal: ${previewPlain('key_member_leaves', data.key_member_leaves)}.`;
  }
  if (data.roles_handled === OPT.roles_handled.SEVEN_PLUS) {
    return `Most visible signal: ${previewPlain('roles_handled', data.roles_handled)}.`;
  }
  return null;
}

function generateConstraintSnapshot(
  data: IntakeResponse,
  primary: ConstraintDimension,
  secondary: ConstraintDimension,
  businessName: string,
  primaryLabel: string,
  secondaryLabel: string,
  founderDependencyScore: number
): string {
  const parts: string[] = [];
  const name = businessName || 'Your Business';

  if (detectConstraintCategory(data) === 'STRATEGIC') {
    parts.push(`${name} is operating with strong delegation and low operational dependency.`);
    parts.push('Core delivery, decisions, and process execution are no longer concentrated in the founder.');
    if (data.growth_limiter === OPT.growth_limiter.DEMAND) {
      parts.push('The current ceiling is market-side (demand consistency), not an internal operating bottleneck.');
    } else {
      parts.push('The primary next lever is strategic optimization (positioning, demand generation, pricing, or channel expansion).');
    }
    parts.push('Start with: run a 90-day demand + pricing experiment plan instead of adding internal process complexity.');
    return parts.join(' ');
  }

  // Sentence 1: What's concentrated
  if (primaryLabel === 'Knowledge Silos') {
    parts.push(`${name} is relying on tribal knowledge instead of documented decision standards.`);
  } else if (primaryLabel === 'Process Gaps') {
    parts.push(`${name} has documented workflows, but execution is inconsistent because those workflows are not enforced.`);
  } else if (primary.type === 'founderCentralization') {
    parts.push(`${name} operates with key functions concentrated around the founder.`);
  } else if (primary.type === 'decisionBottleneck') {
    parts.push(`${name} runs on a decision model where most approvals flow through a single point.`);
  } else if (primary.type === 'structuralFragility') {
    parts.push(`${name} has limited structural redundancy — processes and knowledge are under-formalized.`);
  } else {
    parts.push(`${name} is operating near its capacity ceiling, with growth constrained by available resources.`);
  }

  // Sentence 2: How growth affects it
  const state = data.current_state || '';
  if (state === OPT.current_state.GROWING_STRAINED) {
    parts.push('Current growth is adding pressure to this pattern rather than resolving it.');
  } else if (state === OPT.current_state.STABLE_CAPPED) {
    parts.push('The business has reached a plateau where this constraint limits further scaling.');
  } else if (state === OPT.current_state.CHAOTIC) {
    parts.push('Day-to-day operations are reactive, indicating this pattern is already producing friction.');
  } else if (state === OPT.current_state.PROFITABLE_HEAVY) {
    parts.push('Margins are intact, but growth is anchored to the founder\'s direct involvement.');
  } else {
    parts.push('As demand increases, this pattern will compound.');
  }

  // Sentence 3: Most visible signal
  const signal = mostVisibleSignal(data);
  if (signal) {
    parts.push(signal);
  } else {
    parts.push(`${secondaryLabel} reinforces the primary constraint, creating overlapping pressure.`);
  }

  // Sentence 4: directional action preview
  if (primaryLabel === 'Knowledge Silos') {
    parts.push('Start with: capture the top 3 judgment calls as decision checklists your team can use without escalation.');
  } else if (primaryLabel === 'Process Gaps') {
    parts.push('Start with: enforce a mandatory pre-review checklist and reject work that bypasses the process.');
  } else if (primaryLabel === 'Decision Load') {
    parts.push('Start with: define approval thresholds so routine decisions stop queueing for founder sign-off.');
  } else if (primaryLabel === 'Capacity Constraint') {
    parts.push('Start with: raise throughput per hour (pricing or scope controls) before adding more founder hours.');
  } else if (founderDependencyScore <= 15) {
    parts.push('Start with: shift focus to market leverage and growth design rather than internal firefighting.');
  }

  return parts.join(' ');
}

function generateExposureMetrics(data: IntakeResponse): string[] {
  const lines: Array<string | null> = [];

  lines.push(exposureLine('Delivery model', 'revenue_generation', data.revenue_generation));
  lines.push(exposureLine('Decision authority', 'final_decisions', data.final_decisions));
  lines.push(exposureLine('Documentation', 'process_documentation', data.process_documentation));
  lines.push(exposureLine('Founder roles', 'roles_handled', data.roles_handled));
  lines.push(exposureLine('Interruption load', 'interruption_frequency', data.interruption_frequency));

  // Only include if clearly founder-dependent
  if (
    data.client_relationship === OPT.client_relationship.HIRE_ME ||
    data.client_relationship === OPT.client_relationship.EXPECT_ME
  ) {
    lines.push(exposureLine('Client dependency', 'client_relationship', data.client_relationship));
  }

  return lines.filter(Boolean).slice(0, 5) as string[];
}

function generateContinuityRisk(data: IntakeResponse): string {
  if (detectConstraintCategory(data) === 'STRATEGIC') {
    return 'Continuity risk is low: operations are resilient to normal founder absence and routine variance.';
  }

  const absence = data.two_week_absence || '';
  const keyLeave = data.key_member_leaves || '';

  if (absence === OPT.two_week_absence.REVENUE_DROPS && keyLeave === OPT.key_member_leaves.REVENUE_DROPS) {
    return 'Both founder absence and key-person departure cause immediate revenue loss — the business has no structural buffer.';
  }
  if (absence === OPT.two_week_absence.REVENUE_DROPS) {
    return 'A two-week founder absence causes immediate revenue loss. The business has no independence from its operator.';
  }
  if (absence === OPT.two_week_absence.WORK_SLOWS && keyLeave === OPT.key_member_leaves.REVENUE_DROPS) {
    return 'A key departure drops revenue, and founder absence slows everything. The operation depends on specific people, not systems.';
  }
  if (absence === OPT.two_week_absence.WORK_SLOWS) {
    return 'Founder absence slows operations significantly. The team functions, but not independently.';
  }
  if (keyLeave === OPT.key_member_leaves.REVENUE_DROPS) {
    return 'Losing a key team member directly impacts revenue — individual dependency extends beyond just the founder.';
  }
  if (keyLeave === OPT.key_member_leaves.DELIVERY_SLOWS) {
    return 'A key departure slows delivery. Knowledge transfer and redundancy need attention.';
  }
  if (absence === OPT.two_week_absence.ESCALATES) {
    return 'The team can continue operating but escalates decisions to the founder — authority, not capability, is the dependency.';
  }
  return 'The business shows moderate resilience, but structural dependencies exist that could surface under stress.';
}

function generateLoadTrajectory(data: IntakeResponse): string {
  if (detectConstraintCategory(data) === 'STRATEGIC') {
    if (data.growth_limiter === OPT.growth_limiter.DEMAND) {
      return 'Trajectory now depends more on demand generation and positioning than on internal operating changes.';
    }
    return 'The operating model can support additional growth; trajectory is now strategy-limited, not execution-limited.';
  }

  const state = data.current_state || '';
  const limiter = data.growth_limiter || '';

  if (state === OPT.current_state.CHAOTIC) {
    if (limiter === OPT.growth_limiter.TIME) {
      return 'The current operating mode is consuming available capacity faster than the business can replenish it. Without structural changes, output quality or team stability will be the first pressure point.';
    }
    if (limiter === OPT.growth_limiter.OPS) {
      return 'Operational friction is absorbing capacity that would otherwise support growth. The trajectory stays flat until the friction is addressed.';
    }
    return 'The reactive pattern will compound as workload increases without additional structural support.';
  }
  if (state === OPT.current_state.GROWING_STRAINED) {
    if (limiter === OPT.growth_limiter.STAFF) {
      return 'Growth is outpacing the team\'s delivery capacity. The gap between demand and staffing is the primary constraint on trajectory.';
    }
    if (limiter === OPT.growth_limiter.TIME) {
      return 'Growth is compressing available bandwidth. The trajectory points toward a plateau unless capacity is restructured.';
    }
    return 'Growth is adding load to a structure that hasn\'t scaled with it. The current trajectory leads to a capacity ceiling.';
  }
  if (state === OPT.current_state.STABLE_CAPPED) {
    return 'The business is performing at its current structural ceiling. Trajectory is flat — stable, but with limited upside under the existing model.';
  }
  if (state === OPT.current_state.PROFITABLE_HEAVY) {
    return 'Current margins are intact, but they depend on the founder\'s direct involvement. The trajectory holds as long as that involvement continues.';
  }
  return 'Current constraints will tighten incrementally as operational demands increase.';
}

function generateStructuralTension(data: IntakeResponse): string {
  if (detectConstraintCategory(data) === 'STRATEGIC') {
    return 'Operations are decoupled from the founder; the main tension is choosing the next growth bet, not fixing internal bottlenecks.';
  }

  // 1) Check rule table — first match wins
  for (const rule of TENSION_RULES) {
    if (matchTensionWhen(data, rule.when)) {
      return rule.tension;
    }
  }

  // 2) Generic fallback
  return 'The current structure was designed for an earlier stage — what built the business is now constraining it.';
}

// ------------------------------------------------------------------
// TRACK RESOLUTION (mirrors deepDiveBuilder.resolveTrack)
// ------------------------------------------------------------------

function resolveTrack(data: IntakeResponse): 'A' | 'B' | 'C' | 'UNIVERSAL' {
  const model = data.business_model || data.business_type || '';
  if (!model) return 'UNIVERSAL';

  if (model === OPT.business_model.STANDARDIZED) return 'A';
  if (model === OPT.business_model.ADVISORY) return 'C';
  if (model === OPT.business_model.CREATIVE || model === OPT.business_model.EXPERT) return 'B';
  if (model === OPT.business_model.HYBRID) return 'B';

  // Legacy fallback for non-standard business_type values
  const lower = model.toLowerCase();
  if (lower.includes('standardized') || lower.includes('logistics') || lower.includes('trades')) return 'A';
  if (lower.includes('advisory') || lower.includes('coaching') || lower.includes('consulting')) return 'C';

  return 'B';
}

// ------------------------------------------------------------------
// MAIN EXPORT
// ------------------------------------------------------------------

export function runPreviewDiagnostic(raw: IntakeResponse): PreviewResult {
  const data = normalizeIntake(raw);
  const businessName = data.businessName || 'Your Business';
  const scores = scoreDimensions(data);
  const ranked = rankDimensions(scores);
  const selected = selectPrimarySecondaryDimensions(data, scores);
  const primary = selected.primary;
  const secondary = selected.secondary;
  const category = selected.category;
  const founderDependencyScore = calculateFounderDependencyScore(data);
  const founderDependency = interpretFounderDependencyScore(founderDependencyScore);
  const primaryLabel = category === 'STRATEGIC'
    ? 'Strategic Optimization'
    : resolveConstraintLabel(primary.type, data);
  const secondaryLabel = category === 'STRATEGIC'
    ? resolveConstraintLabel(ranked[0].type, data)
    : resolveConstraintLabel(secondary.type, data);

  // Resolve track for metadata
  const track = resolveTrack(data);

  // Attempt to derive insight flags (optional — only fires if deep-dive answers are present)
  let insightFlags: InsightFlag[] | undefined;
  try {
    // Dynamic import would break synchronous return — import is top-level safe
    // since clarityInsightRules is a pure function with no side effects.
    // We import lazily at module level to avoid circular deps.
    const { deriveClarityInsightFlags } = require('./clarityInsightRules');
    const flags = deriveClarityInsightFlags(data);
    if (flags && flags.length > 0) {
      insightFlags = flags;
    }
  } catch {
    // clarityInsightRules not available or no matching flags — fine, metadata.insightFlags stays undefined
  }

  return {
    businessName,
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    founderDependencyScore,
    founderDependencyLevel: founderDependency.level,
    founderDependencyLabel: founderDependency.label,
    constraintSnapshot: generateConstraintSnapshot(
      data,
      primary,
      secondary,
      businessName,
      primaryLabel,
      secondaryLabel,
      founderDependencyScore
    ),
    primaryConstraint: {
      type: category === 'STRATEGIC' ? 'strategicOptimization' : primary.type,
      label: primaryLabel,
    },
    secondaryConstraint: {
      type: category === 'STRATEGIC' ? ranked[0].type : secondary.type,
      label: secondaryLabel,
    },
    constraintCompoundNarrative: generateCompoundNarrative(primary, secondary, data),
    exposureMetrics: generateExposureMetrics(data),
    continuityRisk: generateContinuityRisk(data),
    loadTrajectory: generateLoadTrajectory(data),
    structuralTension: generateStructuralTension(data),
    metadata: {
      track,
      scores,
      ranked: ranked.map(r => ({ type: r.type, label: r.label, score: r.score })),
      primary: { type: primary.type, label: primaryLabel, score: primary.score },
      secondary: { type: secondary.type, label: secondaryLabel, score: secondary.score },
      insightFlags,
    },
  };
}
