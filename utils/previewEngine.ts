import { IntakeResponse, ConstraintType, determineTrack } from './diagnosticEngine';

// ------------------------------------------------------------------
// PREVIEW ENGINE
// Generates a meaningful preview from just the initial 7-10 questions.
// This is the FREE report that sells the $1,200 full diagnostic.
// ------------------------------------------------------------------

export type LifecycleStage = {
  id: string;
  label: string;
  status: 'healthy' | 'stressed' | 'critical' | 'unknown';
  signal: string;
};

export type SustainabilityHorizon = {
  label: string;               // e.g. "Short", "Moderate", "Stable"
  description: string;         // narrative explanation
  pressureLevel: 'critical' | 'high' | 'moderate' | 'low';
  factors: string[];           // what's driving the score
};

export type PreviewResult = {
  businessName: string;
  date: string;
  track: 'A' | 'B' | 'C';
  trackLabel: string;
  primaryConstraint: ConstraintType;
  constraintLabel: string;
  constraintDescription: string;
  founderDependency: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  founderDependencySignal: string;
  riskSignals: string[];
  successTrap: string;
  whatWeKnow: string[];
  whatWeNeedToFind: string[];
  sustainabilityHorizon: SustainabilityHorizon;
  lifecycle: LifecycleStage[];
};

export function runPreviewDiagnostic(data: IntakeResponse): PreviewResult {
  const track = determineTrack(data.business_type);
  const businessName = data.businessName || 'Your Business';

  // --- DETERMINE CONSTRAINT from initial intake answers ---
  let constraint: ConstraintType = 'UNKNOWN';
  let founderDependency: PreviewResult['founderDependency'] = 'MODERATE';
  let founderDependencySignal = '';
  const riskSignals: string[] = [];
  const whatWeKnow: string[] = [];
  const whatWeNeedToFind: string[] = [];

  // TRACK A: Time-Bound
  if (track === 'A') {
    // Capacity utilization
    if (data.capacity_utilization?.includes('Overbooked') || data.capacity_utilization?.includes('Completely full')) {
      constraint = 'TIME-BOUND';
      riskSignals.push('You are at or beyond capacity — growth requires structural change, not harder work.');
      whatWeKnow.push(`Schedule: ${data.capacity_utilization}`);
    } else if (data.capacity_utilization?.includes('Mostly booked')) {
      constraint = 'TIME-BOUND';
      riskSignals.push('You\'re approaching a ceiling. Current structure has limited room left.');
    }

    // Absence impact
    if (data.absence_impact?.includes('Everything stops') || data.absence_impact?.includes('Revenue drops')) {
      founderDependency = 'CRITICAL';
      founderDependencySignal = `When you're gone: "${data.absence_impact}"`;
      riskSignals.push('Revenue is directly tied to your physical presence.');
    } else if (data.absence_impact?.includes('rescheduled')) {
      founderDependency = 'HIGH';
      founderDependencySignal = 'Appointments depend on you specifically.';
    } else {
      founderDependency = 'MODERATE';
      founderDependencySignal = 'Your team can handle short absences.';
    }

    // Growth blocker
    if (data.growth_blocker?.includes('hours in the day')) {
      whatWeKnow.push('Growth blocker: Not enough hours');
      if (constraint === 'UNKNOWN') constraint = 'TIME-BOUND';
    } else if (data.growth_blocker?.includes('find/train')) {
      whatWeKnow.push('Growth blocker: Hiring/training challenges');
      riskSignals.push('You know you need people — finding the right ones is the bottleneck.');
    } else if (data.growth_blocker?.includes('systems to scale')) {
      whatWeKnow.push('Growth blocker: Missing systems');
      if (constraint === 'UNKNOWN') constraint = 'POLICY-BOUND';
    }

    // Doc state
    if (data.doc_state?.includes('Head') || data.doc_state?.includes('head')) {
      riskSignals.push('Your processes live in your head. This means you can\'t be replicated, even if you hire.');
      whatWeKnow.push('Documentation: Tribal knowledge only');
    } else if (data.doc_state?.includes('Notes')) {
      riskSignals.push('Documentation exists but isn\'t centralized — new hires learn by asking, not reading.');
      whatWeKnow.push('Documentation: Fragmented');
    }

    // Time theft
    if (data.time_theft) {
      const theft = Array.isArray(data.time_theft) ? data.time_theft : [data.time_theft];
      whatWeKnow.push(`Time drains: ${theft.join(', ')}`);
    }

    // Default for track A
    if (constraint === 'UNKNOWN') constraint = 'TIME-BOUND';
  }

  // TRACK B: Decision-Heavy
  if (track === 'B') {
    // Decision backlog
    if (data.decision_backlog?.includes('10+') || data.decision_backlog?.includes('Lost count')) {
      constraint = 'COGNITIVE-BOUND';
      riskSignals.push(`${data.decision_backlog} decisions waiting on you right now. Your team is idle while you context-switch.`);
      whatWeKnow.push(`Decision backlog: ${data.decision_backlog}`);
    } else if (data.decision_backlog?.includes('5-10')) {
      constraint = 'COGNITIVE-BOUND';
      riskSignals.push('A growing decision queue means work velocity depends on your availability.');
      whatWeKnow.push(`Decision backlog: ${data.decision_backlog}`);
    }

    // Approval frequency
    if (data.approval_frequency?.includes('Constantly')) {
      founderDependency = 'CRITICAL';
      founderDependencySignal = 'Work stops constantly waiting for your review.';
      riskSignals.push('You are the approval bottleneck. Everything queues behind you.');
    } else if (data.approval_frequency?.includes('Multiple times')) {
      founderDependency = 'HIGH';
      founderDependencySignal = 'Work pauses multiple times daily for your input.';
    } else if (data.approval_frequency?.includes('Once a day')) {
      founderDependency = 'MODERATE';
      founderDependencySignal = 'Daily check-in dependency — manageable but fragile.';
    }

    // Context switching
    if (data.context_switching?.includes('Non-stop') || data.context_switching?.includes('10+')) {
      riskSignals.push('High interruption frequency destroys deep work capacity. This is a cognitive tax you\'re paying every day.');
      whatWeKnow.push(`Interruptions: ${data.context_switching}`);
    }

    // Mental energy (powerful signal)
    if (data.mental_energy?.includes('Fried')) {
      riskSignals.push('You end every day fried. This isn\'t burnout from hard work — it\'s burnout from decision overload.');
    } else if (data.mental_energy?.includes('Drained')) {
      riskSignals.push('Daily mental drain suggests cognitive load exceeds sustainable capacity.');
    }

    // Where projects pile up
    if (data.project_pile_up?.includes('Waiting on me')) {
      whatWeKnow.push('Bottleneck location: You');
      if (founderDependency !== 'CRITICAL') founderDependency = 'HIGH';
    } else if (data.project_pile_up?.includes('Team confusion')) {
      whatWeKnow.push('Bottleneck: Team lacks clarity on standards');
      if (constraint === 'UNKNOWN') constraint = 'POLICY-BOUND';
    } else if (data.project_pile_up?.includes('Quality issues')) {
      whatWeKnow.push('Bottleneck: Quality control');
    }

    // Delegation blocker
    if (data.delegation_blocker?.includes('Quality trust')) {
      riskSignals.push('You don\'t delegate because you don\'t trust the output. The real question is: are standards undocumented, or is the team undertrained?');
    } else if (data.delegation_blocker?.includes('Faster myself')) {
      riskSignals.push('"It\'s faster if I do it" is the most expensive sentence in your business.');
    } else if (data.delegation_blocker?.includes('Client expects me')) {
      riskSignals.push('Client expectation of founder involvement limits what you can hand off.');
    }

    // Doc state
    if (data.doc_state?.includes('Head') || data.doc_state?.includes('head')) {
      riskSignals.push('No documented standards means every decision defaults back to you.');
    }

    if (constraint === 'UNKNOWN') constraint = 'COGNITIVE-BOUND';
  }

  // TRACK C: Founder-Led
  if (track === 'C') {
    // Revenue dependency
    if (data.revenue_dependency?.includes('Goes to zero')) {
      founderDependency = 'CRITICAL';
      founderDependencySignal = 'Revenue goes to zero without you. You are the business.';
      riskSignals.push('If you stop, the money stops. This is the textbook founder-led constraint.');
      constraint = 'TIME-BOUND';
    } else if (data.revenue_dependency?.includes('Drops significantly')) {
      founderDependency = 'HIGH';
      founderDependencySignal = 'Revenue drops significantly without your direct involvement.';
      constraint = 'TIME-BOUND';
    } else if (data.revenue_dependency?.includes('Dips slightly')) {
      founderDependency = 'MODERATE';
      founderDependencySignal = 'Some revenue independence exists — that\'s rare at this stage.';
    }

    // Client expectation
    if (data.client_expectation?.includes('Only me')) {
      riskSignals.push('Clients expect only you. Scaling means either changing that expectation or productizing your expertise.');
      whatWeKnow.push('Client expectation: Founder-only');
    } else if (data.client_expectation?.includes('Expect me on major')) {
      riskSignals.push('You\'re expected on key deliverables — partial delegation is possible but limited.');
      whatWeKnow.push('Client expectation: Major milestones');
    }

    // Identity attachment
    if (data.identity_attachment?.includes('I AM the work')) {
      riskSignals.push('Strong identity attachment to delivery. This isn\'t a flaw — but it defines your scaling ceiling.');
    } else if (data.identity_attachment?.includes('Practitioner')) {
      riskSignals.push('You still see yourself as the practitioner. The shift to owner hasn\'t happened yet.');
    }

    // Team capability
    if (data.team_capability?.includes('No')) {
      whatWeKnow.push('Team capability gap: Cannot replicate your work');
      riskSignals.push('Your team can\'t do what you do. Until that changes, you are the capacity ceiling.');
    } else if (data.team_capability?.includes('Maybe years')) {
      whatWeKnow.push('Team capability gap: Years from readiness');
    } else if (data.team_capability?.includes('Yes with training')) {
      whatWeKnow.push('Team capability: Ready with investment');
      riskSignals.push('Your team could do this with training — that\'s actually a strong position.');
    }

    // Delegation fear
    if (data.delegation_fear?.includes('They don\'t need me') || data.delegation_fear?.includes("don't need me")) {
      riskSignals.push('Fear of becoming irrelevant is holding the business back from growing past you.');
    }

    if (constraint === 'UNKNOWN') constraint = 'TIME-BOUND';
  }

  // --- CONSTRAINT LABELS ---
  const constraintLabels: Record<ConstraintType, string> = {
    'COGNITIVE-BOUND': 'Cognitive Overload',
    'POLICY-BOUND': 'Missing Structure',
    'TIME-BOUND': 'Capacity Ceiling',
    'UNKNOWN': 'Unidentified',
  };

  const constraintDescriptions: Record<ConstraintType, string> = {
    'COGNITIVE-BOUND': 'Your decision-making capacity is the bottleneck. Work piles up waiting for your judgment because standards aren\'t externalized.',
    'POLICY-BOUND': 'The business lacks documented standards and processes. Work loops back, stalls, or gets redone because "the way we do things" isn\'t written down.',
    'TIME-BOUND': 'You\'ve hit a hard ceiling on hours. The business can\'t grow without either changing your role or adding capacity.',
    'UNKNOWN': 'We need more data to identify your primary constraint precisely.',
  };

  // --- SUCCESS TRAP NARRATIVE ---
  const successTraps: Record<string, string> = {
    'A': `You built ${businessName} by being excellent at what you do. Clients trust you specifically. That trust got you here — but now it means the business can't run without you in the room. The thing that made you successful is the same thing keeping you stuck.`,
    'B': `${businessName} grew because you cared about quality more than anyone else. Over time, your team learned: "When in doubt, ask the founder." That instinct to protect quality created an invisible bottleneck — everything routes through you, whether it needs to or not.`,
    'C': `You ARE ${businessName}. Your expertise, your reputation, your relationships. That's not a problem — it's a structural reality. The question isn't whether to change that, it's whether the business can support you at the scale you want without burning you out.`,
  };

  // --- WHAT WE NEED TO FIND (locked sections) ---
  whatWeNeedToFind.push(
    'Exactly where in your workflow the bottleneck occurs',
    'Which decisions can be safely delegated (and the criteria for each)',
    'What needs to be documented first vs. what can wait',
    'A phased roadmap specific to your constraint type',
    'Whether you need systems, people, or both — and in what order',
  );

  // Add common signals
  if (data.hourly_rate) {
    whatWeKnow.push(`Hourly rate: ${data.hourly_rate}`);
  }
  if (data.team_size) {
    whatWeKnow.push(`Team: ${data.team_size}`);
  }

  // --- SUSTAINABILITY HORIZON ---
  // Based on stress signals from intake answers (no fake numbers)
  const sustainabilityHorizon = calculateSustainabilityHorizon(data, track, founderDependency);

  // --- LIFECYCLE HEATMAP ---
  // Maps their answers to 7 business stages
  const lifecycle = calculateLifecycleHeatmap(data, track, founderDependency, constraint);

  return {
    businessName,
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    track,
    trackLabel: track === 'A' ? 'Time-Bound' : track === 'B' ? 'Decision-Heavy' : 'Founder-Led',
    primaryConstraint: constraint,
    constraintLabel: constraintLabels[constraint],
    constraintDescription: constraintDescriptions[constraint],
    founderDependency,
    founderDependencySignal,
    riskSignals,
    successTrap: successTraps[track],
    whatWeKnow,
    whatWeNeedToFind,
    sustainabilityHorizon,
    lifecycle,
  };
}

// ------------------------------------------------------------------
// SUSTAINABILITY HORIZON
// Qualitative stress trajectory based on real intake signals.
// No fake dollar amounts — just honest pattern matching.
// ------------------------------------------------------------------
function calculateSustainabilityHorizon(
  data: IntakeResponse,
  track: 'A' | 'B' | 'C',
  founderDependency: PreviewResult['founderDependency']
): SustainabilityHorizon {
  let pressure = 0; // 0-100 scale
  const factors: string[] = [];

  // Founder dependency is the heaviest weight
  if (founderDependency === 'CRITICAL') { pressure += 35; factors.push('Business stops without you'); }
  else if (founderDependency === 'HIGH') { pressure += 25; factors.push('Heavy reliance on your involvement'); }
  else if (founderDependency === 'MODERATE') { pressure += 12; }

  // Track-specific signals
  if (track === 'A') {
    if (data.capacity_utilization?.includes('Overbooked')) { pressure += 20; factors.push('Overbooked schedule'); }
    else if (data.capacity_utilization?.includes('Completely full')) { pressure += 15; factors.push('No room in the schedule'); }
    if (data.absence_impact?.includes('Everything stops')) { pressure += 15; }
    if (data.growth_blocker?.includes('hours in the day')) { pressure += 10; factors.push('Growth blocked by your hours'); }
  }

  if (track === 'B') {
    if (data.mental_energy?.includes('Fried')) { pressure += 25; factors.push('Daily cognitive burnout'); }
    else if (data.mental_energy?.includes('Drained')) { pressure += 15; factors.push('Consistent mental drain'); }
    if (data.context_switching?.includes('Non-stop') || data.context_switching?.includes('10+')) { pressure += 15; factors.push('Constant interruptions'); }
    if (data.approval_frequency?.includes('Constantly')) { pressure += 10; }
    if (data.decision_backlog?.includes('Lost count') || data.decision_backlog?.includes('10+')) { pressure += 10; factors.push('Overwhelming decision backlog'); }
  }

  if (track === 'C') {
    if (data.revenue_dependency?.includes('Goes to zero')) { pressure += 20; }
    if (data.identity_attachment?.includes('I AM the work')) { pressure += 15; factors.push('Deep identity attachment to delivery'); }
    else if (data.identity_attachment?.includes('Practitioner')) { pressure += 10; }
    if (data.team_capability?.includes('No')) { pressure += 15; factors.push('Team can\'t replicate your work'); }
    if (data.delegation_fear?.includes("don't need me") || data.delegation_fear?.includes("They don't need me")) { pressure += 10; }
  }

  // Universal: documentation state
  if (data.doc_state?.includes('Head') || data.doc_state?.includes('head')) { pressure += 10; factors.push('No documented processes'); }
  else if (data.doc_state?.includes('Notes')) { pressure += 5; }

  // Clamp to 100
  pressure = Math.min(pressure, 100);

  // Map to qualitative horizon
  if (pressure >= 70) {
    return {
      label: 'Short',
      description: 'Multiple structural pressures are compounding. This operating model has a limited runway before something gives — your health, your team, or your growth.',
      pressureLevel: 'critical',
      factors,
    };
  } else if (pressure >= 50) {
    return {
      label: 'Narrowing',
      description: 'You\'re sustaining, but the cracks are showing. The current structure works until it doesn\'t — and the tipping point is closer than it feels.',
      pressureLevel: 'high',
      factors,
    };
  } else if (pressure >= 30) {
    return {
      label: 'Moderate',
      description: 'There\'s room to breathe, but friction points exist. Addressing them now prevents them from compounding.',
      pressureLevel: 'moderate',
      factors,
    };
  } else {
    return {
      label: 'Stable',
      description: 'Your operational structure has healthy foundations. There are areas to optimize, but no immediate structural risk.',
      pressureLevel: 'low',
      factors,
    };
  }
}

// ------------------------------------------------------------------
// LIFECYCLE HEATMAP
// Maps intake answers to 7 business stages: green/yellow/red.
// Honest assessment — "unknown" if we don't have data for a stage.
// ------------------------------------------------------------------
function calculateLifecycleHeatmap(
  data: IntakeResponse,
  track: 'A' | 'B' | 'C',
  founderDependency: PreviewResult['founderDependency'],
  constraint: ConstraintType
): LifecycleStage[] {
  const stages: LifecycleStage[] = [];

  // 1. SALES / LEAD GENERATION
  // We don't ask about sales directly — mark unknown unless we can infer
  if (data.capacity_utilization?.includes('Struggling')) {
    stages.push({ id: 'sales', label: 'Sales & Leads', status: 'stressed', signal: 'Demand gap' });
  } else if (data.capacity_utilization?.includes('Overbooked') || data.capacity_utilization?.includes('Completely full')) {
    stages.push({ id: 'sales', label: 'Sales & Leads', status: 'healthy', signal: 'Strong demand' });
  } else {
    stages.push({ id: 'sales', label: 'Sales & Leads', status: 'unknown', signal: 'Needs deeper analysis' });
  }

  // 2. CLIENT ONBOARDING
  // Infer from doc state + time theft
  const hasOnboardingFriction = data.time_theft
    ? (Array.isArray(data.time_theft) ? data.time_theft : [data.time_theft]).some(
        (t: string) => t.includes('repetitive') || t.includes('Answering')
      )
    : false;
  if (hasOnboardingFriction) {
    stages.push({ id: 'onboarding', label: 'Client Onboarding', status: 'stressed', signal: 'Repetitive questions suggest unclear handoff' });
  } else if (data.doc_state?.includes('Head') || data.doc_state?.includes('head')) {
    stages.push({ id: 'onboarding', label: 'Client Onboarding', status: 'stressed', signal: 'Onboarding lives in your head' });
  } else {
    stages.push({ id: 'onboarding', label: 'Client Onboarding', status: 'unknown', signal: 'Needs deeper analysis' });
  }

  // 3. SERVICE DELIVERY
  if (founderDependency === 'CRITICAL' || (data.absence_impact?.includes('Everything stops'))) {
    stages.push({ id: 'delivery', label: 'Service Delivery', status: 'critical', signal: 'Founder-dependent delivery' });
  } else if (founderDependency === 'HIGH' || data.absence_impact?.includes('Revenue drops')) {
    stages.push({ id: 'delivery', label: 'Service Delivery', status: 'stressed', signal: 'Delivery relies heavily on you' });
  } else if (data.team_capability?.includes('Yes') && !data.team_capability?.includes('training')) {
    stages.push({ id: 'delivery', label: 'Service Delivery', status: 'healthy', signal: 'Team can deliver independently' });
  } else {
    stages.push({ id: 'delivery', label: 'Service Delivery', status: 'stressed', signal: 'Partial dependency' });
  }

  // 4. REVIEW & APPROVALS
  if (track === 'B') {
    if (data.approval_frequency?.includes('Constantly') || data.project_pile_up?.includes('Waiting on me')) {
      stages.push({ id: 'review', label: 'Review & Approvals', status: 'critical', signal: 'You are the approval bottleneck' });
    } else if (data.approval_frequency?.includes('Multiple times')) {
      stages.push({ id: 'review', label: 'Review & Approvals', status: 'stressed', signal: 'Frequent approval gates' });
    } else {
      stages.push({ id: 'review', label: 'Review & Approvals', status: 'healthy', signal: 'Manageable review cadence' });
    }
  } else if (data.delegation_blocker?.includes('Quality trust') || data.delegation_blocker?.includes('Faster myself')) {
    stages.push({ id: 'review', label: 'Review & Approvals', status: 'stressed', signal: 'Quality control defaults to you' });
  } else {
    stages.push({ id: 'review', label: 'Review & Approvals', status: 'unknown', signal: 'Needs deeper analysis' });
  }

  // 5. GROWTH / SCALING
  if (data.growth_blocker?.includes('hours in the day') || data.growth_blocker?.includes('capacity')) {
    stages.push({ id: 'growth', label: 'Growth & Scaling', status: 'critical', signal: 'Hard ceiling on capacity' });
  } else if (data.growth_blocker?.includes('systems') || data.growth_blocker?.includes('find/train')) {
    stages.push({ id: 'growth', label: 'Growth & Scaling', status: 'stressed', signal: 'Structural barriers to growth' });
  } else if (data.growth_blocker?.includes('Not enough demand')) {
    stages.push({ id: 'growth', label: 'Growth & Scaling', status: 'stressed', signal: 'Demand-side constraint' });
  } else {
    stages.push({ id: 'growth', label: 'Growth & Scaling', status: 'unknown', signal: 'Needs deeper analysis' });
  }

  // 6. DOCUMENTATION & SYSTEMS
  if (data.doc_state?.includes('Centralized')) {
    stages.push({ id: 'systems', label: 'Documentation & Systems', status: 'healthy', signal: 'Centralized documentation' });
  } else if (data.doc_state?.includes('Handbook') || data.doc_state?.includes('handbook')) {
    stages.push({ id: 'systems', label: 'Documentation & Systems', status: 'moderate' as any, signal: 'Basic documentation exists' });
    // fix: moderate isn't a valid status, use 'stressed' as yellow
    stages[stages.length - 1].status = 'stressed';
  } else if (data.doc_state?.includes('Notes')) {
    stages.push({ id: 'systems', label: 'Documentation & Systems', status: 'stressed', signal: 'Fragmented notes' });
  } else if (data.doc_state?.includes('Head') || data.doc_state?.includes('head')) {
    stages.push({ id: 'systems', label: 'Documentation & Systems', status: 'critical', signal: 'All tribal knowledge' });
  } else {
    stages.push({ id: 'systems', label: 'Documentation & Systems', status: 'unknown', signal: 'Needs deeper analysis' });
  }

  // 7. TRANSFERABILITY / EXIT READINESS
  if (founderDependency === 'CRITICAL') {
    stages.push({ id: 'transferability', label: 'Transferability', status: 'critical', signal: 'Business has no value without you' });
  } else if (founderDependency === 'HIGH') {
    stages.push({ id: 'transferability', label: 'Transferability', status: 'stressed', signal: 'Significant key-person risk' });
  } else if (founderDependency === 'MODERATE') {
    stages.push({ id: 'transferability', label: 'Transferability', status: 'stressed', signal: 'Some transferability, room to improve' });
  } else {
    stages.push({ id: 'transferability', label: 'Transferability', status: 'healthy', signal: 'Structurally independent' });
  }

  return stages;
}
