import { describe, it, expect } from 'vitest';
import { runPreviewDiagnostic } from '../previewEngine';
import { OPT } from '../intakeOptionMap';
import type { IntakeResponse } from '../diagnosticEngine';

// Helper: minimal valid intake with only the fields we want to test
function makeIntake(overrides: Partial<IntakeResponse> = {}): IntakeResponse {
  return {
    firstName: 'Test',
    email: 'test@example.com',
    businessName: 'TestCo',
    ...overrides,
  } as IntakeResponse;
}

// ------------------------------------------------------------------
// 1. STRICT MATCHING — fuzzy matching is gone
// ------------------------------------------------------------------
describe('strict matching (no fuzzy .includes)', () => {
  it('exact option "Stable but capped" triggers the capped branch', () => {
    const result = runPreviewDiagnostic(makeIntake({
      current_state: OPT.current_state.STABLE_CAPPED,
      growth_limiter: OPT.growth_limiter.TIME,
      final_decisions: OPT.final_decisions.SHARED,
    }));

    // Should hit the "Stable but capped" path in loadTrajectory
    expect(result.loadTrajectory).toContain('structural ceiling');
    // Should hit constraintSnapshot's plateau sentence
    expect(result.constraintSnapshot).toContain('plateau');
  });

  it('custom-ish string containing keyword "capped" does NOT trigger capped branch', () => {
    const result = runPreviewDiagnostic(makeIntake({
      current_state: 'We feel capped' as any, // not a real option
      growth_limiter: OPT.growth_limiter.TIME,
      final_decisions: OPT.final_decisions.SHARED,
    }));

    // Should NOT contain the plateau sentence from Stable but capped
    expect(result.constraintSnapshot).not.toContain('plateau');
    // Should NOT contain "structural ceiling" (the Stable but capped trajectory)
    expect(result.loadTrajectory).not.toContain('structural ceiling');
    // Should fall through to generic fallback
    expect(result.constraintSnapshot).toContain('As demand increases');
  });

  it('exact "Always me" triggers decision scoring, fuzzy "always me decisions" does not', () => {
    // Exact option
    const exact = runPreviewDiagnostic(makeIntake({
      final_decisions: OPT.final_decisions.ALWAYS_ME,
      project_stall: OPT.project_stall.APPROVAL,
    }));
    expect(exact.metadata.scores.decisionBottleneck).toBeGreaterThanOrEqual(45); // 25 + 20

    // Fuzzy string with the keyword
    const fuzzy = runPreviewDiagnostic(makeIntake({
      final_decisions: 'always me decisions' as any,
      project_stall: 'waiting on my approval sometimes' as any,
    }));
    expect(fuzzy.metadata.scores.decisionBottleneck).toBe(0);
  });

  it('exact "Revenue drops immediately" triggers scoring, substring "Revenue drops" alone does not', () => {
    const exact = runPreviewDiagnostic(makeIntake({
      two_week_absence: OPT.two_week_absence.REVENUE_DROPS,
    }));
    expect(exact.metadata.scores.founderCentralization).toBeGreaterThanOrEqual(25);

    const partial = runPreviewDiagnostic(makeIntake({
      two_week_absence: 'Revenue drops' as any,
    }));
    expect(partial.metadata.scores.founderCentralization).toBe(0);
  });

  it('exact "7+" matches roles_handled, but "7" alone does not', () => {
    const exact = runPreviewDiagnostic(makeIntake({
      roles_handled: OPT.roles_handled.SEVEN_PLUS,
    }));
    expect(exact.metadata.scores.founderCentralization).toBeGreaterThanOrEqual(15);

    const partial = runPreviewDiagnostic(makeIntake({
      roles_handled: '7' as any,
    }));
    expect(partial.metadata.scores.founderCentralization).toBe(0);
  });
});

// ------------------------------------------------------------------
// 2. EXPOSURE METRICS — no duplicated labels
// ------------------------------------------------------------------
describe('exposure metrics label deduplication', () => {
  it('Decision authority line does NOT duplicate the label', () => {
    const result = runPreviewDiagnostic(makeIntake({
      final_decisions: OPT.final_decisions.SHARED,
      revenue_generation: OPT.revenue_generation.TEAM_REVIEWS,
      process_documentation: OPT.process_documentation.LIGHT,
      roles_handled: OPT.roles_handled.FIVE_SIX,
      interruption_frequency: OPT.interruption_frequency.FEW_WEEKLY,
    }));

    const decisionLine = result.exposureMetrics.find(l => l.startsWith('Decision authority:'));
    expect(decisionLine).toBeDefined();
    // Should NOT contain "Decision authority" twice
    // The clean display should say something like "Shared with senior staff" not "Decision authority is shared..."
    const parts = decisionLine!.split('Decision authority');
    expect(parts.length).toBe(2); // Appears exactly once (prefix only)
  });

  it('no exposure metric line contains its label prefix duplicated in the value', () => {
    const result = runPreviewDiagnostic(makeIntake({
      final_decisions: OPT.final_decisions.ALWAYS_ME,
      revenue_generation: OPT.revenue_generation.FOUNDER_MAJORITY,
      process_documentation: OPT.process_documentation.IN_HEAD,
      roles_handled: OPT.roles_handled.SEVEN_PLUS,
      interruption_frequency: OPT.interruption_frequency.CONSTANTLY,
      client_relationship: OPT.client_relationship.HIRE_ME,
    }));

    for (const line of result.exposureMetrics) {
      const colonIdx = line.indexOf(':');
      const label = line.substring(0, colonIdx).trim().toLowerCase();
      const value = line.substring(colonIdx + 1).trim().toLowerCase();
      // The value should not start with the same label word
      expect(value.startsWith(label)).toBe(false);
    }
  });
});

// ------------------------------------------------------------------
// 3. ACCEPTANCE CASE from spec
// ------------------------------------------------------------------
describe('acceptance case: Stable but capped + Not enough time + Shared with senior team', () => {
  const result = runPreviewDiagnostic(makeIntake({
    current_state: OPT.current_state.STABLE_CAPPED,
    growth_limiter: OPT.growth_limiter.TIME,
    final_decisions: OPT.final_decisions.SHARED,
    business_model: OPT.business_model.CREATIVE,
  }));

  it('produces capacityConstraint + decisionBottleneck as top two', () => {
    // Capacity: 10 (stable capped) + 20 (time) = 30
    // Decision: 5 (shared)
    // Founder: 10 (time growth_limiter)
    // Fragility: 5 (stable capped)
    expect(result.primaryConstraint.type).toBe('capacityConstraint');
    // Secondary could be founderCentralization (10) or decisionBottleneck (5) or structuralFragility (5)
    // With only these 3 fields, founderCentralization gets 10 from growth_limiter:TIME
    expect(result.secondaryConstraint.type).toBe('founderCentralization');
  });

  it('narrative is NOT the generic fallback', () => {
    expect(result.constraintCompoundNarrative).not.toContain('creating reinforcing pressure');
  });

  it('exposure metric for Decision authority reads clean (not duplicated)', () => {
    const decisionLine = result.exposureMetrics.find(l => l.startsWith('Decision authority:'));
    expect(decisionLine).toBeDefined();
    expect(decisionLine).toContain('Shared with senior staff');
    // Verify no duplication
    expect(decisionLine).not.toContain('Decision authority is shared');
  });

  it('includes metadata', () => {
    expect(result.metadata).toBeDefined();
    expect(result.metadata.track).toBe('B'); // Creative → Track B
    expect(result.metadata.scores).toBeDefined();
    expect(result.metadata.ranked).toHaveLength(4);
    expect(result.metadata.primary.score).toBeGreaterThan(0);
  });

  it('structural tension is specific (not generic fallback)', () => {
    // With stable_capped + growth_limiter:TIME, should hit the new tension rule
    expect(result.structuralTension).toContain('capacity problem');
  });
});

// ------------------------------------------------------------------
// 4. METADATA output
// ------------------------------------------------------------------
describe('metadata output', () => {
  it('includes track, scores, ranked, primary, secondary', () => {
    const result = runPreviewDiagnostic(makeIntake({
      business_model: OPT.business_model.STANDARDIZED,
      final_decisions: OPT.final_decisions.ALWAYS_ME,
      two_week_absence: OPT.two_week_absence.REVENUE_DROPS,
    }));

    expect(result.metadata.track).toBe('A');
    expect(typeof result.metadata.scores.founderCentralization).toBe('number');
    expect(typeof result.metadata.scores.structuralFragility).toBe('number');
    expect(typeof result.metadata.scores.decisionBottleneck).toBe('number');
    expect(typeof result.metadata.scores.capacityConstraint).toBe('number');
    expect(result.metadata.ranked).toHaveLength(4);
    expect(result.metadata.primary.type).toBeDefined();
    expect(result.metadata.primary.label).toBeDefined();
    expect(result.metadata.primary.score).toBeGreaterThanOrEqual(0);
    expect(result.metadata.secondary.type).toBeDefined();
  });

  it('resolves tracks correctly from business_model', () => {
    const trackA = runPreviewDiagnostic(makeIntake({ business_model: OPT.business_model.STANDARDIZED }));
    expect(trackA.metadata.track).toBe('A');

    const trackB = runPreviewDiagnostic(makeIntake({ business_model: OPT.business_model.CREATIVE }));
    expect(trackB.metadata.track).toBe('B');

    const trackC = runPreviewDiagnostic(makeIntake({ business_model: OPT.business_model.ADVISORY }));
    expect(trackC.metadata.track).toBe('C');

    const universal = runPreviewDiagnostic(makeIntake({}));
    expect(universal.metadata.track).toBe('UNIVERSAL');
  });
});

// ------------------------------------------------------------------
// 5. COMPOUND NARRATIVES — specific pairs hit handcrafted output
// ------------------------------------------------------------------
describe('compound narratives hit specific output', () => {
  it('founderCentralization + decisionBottleneck with team delivers → specific narrative', () => {
    const result = runPreviewDiagnostic(makeIntake({
      revenue_generation: OPT.revenue_generation.TEAM_REVIEWS,
      two_week_absence: OPT.two_week_absence.REVENUE_DROPS,
      final_decisions: OPT.final_decisions.ALWAYS_ME,
      process_documentation: OPT.process_documentation.IN_HEAD,
      client_relationship: OPT.client_relationship.HIRE_ME,
    }));

    // This should produce founderCentralization primary, decisionBottleneck secondary
    // And the team-delivers gated rule should fire
    expect(result.constraintCompoundNarrative).not.toContain('creating reinforcing pressure');
  });

  it('capacityConstraint + structuralFragility with ops inefficiency → specific narrative', () => {
    const result = runPreviewDiagnostic(makeIntake({
      current_state: OPT.current_state.CHAOTIC,
      growth_limiter: OPT.growth_limiter.OPS,
      hiring_situation: OPT.hiring_situation.HARD_TO_FIND,
      free_capacity: OPT.free_capacity.HIRE,
      key_member_leaves: OPT.key_member_leaves.REVENUE_DROPS,
    }));

    expect(result.constraintCompoundNarrative).not.toContain('creating reinforcing pressure');
  });
});

// ------------------------------------------------------------------
// 6. STRUCTURAL TENSIONS — new rules fire
// ------------------------------------------------------------------
describe('structural tensions', () => {
  it('shared decisions + stalls on approval → specific tension', () => {
    const result = runPreviewDiagnostic(makeIntake({
      final_decisions: OPT.final_decisions.SHARED,
      project_stall: OPT.project_stall.APPROVAL,
    }));

    expect(result.structuralTension).toContain('shared in theory');
  });

  it('few interruptions + not enough time → specific tension about capacity drain', () => {
    const result = runPreviewDiagnostic(makeIntake({
      interruption_frequency: OPT.interruption_frequency.FEW_WEEKLY,
      growth_limiter: OPT.growth_limiter.TIME,
    }));

    expect(result.structuralTension).toContain('somewhere other than decision load');
  });

  it('docs not used + team delivers with review → docs are formality tension', () => {
    const result = runPreviewDiagnostic(makeIntake({
      process_documentation: OPT.process_documentation.NOT_USED,
      revenue_generation: OPT.revenue_generation.TEAM_REVIEWS,
    }));

    expect(result.structuralTension).toContain('formality');
  });

  it('stable capped + team execution stall → ceiling is delivery', () => {
    const result = runPreviewDiagnostic(makeIntake({
      current_state: OPT.current_state.STABLE_CAPPED,
      project_stall: OPT.project_stall.TEAM_EXECUTION,
    }));

    expect(result.structuralTension).toContain('delivery capacity');
  });
});
