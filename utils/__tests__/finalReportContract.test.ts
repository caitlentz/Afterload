import { describe, expect, it } from 'vitest';
import { runDiagnostic, type ConstraintType, type IntakeResponse } from '../diagnosticEngine';

function makeCognitiveBoundScenario(): IntakeResponse {
  return {
    firstName: 'Cognitive',
    businessName: 'Decision Queue Co',
    business_model: 'Creative service',
    financial_authority_threshold: '$50',
    gatekeeper_protocol: 'C. Team pauses work until you can review',
    micro_decision_audit: 'Yes',
    micro_decision_frequency: 'C. 16+ decisions',
    final_decisions: 'Always me',
    pricing_decisions: 'Only by me',
    project_stall: 'Waiting on my approval',
    interruption_frequency: 'Multiple times daily',
    qualification_triage: 'I personally screen/qualify every potential client',
    deep_work_audit: '2-3.9 hours',
    recovery_tax: 'Takes a few minutes but I get back on track',
    wait_time_analysis: 'A. Less than 4 hours (Immediate flow)',
    rework_loop: 'A. Less than 10% (Rare)',
    handoff_dependency: 'No - intake documentation handles it',
    runway_stress_test: 'D. 6+ months (Secure)',
    tool_count: '4',
    lead_gen_intake: 'Automatically captured in CRM',
    onboarding_integration: 'Fully automated or handled by team',
    review_quality_control: 'Only for specific situations (new clients, high-value, complex cases)',
    delivery_close_out: 'Yes - fully automated',
    bus_factor_30_day: 'A. It grows/continues normally',
    trust_system_drill_down: 'A. Create a system/process to prevent it',
    revenue_range: '$250k - $500k',
    average_service_rate: '$150 - $250/hr',
    low_value_hours_audit: '1-5 hours',
    revenue_leakage_estimator: 'Yes',
  } as IntakeResponse;
}

function makePolicyBoundScenario(): IntakeResponse {
  return {
    firstName: 'Policy',
    businessName: 'Process Gap Co',
    business_model: 'Standardized service',
    financial_authority_threshold: '$5000',
    gatekeeper_protocol: 'A. Team references the SOP/Policy and decides',
    micro_decision_audit: 'No',
    final_decisions: 'Shared with senior team',
    pricing_decisions: 'Senior team sets pricing',
    project_stall: 'Waiting on team execution',
    interruption_frequency: 'Rarely',
    wait_time_analysis: 'D. It waits until I "clear the deck" (Variable/Infinite lag)',
    rework_loop: 'C. More than 50% (Frequent)',
    handoff_dependency: 'Yes - I always have to translate what the client wants',
    doc_state: 'Nothing is written down; it all lives in the founder head',
    doc_usage: 'Rarely',
    lead_gen_intake: 'They live in inbox/DMs',
    onboarding_integration: 'I personally manage all onboarding communication',
    review_quality_control: 'Yes - I review everything before it goes to the client',
    delivery_close_out: 'No - manual process',
    tool_zombie_check: 'Yes',
    tool_zombie_count: '4',
    tool_count: '12',
    search_friction: '6+ hours',
    bus_factor_30_day: 'B. It maintains/survives but stalls',
    trust_system_drill_down: 'B. Handle it yourself going forward',
    deep_work_audit: '2-3.9 hours',
    recovery_tax: 'Takes a few minutes but I get back on track',
    revenue_range: '$250k - $500k',
    average_service_rate: '$100 - $150/hr',
    low_value_hours_audit: '6-10 hours',
    revenue_leakage_estimator: 'Yes',
  } as IntakeResponse;
}

function makeTimeBoundScenario(): IntakeResponse {
  return {
    firstName: 'Time',
    businessName: 'Founder Capacity Co',
    business_model: 'Advisory/coaching',
    revenue_generation: 'Founder delivers majority of service',
    two_week_absence: 'Revenue drops immediately',
    client_relationship: 'Clients hire me specifically',
    roles_handled: '7+',
    current_state: 'Chaotic and reactive',
    final_decisions: 'Shared with senior team',
    pricing_decisions: 'I approve final pricing',
    project_stall: 'Hiring/staffing gaps',
    interruption_frequency: 'Constantly throughout the day',
    bus_factor_30_day: 'C. It collapses/revenue stops',
    collapse_diagnosis: [
      'Sales would stop (no one else can close deals)',
      'Delivery would halt (team wouldn\'t know what to do)',
    ],
    deep_work_audit: 'Less than 1 hour',
    recovery_tax: 'Task is abandoned or significantly delayed',
    interruption_source_id: 'C. Emergency firefighting (systems breaking)',
    runway_stress_test: 'A. Less than 4 weeks (Immediate Crisis)',
    energy_runway: 'A. I am already burning out',
    trust_system_drill_down: 'B. Handle it yourself going forward',
    financial_authority_threshold: '$2000',
    gatekeeper_protocol: 'A. Team references the SOP/Policy and decides',
    wait_time_analysis: 'B. 24-48 hours (Standard batching)',
    rework_loop: 'A. Less than 10% (Rare)',
    handoff_dependency: 'No - intake documentation handles it',
    lead_gen_intake: 'Manual entry required',
    onboarding_integration: 'Partially automated, but I handle some steps personally',
    review_quality_control: 'Only for specific situations (new clients, high-value, complex cases)',
    delivery_close_out: 'Partially automated',
    revenue_range: '$500k - $1M',
    average_service_rate: '$150 - $250/hr',
    low_value_hours_audit: '10+ hours',
    revenue_leakage_estimator: 'Yes',
    tool_zombie_check: 'Yes',
    tool_zombie_count: '3',
    tool_count: '8',
    search_friction: '3-5 hours',
    strategic_work_id: 'Build a scalable sales engine',
    founder_responsibilities: ['Client communication', 'Scheduling', 'Quality control'],
    has_delegation_support: 'No dedicated ops support',
    doc_state: 'Notes and scattered docs',
    team_capability: 'No — team cannot reliably replicate founder output yet',
    client_expectation: 'Clients expect me specifically',
  } as IntakeResponse;
}

function expectPrimaryConstraint(input: IntakeResponse, expected: ConstraintType) {
  const report = runDiagnostic(input).report;
  expect(report.primaryConstraint).toBe(expected);
}

describe('final report scenario coverage', () => {
  it('reveals decision bottleneck as COGNITIVE-BOUND', () => {
    expectPrimaryConstraint(makeCognitiveBoundScenario(), 'COGNITIVE-BOUND');
  });

  it('reveals process/system bottleneck as POLICY-BOUND', () => {
    expectPrimaryConstraint(makePolicyBoundScenario(), 'POLICY-BOUND');
  });

  it('reveals founder capacity bottleneck as TIME-BOUND', () => {
    expectPrimaryConstraint(makeTimeBoundScenario(), 'TIME-BOUND');
  });
});

describe('final report promised deliverables contract', () => {
  it('includes pressure points, annual friction cost, and three-phase roadmap data', () => {
    const report = runDiagnostic(makeTimeBoundScenario()).report;

    // Pressure-point analysis
    expect(report.pressurePoints.length).toBeGreaterThanOrEqual(3);
    expect(report.enrichedPressurePoints.length).toBeGreaterThanOrEqual(3);
    expect(report.enrichedPressurePoints[0].title).toBeTruthy();
    expect(report.enrichedPressurePoints[0].finding).toBeTruthy();

    // Annual friction-cost calculation
    expect(report.frictionCost.totalRange.high).toBeGreaterThan(0);
    expect(report.frictionCost.totalRange.high).toBeGreaterThanOrEqual(report.frictionCost.totalRange.low);
    expect(report.frictionCost.confidenceLevel).toMatch(/ESTIMATED|ROUGH|DIRECTIONAL/);

    // Three-phase roadmap
    expect(report.phases.length).toBe(3);
    expect(report.enrichedPhases.length).toBeGreaterThanOrEqual(3);
    expect(report.enrichedPhases[0].actions.length).toBeGreaterThan(0);
    expect(report.enrichedPhases[0].successCriteria).toBeTruthy();

    // Core final-report fields should always exist
    expect(report.executiveSummary.length).toBeGreaterThan(40);
    expect(report.constraintDescription.length).toBeGreaterThan(20);
    expect(report.delegationMatrix.length).toBeGreaterThan(0);
    expect(report.heatmap.length).toBeGreaterThanOrEqual(5);
    expect(report.compositeScores.founderRisk.score).toBeGreaterThanOrEqual(0);
  });
});
