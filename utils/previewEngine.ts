import { IntakeResponse } from './diagnosticEngine';
import { normalizeIntake } from './normalizeIntake';
export { getPreviewEligibility } from './normalizeIntake';
export type { PreviewEligibility } from './normalizeIntake';

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
  founderCentralization: 'Founder Dependency',
  structuralFragility: 'System Fragility',
  decisionBottleneck: 'Decision Bottleneck',
  capacityConstraint: 'Capacity Constraint',
};

// ------------------------------------------------------------------
// PLAIN-ENGLISH TRANSLATOR
// Converts raw single-select option strings into human copy.
// Unmapped values fall through as-is.
// ------------------------------------------------------------------

type PlainEnglishMap = Record<string, Record<string, string>>;

const PREVIEW_PLAIN_EN: PlainEnglishMap = {
  revenue_generation: {
    'Founder delivers majority of service': 'Most delivery depends on the founder',
    'Team delivers, founder reviews': 'Team delivers, founder still reviews most work',
    'Team delivers independently': 'Team delivers without founder involvement',
    'Mix of founder + team delivery': 'Delivery is split between founder and team',
  },
  two_week_absence: {
    'Revenue drops immediately': 'Revenue drops fast if the founder steps away',
    'Work slows significantly': 'Work slows significantly without the founder',
    'Team continues but escalates decisions': 'Team can run, but escalates decisions upward',
    'Business runs mostly normally': 'Business runs mostly normally without the founder',
  },
  final_decisions: {
    'Always me': 'Nearly all decisions route through the founder',
    'Mostly me': 'Most decisions still route through the founder',
    'Shared with senior team': 'Decision authority is shared with senior staff',
    'Rarely me': 'The team makes most decisions without escalation',
  },
  project_stall: {
    'Waiting on my approval': 'Projects stall waiting for founder approval',
    'Waiting on team execution': 'Projects stall waiting on team execution',
    'Hiring/staffing gaps': 'Projects stall due to staffing gaps',
  },
  growth_limiter: {
    'Not enough time': 'Founder time is the limiter',
    'Not enough qualified staff': 'Team capacity is the limiter',
    'Operational inefficiency': 'Operational friction is the limiter',
    'Pricing structure': 'Pricing / margins are the limiter',
    'Inconsistent demand': 'Demand volatility is the limiter',
  },
  process_documentation: {
    'Mostly in my head': 'Processes live in the founder\'s head (not systemized)',
    'Light documentation': 'Some documentation exists, but it\'s incomplete',
    'Documented but not used': 'Docs exist, but the team doesn\'t run on them',
    'Fully documented and followed': 'Processes are documented and consistently followed',
  },
  roles_handled: {
    '7+': 'Founder is carrying 7+ roles',
    '5–6': 'Founder is carrying 5–6 roles',
    '3–4': 'Founder is carrying 3–4 roles',
    '1–2': 'Founder is carrying 1–2 roles',
  },
  client_relationship: {
    'Clients hire me specifically': 'Clients hire the founder specifically',
    'Clients hire the firm but expect me involved': 'Clients expect founder involvement',
    'Clients are assigned to team members': 'Clients work directly with the team',
    'No founder involvement needed': 'No founder involvement in client work',
  },
  key_member_leaves: {
    'Revenue drops': 'Revenue drops if a key person leaves',
    'Delivery slows': 'Delivery slows if a key person leaves',
    'Temporary disruption': 'Temporary disruption if a key person leaves',
    'Minimal impact': 'Minimal impact if a key person leaves',
  },
  pricing_decisions: {
    'Only by me': 'Pricing decisions are founder-only',
    'I approve final pricing': 'Founder approves final pricing',
    'Senior team sets pricing': 'Senior team sets pricing',
    'Fixed pricing structure': 'Fixed pricing structure in place',
  },
  interruption_frequency: {
    'Constantly throughout the day': 'Constant decision interruptions throughout the day',
    'Multiple times daily': 'Multiple decision interruptions per day',
    'A few times per week': 'A few decision interruptions per week',
    'Rarely': 'Rarely interrupted for decisions',
  },
  hiring_situation: {
    'Actively hiring, hard to find talent': 'Hiring is hard (talent is scarce)',
    'Hiring occasionally': 'Hiring happens occasionally',
    'Fully staffed': 'Currently fully staffed',
    'Overstaffed': 'Currently overstaffed',
  },
  free_capacity: {
    'Delegating approvals': 'Delegating approvals would free capacity fastest',
    'Hiring more staff': 'Hiring would free capacity fastest',
    'Better systems': 'Better systems would free capacity fastest',
    'Raising prices': 'Raising prices would relieve pressure fastest',
    'Reducing client load': 'Reducing client load would relieve pressure fastest',
  },
  current_state: {
    'Chaotic and reactive': 'Operating in a chaotic, reactive mode',
    'Growing but strained': 'Growing, but strain is increasing',
    'Stable but capped': 'Stable, but capped at a ceiling',
    'Profitable but founder-heavy': 'Profitable, but founder-heavy',
    'Unsure': 'Current state is unclear',
  },
};

function previewPlain(field: string, value?: string): string {
  if (!value) return '';
  return PREVIEW_PLAIN_EN[field]?.[value] ?? value;
}

function previewLine(label: string, field: string, value?: string): string | null {
  if (!value) return null;
  return `${label}: ${previewPlain(field, value)}`;
}

// ------------------------------------------------------------------
// RULE MATCHER ENGINE
// Shared condition matching for compound narratives + structural tension.
// ------------------------------------------------------------------

type FieldKey = keyof IntakeResponse;

type Condition = {
  field: FieldKey;
  includes?: string;
  includesAny?: string[];
  notIncludes?: string;
};

function str(val: unknown): string {
  return (val ?? '').toString();
}

function matchCondition(data: IntakeResponse, c: Condition): boolean {
  const v = str(data[c.field]).toLowerCase();
  if (!v) return false;
  if (c.includes && !v.includes(c.includes.toLowerCase())) return false;
  if (c.includesAny && !c.includesAny.some(s => v.includes(s.toLowerCase()))) return false;
  if (c.notIncludes && v.includes(c.notIncludes.toLowerCase())) return false;
  return true;
}

function matchAll(data: IntakeResponse, conditions: Condition[]): boolean {
  return conditions.every(c => matchCondition(data, c));
}

// ------------------------------------------------------------------
// COMPOUND NARRATIVE RULES
// Keyed on primary.type + secondary.type, with optional answer gates.
// First match wins. Existing hardcoded pairs remain as fallback.
// ------------------------------------------------------------------

type CompoundRule = {
  primary: string;
  secondary: string;
  when?: Condition[];
  narrative: string;
};

const COMPOUND_RULES: CompoundRule[] = [
  // ── Answer-gated variants (most specific → least specific) ──

  // founderCentralization + decisionBottleneck + team delivers → delegation exists but authority centralized
  {
    primary: 'founderCentralization',
    secondary: 'decisionBottleneck',
    when: [{ field: 'revenue_generation', includes: 'Team delivers' }],
    narrative: 'The team can deliver, but most decisions still route through the founder. Delegation exists in execution — not in authority.',
  },

  // founderCentralization + decisionBottleneck + constant interruptions
  {
    primary: 'founderCentralization',
    secondary: 'decisionBottleneck',
    when: [{ field: 'interruption_frequency', includes: 'Constantly' }],
    narrative: 'Revenue depends on the founder, and constant decision interruptions fragment the time available for delivery. The two constraints reinforce each other.',
  },

  // decisionBottleneck + structuralFragility + light docs exist
  {
    primary: 'decisionBottleneck',
    secondary: 'structuralFragility',
    when: [{ field: 'process_documentation', includes: 'Light documentation' }],
    narrative: 'Partial documentation exists, but not the decision criteria the team needs. Every judgment call still routes to the founder because the docs don\'t cover when and how to decide.',
  },

  // decisionBottleneck + structuralFragility + docs exist but unused
  {
    primary: 'decisionBottleneck',
    secondary: 'structuralFragility',
    when: [{ field: 'process_documentation', includes: 'Documented but not used' }],
    narrative: 'Processes are documented, but the team doesn\'t run on them — so decisions still centralize. The infrastructure exists; the adoption doesn\'t.',
  },

  // capacityConstraint + decisionBottleneck + multiple daily interruptions
  {
    primary: 'capacityConstraint',
    secondary: 'decisionBottleneck',
    when: [{ field: 'interruption_frequency', includesAny: ['Multiple times daily', 'Constantly'] }],
    narrative: 'Frequent decision interruptions are consuming capacity that should go toward output. The bottleneck is artificial — created by centralized authority, not by actual workload limits.',
  },

  // capacityConstraint + founderCentralization + hiring hard
  {
    primary: 'capacityConstraint',
    secondary: 'founderCentralization',
    when: [{ field: 'hiring_situation', includes: 'hard to find talent' }],
    narrative: 'Capacity is maxed and hiring is difficult. The founder carries too much of the load, and the talent market isn\'t providing relief fast enough.',
  },

  // structuralFragility + capacityConstraint + hiring hard
  {
    primary: 'structuralFragility',
    secondary: 'capacityConstraint',
    when: [{ field: 'hiring_situation', includes: 'hard to find talent' }],
    narrative: 'The business can\'t scale because it can\'t onboard effectively — no playbook exists for new hires to follow, and finding qualified talent is already difficult.',
  },

  // structuralFragility + founderCentralization + processes in head
  {
    primary: 'structuralFragility',
    secondary: 'founderCentralization',
    when: [{ field: 'process_documentation', includes: 'Mostly in my head' }],
    narrative: 'All institutional knowledge lives in the founder\'s head. The fragility and the dependency are the same problem — extraction hasn\'t started.',
  },

  // founderCentralization + capacityConstraint + not enough time
  {
    primary: 'founderCentralization',
    secondary: 'capacityConstraint',
    when: [{ field: 'growth_limiter', includes: 'Not enough time' }],
    narrative: 'Revenue is tied to the founder\'s time, and that time is the stated growth limiter. The constraint won\'t move until the founder\'s role does.',
  },

  // capacityConstraint + structuralFragility + operational inefficiency
  {
    primary: 'capacityConstraint',
    secondary: 'structuralFragility',
    when: [{ field: 'growth_limiter', includes: 'Operational inefficiency' }],
    narrative: 'Capacity is capped, and operational friction is the primary drag. More people won\'t help until the systems they\'d work inside are built.',
  },

  // decisionBottleneck + founderCentralization + clients hire founder specifically
  {
    primary: 'decisionBottleneck',
    secondary: 'founderCentralization',
    when: [{ field: 'client_relationship', includes: 'hire me specifically' }],
    narrative: 'Decisions funnel through the founder, and clients expect that same person involved. Authority and client relationships are both concentrated in one role.',
  },

  // founderCentralization + structuralFragility + revenue drops on absence
  {
    primary: 'founderCentralization',
    secondary: 'structuralFragility',
    when: [{ field: 'two_week_absence', includes: 'Revenue drops immediately' }],
    narrative: 'Revenue stops when the founder steps away, and no documented structure exists to absorb that gap. The single point of failure has no backup.',
  },
];

function generateCompoundNarrative(
  primary: ConstraintDimension,
  secondary: ConstraintDimension,
  data: IntakeResponse
): string {
  const p = primary.type;
  const s = secondary.type;

  // 1) Check rule table (answer-gated variants first)
  for (const rule of COMPOUND_RULES) {
    if (rule.primary === p && rule.secondary === s) {
      if (!rule.when || matchAll(data, rule.when)) {
        return rule.narrative;
      }
    }
  }

  // 2) Existing hardcoded pair fallbacks (no answer gates)
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

  // 3) Generic fallback
  return `The ${primary.label.toLowerCase()} is compounded by ${secondary.label.toLowerCase()}, creating reinforcing pressure on the business.`;
}

// ------------------------------------------------------------------
// STRUCTURAL TENSION RULES
// Keyed on answer-pair conditions. First match wins.
// ------------------------------------------------------------------

type TensionRule = {
  when: Condition[];
  tension: string;
};

const TENSION_RULES: TensionRule[] = [
  // ── Migrated from existing if/else + new additions ──

  // Team delivers independently but decisions centralized
  {
    when: [
      { field: 'revenue_generation', includes: 'Team delivers independently' },
      { field: 'final_decisions', includesAny: ['Always me', 'Mostly me'] },
    ],
    tension: 'Team capable of independent delivery, but decision authority remains centralized.',
  },

  // Team delivers (founder reviews) but decisions still "always me"
  {
    when: [
      { field: 'revenue_generation', includes: 'founder reviews' },
      { field: 'final_decisions', includes: 'Always me' },
    ],
    tension: 'The founder already reviews team output — yet all final decisions still route through the same person. The review layer doubles as a decision bottleneck.',
  },

  // Hiring constrained + pricing unchanged
  {
    when: [
      { field: 'hiring_situation', includes: 'hard to find talent' },
      { field: 'growth_limiter', includes: 'Pricing structure' },
    ],
    tension: 'Hiring is constrained, but pricing hasn\'t changed — the business can\'t attract the talent it needs at current margins.',
  },

  // Documented but not used + stalls on approval
  {
    when: [
      { field: 'process_documentation', includes: 'Documented but not used' },
      { field: 'project_stall', includes: 'Waiting on my approval' },
    ],
    tension: 'Processes are documented, but the team still waits on founder approval — the bottleneck is authority, not knowledge.',
  },

  // Light documentation + shared decisions → docs don't cover decision criteria
  {
    when: [
      { field: 'process_documentation', includes: 'Light documentation' },
      { field: 'final_decisions', includes: 'Shared' },
    ],
    tension: 'Decision authority is shared, but documentation is incomplete — the team has authority without the reference material to use it consistently.',
  },

  // Processes in head + decisions always me
  {
    when: [
      { field: 'process_documentation', includes: 'Mostly in my head' },
      { field: 'final_decisions', includes: 'Always me' },
    ],
    tension: 'All decisions route through the founder, and no documented criteria exist for anyone else to use. The concentration is total.',
  },

  // Processes in head + decisions mostly me
  {
    when: [
      { field: 'process_documentation', includes: 'Mostly in my head' },
      { field: 'final_decisions', includes: 'Mostly me' },
    ],
    tension: 'Most decisions still flow through the founder, and the knowledge base to support delegation hasn\'t been built. Authority centralizes by default.',
  },

  // Founder delivers majority + clients hire founder specifically
  {
    when: [
      { field: 'revenue_generation', includes: 'Founder delivers majority' },
      { field: 'client_relationship', includes: 'hire me specifically' },
    ],
    tension: 'Clients hire the founder, and the founder does most of the delivery. Both the relationship and the execution are concentrated in one person.',
  },

  // Team delivers + clients still expect founder
  {
    when: [
      { field: 'revenue_generation', includesAny: ['Team delivers', 'independently'] },
      { field: 'client_relationship', includes: 'expect me involved' },
    ],
    tension: 'The team handles delivery, but clients still expect founder involvement — the constraint is perception, not capability.',
  },

  // Revenue drops on absence + revenue drops on key departure
  {
    when: [
      { field: 'two_week_absence', includes: 'Revenue drops immediately' },
      { field: 'key_member_leaves', includes: 'Revenue drops' },
    ],
    tension: 'Both founder absence and key-person departure impact revenue. Dependency extends beyond the founder to specific individuals — no structural buffer exists.',
  },

  // Work slows on absence + delivery slows on key departure
  {
    when: [
      { field: 'two_week_absence', includes: 'Work slows significantly' },
      { field: 'key_member_leaves', includes: 'Delivery slows' },
    ],
    tension: 'Both founder absence and key-person departure slow operations. The business depends on specific people rather than documented systems.',
  },

  // Revenue drops on absence + delivery slows on key departure
  {
    when: [
      { field: 'two_week_absence', includes: 'Revenue drops immediately' },
      { field: 'key_member_leaves', includes: 'Delivery slows' },
    ],
    tension: 'Founder absence stops revenue, and losing a key team member slows delivery. The operation has two different single points of failure.',
  },

  // Wants to delegate approvals but decisions are "always me"
  {
    when: [
      { field: 'free_capacity', includes: 'Delegating approvals' },
      { field: 'final_decisions', includes: 'Always me' },
    ],
    tension: 'The founder wants to delegate decisions but hasn\'t started — the constraint is structural, not aspirational.',
  },

  // Team delivers but key person leaving drops revenue
  {
    when: [
      { field: 'revenue_generation', includesAny: ['Team delivers', 'independently'] },
      { field: 'key_member_leaves', includes: 'Revenue drops' },
    ],
    tension: 'Team handles delivery, but losing a key member still impacts revenue — concentration has shifted from founder to individuals.',
  },

  // Hiring to solve capacity but growth limited by systems
  {
    when: [
      { field: 'free_capacity', includes: 'Hiring more staff' },
      { field: 'growth_limiter', includes: 'Operational inefficiency' },
    ],
    tension: 'Hiring seen as the solution, but operational inefficiency is the actual limiter — more people won\'t fix broken systems.',
  },

  // Growth limited by staff + delegating approvals as capacity lever
  {
    when: [
      { field: 'growth_limiter', includes: 'Not enough qualified staff' },
      { field: 'free_capacity', includes: 'Delegating approvals' },
    ],
    tension: 'Staffing is the stated limiter, but the founder sees delegating approvals as the biggest capacity lever. The team may be more capable than current authority structures allow.',
  },

  // Growth limited by time + better systems as lever
  {
    when: [
      { field: 'growth_limiter', includes: 'Not enough time' },
      { field: 'free_capacity', includes: 'Better systems' },
    ],
    tension: 'Not enough time is the stated limiter, and better systems is the identified lever — but systems require the same time that\'s currently missing to build.',
  },

  // Growth limited by time + hiring as lever
  {
    when: [
      { field: 'growth_limiter', includes: 'Not enough time' },
      { field: 'free_capacity', includes: 'Hiring more staff' },
    ],
    tension: 'Time is the limiter, and hiring is the identified solution — but new hires require onboarding time from a founder who has none to spare.',
  },

  // Business runs normally without founder but clients hire founder specifically
  {
    when: [
      { field: 'two_week_absence', includes: 'Business runs mostly normally' },
      { field: 'client_relationship', includes: 'hire me specifically' },
    ],
    tension: 'Operations run without the founder, but clients still expect founder involvement — the constraint is perception, not capability.',
  },

  // Processes in head but team delivers
  {
    when: [
      { field: 'process_documentation', includes: 'Mostly in my head' },
      { field: 'revenue_generation', includesAny: ['Team delivers', 'independently'] },
    ],
    tension: 'Team delivers service, but processes live in the founder\'s head — the gap between execution and documentation creates hidden risk.',
  },

  // Better systems identified but documentation is "in my head"
  {
    when: [
      { field: 'free_capacity', includes: 'Better systems' },
      { field: 'process_documentation', includes: 'Mostly in my head' },
    ],
    tension: 'Better systems identified as the lever, but no documented processes exist to systematize — the foundation hasn\'t been laid.',
  },

  // Constant interruptions + time as growth limiter
  {
    when: [
      { field: 'interruption_frequency', includes: 'Constantly' },
      { field: 'growth_limiter', includes: 'Not enough time' },
    ],
    tension: 'Not enough time is the stated growth limiter, but constant decision interruptions are consuming the time that exists.',
  },

  // Multiple daily interruptions + projects stall on approval
  {
    when: [
      { field: 'interruption_frequency', includesAny: ['Multiple times daily', 'Constantly'] },
      { field: 'project_stall', includes: 'Waiting on my approval' },
    ],
    tension: 'The founder is interrupted constantly for decisions, and projects stall waiting on approval. The interruptions and the bottleneck are the same problem.',
  },

  // Multiple daily interruptions + projects stall on team execution
  {
    when: [
      { field: 'interruption_frequency', includesAny: ['Multiple times daily', 'Constantly'] },
      { field: 'project_stall', includes: 'Waiting on team execution' },
    ],
    tension: 'The founder is interrupted frequently for decisions, but projects stall on team execution — the team needs both direction and capacity.',
  },

  // Growing but strained + fully staffed
  {
    when: [
      { field: 'current_state', includes: 'Growing but strained' },
      { field: 'hiring_situation', includes: 'Fully staffed' },
    ],
    tension: 'Growing but strained despite being fully staffed — the constraint isn\'t headcount, it\'s how work is structured.',
  },

  // Profitable + 7+ roles
  {
    when: [
      { field: 'current_state', includes: 'Profitable' },
      { field: 'roles_handled', includes: '7+' },
    ],
    tension: 'Profitable, but the founder is handling 7+ roles — profitability masks an unsustainable operating model.',
  },
];

// ------------------------------------------------------------------
// SCORING (unchanged)
// ------------------------------------------------------------------

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

function mostVisibleSignal(data: IntakeResponse): string | null {
  if (data.interruption_frequency?.includes('Constantly')) {
    return `Most visible signal: ${previewPlain('interruption_frequency', data.interruption_frequency)}.`;
  }
  if (data.two_week_absence?.includes('Revenue drops immediately')) {
    return `Most visible signal: ${previewPlain('two_week_absence', data.two_week_absence)}.`;
  }
  if (data.project_stall?.includes('Waiting on my approval')) {
    return `Most visible signal: ${previewPlain('project_stall', data.project_stall)}.`;
  }
  if (data.process_documentation?.includes('Mostly in my head')) {
    return `Most visible signal: ${previewPlain('process_documentation', data.process_documentation)}.`;
  }
  if (data.key_member_leaves?.includes('Revenue drops')) {
    return `Most visible signal: ${previewPlain('key_member_leaves', data.key_member_leaves)}.`;
  }
  if (data.roles_handled?.includes('7+')) {
    return `Most visible signal: ${previewPlain('roles_handled', data.roles_handled)}.`;
  }
  return null;
}

function generateConstraintSnapshot(
  data: IntakeResponse,
  primary: ConstraintDimension,
  secondary: ConstraintDimension,
  businessName: string
): string {
  const parts: string[] = [];
  const name = businessName || 'Your Business';

  // Sentence 1: What's concentrated
  if (primary.type === 'founderCentralization') {
    parts.push(`${name} operates with key functions concentrated around the founder.`);
  } else if (primary.type === 'decisionBottleneck') {
    parts.push(`${name} runs on a decision model where most approvals flow through a single point.`);
  } else if (primary.type === 'structuralFragility') {
    parts.push(`${name} has limited structural redundancy — processes and knowledge are under-formalized.`);
  } else {
    parts.push(`${name} is operating near its capacity ceiling, with growth constrained by available resources.`);
  }

  // Sentence 2: How growth affects it (safe if current_state missing)
  const state = data.current_state || '';
  if (state.includes('Growing but strained')) {
    parts.push('Current growth is adding pressure to this pattern rather than resolving it.');
  } else if (state.includes('Stable but capped')) {
    parts.push('The business has reached a plateau where this constraint limits further scaling.');
  } else if (state.includes('Chaotic and reactive')) {
    parts.push('Day-to-day operations are reactive, indicating this pattern is already producing friction.');
  } else if (state.includes('Profitable but founder-heavy')) {
    parts.push('Margins are intact, but growth is anchored to the founder\'s direct involvement.');
  } else {
    parts.push('As demand increases, this pattern will compound.');
  }

  // Sentence 3: Most visible signal (translated, safe if any field missing)
  const signal = mostVisibleSignal(data);
  if (signal) {
    parts.push(signal);
  } else {
    parts.push(`${secondary.label} reinforces the primary constraint, creating overlapping pressure.`);
  }

  return parts.join(' ');
}

function generateExposureMetrics(data: IntakeResponse): string[] {
  const lines: Array<string | null> = [];

  lines.push(previewLine('Delivery model', 'revenue_generation', data.revenue_generation));
  lines.push(previewLine('Decision authority', 'final_decisions', data.final_decisions));
  lines.push(previewLine('Documentation', 'process_documentation', data.process_documentation));
  lines.push(previewLine('Founder roles', 'roles_handled', data.roles_handled));
  lines.push(previewLine('Interruption load', 'interruption_frequency', data.interruption_frequency));

  // Only include if clearly founder-dependent
  if (
    data.client_relationship &&
    (data.client_relationship.toLowerCase().includes('hire me') ||
      data.client_relationship.toLowerCase().includes('expect me'))
  ) {
    lines.push(previewLine('Client dependency', 'client_relationship', data.client_relationship));
  }

  return lines.filter(Boolean).slice(0, 5) as string[];
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
      return 'The current operating mode is consuming available capacity faster than the business can replenish it. Without structural changes, output quality or team stability will be the first pressure point.';
    }
    if (limiter.includes('Operational inefficiency')) {
      return 'Operational friction is absorbing capacity that would otherwise support growth. The trajectory stays flat until the friction is addressed.';
    }
    return 'The reactive pattern will compound as workload increases without additional structural support.';
  }
  if (state.includes('Growing but strained')) {
    if (limiter.includes('Not enough qualified staff')) {
      return 'Growth is outpacing the team\'s delivery capacity. The gap between demand and staffing is the primary constraint on trajectory.';
    }
    if (limiter.includes('Not enough time')) {
      return 'Growth is compressing available bandwidth. The trajectory points toward a plateau unless capacity is restructured.';
    }
    return 'Growth is adding load to a structure that hasn\'t scaled with it. The current trajectory leads to a capacity ceiling.';
  }
  if (state.includes('Stable but capped')) {
    return 'The business is performing at its current structural ceiling. Trajectory is flat — stable, but with limited upside under the existing model.';
  }
  if (state.includes('Profitable but founder-heavy')) {
    return 'Current margins are intact, but they depend on the founder\'s direct involvement. The trajectory holds as long as that involvement continues.';
  }
  return 'Current constraints will tighten incrementally as operational demands increase.';
}

function generateStructuralTension(data: IntakeResponse): string {
  // 1) Check rule table — first match wins
  for (const rule of TENSION_RULES) {
    if (matchAll(data, rule.when)) {
      return rule.tension;
    }
  }

  // 2) Generic fallback
  return 'The current structure was designed for an earlier stage — what built the business is now constraining it.';
}

// ------------------------------------------------------------------
// MAIN EXPORT
// ------------------------------------------------------------------

export function runPreviewDiagnostic(raw: IntakeResponse): PreviewResult {
  const data = normalizeIntake(raw);
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
