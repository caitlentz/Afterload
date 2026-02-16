import { IntakeResponse } from './diagnosticEngine';

// ------------------------------------------------------------------
// NORMALIZE INTAKE
// Maps v1 legacy keys → v2 keys with safe fallbacks.
// Returns the original object with normalized aliases overlaid.
// Does NOT remove any fields — additive only.
// ------------------------------------------------------------------

export type PreviewEligibility = {
  outcome: 'OK' | 'OUT_OF_SCOPE';
  note?: string;
};

const SERVICE_SIGNALS = [
  'agency', 'consulting', 'advisory', 'coaching', 'freelance',
  'service', 'firm', 'studio', 'professional', 'creative',
  'design', 'development', 'marketing', 'legal', 'accounting',
  'engineering', 'architecture', 'contractor', 'therapist',
  'clinic', 'practice', 'managed service',
];

export function getPreviewEligibility(data: IntakeResponse): PreviewEligibility {
  const model = (
    data.business_model || data.business_type || data.businessType || ''
  ).toLowerCase();

  if (!model) return { outcome: 'OK' }; // no data → don't block

  const looksLikeService = SERVICE_SIGNALS.some(s => model.includes(s));

  if (looksLikeService) return { outcome: 'OK' };

  // Broad catch: if we can't tell, let it through — only flag obvious non-service
  const nonServiceSignals = ['ecommerce', 'e-commerce', 'saas', 'marketplace', 'retail', 'manufacturing', 'dropship'];
  const looksNonService = nonServiceSignals.some(s => model.includes(s));

  if (looksNonService) {
    return {
      outcome: 'OUT_OF_SCOPE',
      note: "Based on your model, Afterload doesn't run full diagnostics for this type yet. You'll still get a quick structural snapshot below, plus the best next-fit path.",
    };
  }

  return { outcome: 'OK' };
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
