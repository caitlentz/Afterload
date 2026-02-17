import { describe, it, expect } from 'vitest';
import {
  buildDeepDiveQuestionSet,
  DeepDivePrefs,
  BUILDER_VERSION,
  QUESTION_BANK_VERSION,
  isOutdatedPack,
} from '../deepDiveBuilder';
import { runPreviewDiagnostic, PreviewResult } from '../previewEngine';
import type { IntakeResponse } from '../diagnosticEngine';

// ------------------------------------------------------------------
// TEST FIXTURES
// ------------------------------------------------------------------

/** Simulates a typical founder-heavy creative agency */
function makeCreativeAgencyIntake(): IntakeResponse {
  return {
    business_model: 'Creative service',
    revenue_generation: 'Founder delivers majority of service',
    two_week_absence: 'Revenue drops immediately',
    final_decisions: 'Always me',
    project_stall: 'Waiting on my approval',
    growth_limiter: 'Not enough time',
    process_documentation: 'Mostly in my head',
    roles_handled: '7+',
    client_relationship: 'Clients hire me specifically',
    key_member_leaves: 'Revenue drops',
    pricing_decisions: 'Only by me',
    interruption_frequency: 'Constantly throughout the day',
    hiring_situation: 'Actively hiring, hard to find talent',
    free_capacity: 'Better systems',
    current_state: 'Growing but strained',
    firstName: 'Jane',
    email: 'jane@test.com',
    businessName: 'Test Agency',
  } as IntakeResponse;
}

/** Simulates a standardized service (Track A) */
function makeStandardizedIntake(): IntakeResponse {
  return {
    business_model: 'Standardized service',
    revenue_generation: 'Team delivers, founder reviews',
    two_week_absence: 'Work slows significantly',
    final_decisions: 'Mostly me',
    project_stall: 'Waiting on team execution',
    growth_limiter: 'Operational inefficiency',
    process_documentation: 'Light documentation',
    roles_handled: '3–4',
    client_relationship: 'Clients hire the firm but expect me involved',
    key_member_leaves: 'Delivery slows',
    pricing_decisions: 'I approve final pricing',
    interruption_frequency: 'Multiple times daily',
    hiring_situation: 'Hiring occasionally',
    free_capacity: 'Hiring more staff',
    current_state: 'Stable but capped',
    firstName: 'Bob',
    email: 'bob@test.com',
    businessName: 'Test Services',
  } as IntakeResponse;
}

/** Simulates a coaching/consulting business (Track C) */
function makeCoachingIntake(): IntakeResponse {
  return {
    business_model: 'Advisory/coaching',
    revenue_generation: 'Founder delivers majority of service',
    two_week_absence: 'Revenue drops immediately',
    final_decisions: 'Always me',
    project_stall: 'Waiting on my approval',
    growth_limiter: 'Not enough time',
    process_documentation: 'Mostly in my head',
    roles_handled: '5–6',
    client_relationship: 'Clients hire me specifically',
    key_member_leaves: 'Temporary disruption',
    pricing_decisions: 'Only by me',
    interruption_frequency: 'A few times per week',
    hiring_situation: 'Fully staffed',
    free_capacity: 'Delegating approvals',
    current_state: 'Profitable but founder-heavy',
    firstName: 'Carol',
    email: 'carol@test.com',
    businessName: 'Test Consulting',
  } as IntakeResponse;
}

function buildPreview(intake: IntakeResponse): PreviewResult {
  return runPreviewDiagnostic(intake);
}

function makeSystemCapacityPreview(): PreviewResult {
  return {
    primaryConstraint: {
      type: 'structuralFragility',
      label: 'System Fragility',
      score: 60,
    },
    secondaryConstraint: {
      type: 'capacityConstraint',
      label: 'Capacity Constraint',
      score: 55,
    },
  } as unknown as PreviewResult;
}

// ------------------------------------------------------------------
// TESTS: QUESTION SET BUILDER
// ------------------------------------------------------------------

describe('buildDeepDiveQuestionSet', () => {
  // ── Determinism ──

  it('returns identical results for identical inputs', () => {
    const intake = makeCreativeAgencyIntake();
    const preview = buildPreview(intake);
    const result1 = buildDeepDiveQuestionSet({ intake, preview });
    const result2 = buildDeepDiveQuestionSet({ intake, preview });

    expect(result1.questions.map(q => q.id)).toEqual(result2.questions.map(q => q.id));
    expect(result1.packMeta).toEqual(result2.packMeta);
  });

  // ── Mode sizing ──

  it('SHORT mode produces ~15 questions', () => {
    const intake = makeCreativeAgencyIntake();
    const preview = buildPreview(intake);
    const result = buildDeepDiveQuestionSet({
      intake,
      preview,
      userPrefs: { mode: 'SHORT' },
    });

    expect(result.questions.length).toBeGreaterThanOrEqual(10);
    expect(result.questions.length).toBeLessThanOrEqual(18);
    expect(result.packMeta.estimatedMinutes).toBeGreaterThan(0);
  });

  it('STANDARD mode produces ~25 questions', () => {
    const intake = makeCreativeAgencyIntake();
    const preview = buildPreview(intake);
    const result = buildDeepDiveQuestionSet({
      intake,
      preview,
      userPrefs: { mode: 'STANDARD' },
    });

    expect(result.questions.length).toBeGreaterThanOrEqual(15);
    expect(result.questions.length).toBeLessThanOrEqual(28);
  });

  it('DEEP mode produces ~35 questions', () => {
    const intake = makeCreativeAgencyIntake();
    const preview = buildPreview(intake);
    const result = buildDeepDiveQuestionSet({
      intake,
      preview,
      userPrefs: { mode: 'DEEP' },
    });

    expect(result.questions.length).toBeGreaterThanOrEqual(20);
    expect(result.questions.length).toBeLessThanOrEqual(38);
  });

  it('respects maxQuestions override', () => {
    const intake = makeCreativeAgencyIntake();
    const preview = buildPreview(intake);

    // maxQuestions must be realistic (spine is ~12, personable ~3)
    // With personable off, the limit is strictly respected
    const resultNoP = buildDeepDiveQuestionSet({
      intake,
      preview,
      userPrefs: { mode: 'DEEP', maxQuestions: 14, includePersonable: false },
    });
    expect(resultNoP.questions.length).toBeLessThanOrEqual(14);

    // With personable on, a low maxQuestions still trims module/track
    const resultWithP = buildDeepDiveQuestionSet({
      intake,
      preview,
      userPrefs: { mode: 'DEEP', maxQuestions: 20 },
    });
    // personable adds up to 3 on top of the non-personable budget
    expect(resultWithP.questions.length).toBeLessThanOrEqual(23);
  });

  // ── Track selection ──

  it('assigns Track B for creative service', () => {
    const intake = makeCreativeAgencyIntake();
    const preview = buildPreview(intake);
    const result = buildDeepDiveQuestionSet({ intake, preview });

    expect(result.packMeta.track).toBe('B');
  });

  it('assigns Track A for standardized service', () => {
    const intake = makeStandardizedIntake();
    const preview = buildPreview(intake);
    const result = buildDeepDiveQuestionSet({ intake, preview });

    expect(result.packMeta.track).toBe('A');
  });

  it('assigns Track C for coaching/advisory', () => {
    const intake = makeCoachingIntake();
    const preview = buildPreview(intake);
    const result = buildDeepDiveQuestionSet({ intake, preview });

    expect(result.packMeta.track).toBe('C');
  });

  // ── Module selection based on preview constraints ──

  it('selects modules aligned with primary + secondary constraints', () => {
    const intake = makeCreativeAgencyIntake();
    const preview = buildPreview(intake);
    const result = buildDeepDiveQuestionSet({ intake, preview });

    // The creative agency fixture should have founderCentralization high
    expect(result.packMeta.selectedModules.length).toBeGreaterThanOrEqual(2);
    // packMeta should reflect the constraint types
    expect(result.packMeta.primaryConstraint).toBeTruthy();
    expect(result.packMeta.secondaryConstraint).toBeTruthy();
  });

  // ── Personable layer ──

  it('includes at least 2 Founder Reality questions in STANDARD mode', () => {
    const intake = makeCreativeAgencyIntake();
    const preview = buildPreview(intake);
    const result = buildDeepDiveQuestionSet({
      intake,
      preview,
      userPrefs: { mode: 'STANDARD' },
    });

    const founderReality = result.questions.filter(q => q.module === 'Founder Reality');
    expect(founderReality.length).toBeGreaterThanOrEqual(2);
    expect(result.packMeta.personableCount).toBeGreaterThanOrEqual(2);
  });

  it('includes at least 2 Founder Reality questions in SHORT mode', () => {
    const intake = makeCreativeAgencyIntake();
    const preview = buildPreview(intake);
    const result = buildDeepDiveQuestionSet({
      intake,
      preview,
      userPrefs: { mode: 'SHORT' },
    });

    const founderReality = result.questions.filter(q => q.module === 'Founder Reality');
    expect(founderReality.length).toBeGreaterThanOrEqual(2);
  });

  it('excludes personable when includePersonable=false', () => {
    const intake = makeCreativeAgencyIntake();
    const preview = buildPreview(intake);
    const result = buildDeepDiveQuestionSet({
      intake,
      preview,
      userPrefs: { mode: 'STANDARD', includePersonable: false },
    });

    const founderReality = result.questions.filter(q => q.module === 'Founder Reality');
    expect(founderReality.length).toBe(0);
    expect(result.packMeta.personableCount).toBe(0);
  });

  // ── dependsOn ordering ──

  it('places parent questions before their dependents', () => {
    const intake = makeCreativeAgencyIntake();
    const preview = buildPreview(intake);
    const result = buildDeepDiveQuestionSet({
      intake,
      preview,
      userPrefs: { mode: 'DEEP' },
    });

    const ids = result.questions.map(q => q.id);

    for (const q of result.questions) {
      if (q.dependsOn) {
        const parentIdx = ids.indexOf(q.dependsOn.questionId);
        const childIdx = ids.indexOf(q.id);
        if (parentIdx !== -1) {
          expect(parentIdx).toBeLessThan(childIdx);
        }
      }
    }
  });

  // ── No duplicates ──

  it('contains no duplicate question IDs', () => {
    const intake = makeCreativeAgencyIntake();
    const preview = buildPreview(intake);
    const result = buildDeepDiveQuestionSet({
      intake,
      preview,
      userPrefs: { mode: 'DEEP' },
    });

    const ids = result.questions.map(q => q.id);
    const unique = new Set(ids);
    expect(ids.length).toBe(unique.size);
  });

  // ── Spine always present ──

  it('always includes core spine questions', () => {
    const intake = makeCreativeAgencyIntake();
    const preview = buildPreview(intake);
    const result = buildDeepDiveQuestionSet({
      intake,
      preview,
      userPrefs: { mode: 'SHORT' },
    });

    const ids = new Set(result.questions.map(q => q.id));
    // These critical spine questions should always be present
    expect(ids.has('deep_work_audit')).toBe(true);
    expect(ids.has('recovery_tax')).toBe(true);
    expect(ids.has('bus_factor_30_day')).toBe(true);
    expect(ids.has('interruption_source_id')).toBe(true);
  });

  // ── avoidFinance ──

  it('reduces finance questions when avoidFinance=true', () => {
    const intake = makeCreativeAgencyIntake();
    const preview = buildPreview(intake);

    const withFinance = buildDeepDiveQuestionSet({
      intake,
      preview,
      userPrefs: { mode: 'STANDARD' },
    });
    const withoutFinance = buildDeepDiveQuestionSet({
      intake,
      preview,
      userPrefs: { mode: 'STANDARD', avoidFinance: true },
    });

    const finCountWith = withFinance.questions.filter(q => q.module === 'Financial Health').length;
    const finCountWithout = withoutFinance.questions.filter(q => q.module === 'Financial Health').length;

    expect(finCountWithout).toBeLessThanOrEqual(finCountWith);
  });

  // ── Pack metadata ──

  it('returns complete packMeta', () => {
    const intake = makeCreativeAgencyIntake();
    const preview = buildPreview(intake);
    const result = buildDeepDiveQuestionSet({ intake, preview });

    expect(result.packMeta.packId).toBeTruthy();
    expect(result.packMeta.track).toMatch(/^[ABC]$/);
    expect(result.packMeta.selectedModules.length).toBeGreaterThanOrEqual(2);
    expect(result.packMeta.spineCount).toBeGreaterThan(0);
    expect(result.packMeta.estimatedMinutes).toBeGreaterThan(0);
    expect(result.packMeta.builderVersion).toBe(BUILDER_VERSION);
    expect(result.packMeta.questionBankVersion).toBe(QUESTION_BANK_VERSION);
  });

  it('isOutdatedPack returns true when versions mismatch', () => {
    expect(isOutdatedPack({
      builderVersion: 'older',
      questionBankVersion: QUESTION_BANK_VERSION,
    })).toBe(true);

    expect(isOutdatedPack({
      builderVersion: BUILDER_VERSION,
      questionBankVersion: 'older',
    })).toBe(true);
  });

  it('isOutdatedPack returns false when versions match', () => {
    expect(isOutdatedPack({
      builderVersion: BUILDER_VERSION,
      questionBankVersion: QUESTION_BANK_VERSION,
    })).toBe(false);
  });

  // ── Track-specific questions included ──

  it('includes Track A questions for standardized service', () => {
    const intake = makeStandardizedIntake();
    const preview = buildPreview(intake);
    const result = buildDeepDiveQuestionSet({
      intake,
      preview,
      userPrefs: { mode: 'DEEP' },
    });

    const ids = new Set(result.questions.map(q => q.id));
    // Track A has gatekeeper_protocol, handoff_dependency, qualification_triage, etc.
    const trackAIds = ['gatekeeper_protocol', 'handoff_dependency', 'qualification_triage', 'fulfillment_production', 'team_idle_time_cost'];
    const included = trackAIds.filter(id => ids.has(id));
    expect(included.length).toBeGreaterThan(0);
    expect(result.packMeta.trackCount).toBeGreaterThan(0);
  });

  it('prioritizes track questions relevant to selected constraint modules', () => {
    const intake = makeCoachingIntake(); // Track C
    const preview = makeSystemCapacityPreview();
    const result = buildDeepDiveQuestionSet({
      intake,
      preview,
      userPrefs: { mode: 'STANDARD' },
    });

    const trackSpecific = result.questions.filter(
      q => q.tracks.includes('C') && !q.tracks.includes('UNIVERSAL')
    );

    expect(trackSpecific.length).toBeGreaterThan(0);
    expect(trackSpecific.some(q => q.module === 'Decision Load')).toBe(false);

    const allowedModules = new Set([
      'System Health',
      'Financial Health',
      'Process Heatmap',
      'Flow Friction',
      'Workload Analysis',
    ]);
    expect(trackSpecific.every(q => allowedModules.has(q.module))).toBe(true);
  });
});
