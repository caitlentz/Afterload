import { CLARITY_SESSION_QUESTIONS, ClarityQuestion } from './claritySessionQuestions';
import type { IntakeResponse } from './diagnosticEngine';
import type { PreviewResult } from './previewEngine';

// ------------------------------------------------------------------
// DEEP DIVE QUESTION SET BUILDER
// Assembles a personalized clarity session from the universal bank.
// Deterministic: same inputs → same question pack.
// ------------------------------------------------------------------

// ── Public types ──

export type DeepDiveMode = 'SHORT' | 'STANDARD' | 'DEEP';
export type FocusArea = 'SYSTEMS' | 'TEAM' | 'DELIVERY' | 'SALES' | 'MIXED';

export type DeepDivePrefs = {
  mode?: DeepDiveMode;
  avoidFinance?: boolean;
  focus?: FocusArea;
  includePersonable?: boolean;  // default true
  maxQuestions?: number;        // overrides mode target
};

export type PackMeta = {
  packId: string;
  track: 'A' | 'B' | 'C';
  primaryConstraint?: string;
  secondaryConstraint?: string;
  selectedModules: string[];
  spineCount: number;
  moduleCount: number;
  trackCount: number;
  personableCount: number;
  estimatedMinutes: number;
  builderVersion: string;
  questionBankVersion: string;
};

export type DeepDiveResult = {
  questions: ClarityQuestion[];
  packMeta: PackMeta;
};

// ── Internal constants ──

export const BUILDER_VERSION = '2026-02-17.1';
export const QUESTION_BANK_VERSION = '2026-02-17.1';

const MODE_TARGETS: Record<DeepDiveMode, number> = {
  SHORT: 15,
  STANDARD: 25,
  DEEP: 35,
};

const PERSONABLE_COUNTS: Record<DeepDiveMode, number> = {
  SHORT: 2,
  STANDARD: 3,
  DEEP: 3,
};

const TIME_PER_TYPE: Record<string, number> = {
  single: 0.4,
  multi: 0.8,
  text: 1.2,
  form: 1.5,
  dollar: 0.6,
};

// ── Spine definition (always-asked, high-signal) ──

const SPINE_IDS_FULL: string[] = [
  'financial_authority_threshold',  // Decision Load
  'deep_work_audit',                // Context Switching
  'recovery_tax',                   // Context Switching
  'runway_stress_test',             // Sustainability Horizon
  'revenue_range',                  // Financial Health
  'profitability_gut_check',        // Financial Health
  'pricing_confidence',             // Financial Health
  'tool_count',                     // System Health
  'search_friction',                // System Health
  'bus_factor_30_day',              // Workload Analysis
  'interruption_source_id',         // Diagnosis & Roadmap
  'strategic_work_id',              // Diagnosis & Roadmap
];

const SPINE_FINANCE_IDS = ['revenue_range', 'profitability_gut_check', 'pricing_confidence'];

// ── Constraint → Module mapping ──

const CONSTRAINT_MODULES: Record<string, string[]> = {
  founderCentralization: ['Workload Analysis', 'Founder Reality', 'Process Heatmap'],
  structuralFragility:   ['System Health', 'Process Heatmap', 'Flow Friction'],
  decisionBottleneck:    ['Decision Load', 'Flow Friction', 'Diagnosis & Roadmap'],
  capacityConstraint:    ['Financial Health', 'Workload Analysis', 'Process Heatmap'],
};

// ── Focus → Module mapping (user preference) ──

const FOCUS_MODULES: Record<FocusArea, string[]> = {
  SYSTEMS:  ['System Health', 'Process Heatmap'],
  TEAM:     ['Workload Analysis', 'Flow Friction'],
  DELIVERY: ['Process Heatmap', 'Flow Friction'],
  SALES:    ['Process Heatmap', 'Decision Load'],
  MIXED:    [],
};

// ── Track determination (reuses existing logic pattern) ──

function resolveTrack(intake: IntakeResponse): 'A' | 'B' | 'C' {
  const model = intake.business_model || intake.business_type || '';
  const lower = model.toLowerCase();
  if (lower.includes('standardized')) return 'A';
  if (lower.includes('advisory') || lower.includes('coaching')) return 'C';
  if (lower.includes('creative') || lower.includes('expert')) return 'B';
  if (lower.includes('hybrid')) return 'B';
  // Legacy
  if (lower.includes('logistics') || lower.includes('trades')) return 'A';
  if (lower.includes('consulting')) return 'C';
  return 'B';
}

// ── Helpers ──

function questionById(id: string): ClarityQuestion | undefined {
  return CLARITY_SESSION_QUESTIONS.find(q => q.id === id);
}

function questionsForModule(mod: string, track: 'A' | 'B' | 'C'): ClarityQuestion[] {
  return CLARITY_SESSION_QUESTIONS.filter(q =>
    q.module === mod &&
    (q.tracks.includes('UNIVERSAL') || q.tracks.includes(track))
  );
}

function estimateMinutes(questions: ClarityQuestion[]): number {
  const raw = questions.reduce((sum, q) => sum + (TIME_PER_TYPE[q.type] ?? 0.5), 0);
  return Math.ceil(raw);
}

function generatePackId(track: string, primary: string, mode: string): string {
  const hash = `${track}-${primary}-${mode}`.replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  return `pack_${hash}`;
}

export function isOutdatedPack(
  packMeta?: Partial<Pick<PackMeta, 'builderVersion' | 'questionBankVersion'>> | null
): boolean {
  if (!packMeta) return true;
  return (
    packMeta.builderVersion !== BUILDER_VERSION ||
    packMeta.questionBankVersion !== QUESTION_BANK_VERSION
  );
}

// ── Core builder ──

export function buildDeepDiveQuestionSet(args: {
  intake: IntakeResponse;
  preview: PreviewResult;
  userPrefs?: DeepDivePrefs;
  partialAnswersSoFar?: Record<string, any>;
}): DeepDiveResult {
  const { intake, preview, userPrefs = {} } = args;

  const mode: DeepDiveMode = userPrefs.mode ?? 'STANDARD';
  const avoidFinance = userPrefs.avoidFinance ?? false;
  const focus = userPrefs.focus ?? 'MIXED';
  const includePersonable = userPrefs.includePersonable ?? true;
  const maxQuestions = userPrefs.maxQuestions ?? MODE_TARGETS[mode];

  const track = resolveTrack(intake);
  const primaryType = preview.primaryConstraint?.type ?? '';
  const secondaryType = preview.secondaryConstraint?.type ?? '';

  // ------------------------------------------------------------------
  // A) SPINE — always asked, high signal
  // ------------------------------------------------------------------
  let spineIds = [...SPINE_IDS_FULL];

  if (avoidFinance) {
    spineIds = spineIds.filter(id => !SPINE_FINANCE_IDS.includes(id));
  }

  const spineQuestions: ClarityQuestion[] = spineIds
    .map(id => questionById(id))
    .filter((q): q is ClarityQuestion => !!q);

  // ------------------------------------------------------------------
  // B) MODULE SELECTION — 2 hot modules from constraints + 1 from focus
  // ------------------------------------------------------------------
  const selectedModuleSet = new Set<string>();

  // Primary constraint → first preferred module
  const primaryModules = CONSTRAINT_MODULES[primaryType] ?? [];
  if (primaryModules.length > 0) selectedModuleSet.add(primaryModules[0]);

  // Secondary constraint → first preferred module not already selected
  const secondaryModules = CONSTRAINT_MODULES[secondaryType] ?? [];
  for (const m of secondaryModules) {
    if (!selectedModuleSet.has(m)) {
      selectedModuleSet.add(m);
      break;
    }
  }

  // Ensure we have at least 2 modules
  if (selectedModuleSet.size < 2) {
    for (const m of primaryModules) {
      if (!selectedModuleSet.has(m)) {
        selectedModuleSet.add(m);
        break;
      }
    }
  }

  // Focus-based module (only if not MIXED)
  if (focus !== 'MIXED') {
    const focusMods = FOCUS_MODULES[focus];
    for (const m of focusMods) {
      if (!selectedModuleSet.has(m)) {
        selectedModuleSet.add(m);
        break;
      }
    }
  }

  const selectedModules = Array.from(selectedModuleSet);

  // Gather module questions (exclude spine questions and personable)
  const spineIdSet = new Set(spineIds);
  const personableIds = new Set(['last_hour_wished_delegated', 'magic_wand_fix', 'what_keeps_you_up']);

  let moduleQuestions: ClarityQuestion[] = [];
  for (const mod of selectedModules) {
    const qs = questionsForModule(mod, track).filter(
      q => !spineIdSet.has(q.id) && !personableIds.has(q.id)
    );
    moduleQuestions.push(...qs);
  }

  // Cap module questions based on mode
  const moduleQLimit = mode === 'SHORT' ? 4 : mode === 'STANDARD' ? 10 : 16;
  moduleQuestions = moduleQuestions.slice(0, moduleQLimit);

  // ------------------------------------------------------------------
  // C) TRACK QUESTIONS — questions tagged for this track
  // ------------------------------------------------------------------
  const existingIds = new Set([
    ...spineIds,
    ...moduleQuestions.map(q => q.id),
    ...Array.from(personableIds),
  ]);

  const trackQuestions = CLARITY_SESSION_QUESTIONS.filter(
    q =>
      q.tracks.includes(track) &&
      !q.tracks.includes('UNIVERSAL') &&
      !existingIds.has(q.id)
  );

  // Cap track questions based on mode
  const trackQLimit = mode === 'SHORT' ? 2 : mode === 'STANDARD' ? 5 : 8;
  const trackQSlice = trackQuestions.slice(0, trackQLimit);

  // ------------------------------------------------------------------
  // D) PERSONABLE LAYER — Founder Reality
  // ------------------------------------------------------------------
  const personableQuestions: ClarityQuestion[] = [];
  if (includePersonable) {
    const allPersonable = CLARITY_SESSION_QUESTIONS.filter(q => personableIds.has(q.id));
    const personableLimit = PERSONABLE_COUNTS[mode];
    personableQuestions.push(...allPersonable.slice(0, personableLimit));
  }

  // ------------------------------------------------------------------
  // E) ASSEMBLE + DEDUP + DEPENDSON RESOLUTION
  // ------------------------------------------------------------------

  // Reserve slots for personable — they must not be trimmed
  const personableSlots = personableQuestions.length;
  const nonPersonableLimit = maxQuestions - personableSlots;

  const nonPersonableRaw: ClarityQuestion[] = [
    ...spineQuestions,
    ...moduleQuestions,
    ...trackQSlice,
  ];

  // Dedup non-personable by id (first occurrence wins)
  const seenIds = new Set<string>();
  const dedupedNonP: ClarityQuestion[] = [];
  for (const q of nonPersonableRaw) {
    if (!seenIds.has(q.id)) {
      seenIds.add(q.id);
      dedupedNonP.push(q);
    }
  }

  // Inject parent questions for any dependsOn references
  const npIds = new Set(dedupedNonP.map(q => q.id));
  const injections: ClarityQuestion[] = [];
  for (const q of dedupedNonP) {
    if (q.dependsOn && !npIds.has(q.dependsOn.questionId)) {
      const parent = questionById(q.dependsOn.questionId);
      if (parent && !npIds.has(parent.id)) {
        injections.push(parent);
        npIds.add(parent.id);
      }
    }
  }

  const mergedNonP = [...dedupedNonP, ...injections];
  const sortedNonP = topoSortQuestions(mergedNonP);

  // Trim non-personable to fit within budget
  const trimmedNonP = trimToLimit(sortedNonP, Math.max(nonPersonableLimit, spineQuestions.length));

  // Avoidance: if avoidFinance, strip non-spine finance questions
  const filteredNonP = avoidFinance
    ? trimmedNonP.filter(q => q.module !== 'Financial Health' || spineIdSet.has(q.id) || !SPINE_FINANCE_IDS.includes(q.id))
    : trimmedNonP;

  // Final assembly: non-personable first, personable last
  const combinedIds = new Set(filteredNonP.map(q => q.id));
  const dedupedPersonable = personableQuestions.filter(q => !combinedIds.has(q.id));
  const finalQuestions = [...filteredNonP, ...dedupedPersonable];

  // ------------------------------------------------------------------
  // G) BUILD METADATA
  // ------------------------------------------------------------------
  const spineCount = finalQuestions.filter(q => spineIdSet.has(q.id)).length;
  const moduleCount = finalQuestions.filter(q => !spineIdSet.has(q.id) && !personableIds.has(q.id) && selectedModuleSet.has(q.module)).length;
  const trackCount = finalQuestions.filter(q => !q.tracks.includes('UNIVERSAL') && !spineIdSet.has(q.id)).length;
  const personableCount = finalQuestions.filter(q => personableIds.has(q.id)).length;

  const packMeta: PackMeta = {
    packId: generatePackId(track, primaryType, mode),
    track,
    primaryConstraint: primaryType || undefined,
    secondaryConstraint: secondaryType || undefined,
    selectedModules,
    spineCount,
    moduleCount,
    trackCount,
    personableCount,
    estimatedMinutes: estimateMinutes(finalQuestions),
    builderVersion: BUILDER_VERSION,
    questionBankVersion: QUESTION_BANK_VERSION,
  };

  return { questions: finalQuestions, packMeta };
}

// ── Topological sort: ensure parent questions appear before dependents ──

function topoSortQuestions(questions: ClarityQuestion[]): ClarityQuestion[] {
  const idSet = new Set(questions.map(q => q.id));
  const result: ClarityQuestion[] = [];
  const placed = new Set<string>();

  function place(q: ClarityQuestion) {
    if (placed.has(q.id)) return;
    if (q.dependsOn && idSet.has(q.dependsOn.questionId) && !placed.has(q.dependsOn.questionId)) {
      const parent = questions.find(p => p.id === q.dependsOn!.questionId);
      if (parent) place(parent);
    }
    placed.add(q.id);
    result.push(q);
  }

  for (const q of questions) {
    place(q);
  }
  return result;
}

// ── Trim to limit while keeping parent-child integrity ──

function trimToLimit(questions: ClarityQuestion[], limit: number): ClarityQuestion[] {
  if (questions.length <= limit) return questions;

  // Build set of required parent IDs
  const parentIds = new Set<string>();
  for (const q of questions) {
    if (q.dependsOn) parentIds.add(q.dependsOn.questionId);
  }

  // Take first `limit` questions, but if we'd drop a parent whose child is kept, swap
  const kept = questions.slice(0, limit);
  const keptIds = new Set(kept.map(q => q.id));

  // Remove children whose parents were dropped
  return kept.filter(q => {
    if (q.dependsOn && !keptIds.has(q.dependsOn.questionId)) {
      return false; // drop orphaned dependent
    }
    return true;
  });
}
