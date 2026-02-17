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

export const DIMENSION_LABELS: Record<keyof DimensionScores, string> = {
  founderCentralization: 'Founder Dependency',
  structuralFragility: 'System Fragility',
  decisionBottleneck: 'Decision Bottleneck',
  capacityConstraint: 'Capacity Constraint',
};

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

export function rankDimensions(scores: DimensionScores): RankedDimension[] {
  const entries = (Object.keys(scores) as (keyof DimensionScores)[]).map((key) => ({
    type: key,
    label: DIMENSION_LABELS[key],
    score: scores[key],
  }));

  return entries.sort((a, b) => b.score - a.score);
}
