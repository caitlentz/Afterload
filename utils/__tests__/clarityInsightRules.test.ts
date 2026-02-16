import { describe, it, expect } from 'vitest';
import { deriveClarityInsightFlags, InsightFlag } from '../clarityInsightRules';
import type { IntakeResponse } from '../diagnosticEngine';

// ------------------------------------------------------------------
// TEST FIXTURES
// ------------------------------------------------------------------

function makeBaseAnswers(): IntakeResponse {
  return {
    business_model: 'Creative service',
    firstName: 'Test',
    email: 'test@test.com',
    businessName: 'Test Co',
  } as IntakeResponse;
}

// ------------------------------------------------------------------
// TESTS: INSIGHT FLAGS
// ------------------------------------------------------------------

describe('deriveClarityInsightFlags', () => {
  it('returns empty array when no conditions match', () => {
    const answers = makeBaseAnswers();
    const flags = deriveClarityInsightFlags(answers);
    expect(flags).toEqual([]);
  });

  // ── Rule 1: Tool sprawl ──

  it('fires tool_sprawl when tool_zombie_check=Yes and tool_count>=10', () => {
    const answers: IntakeResponse = {
      ...makeBaseAnswers(),
      tool_zombie_check: 'Yes',
      tool_count: '12',
    } as IntakeResponse;

    const flags = deriveClarityInsightFlags(answers);
    const match = flags.find(f => f.id === 'tool_sprawl');
    expect(match).toBeTruthy();
    expect(match!.severity).toBe('MEDIUM');
    expect(match!.evidenceQuestionIds).toContain('tool_zombie_check');
    expect(match!.evidenceQuestionIds).toContain('tool_count');
  });

  it('does NOT fire tool_sprawl when tool_count < 10', () => {
    const answers: IntakeResponse = {
      ...makeBaseAnswers(),
      tool_zombie_check: 'Yes',
      tool_count: '5',
    } as IntakeResponse;

    const flags = deriveClarityInsightFlags(answers);
    expect(flags.find(f => f.id === 'tool_sprawl')).toBeUndefined();
  });

  // ── Rule 2: No intake system + high retrieval tax ──

  it('fires intake_retrieval_gap when search_friction=6+ and leads in inbox', () => {
    const answers: IntakeResponse = {
      ...makeBaseAnswers(),
      search_friction: '6+ hours',
      lead_gen_intake: 'They live in inbox/DMs',
    } as IntakeResponse;

    const flags = deriveClarityInsightFlags(answers);
    const match = flags.find(f => f.id === 'intake_retrieval_gap');
    expect(match).toBeTruthy();
    expect(match!.severity).toBe('HIGH');
  });

  // ── Rule 3: Founder as quality gate ──

  it('fires founder_quality_gate when bus_factor collapses and founder reviews everything', () => {
    const answers: IntakeResponse = {
      ...makeBaseAnswers(),
      bus_factor_30_day: 'C. It collapses/revenue stops',
      review_quality_control: 'Yes - I review everything before it goes to the client',
    } as IntakeResponse;

    const flags = deriveClarityInsightFlags(answers);
    const match = flags.find(f => f.id === 'founder_quality_gate');
    expect(match).toBeTruthy();
    expect(match!.severity).toBe('HIGH');
  });

  // ── Rule 4: Rework + QC trap ──

  it('fires rework_qc_trap when rework >50% and founder reviews everything', () => {
    const answers: IntakeResponse = {
      ...makeBaseAnswers(),
      rework_loop: 'C. More than 50% (Frequent)',
      review_quality_control: 'Yes - I review everything before it goes to the client',
    } as IntakeResponse;

    const flags = deriveClarityInsightFlags(answers);
    const match = flags.find(f => f.id === 'rework_qc_trap');
    expect(match).toBeTruthy();
  });

  // ── Rule 5: Financial stability, human instability ──

  it('fires cash_vs_burnout when cash stable but burning out', () => {
    const answers: IntakeResponse = {
      ...makeBaseAnswers(),
      runway_stress_test: 'C. 3-6 months (Stable)',
      energy_runway: 'A. I am already burning out',
    } as IntakeResponse;

    const flags = deriveClarityInsightFlags(answers);
    const match = flags.find(f => f.id === 'cash_vs_burnout');
    expect(match).toBeTruthy();
    expect(match!.severity).toBe('HIGH');
  });

  it('fires cash_vs_burnout when cash secure but 6-12 weeks energy', () => {
    const answers: IntakeResponse = {
      ...makeBaseAnswers(),
      runway_stress_test: 'D. 6+ months (Secure)',
      energy_runway: 'B. 6-12 weeks',
    } as IntakeResponse;

    const flags = deriveClarityInsightFlags(answers);
    expect(flags.find(f => f.id === 'cash_vs_burnout')).toBeTruthy();
  });

  // ── Rule 10: System avoidance ──

  it('fires system_avoidance when bus_factor collapses + handle-it-yourself instinct', () => {
    const answers: IntakeResponse = {
      ...makeBaseAnswers(),
      bus_factor_30_day: 'C. It collapses/revenue stops',
      trust_system_drill_down: 'B. Handle it yourself going forward',
    } as IntakeResponse;

    const flags = deriveClarityInsightFlags(answers);
    const match = flags.find(f => f.id === 'system_avoidance');
    expect(match).toBeTruthy();
    expect(match!.severity).toBe('HIGH');
  });

  // ── Rule 9: Pricing paralysis ──

  it('fires pricing_paralysis when afraid to raise + stale pricing', () => {
    const answers: IntakeResponse = {
      ...makeBaseAnswers(),
      pricing_confidence: "Not confident — I suspect I'm undercharging but I'm afraid to raise prices",
      pricing_last_raised: 'Over 2 years ago (or never)',
    } as IntakeResponse;

    const flags = deriveClarityInsightFlags(answers);
    const match = flags.find(f => f.id === 'pricing_paralysis');
    expect(match).toBeTruthy();
    expect(match!.severity).toBe('MEDIUM');
  });

  // ── Rule 12: Admin rate mismatch ──

  it('fires admin_rate_mismatch when high rate + many low-value hours', () => {
    const answers: IntakeResponse = {
      ...makeBaseAnswers(),
      average_service_rate: '$150 - $250/hr',
      low_value_hours_audit: '10+ hours',
    } as IntakeResponse;

    const flags = deriveClarityInsightFlags(answers);
    const match = flags.find(f => f.id === 'admin_rate_mismatch');
    expect(match).toBeTruthy();
  });

  // ── Multiple flags can fire ──

  it('returns multiple flags when multiple conditions match', () => {
    const answers: IntakeResponse = {
      ...makeBaseAnswers(),
      tool_zombie_check: 'Yes',
      tool_count: '15',
      bus_factor_30_day: 'C. It collapses/revenue stops',
      review_quality_control: 'Yes - I review everything before it goes to the client',
      trust_system_drill_down: 'B. Handle it yourself going forward',
      rework_loop: 'C. More than 50% (Frequent)',
    } as IntakeResponse;

    const flags = deriveClarityInsightFlags(answers);
    expect(flags.length).toBeGreaterThanOrEqual(3);

    const ids = flags.map(f => f.id);
    expect(ids).toContain('tool_sprawl');
    expect(ids).toContain('founder_quality_gate');
    expect(ids).toContain('system_avoidance');
    expect(ids).toContain('rework_qc_trap');
  });

  // ── Severity sorting ──

  it('sorts HIGH flags before MEDIUM flags', () => {
    const answers: IntakeResponse = {
      ...makeBaseAnswers(),
      tool_zombie_check: 'Yes',
      tool_count: '15',
      bus_factor_30_day: 'C. It collapses/revenue stops',
      review_quality_control: 'Yes - I review everything before it goes to the client',
    } as IntakeResponse;

    const flags = deriveClarityInsightFlags(answers);
    // founder_quality_gate is HIGH, tool_sprawl is MEDIUM
    const highIdx = flags.findIndex(f => f.severity === 'HIGH');
    const medIdx = flags.findIndex(f => f.severity === 'MEDIUM');
    if (highIdx !== -1 && medIdx !== -1) {
      expect(highIdx).toBeLessThan(medIdx);
    }
  });

  // ── Rule 6: Micro-decision overload ──

  it('fires micro_decision_overload when 16+ micro-decisions + poor deep work', () => {
    const answers: IntakeResponse = {
      ...makeBaseAnswers(),
      micro_decision_frequency: 'C. 16+ decisions',
      deep_work_audit: 'Less than 1 hour',
    } as IntakeResponse;

    const flags = deriveClarityInsightFlags(answers);
    expect(flags.find(f => f.id === 'micro_decision_overload')).toBeTruthy();
  });

  // ── Rule 15: Context switch penalty ──

  it('fires context_switch_penalty when recovery difficult + short deep work', () => {
    const answers: IntakeResponse = {
      ...makeBaseAnswers(),
      recovery_tax: 'Significant effort required to rebuild focus',
      deep_work_audit: '1-1.9 hours',
    } as IntakeResponse;

    const flags = deriveClarityInsightFlags(answers);
    expect(flags.find(f => f.id === 'context_switch_penalty')).toBeTruthy();
  });
});
