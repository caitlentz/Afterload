import { IntakeResponse } from './diagnosticEngine';
import { OPT } from './intakeOptionMap';
import {
  calculateFounderDependencyScore,
  detectConstraintCategory,
  resolveConstraintLabel,
  scoreDimensions,
  selectPrimarySecondaryDimensions,
} from './previewScoring';
import type { RankedDimension } from './previewScoring';

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
    pattern: 'FOUNDER' | 'SYSTEM' | 'DECISION' | 'CAPACITY' | 'MIXED' | 'STRATEGIC';
    confidence: 'HIGH' | 'MED' | 'LOW';
    primaryConstraint: { type: string; label: string; score: number };
    secondaryConstraint: { type: string; label: string; score: number };
    rationale: string;
  };
};

function calculateFounderDependency(data: IntakeResponse): number {
  return calculateFounderDependencyScore(data);
}

function deriveOperationalPattern(
  data: IntakeResponse,
  primary: RankedDimension,
  secondary: RankedDimension
): 'FOUNDER' | 'SYSTEM' | 'DECISION' | 'CAPACITY' | 'MIXED' | 'STRATEGIC' {
  if (detectConstraintCategory(data) === 'STRATEGIC') return 'STRATEGIC';
  if (Math.abs(primary.score - secondary.score) <= 10) return 'MIXED';
  if (primary.type === 'founderCentralization') return 'FOUNDER';
  if (primary.type === 'structuralFragility') return 'SYSTEM';
  if (primary.type === 'decisionBottleneck') return 'DECISION';
  return 'CAPACITY';
}

function deriveConfidence(founderDependencyScore: number): 'HIGH' | 'MED' | 'LOW' {
  if (founderDependencyScore >= 70) return 'HIGH';
  if (founderDependencyScore >= 50) return 'MED';
  return 'LOW';
}

export function getPreviewEligibility(data: IntakeResponse): PreviewEligibility {
  const founderDependencyScore = calculateFounderDependency(data);
  const scores = scoreDimensions(data);
  const { primary, secondary, category } = selectPrimarySecondaryDimensions(data, scores);
  const strategic = category === 'STRATEGIC';
  const primaryConstraint: RankedDimension = {
    type: strategic ? ('strategicOptimization' as any) : primary.type,
    label: strategic ? 'Strategic Optimization' : resolveConstraintLabel(primary.type, data),
    score: primary.score,
  };
  const secondaryConstraint: RankedDimension = {
    ...secondary,
    label: resolveConstraintLabel(secondary.type, data),
  };
  const pattern = deriveOperationalPattern(data, primaryConstraint, secondaryConstraint);
  const confidence = deriveConfidence(founderDependencyScore);
  const rationale = `Pattern: ${pattern} (primary=${primaryConstraint.label}) + (secondary=${secondaryConstraint.label}); confidence=${confidence}; MIXED=${pattern === 'MIXED'}.`;

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
