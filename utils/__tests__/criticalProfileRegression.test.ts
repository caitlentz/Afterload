import { describe, expect, it } from 'vitest';
import type { IntakeResponse } from '../diagnosticEngine';
import { OPT } from '../intakeOptionMap';
import { runPreviewDiagnostic } from '../previewEngine';
import { getPreviewEligibility } from '../normalizeIntake';

function makeIntake(overrides: Partial<IntakeResponse> = {}): IntakeResponse {
  return {
    firstName: 'Test',
    email: 'test@example.com',
    businessName: 'TestCo',
    ...overrides,
  } as IntakeResponse;
}

describe('critical profile regressions', () => {
  it('classifies documented-but-not-used + team-execution stalls as Process Gaps', () => {
    const result = runPreviewDiagnostic(makeIntake({
      process_documentation: OPT.process_documentation.NOT_USED,
      project_stall: OPT.project_stall.TEAM_EXECUTION,
      growth_limiter: OPT.growth_limiter.OPS,
      final_decisions: OPT.final_decisions.SHARED,
    }));

    expect(result.primaryConstraint.label).toBe('Process Gaps');
    expect(result.primaryConstraint.type).toBe('structuralFragility');
  });

  it('detects knowledge-silo profile and yields high founder-dependency confidence signal', () => {
    const intake = makeIntake({
      process_documentation: OPT.process_documentation.IN_HEAD,
      client_relationship: OPT.client_relationship.HIRE_ME,
      hiring_situation: OPT.hiring_situation.HARD_TO_FIND,
      two_week_absence: OPT.two_week_absence.ESCALATES,
      pricing_decisions: OPT.pricing_decisions.I_APPROVE,
      final_decisions: OPT.final_decisions.MOSTLY_ME,
      interruption_frequency: OPT.interruption_frequency.MULTIPLE_DAILY,
      roles_handled: OPT.roles_handled.FIVE_SIX,
      project_stall: OPT.project_stall.TEAM_EXECUTION,
    });

    const preview = runPreviewDiagnostic(intake);
    const eligibility = getPreviewEligibility(intake);

    expect(preview.primaryConstraint.label).toBe('Knowledge Silos');
    expect(eligibility.metadata.founderDependencyScore).toBeGreaterThanOrEqual(61);
  });

  it('treats well-delegated + inconsistent-demand as strategic, not operational-capacity', () => {
    const intake = makeIntake({
      revenue_generation: OPT.revenue_generation.TEAM_INDEPENDENT,
      final_decisions: OPT.final_decisions.RARELY_ME,
      process_documentation: OPT.process_documentation.FULLY,
      two_week_absence: OPT.two_week_absence.RUNS_NORMALLY,
      growth_limiter: OPT.growth_limiter.DEMAND,
      client_relationship: OPT.client_relationship.NO_FOUNDER,
      roles_handled: OPT.roles_handled.ONE_TWO,
      interruption_frequency: OPT.interruption_frequency.RARELY,
      pricing_decisions: OPT.pricing_decisions.FIXED,
    });

    const preview = runPreviewDiagnostic(intake);
    expect(preview.primaryConstraint.label).toBe('Strategic Optimization');
    expect(preview.primaryConstraint.type).toBe('strategicOptimization');
    expect(preview.metadata.scores.capacityConstraint).toBe(0);
  });
});
