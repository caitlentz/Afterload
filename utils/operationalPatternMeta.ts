export type OperationalPattern = 'FOUNDER' | 'DECISION' | 'SYSTEM' | 'CAPACITY' | 'MIXED' | 'STRATEGIC';
export type ConfidenceBand = 'HIGH' | 'MED' | 'LOW';

export type ConstraintScore = {
  type: string;
  label: string;
  score: number;
};

export function describePattern(pattern: OperationalPattern): string {
  switch (pattern) {
    case 'FOUNDER':
      return 'Most pressure comes from founder-centered execution and approvals.';
    case 'DECISION':
      return 'Work queues are mainly caused by approval and judgment bottlenecks.';
    case 'SYSTEM':
      return 'Process/system reliability is the main limit on consistency and scale.';
    case 'CAPACITY':
      return 'Delivery bandwidth is the main ceiling; demand is outpacing available capacity.';
    case 'MIXED':
      return 'Two constraints are close in severity, so this is a blended bottleneck.';
    case 'STRATEGIC':
      return 'Operations are stable and independent; the next bottleneck is market growth, positioning, or pricing strategy.';
    default:
      return 'Operational pressure is distributed across multiple constraints.';
  }
}

export function describeConfidence(confidence: ConfidenceBand, founderDependencyScore: number): string {
  if (confidence === 'HIGH') {
    return `High confidence signal from founder-dependency score (${founderDependencyScore}/100).`;
  }
  if (confidence === 'MED') {
    return `Moderate confidence signal from founder-dependency score (${founderDependencyScore}/100).`;
  }
  return `Low confidence signal from founder-dependency score (${founderDependencyScore}/100); treat as directional.`;
}

export function summarizeConstraintGap(primary: ConstraintScore, secondary: ConstraintScore): string {
  const gap = Math.abs((primary?.score || 0) - (secondary?.score || 0));
  const mixed = gap <= 10;
  return `${primary.label} leads ${secondary.label} by ${gap} points (${mixed ? 'MIXED threshold hit' : 'clear primary'}).`;
}

export function recommendedFocus(primary: ConstraintScore, secondary: ConstraintScore): string {
  return `Start with ${primary.label} first, then address ${secondary.label} to reduce rebound risk.`;
}
