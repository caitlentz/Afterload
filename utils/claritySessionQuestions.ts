export type ClarityQuestion = {
  id: string;
  module: string;
  text: string;
  type: 'dollar' | 'single' | 'multi' | 'text' | 'form';
  tracks: Array<'UNIVERSAL' | 'A' | 'B' | 'C'>;
  options?: string[];
  dependsOn?: {
    questionId: string;
    requiredValue: any[];
  };
  placeholder?: string;
  helperText?: string;
  maxSelect?: number;
  selectAll?: boolean;
};

export const CLARITY_SESSION_QUESTIONS: ClarityQuestion[] = [
  // ==========================================
  // SECTION 1: UNIVERSAL QUESTIONS
  // ==========================================

  // MODULE: DECISION LOAD
  {
    id: 'financial_authority_threshold',
    module: 'Decision Load',
    text: 'What is the maximum dollar amount your senior-most team member can authorize without your direct sign-off?',
    type: 'dollar',
    tracks: ['UNIVERSAL'],
    placeholder: '$'
  },

  // MODULE: CONTEXT SWITCHING
  {
    id: 'deep_work_audit',
    module: 'Context Switching',
    text: 'What is the longest single block of uninterrupted time you achieved last week?',
    type: 'single',
    tracks: ['UNIVERSAL'],
    options: ['4+ hours', '2-3.9 hours', '1-1.9 hours', 'Less than 1 hour']
  },
  {
    id: 'recovery_tax',
    module: 'Context Switching',
    text: 'When interrupted, how difficult is it to return to the original level of focus?',
    type: 'single',
    tracks: ['UNIVERSAL'],
    options: [
      'Instant snap-back - no problem refocusing',
      'Takes a few minutes but I get back on track',
      'Significant effort required to rebuild focus',
      'Task is abandoned or significantly delayed'
    ]
  },

  // MODULE: SUSTAINABILITY HORIZON
  {
    id: 'runway_stress_test',
    module: 'Sustainability Horizon',
    text: 'If revenue stopped tomorrow, how many weeks could the business operate on current cash reserves?',
    type: 'single',
    tracks: ['UNIVERSAL'],
    options: [
      'A. Less than 4 weeks (Immediate Crisis)',
      'B. 1-3 months (Cash Flow Pressure)',
      'C. 3-6 months (Stable)',
      'D. 6+ months (Secure)'
    ]
  },
  {
    id: 'energy_runway',
    module: 'Sustainability Horizon',
    text: 'At your current pace of work (hours + intensity), how long can you physically sustain this output before a health or burnout event occurs?',
    type: 'single',
    tracks: ['UNIVERSAL'],
    dependsOn: {
      questionId: 'runway_stress_test',
      requiredValue: ['C. 3-6 months (Stable)', 'D. 6+ months (Secure)']
    },
    options: [
      'A. I am already burning out',
      'B. 6-12 weeks',
      'C. 6 months',
      'D. Indefinitely (Sustainable)'
    ]
  },

  // MODULE: FINANCIAL HEALTH
  {
    id: 'revenue_range',
    module: 'Financial Health',
    text: "What's your approximate annual revenue?",
    helperText: "A rough range is fine — this helps us understand scale, not judge.",
    type: 'single',
    tracks: ['UNIVERSAL'],
    options: ['Under $100k', '$100k - $250k', '$250k - $500k', '$500k - $1M', 'Over $1M']
  },
  {
    id: 'profitability_gut_check',
    module: 'Financial Health',
    text: 'After all expenses (payroll, rent, supplies, software, etc.), would you say the business is:',
    type: 'single',
    tracks: ['UNIVERSAL'],
    options: [
      'Comfortably profitable — healthy margins',
      'Breaking even or slightly profitable',
      'Profitable on paper, but cash is always tight',
      'Losing money or barely surviving'
    ]
  },
  {
    id: 'pricing_confidence',
    module: 'Financial Health',
    text: 'How confident are you that your pricing covers all your costs and pays you fairly?',
    helperText: "Think about overhead, supplies, payroll, rent — not just what's left in the bank.",
    type: 'single',
    tracks: ['UNIVERSAL'],
    options: [
      "Very confident — I've done the math and I know my margins",
      "Somewhat confident — I think it's right but haven't checked recently",
      'Not sure — I set prices based on what competitors charge',
      "Not confident — I suspect I'm undercharging but I'm afraid to raise prices"
    ]
  },
  {
    id: 'pricing_last_raised',
    module: 'Financial Health',
    text: 'When did you last raise your prices?',
    type: 'single',
    tracks: ['UNIVERSAL'],
    options: [
      'Within the last 6 months',
      '6-12 months ago',
      '1-2 years ago',
      'Over 2 years ago (or never)'
    ]
  },
  {
    id: 'expense_awareness',
    module: 'Financial Health',
    text: 'How well do you know your monthly operating expenses?',
    type: 'single',
    tracks: ['UNIVERSAL'],
    options: [
      'I track them closely and know the number',
      'I have a rough idea',
      'I know the big ones but not the total',
      "Honestly, I'm not sure"
    ]
  },
  {
    id: 'average_service_rate',
    module: 'Financial Health',
    text: "What's the average rate your business charges per hour or per service?",
    helperText: "A rough average is fine — this helps us estimate operational costs.",
    type: 'single',
    tracks: ['UNIVERSAL'],
    options: ['Under $50/hr', '$50 - $100/hr', '$100 - $150/hr', '$150 - $250/hr', '$250+/hr']
  },
  {
    id: 'low_value_hours_audit',
    module: 'Financial Health',
    text: 'Review your last week. How many hours were spent on tasks that could be done by an administrative assistant (e.g., scheduling, invoicing, formatting documents)?',
    type: 'single',
    tracks: ['UNIVERSAL'],
    options: ['0', '1-5 hours', '6-10 hours', '10+ hours']
  },
  {
    id: 'revenue_leakage_estimator',
    module: 'Financial Health',
    text: 'Do you believe you lost revenue this year specifically due to operational delays (e.g., slow proposal turnaround, missed renewals, client churn from service delays)?',
    type: 'single',
    tracks: ['UNIVERSAL'],
    options: ['Yes', 'No']
  },

  // MODULE: PROCESS HEATMAP
  {
    id: 'lead_gen_intake',
    module: 'Process Heatmap',
    text: 'Are leads automatically captured in a CRM, or do they live in your inbox/DMs?',
    type: 'single',
    tracks: ['UNIVERSAL'],
    options: ['Automatically captured in CRM', 'Manual entry required', 'They live in inbox/DMs']
  },
  {
    id: 'onboarding_integration',
    module: 'Process Heatmap',
    text: 'Once a client books/commits, how is the onboarding handled?',
    type: 'single',
    tracks: ['UNIVERSAL'],
    options: [
      'Fully automated or handled by team',
      'Partially automated, but I handle some steps personally',
      'I personally manage all onboarding communication'
    ]
  },
  {
    id: 'review_quality_control',
    module: 'Process Heatmap',
    text: 'Does every completed service/deliverable require your review before the client receives it?',
    type: 'single',
    tracks: ['UNIVERSAL'],
    options: [
      'No - team handles quality control independently',
      'Only for specific situations (new clients, high-value, complex cases)',
      'Yes - I review everything before it goes to the client'
    ]
  },
  {
    id: 'delivery_close_out',
    module: 'Process Heatmap',
    text: 'Is the project close-out (final invoice, testimonial request, client offboarding) automated?',
    type: 'single',
    tracks: ['UNIVERSAL'],
    options: ['Yes - fully automated', 'Partially automated', 'No - manual process']
  },

  // MODULE: SYSTEM HEALTH
  {
    id: 'tool_zombie_check',
    module: 'System Health',
    text: 'Are there software tools you pay for but haven\'t logged into in the last 30 days?',
    type: 'single',
    tracks: ['UNIVERSAL'],
    options: ['Yes', 'No']
  },
  {
    id: 'tool_zombie_count',
    module: 'System Health',
    text: 'How many tools?',
    type: 'dollar',
    tracks: ['UNIVERSAL'],
    placeholder: 'Count',
    dependsOn: {
      questionId: 'tool_zombie_check',
      requiredValue: ['Yes']
    }
  },
  {
    id: 'tool_count',
    module: 'System Health',
    text: 'How many different software tools does your team use regularly (project management, CRM, communication, etc.)?',
    type: 'dollar',
    tracks: ['UNIVERSAL'],
    placeholder: 'Number of tools'
  },
  {
    id: 'search_friction',
    module: 'System Health',
    text: 'How much time per week is spent (by you or your team) searching for files, information, or "where we keep X"?',
    type: 'single',
    tracks: ['UNIVERSAL'],
    options: ['0-2 hours', '3-5 hours', '6+ hours'],
    placeholder: 'Hours per week'
  },

  // MODULE: WORKLOAD ANALYSIS
  {
    id: 'bus_factor_30_day',
    module: 'Workload Analysis',
    text: 'Scenario: You are hospitalized for 30 days with no phone/internet access. What happens to the business?',
    type: 'single',
    tracks: ['UNIVERSAL'],
    options: [
      'A. It grows/continues normally',
      'B. It maintains/survives but stalls',
      'C. It collapses/revenue stops'
    ]
  },
  {
    id: 'collapse_diagnosis',
    module: 'Workload Analysis',
    text: 'What specifically would collapse first?',
    type: 'multi',
    selectAll: true,
    tracks: ['UNIVERSAL'],
    dependsOn: {
      questionId: 'bus_factor_30_day',
      requiredValue: ['C. It collapses/revenue stops']
    },
    options: [
      'Sales would stop (no one else can close deals)',
      'Delivery would halt (team wouldn\'t know what to do)',
      'Client relationships would deteriorate (they expect me specifically)',
      'Financial management would fail (only I handle money)'
    ]
  },
  {
    id: 'trust_system_drill_down',
    module: 'Workload Analysis',
    text: 'When something goes wrong in the business, is your instinct to:',
    type: 'single',
    tracks: ['UNIVERSAL'],
    options: [
      'A. Create a system/process to prevent it',
      'B. Handle it yourself going forward'
    ]
  },

  // MODULE: DIAGNOSIS & ROADMAP
  {
    id: 'superpower_audit',
    module: 'Diagnosis & Roadmap',
    text: 'What are the two skills that got you to your first $1M (e.g., "Charismatic Sales," "Technical Genius," "Quality Obsession")?',
    type: 'form',
    tracks: ['UNIVERSAL']
  },
  {
    id: 'interruption_source_id',
    module: 'Diagnosis & Roadmap',
    text: 'What is the single most frequent interruption you face?',
    type: 'single',
    tracks: ['UNIVERSAL'],
    options: [
      'A. "Quick questions" from team (Slack/in-person)',
      'B. Client emails requiring immediate response',
      'C. Emergency firefighting (systems breaking)',
      'D. Administrative tasks (scheduling, invoicing reminders)'
    ]
  },
  {
    id: 'strategic_work_id',
    module: 'Diagnosis & Roadmap',
    text: 'What is the ONE strategic activity you are not doing because you\'re "too busy"?',
    type: 'text',
    tracks: ['UNIVERSAL'],
    placeholder: 'e.g., Build a sales pipeline, Document SOPs...'
  },

  // ==========================================
  // SECTION 2: TRACK-SPECIFIC QUESTIONS
  // ==========================================

  // TRACK A: TIME-BOUND SERVICES (Logistics, Trades, Standardized)
  {
    id: 'gatekeeper_protocol',
    module: 'Decision Load',
    text: 'When a non-standard client request arrives, what is the default team protocol?',
    type: 'single',
    tracks: ['A', 'B'], // Also used in B per PDF
    options: [
      'A. Team references the SOP/Policy and decides',
      'B. Team prepares options but waits for your approval',
      'C. Team pauses work until you can review'
    ]
  },
  {
    id: 'handoff_dependency',
    module: 'Flow Friction',
    text: 'Does the handoff between Sales and Delivery require you to personally communicate the client\'s needs to the team?',
    type: 'single',
    tracks: ['A', 'B'], // Also used in B per PDF
    options: [
      'Yes - I always have to translate what the client wants',
      'Sometimes - for complex or non-standard requests',
      'No - intake documentation handles it'
    ]
  },
  {
    id: 'qualification_triage',
    module: 'Process Heatmap',
    text: 'How are potential clients qualified or screened before booking/starting work?',
    type: 'single',
    tracks: ['A', 'B'], // Also used in B per PDF
    options: [
      'Team uses documented criteria and handles it autonomously',
      'Team does initial screening, but I make final call on edge cases',
      'I personally screen/qualify every potential client',
      'No formal screening - we accept all clients who can pay'
    ]
  },
  {
    id: 'fulfillment_production',
    module: 'Process Heatmap',
    text: 'Can the team complete the core service deliverable without asking you clarifying questions?',
    type: 'single',
    tracks: ['A', 'C'], // Used in C per PDF
    options: [
      'Always - team is fully autonomous',
      'Mostly - experienced team members work independently',
      'Sometimes - occasional clarification needed',
      'Never - constant questions required regardless of experience level'
    ]
  },
  {
    id: 'team_idle_time_cost',
    module: 'Workload Analysis',
    text: 'On average, how many hours per week does a single team member wait for your approval to proceed with their work?',
    type: 'dollar',
    tracks: ['A', 'C'], // Used in C per PDF
    placeholder: 'Hours per week'
  },

  // TRACK B: DECISION-HEAVY SERVICES (Creative, Expert, Technical)
  {
    id: 'micro_decision_audit',
    module: 'Decision Load',
    text: 'In the last 48 hours, did you personally approve any expense, client email, or task clarification valued at less than $100?',
    type: 'single',
    tracks: ['B', 'C'], // Also used in C per PDF
    options: ['Yes', 'No']
  },
  {
    id: 'micro_decision_frequency',
    module: 'Decision Load',
    text: 'Estimate the number of these "micro-decisions" you field in a typical day:',
    type: 'single',
    tracks: ['B', 'C'],
    dependsOn: {
      questionId: 'micro_decision_audit',
      requiredValue: ['Yes']
    },
    options: ['A. 0-5 decisions', 'B. 6-15 decisions', 'C. 16+ decisions']
  },
  {
    id: 'wait_time_analysis',
    module: 'Flow Friction',
    text: 'Once a project phase is marked "complete" by your team, how long does it typically sit in the queue before the next action is taken?',
    type: 'single',
    tracks: ['B', 'C'],
    options: [
      'A. Less than 4 hours (Immediate flow)',
      'B. 24-48 hours (Standard batching)',
      'C. 3-5 days (Significant lag)',
      'D. It waits until I "clear the deck" (Variable/Infinite lag)'
    ]
  },
  {
    id: 'rework_loop',
    module: 'Flow Friction',
    text: 'What percentage of work submitted to you is returned to the team for revision due to errors or misalignment?',
    type: 'single',
    tracks: ['B', 'C'],
    options: [
      'A. Less than 10% (Rare)',
      'B. 10-30% (Occasional)',
      'C. More than 50% (Frequent)'
    ]
  },
  {
    id: 'sales_commitment',
    module: 'Process Heatmap',
    text: 'Do you personally write/approve every proposal sent to a client?',
    type: 'single',
    tracks: ['B', 'C'],
    options: [
      'No - team uses templates independently',
      'I approve but don\'t write',
      'Yes - I write/approve everything'
    ]
  },

  // TRACK C: FOUNDER-LED SERVICES (Coaching, Consulting)
  // Track C uses a combination of Q's from A and B as defined in PDF (Additional 4 Questions)
  // Logic handled in tracks array above:
  // Q-DL1: Micro-Decision Audit (from B)
  // Q-FF1: Wait Time Analysis (from B)
  // Q-FF2: Rework Loop (from B)
  // Q-PH3: Sales (from B)
];
