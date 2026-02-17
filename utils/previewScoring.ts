import type { IntakeResponse } from './diagnosticEngine';
import { OPT } from './intakeOptionMap';

export type DimensionScores = {
  founderCentralization: number;
  structuralFragility: number;
  decisionBottleneck: number;
  capacityConstraint: number;
};

export type RankedDimension = {
  type: keyof DimensionScores;
  label: string;
  score: number;
};

export type ConstraintCategory =
  | 'KNOWLEDGE'
  | 'DECISION_LOAD'
  | 'PROCESS'
  | 'CAPACITY'
  | 'STRATEGIC'
  | 'NONE';

export type FounderDependencyLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export const DIMENSION_LABELS: Record<keyof DimensionScores, string> = {
  founderCentralization: 'Founder Dependency',
  structuralFragility: 'System Fragility',
  decisionBottleneck: 'Decision Load',
  capacityConstraint: 'Capacity Constraint',
};

export function calculateFounderDependencyScore(data: IntakeResponse): number {
  let score = 0;

  // Decision load (40)
  if (data.final_decisions === OPT.final_decisions.ALWAYS_ME) score += 20;
  else if (data.final_decisions === OPT.final_decisions.MOSTLY_ME) score += 15;
  else if (data.final_decisions === OPT.final_decisions.SHARED) score += 5;

  if (data.pricing_decisions === OPT.pricing_decisions.ONLY_ME) score += 20;
  else if (data.pricing_decisions === OPT.pricing_decisions.I_APPROVE) score += 10;
  else if (data.pricing_decisions === OPT.pricing_decisions.SENIOR_TEAM) score += 5;

  // Absence impact (30)
  if (data.two_week_absence === OPT.two_week_absence.REVENUE_DROPS) score += 30;
  else if (data.two_week_absence === OPT.two_week_absence.WORK_SLOWS) score += 20;
  else if (data.two_week_absence === OPT.two_week_absence.ESCALATES) score += 10;

  // Knowledge silos (20)
  if (data.process_documentation === OPT.process_documentation.IN_HEAD) score += 10;
  else if (data.process_documentation === OPT.process_documentation.LIGHT) score += 5;
  else if (data.process_documentation === OPT.process_documentation.NOT_USED) score += 3;

  if (data.client_relationship === OPT.client_relationship.HIRE_ME) score += 10;
  else if (data.client_relationship === OPT.client_relationship.EXPECT_ME) score += 5;
  else if (data.client_relationship === OPT.client_relationship.ASSIGNED) score += 2;

  // Context switching (10)
  if (data.interruption_frequency === OPT.interruption_frequency.CONSTANTLY) score += 5;
  else if (data.interruption_frequency === OPT.interruption_frequency.MULTIPLE_DAILY) score += 3;
  else if (data.interruption_frequency === OPT.interruption_frequency.FEW_WEEKLY) score += 1;

  if (data.roles_handled === OPT.roles_handled.SEVEN_PLUS) score += 5;
  else if (data.roles_handled === OPT.roles_handled.FIVE_SIX) score += 3;
  else if (data.roles_handled === OPT.roles_handled.THREE_FOUR) score += 1;

  return Math.min(score, 100);
}

export function interpretFounderDependencyScore(score: number): {
  level: FounderDependencyLevel;
  label: string;
  description: string;
} {
  if (score >= 81) {
    return {
      level: 'CRITICAL',
      label: 'Critical Dependency',
      description: 'Revenue and operations are tightly coupled to founder involvement.',
    };
  }
  if (score >= 61) {
    return {
      level: 'HIGH',
      label: 'High Dependency',
      description: 'Founder involvement is a primary constraint on scaling.',
    };
  }
  if (score >= 31) {
    return {
      level: 'MODERATE',
      label: 'Moderate Dependency',
      description: 'Delegation exists, but key bottlenecks still route through the founder.',
    };
  }
  return {
    level: 'LOW',
    label: 'Low Dependency',
    description: 'Operations are largely distributed and founder-independent.',
  };
}

export function isWellDelegated(data: IntakeResponse): boolean {
  return (
    data.revenue_generation === OPT.revenue_generation.TEAM_INDEPENDENT &&
    data.final_decisions === OPT.final_decisions.RARELY_ME &&
    data.process_documentation === OPT.process_documentation.FULLY &&
    data.two_week_absence === OPT.two_week_absence.RUNS_NORMALLY
  );
}

export function detectConstraintCategory(data: IntakeResponse): ConstraintCategory {
  if (isWellDelegated(data)) return 'STRATEGIC';

  const knowledge =
    (
      (data.process_documentation === OPT.process_documentation.IN_HEAD ||
        data.process_documentation === OPT.process_documentation.LIGHT) &&
      (data.client_relationship === OPT.client_relationship.HIRE_ME ||
        data.client_relationship === OPT.client_relationship.EXPECT_ME)
    ) ||
    (
      data.process_documentation === OPT.process_documentation.IN_HEAD &&
      data.pricing_decisions === OPT.pricing_decisions.I_APPROVE &&
      data.two_week_absence === OPT.two_week_absence.ESCALATES
    ) ||
    (
      data.hiring_situation === OPT.hiring_situation.HARD_TO_FIND &&
      data.process_documentation === OPT.process_documentation.IN_HEAD
    );

  if (knowledge) return 'KNOWLEDGE';

  const decision =
    (data.final_decisions === OPT.final_decisions.ALWAYS_ME ||
      data.final_decisions === OPT.final_decisions.MOSTLY_ME) &&
    data.project_stall === OPT.project_stall.APPROVAL;
  if (decision) return 'DECISION_LOAD';

  const process =
    data.process_documentation === OPT.process_documentation.NOT_USED &&
    data.project_stall === OPT.project_stall.TEAM_EXECUTION;
  if (process) return 'PROCESS';

  const capacity =
    data.revenue_generation === OPT.revenue_generation.FOUNDER_MAJORITY &&
    data.growth_limiter === OPT.growth_limiter.TIME &&
    data.two_week_absence === OPT.two_week_absence.REVENUE_DROPS;
  if (capacity) return 'CAPACITY';

  return 'NONE';
}

export function selectPrimarySecondaryDimensions(
  data: IntakeResponse,
  scores: DimensionScores
): { primary: RankedDimension; secondary: RankedDimension; category: ConstraintCategory } {
  const ranked = rankDimensions(scores);
  const category = detectConstraintCategory(data);

  const dimensionForCategory: Partial<Record<ConstraintCategory, keyof DimensionScores>> = {
    KNOWLEDGE: 'structuralFragility',
    DECISION_LOAD: 'decisionBottleneck',
    PROCESS: 'structuralFragility',
    CAPACITY: 'capacityConstraint',
  };

  const preferredType = dimensionForCategory[category];
  if (!preferredType) {
    return { primary: ranked[0], secondary: ranked[1], category };
  }

  const preferred = ranked.find(r => r.type === preferredType) || ranked[0];
  const secondary = ranked.find(r => r.type !== preferred.type) || ranked[1] || ranked[0];
  return {
    primary: preferred,
    secondary,
    category,
  };
}

export function resolveConstraintLabel(
  type: keyof DimensionScores,
  data: IntakeResponse
): string {
  if (type === 'decisionBottleneck') return 'Decision Load';
  if (type === 'capacityConstraint') return 'Capacity Constraint';
  if (type === 'founderCentralization') return 'Founder Dependency';

  // structuralFragility can represent two distinct realities.
  if (
    data.process_documentation === OPT.process_documentation.NOT_USED &&
    data.project_stall === OPT.project_stall.TEAM_EXECUTION
  ) {
    return 'Process Gaps';
  }

  if (
    (data.process_documentation === OPT.process_documentation.IN_HEAD ||
      data.process_documentation === OPT.process_documentation.LIGHT) &&
    (data.client_relationship === OPT.client_relationship.HIRE_ME ||
      data.client_relationship === OPT.client_relationship.EXPECT_ME ||
      data.hiring_situation === OPT.hiring_situation.HARD_TO_FIND)
  ) {
    return 'Knowledge Silos';
  }

  return 'System Fragility';
}

// Shared scoring logic for preview output + eligibility metadata.
export function scoreDimensions(data: IntakeResponse): DimensionScores {
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
    s.capacityConstraint += 4;
  }

  if (data.process_documentation === OPT.process_documentation.IN_HEAD) {
    s.structuralFragility += 25; s.founderCentralization += 10;
  } else if (data.process_documentation === OPT.process_documentation.LIGHT) {
    s.structuralFragility += 12;
  } else if (data.process_documentation === OPT.process_documentation.NOT_USED) {
    s.structuralFragility += 15; s.decisionBottleneck += 5;
  }

  if (data.roles_handled === OPT.roles_handled.SEVEN_PLUS) {
    s.founderCentralization += 15; s.structuralFragility += 10; s.capacityConstraint += 6;
  } else if (data.roles_handled === OPT.roles_handled.FIVE_SIX) {
    s.founderCentralization += 10; s.capacityConstraint += 4;
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
    s.decisionBottleneck += 20; s.capacityConstraint += 4;
  } else if (data.interruption_frequency === OPT.interruption_frequency.MULTIPLE_DAILY) {
    s.decisionBottleneck += 12; s.capacityConstraint += 2;
  } else if (data.interruption_frequency === OPT.interruption_frequency.FEW_WEEKLY) {
    s.decisionBottleneck += 4;
  }

  if (data.hiring_situation === OPT.hiring_situation.HARD_TO_FIND) {
    s.capacityConstraint += 4;
    if (data.process_documentation === OPT.process_documentation.IN_HEAD) {
      s.structuralFragility += 10;
    }
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

  // Pattern boosts to improve classifier stability:
  // Knowledge silos
  if (
    (data.process_documentation === OPT.process_documentation.IN_HEAD ||
      data.process_documentation === OPT.process_documentation.LIGHT) &&
    (data.client_relationship === OPT.client_relationship.HIRE_ME ||
      data.client_relationship === OPT.client_relationship.EXPECT_ME)
  ) {
    s.structuralFragility += 18;
    s.founderCentralization += 6;
  }
  if (
    data.process_documentation === OPT.process_documentation.IN_HEAD &&
    data.pricing_decisions === OPT.pricing_decisions.I_APPROVE &&
    data.two_week_absence === OPT.two_week_absence.ESCALATES
  ) {
    s.structuralFragility += 12;
  }

  // Process gaps (docs exist but are not followed)
  if (
    data.process_documentation === OPT.process_documentation.NOT_USED &&
    data.project_stall === OPT.project_stall.TEAM_EXECUTION
  ) {
    s.structuralFragility += 18;
    s.decisionBottleneck += 6;
  }

  // True capacity ceiling pattern
  if (
    data.revenue_generation === OPT.revenue_generation.FOUNDER_MAJORITY &&
    data.growth_limiter === OPT.growth_limiter.TIME &&
    data.two_week_absence === OPT.two_week_absence.REVENUE_DROPS
  ) {
    s.capacityConstraint += 30;
  }

  s.founderCentralization = Math.min(100, s.founderCentralization);
  s.structuralFragility = Math.min(100, s.structuralFragility);
  s.decisionBottleneck = Math.min(100, s.decisionBottleneck);
  s.capacityConstraint = Math.min(100, s.capacityConstraint);

  return s;
}

export function rankDimensions(scores: DimensionScores): RankedDimension[] {
  const entries = (Object.keys(scores) as (keyof DimensionScores)[]).map((key) => ({
    type: key,
    label: DIMENSION_LABELS[key],
    score: scores[key],
  }));

  return entries.sort((a, b) => b.score - a.score);
}
