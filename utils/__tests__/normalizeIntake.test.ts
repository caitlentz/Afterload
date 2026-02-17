import { describe, expect, it } from 'vitest';
import { getPreviewEligibility } from '../normalizeIntake';
import { OPT } from '../intakeOptionMap';
import type { IntakeResponse } from '../diagnosticEngine';
import { scoreDimensions, selectPrimarySecondaryDimensions } from '../previewScoring';

function makeIntake(overrides: Partial<IntakeResponse> = {}): IntakeResponse {
  return {
    firstName: 'Test',
    email: 'test@example.com',
    businessName: 'TestCo',
    ...overrides,
  } as IntakeResponse;
}

describe('getPreviewEligibility operational pattern labeling', () => {
  it('always returns outcome OK (no industry filtering)', () => {
    const result = getPreviewEligibility(makeIntake({
      business_model: 'SaaS marketplace' as any,
    }));

    expect(result.outcome).toBe('OK');
  });

  it('maps pattern from primary dimension type', () => {
    const result = getPreviewEligibility(makeIntake({
      revenue_generation: OPT.revenue_generation.FOUNDER_MAJORITY,
      two_week_absence: OPT.two_week_absence.REVENUE_DROPS,
      client_relationship: OPT.client_relationship.HIRE_ME,
      final_decisions: OPT.final_decisions.RARELY_ME,
    }));

    expect(result.metadata.primaryConstraint.type).toBe('founderCentralization');
    expect(result.metadata.pattern).toBe('FOUNDER');
  });

  it('overrides to MIXED when top two constraints are within 10 points', () => {
    const result = getPreviewEligibility(makeIntake({
      final_decisions: OPT.final_decisions.SHARED,
      project_stall: OPT.project_stall.APPROVAL,
      interruption_frequency: OPT.interruption_frequency.FEW_WEEKLY,
      growth_limiter: OPT.growth_limiter.STAFF,
      current_state: OPT.current_state.GROWING_STRAINED,
      roles_handled: OPT.roles_handled.ONE_TWO,
      client_relationship: OPT.client_relationship.NO_FOUNDER,
    }));

    const gap = Math.abs(
      result.metadata.primaryConstraint.score - result.metadata.secondaryConstraint.score
    );

    expect(gap).toBeLessThanOrEqual(10);
    expect(result.metadata.pattern).toBe('MIXED');
  });

  it('sets confidence HIGH for founderDependencyScore >= 70', () => {
    const result = getPreviewEligibility(makeIntake({
      pricing_decisions: OPT.pricing_decisions.ONLY_ME,
      process_documentation: OPT.process_documentation.IN_HEAD,
      client_relationship: OPT.client_relationship.HIRE_ME,
      revenue_generation: OPT.revenue_generation.FOUNDER_MAJORITY,
      two_week_absence: OPT.two_week_absence.REVENUE_DROPS,
      final_decisions: OPT.final_decisions.ALWAYS_ME,
    }));

    expect(result.metadata.founderDependencyScore).toBeGreaterThanOrEqual(70);
    expect(result.metadata.confidence).toBe('HIGH');
  });

  it('sets confidence MED for founderDependencyScore 50-69', () => {
    const result = getPreviewEligibility(makeIntake({
      final_decisions: OPT.final_decisions.ALWAYS_ME,
      pricing_decisions: OPT.pricing_decisions.I_APPROVE,
      revenue_generation: OPT.revenue_generation.FOUNDER_MAJORITY,
      two_week_absence: OPT.two_week_absence.ESCALATES,
      process_documentation: OPT.process_documentation.LIGHT,
      client_relationship: OPT.client_relationship.EXPECT_ME,
      interruption_frequency: OPT.interruption_frequency.FEW_WEEKLY,
    }));

    expect(result.metadata.founderDependencyScore).toBeGreaterThanOrEqual(50);
    expect(result.metadata.founderDependencyScore).toBeLessThan(70);
    expect(result.metadata.confidence).toBe('MED');
  });

  it('sets confidence LOW for founderDependencyScore below 50', () => {
    const result = getPreviewEligibility(makeIntake({
      final_decisions: OPT.final_decisions.SHARED,
      interruption_frequency: OPT.interruption_frequency.FEW_WEEKLY,
    }));

    expect(result.metadata.founderDependencyScore).toBeLessThan(50);
    expect(result.metadata.confidence).toBe('LOW');
  });

  it('uses strict enum equality only (no fuzzy matching)', () => {
    const result = getPreviewEligibility(makeIntake({
      revenue_generation: 'Founder delivers majority' as any,
      two_week_absence: 'Revenue drops' as any,
      final_decisions: 'Always me decisions' as any,
      project_stall: 'Waiting on approval sometimes' as any,
      roles_handled: '7' as any,
      client_relationship: 'Clients hire me' as any,
    }));

    expect(result.metadata.founderDependencyScore).toBe(0);
    expect(result.metadata.primaryConstraint.score).toBe(0);
    expect(result.metadata.secondaryConstraint.score).toBe(0);
    expect(result.metadata.pattern).toBe('MIXED');
    expect(result.metadata.confidence).toBe('LOW');
  });

  it('uses shared preview scorer selection outputs for constraints', () => {
    const intake = makeIntake({
      growth_limiter: OPT.growth_limiter.STAFF,
      final_decisions: OPT.final_decisions.ALWAYS_ME,
      project_stall: OPT.project_stall.APPROVAL,
      process_documentation: OPT.process_documentation.LIGHT,
    });
    const result = getPreviewEligibility(intake);
    const selected = selectPrimarySecondaryDimensions(intake, scoreDimensions(intake));

    expect(result.metadata.primaryConstraint.type).toEqual(selected.primary.type);
    expect(result.metadata.primaryConstraint.score).toEqual(selected.primary.score);
    expect(result.metadata.secondaryConstraint.type).toEqual(selected.secondary.type);
    expect(result.metadata.secondaryConstraint.score).toEqual(selected.secondary.score);
  });

  it('rationale includes primary label, secondary label, pattern, and confidence', () => {
    const result = getPreviewEligibility(makeIntake({
      final_decisions: OPT.final_decisions.ALWAYS_ME,
      project_stall: OPT.project_stall.APPROVAL,
      growth_limiter: OPT.growth_limiter.STAFF,
    }));

    expect(result.metadata.rationale).toContain(result.metadata.primaryConstraint.label);
    expect(result.metadata.rationale).toContain(result.metadata.secondaryConstraint.label);
    expect(result.metadata.rationale).toContain(`Pattern: ${result.metadata.pattern}`);
    expect(result.metadata.rationale).toContain(`confidence=${result.metadata.confidence}`);
  });
});
