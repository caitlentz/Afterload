import { IntakeResponse } from './diagnosticEngine';
import { OPT } from './intakeOptionMap';

// ------------------------------------------------------------------
// NORMALIZE INTAKE
// Maps v1 legacy keys → v2 keys with safe fallbacks.
// Returns the original object with normalized aliases overlaid.
// Does NOT remove any fields — additive only.
// ------------------------------------------------------------------

export type PreviewEligibility = {
  outcome: 'OK';
  metadata: {
    founderDependencyScore: number;
    pattern: 'FOUNDER_HEAVY' | 'DECISION_HEAVY' | 'SYSTEM_FRAGILE' | 'CAPACITY_CEILING' | 'MIXED';
    confidence: 'HIGH' | 'MED' | 'LOW';
    primaryConstraint: { type: string; label: string; score: number };
    secondaryConstraint: { type: string; label: string; score: number };
    rationale: string;
  };
};

type DimensionScores = {
  founderCentralization: number;
  structuralFragility: number;
  decisionBottleneck: number;
  capacityConstraint: number;
};

type RankedConstraint = { type: string; label: string; score: number };

const DIMENSION_LABELS: Record<string, string> = {
  founderCentralization: 'Founder Dependency',
  structuralFragility: 'System Fragility',
  decisionBottleneck: 'Decision Bottleneck',
  capacityConstraint: 'Capacity Constraint',
};

function calculateFounderDependency(data: IntakeResponse): number {
  let score = 0;

  if (data.revenue_generation === OPT.revenue_generation.FOUNDER_MAJORITY) score += 25;
  if (data.two_week_absence === OPT.two_week_absence.REVENUE_DROPS) score += 25;
  if (data.final_decisions === OPT.final_decisions.ALWAYS_ME) score += 20;
  if (data.roles_handled === OPT.roles_handled.SEVEN_PLUS) score += 15;
  if (data.client_relationship === OPT.client_relationship.HIRE_ME) score += 15;

  return Math.min(100, score);
}

function scoreDimensions(data: IntakeResponse): DimensionScores {
  const s: DimensionScores = {
    founderCentralization: 0,
    structuralFragility: 0,
    decisionBottleneck: 0,
    capacityConstraint: 0,
  };

  if (data.business_model === OPT.business_model.ADVISORY) {
    s.founderCentralization += 5;
  }

  if (data.revenue_generation === OPT.revenue_generation.FOUNDER_MAJORITY) {
    s.founderCentralization += 25; s.capacityConstraint += 15;
  } else if (data.revenue_generation === OPT.revenue_generation.TEAM_REVIEWS) {
    s.founderCentralization += 12; s.decisionBottleneck += 8;
  } else if (data.revenue_generation === OPT.revenue_generation.MIX) {
    s.founderCentralization += 10; s.capacityConstraint += 5;
  }

  if (data.two_week_absence === OPT.two_week_absence.REVENUE_DROPS) {
    s.founderCentralization += 25; s.structuralFragility += 20;
  } else if (data.two_week_absence === OPT.two_week_absence.WORK_SLOWS) {
    s.founderCentralization += 15; s.structuralFragility += 10;
  } else if (data.two_week_absence === OPT.two_week_absence.ESCALATES) {
    s.decisionBottleneck += 12;
  }

  if (data.final_decisions === OPT.final_decisions.ALWAYS_ME) {
    s.decisionBottleneck += 25; s.founderCentralization += 10;
  } else if (data.final_decisions === OPT.final_decisions.MOSTLY_ME) {
    s.decisionBottleneck += 15; s.founderCentralization += 5;
  } else if (data.final_decisions === OPT.final_decisions.SHARED) {
    s.decisionBottleneck += 5;
  }

  if (data.project_stall === OPT.project_stall.APPROVAL) {
    s.decisionBottleneck += 20;
  } else if (data.project_stall === OPT.project_stall.TEAM_EXECUTION) {
    s.capacityConstraint += 10; s.structuralFragility += 5;
  } else if (data.project_stall === OPT.project_stall.STAFFING) {
    s.capacityConstraint += 15;
  }

  if (data.growth_limiter === OPT.growth_limiter.TIME) {
    s.capacityConstraint += 20; s.founderCentralization += 10;
  } else if (data.growth_limiter === OPT.growth_limiter.STAFF) {
    s.capacityConstraint += 20;
  } else if (data.growth_limiter === OPT.growth_limiter.OPS) {
    s.structuralFragility += 15; s.capacityConstraint += 5;
  } else if (data.growth_limiter === OPT.growth_limiter.PRICING) {
    s.capacityConstraint += 10;
  } else if (data.growth_limiter === OPT.growth_limiter.DEMAND) {
    s.capacityConstraint += 8;
  }

  if (data.process_documentation === OPT.process_documentation.IN_HEAD) {
    s.structuralFragility += 25; s.founderCentralization += 10;
  } else if (data.process_documentation === OPT.process_documentation.LIGHT) {
    s.structuralFragility += 12;
  } else if (data.process_documentation === OPT.process_documentation.NOT_USED) {
    s.structuralFragility += 15; s.decisionBottleneck += 5;
  }

  if (data.roles_handled === OPT.roles_handled.SEVEN_PLUS) {
    s.founderCentralization += 15; s.structuralFragility += 10; s.capacityConstraint += 10;
  } else if (data.roles_handled === OPT.roles_handled.FIVE_SIX) {
    s.founderCentralization += 10; s.capacityConstraint += 8;
  } else if (data.roles_handled === OPT.roles_handled.THREE_FOUR) {
    s.founderCentralization += 5;
  }

  if (data.client_relationship === OPT.client_relationship.HIRE_ME) {
    s.founderCentralization += 20;
  } else if (data.client_relationship === OPT.client_relationship.EXPECT_ME) {
    s.founderCentralization += 12;
  }

  if (data.key_member_leaves === OPT.key_member_leaves.REVENUE_DROPS) {
    s.structuralFragility += 20; s.capacityConstraint += 10;
  } else if (data.key_member_leaves === OPT.key_member_leaves.DELIVERY_SLOWS) {
    s.structuralFragility += 12;
  } else if (data.key_member_leaves === OPT.key_member_leaves.TEMPORARY) {
    s.structuralFragility += 5;
  }

  if (data.pricing_decisions === OPT.pricing_decisions.ONLY_ME) {
    s.decisionBottleneck += 10; s.founderCentralization += 8;
  } else if (data.pricing_decisions === OPT.pricing_decisions.I_APPROVE) {
    s.decisionBottleneck += 5;
  }

  if (data.interruption_frequency === OPT.interruption_frequency.CONSTANTLY) {
    s.decisionBottleneck += 20; s.capacityConstraint += 10;
  } else if (data.interruption_frequency === OPT.interruption_frequency.MULTIPLE_DAILY) {
    s.decisionBottleneck += 12; s.capacityConstraint += 5;
  } else if (data.interruption_frequency === OPT.interruption_frequency.FEW_WEEKLY) {
    s.decisionBottleneck += 4;
  }

  if (data.hiring_situation === OPT.hiring_situation.HARD_TO_FIND) {
    s.capacityConstraint += 15;
  } else if (data.hiring_situation === OPT.hiring_situation.OCCASIONALLY) {
    s.capacityConstraint += 5;
  }

  if (data.free_capacity === OPT.free_capacity.DELEGATE_APPROVALS) {
    s.decisionBottleneck += 8;
  } else if (data.free_capacity === OPT.free_capacity.HIRE) {
    s.capacityConstraint += 8;
  } else if (data.free_capacity === OPT.free_capacity.SYSTEMS) {
    s.structuralFragility += 8;
  } else if (data.free_capacity === OPT.free_capacity.RAISE_PRICES) {
    s.capacityConstraint += 5;
  } else if (data.free_capacity === OPT.free_capacity.REDUCE_CLIENTS) {
    s.founderCentralization += 5; s.capacityConstraint += 5;
  }

  if (data.current_state === OPT.current_state.CHAOTIC) {
    s.structuralFragility += 15; s.capacityConstraint += 10;
  } else if (data.current_state === OPT.current_state.GROWING_STRAINED) {
    s.capacityConstraint += 12;
  } else if (data.current_state === OPT.current_state.STABLE_CAPPED) {
    s.capacityConstraint += 10; s.structuralFragility += 5;
  } else if (data.current_state === OPT.current_state.PROFITABLE_HEAVY) {
    s.founderCentralization += 15;
  }

  s.founderCentralization = Math.min(100, s.founderCentralization);
  s.structuralFragility = Math.min(100, s.structuralFragility);
  s.decisionBottleneck = Math.min(100, s.decisionBottleneck);
  s.capacityConstraint = Math.min(100, s.capacityConstraint);

  return s;
}

function rankDimensions(scores: DimensionScores): RankedConstraint[] {
  const entries = (Object.keys(scores) as (keyof DimensionScores)[]).map((key) => ({
    type: key,
    label: DIMENSION_LABELS[key],
    score: scores[key],
  }));

  return entries.sort((a, b) => b.score - a.score);
}

function deriveOperationalPattern(
  primary: RankedConstraint,
  secondary: RankedConstraint
): 'FOUNDER_HEAVY' | 'DECISION_HEAVY' | 'SYSTEM_FRAGILE' | 'CAPACITY_CEILING' | 'MIXED' {
  if (Math.abs(primary.score - secondary.score) <= 10) return 'MIXED';
  if (primary.type === 'founderCentralization') return 'FOUNDER_HEAVY';
  if (primary.type === 'decisionBottleneck') return 'DECISION_HEAVY';
  if (primary.type === 'structuralFragility') return 'SYSTEM_FRAGILE';
  return 'CAPACITY_CEILING';
}

function deriveConfidence(founderDependencyScore: number): 'HIGH' | 'MED' | 'LOW' {
  if (founderDependencyScore >= 70) return 'HIGH';
  if (founderDependencyScore >= 50) return 'MED';
  return 'LOW';
}

export function getPreviewEligibility(data: IntakeResponse): PreviewEligibility {
  const founderDependencyScore = calculateFounderDependency(data);
  const ranked = rankDimensions(scoreDimensions(data));
  const primaryConstraint = ranked[0];
  const secondaryConstraint = ranked[1];
  const pattern = deriveOperationalPattern(primaryConstraint, secondaryConstraint);
  const confidence = deriveConfidence(founderDependencyScore);
  const rationale = `Primary constraint is ${primaryConstraint.label} with secondary ${secondaryConstraint.label}; founder-dependency confidence is ${confidence}.`;

  return {
    outcome: 'OK',
    metadata: {
      founderDependencyScore,
      pattern,
      confidence,
      primaryConstraint,
      secondaryConstraint,
      rationale,
    },
  };
}

/**
 * Overlays v2-normalized keys onto an IntakeResponse.
 * Fallback priority: v2 key → v1 key → undefined (left absent).
 * Spread keeps all original fields intact.
 */
export function normalizeIntake(raw: IntakeResponse): IntakeResponse {
  return {
    ...raw,

    // business_model ← business_type ← businessType
    business_model: raw.business_model || raw.business_type || raw.businessType,

    // current_state (no v1 equivalent — just ensure it's a string)
    current_state: raw.current_state || '',

    // growth_limiter ← growth_blocker
    growth_limiter: raw.growth_limiter || raw.growth_blocker,

    // process_documentation ← doc_state
    process_documentation:
      raw.process_documentation ||
      (Array.isArray(raw.doc_state) ? raw.doc_state[0] : raw.doc_state),

    // interruption_frequency ← approval_frequency ← context_switching
    interruption_frequency:
      raw.interruption_frequency || raw.approval_frequency || raw.context_switching,

    // project_stall ← project_pile_up
    project_stall: raw.project_stall || raw.project_pile_up,

    // two_week_absence ← absence_impact
    two_week_absence: raw.two_week_absence || raw.absence_impact,
  };
}
