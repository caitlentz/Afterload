import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import {
  ArrowRight,
  LogOut,
  Activity,
  FileText,
  CheckCircle,
  ChevronRight,
  Zap,
  Shield,
  Settings,
  Pencil,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  X,
  Check,
  Sparkles,
} from 'lucide-react';
import type { IntakeResponse, DiagnosticResult } from '../utils/diagnosticEngine';
import type { PaymentStatus } from '../utils/database';

const Intake = lazy(() => import('./Intake'));

interface DashboardProps {
  userEmail: string;
  intakeData: IntakeResponse | null;
  diagnosticResult: DiagnosticResult | null;
  paymentStatus: PaymentStatus;
  onViewReport: () => void;
  onViewFullReport: () => void;
  onDiagnosticComplete: (answers: IntakeResponse, password?: string) => void;
  onResumeIntake: () => void;
  onStartPayment: () => void;
  onEditAnswers: () => void;
  onResetDiagnostic: () => void;
  onUpdateIntake: (updates: Partial<IntakeResponse>) => void;
  onLogout: () => void;
}

// Human-readable labels for intake question IDs
const ANSWER_LABELS: Record<string, string> = {
  business_type: 'Business Model',
  team_size: 'Team Size',
  capacity_utilization: 'Schedule Capacity',
  absence_impact: 'Absence Impact',
  hourly_rate: 'Hourly Rate',
  growth_blocker: 'Growth Blocker',
  doc_state: 'Documentation',
  doc_usage: 'Doc Usage',
  current_revenue_estimate: 'Revenue',
  revenue: 'Revenue',
  time_theft: 'Time Drains',
  biggest_frustration: 'Biggest Frustration',
  decision_backlog: 'Decision Backlog',
  approval_frequency: 'Approval Frequency',
  context_switching: 'Context Switching',
  mental_energy: 'Mental Energy',
  delegation_blocker: 'Delegation Blocker',
  project_pile_up: 'Project Bottleneck',
  revenue_dependency: 'Revenue Dependency',
  client_expectation: 'Client Expectations',
  delegation_fear: 'Delegation Fear',
  identity_attachment: 'Identity Attachment',
  team_capability: 'Team Capability',
  years_in_business: 'Years in Business',
  founder_operational_role: 'Founder Role',
  founder_responsibilities: 'Founder Handles',
  has_delegation_support: 'Delegation Support',
  pricing_confidence: 'Pricing Confidence',
  pricing_last_raised: 'Last Price Increase',
  revenue_range: 'Revenue Range',
  profitability_gut_check: 'Profitability',
  expense_awareness: 'Expense Awareness',
  average_service_rate: 'Service Rate',
  business_model: 'Business Model',
  revenue_generation: 'Revenue Generation',
  two_week_absence: 'Two-Week Absence Impact',
  final_decisions: 'Decision Authority',
  project_stall: 'Project Stall Point',
  growth_limiter: 'Growth Limiter',
  process_documentation: 'Process Documentation',
  roles_handled: 'Roles Handled',
  client_relationship: 'Client Relationships',
  key_member_leaves: 'Key Member Impact',
  pricing_decisions: 'Pricing Authority',
  interruption_frequency: 'Interruption Frequency',
  hiring_situation: 'Hiring Situation',
  free_capacity: 'Capacity Lever',
  current_state: 'Current State',
};

// Keys to skip showing (they're displayed elsewhere or are meta)
const SKIP_KEYS = ['firstName', 'email', 'businessName', 'website', 'specificType', 'businessType', 'contact'];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getContextMessage(stage: string, firstName: string): string {
  switch (stage) {
    case 'fresh':
      return "You're in the right place. Let's figure out what's actually going on.";
    case 'preview_ready':
      return "We found some things. Take a look when you're ready — then continue to the clarity session.";
    case 'deep_complete':
      return "All questions answered. Complete your payment to start the report.";
    case 'paid':
      return "Everything is locked in. Your report will appear here when it's ready.";
    default:
      return "Here's where things stand.";
  }
}

export default function Dashboard({
  userEmail,
  intakeData,
  diagnosticResult,
  paymentStatus,
  onViewReport,
  onViewFullReport,
  onDiagnosticComplete,
  onResumeIntake,
  onStartPayment,
  onEditAnswers,
  onResetDiagnostic,
  onUpdateIntake,
  onLogout,
}: DashboardProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [reportReleased, setReportReleased] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const hasReport = !!diagnosticResult;
  // Detect deep dive by checking for question IDs unique to the deep dive,
  // NOT by key count (initial intake alone can have 16+ keys).
  const DEEP_DIVE_IDS = ['financial_authority_threshold', 'deep_work_audit', 'runway_stress_test', 'low_value_hours_audit'];
  const hasDeepIntake = intakeData && (
    !!(intakeData as any)._deepDiveComplete ||
    DEEP_DIVE_IDS.some(id => id in intakeData)
  );
  const businessName = intakeData?.businessName || null;
  const firstName = intakeData?.firstName || userEmail.split('@')[0];
  const hasInitialIntake = intakeData && Object.keys(intakeData).length > 3;

  // Determine journey stage
  type Stage = 'fresh' | 'preview_ready' | 'deep_complete' | 'paid';
  let stage: Stage = 'fresh';
  if (paymentStatus.paid) stage = 'paid';
  else if (hasDeepIntake) stage = 'deep_complete';
  else if (hasInitialIntake) stage = 'preview_ready';

  const stages = [
    { id: 'fresh', label: 'Initial Intake', icon: FileText },
    { id: 'preview_ready', label: 'Preview & Clarity Session', icon: Activity },
    { id: 'deep_complete', label: 'Payment', icon: Shield },
    { id: 'paid', label: 'Report', icon: Zap },
  ];

  // Map current stage to the visual progress tracker index
  const stageToIndex: Record<Stage, number> = {
    fresh: 0,
    preview_ready: 1,
    deep_complete: 2,
    paid: 3,
  };
  const currentStageIndex = stageToIndex[stage];

  // Name editing handlers
  const startEditingName = () => {
    setEditName(firstName);
    setIsEditingName(true);
  };

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const saveName = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== firstName) {
      onUpdateIntake({ firstName: trimmed });
    }
    setIsEditingName(false);
  };

  const cancelEditName = () => {
    setIsEditingName(false);
    setEditName('');
  };

  // Check if admin has released the full report for this client
  useEffect(() => {
    if (stage === 'paid') {
      import('../utils/database').then(({ checkReportReleased }) =>
        checkReportReleased(userEmail).then(setReportReleased)
      );
    }
  }, [stage, userEmail]);

  const greeting = getGreeting();
  const contextMessage = getContextMessage(stage, firstName);

  return (
    <div className="min-h-screen w-full relative z-20 pt-28 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Greeting + Settings */}
        <div
          className="mb-12 animate-[fadeInUp_0.6s_ease-out_both]"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Editable name */}
              <div className="flex items-center gap-3 mb-1">
                {isEditingName ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveName();
                        if (e.key === 'Escape') cancelEditName();
                      }}
                      className="font-serif text-4xl md:text-5xl text-brand-dark bg-transparent border-b-2 border-brand-mid/40 focus:border-brand-mid outline-none py-0 px-0 w-full max-w-xs"
                      placeholder="Your name"
                    />
                    <button
                      onClick={saveName}
                      className="w-8 h-8 rounded-full bg-brand-dark/10 hover:bg-brand-dark/20 flex items-center justify-center transition-colors"
                    >
                      <Check size={14} className="text-brand-dark/60" />
                    </button>
                    <button
                      onClick={cancelEditName}
                      className="w-8 h-8 rounded-full hover:bg-brand-dark/10 flex items-center justify-center transition-colors"
                    >
                      <X size={14} className="text-brand-dark/30" />
                    </button>
                  </div>
                ) : (
                  <h1 className="font-serif text-4xl md:text-5xl text-brand-dark group flex items-center gap-3">
                    <span>{greeting}, {firstName}.</span>
                    <button
                      onClick={startEditingName}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-full hover:bg-brand-dark/5 flex items-center justify-center"
                      title="Edit your name"
                    >
                      <Pencil size={12} className="text-brand-dark/30" />
                    </button>
                  </h1>
                )}
              </div>

              {/* Context message */}
              <p className="text-brand-dark/50 text-sm font-lora mt-2">
                {contextMessage}
              </p>
            </div>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`mt-2 w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ml-4 ${
                showSettings
                  ? 'bg-brand-dark text-white'
                  : 'bg-white/60 text-brand-dark/30 hover:text-brand-dark/60 hover:bg-white/80 border border-white/80'
              }`}
            >
              {showSettings ? <X size={16} /> : <Settings size={16} />}
            </button>
          </div>

          {/* Settings Panel */}
          <div className={`grid transition-all duration-300 ease-out ${showSettings ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
            <div className="overflow-hidden">
                <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/60 p-6 space-y-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 mb-2">
                    Settings
                  </div>

                  {/* Name edit from settings */}
                  <button
                    onClick={() => { setShowSettings(false); startEditingName(); }}
                    className="w-full flex items-center gap-3 py-3 px-1 text-left group"
                  >
                    <Pencil size={14} className="text-brand-dark/30 group-hover:text-brand-mid transition-colors" />
                    <div>
                      <div className="text-sm font-medium text-brand-dark group-hover:text-brand-mid transition-colors">Edit Name</div>
                      <div className="text-[11px] text-brand-dark/40">Currently: {firstName}</div>
                    </div>
                  </button>

                  <div className="h-px bg-brand-dark/5" />

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <div className="text-sm font-medium text-brand-dark">Account</div>
                      <div className="text-xs text-brand-dark/40">{userEmail}</div>
                    </div>
                  </div>

                  <div className="h-px bg-brand-dark/5" />

                  <button
                    onClick={() => { setShowSettings(false); onResetDiagnostic(); }}
                    className="w-full flex items-center gap-3 py-3 px-1 text-left group"
                  >
                    <RotateCcw size={14} className="text-brand-dark/30 group-hover:text-brand-mid transition-colors" />
                    <div>
                      <div className="text-sm font-medium text-brand-dark group-hover:text-brand-mid transition-colors">Start Over</div>
                      <div className="text-[11px] text-brand-dark/40">Clear all answers and begin a fresh diagnostic</div>
                    </div>
                  </button>

                  <div className="h-px bg-brand-dark/5" />

                  <button
                    onClick={() => { setShowSettings(false); onLogout(); }}
                    className="w-full flex items-center gap-3 py-3 px-1 text-left group"
                  >
                    <LogOut size={14} className="text-brand-dark/30 group-hover:text-red-500 transition-colors" />
                    <div>
                      <div className="text-sm font-medium text-brand-dark group-hover:text-red-500 transition-colors">Sign Out</div>
                      <div className="text-[11px] text-brand-dark/40">You can sign back in anytime with a magic link</div>
                    </div>
                  </button>
                </div>
            </div>
          </div>
        </div>

        {/* Journey Progress */}
        <div
          className="mb-10 animate-[fadeInUp_0.6s_ease-out_0.1s_both]"
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 mb-4">
            Your Journey
          </div>
          <div className="flex items-center gap-0">
            {stages.map((s, idx) => {
              const isComplete = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              const Icon = s.icon;
              return (
                <React.Fragment key={s.id}>
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                        isComplete
                          ? 'bg-brand-dark text-white'
                          : isCurrent
                          ? 'bg-brand-dark/10 text-brand-dark border-2 border-brand-dark/40'
                          : 'bg-brand-dark/5 text-brand-dark/20'
                      }`}
                    >
                      {isComplete ? <CheckCircle size={18} /> : <Icon size={16} />}
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider text-center leading-tight ${
                        isCurrent ? 'text-brand-dark' : isComplete ? 'text-brand-dark/60' : 'text-brand-dark/20'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {idx < stages.length - 1 && (
                    <div
                      className={`h-px flex-1 -mt-6 ${
                        idx < currentStageIndex ? 'bg-brand-dark' : 'bg-brand-dark/10'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Primary Action Card */}
        <div
          className="mb-8 animate-[fadeInUp_0.6s_ease-out_0.2s_both]"
        >
          {/* STAGE: Fresh — Inline intake questions */}
          {stage === 'fresh' && (
            <Suspense fallback={
              <div className="w-full bg-white/70 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] border border-white/80 animate-pulse">
                <div className="h-8 w-48 bg-brand-dark/5 rounded mb-4" />
                <div className="h-4 w-64 bg-brand-dark/5 rounded" />
              </div>
            }>
              {/* Override Intake's full-page styling when embedded in Dashboard */}
              <div className="dashboard-inline-intake [&>section]:min-h-0 [&>section]:py-0 [&>section]:px-0">
                <Intake onComplete={onDiagnosticComplete} userEmail={userEmail} />
              </div>
            </Suspense>
          )}

          {/* STAGE: Preview ready — intake done, clarity session not started */}
          {stage === 'preview_ready' && (
            <div className="space-y-4">
              <button
                onClick={onViewReport}
                className="w-full text-left bg-white/70 backdrop-blur-xl p-8 md:p-10 rounded-[2rem] border border-white/80 shadow-sm hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Activity size={16} className="text-brand-mid" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-mid">
                        Preview Ready
                      </span>
                    </div>
                    <h2 className="font-serif text-2xl md:text-3xl text-brand-dark mb-2">
                      View Your Preview Report
                    </h2>
                    <p className="text-brand-dark/50 text-sm max-w-md font-lora">
                      We identified some patterns. This is what we can see from the surface.
                    </p>
                  </div>
                  <ChevronRight
                    size={24}
                    className="text-brand-dark/20 group-hover:text-brand-mid group-hover:translate-x-1 transition-all mt-2"
                  />
                </div>
              </button>

              <button
                onClick={onResumeIntake}
                className="w-full text-left bg-brand-dark text-white p-6 md:p-8 rounded-[1.5rem] shadow-lg hover:shadow-xl transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-xl mb-1">Continue to Clarity Session</h3>
                    <p className="text-white/60 text-sm font-lora">
                      25 targeted questions · About 10 minutes · This is where we find the real answers
                    </p>
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all"
                  />
                </div>
              </button>
            </div>
          )}

          {/* STAGE: Clarity session complete — all questions answered, not paid */}
          {stage === 'deep_complete' && (
            <div className="space-y-4">
              <div className="bg-green-50/80 backdrop-blur-md p-4 rounded-2xl border border-green-200/60 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <div className="text-sm font-medium text-green-800">Clarity session complete</div>
                  <div className="text-[11px] text-green-600/70">
                    All questions answered. One step left.
                  </div>
                </div>
              </div>

              <button
                onClick={onStartPayment}
                className="w-full text-left bg-brand-dark text-white p-8 md:p-10 rounded-[2rem] shadow-lg hover:shadow-xl transition-all group relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield size={16} className="text-white/60" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
                      Final Step
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl md:text-3xl text-white mb-2">
                    Complete Your Payment
                  </h2>
                  <p className="text-white/60 text-sm mb-6 max-w-md font-lora">
                    $1,200 one-time payment. Your Business Clarity Report will be delivered
                    within 5–7 business days.
                  </p>
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/70 group-hover:text-white group-hover:gap-3 transition-all">
                    Proceed to Payment <ArrowRight size={14} />
                  </div>
                </div>
              </button>

              {intakeData && (
                <button
                  onClick={onViewReport}
                  className="w-full text-left bg-white/50 backdrop-blur-xl p-5 rounded-2xl border border-white/60 hover:bg-white/70 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Activity size={16} className="text-brand-dark/30" />
                      <span className="text-sm text-brand-dark/50 font-lora">Review your preview report</span>
                    </div>
                    <ChevronRight size={16} className="text-brand-dark/20 group-hover:text-brand-mid transition-colors" />
                  </div>
                </button>
              )}
            </div>
          )}

          {/* STAGE: Paid — report in progress or released */}
          {stage === 'paid' && (
            <div className="space-y-4">
              {/* Report released — show the big CTA */}
              {reportReleased && (
                <button
                  onClick={onViewFullReport}
                  className="w-full text-left bg-brand-dark text-white p-8 md:p-10 rounded-[2rem] shadow-lg hover:shadow-xl transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles size={16} className="text-white/60" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
                        Report Ready
                      </span>
                    </div>
                    <h2 className="font-serif text-2xl md:text-3xl text-white mb-2">
                      View Your Business Clarity Report
                    </h2>
                    <p className="text-white/60 text-sm mb-6 max-w-md font-lora">
                      Your full report is ready. Constraint analysis, delegation matrix, roadmap — it's all here.
                    </p>
                    <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/70 group-hover:text-white group-hover:gap-3 transition-all">
                      Open Report <ArrowRight size={14} />
                    </div>
                  </div>
                </button>
              )}

              {/* Waiting card — shows when report isn't released yet */}
              {!reportReleased && (
                <div className="w-full bg-white/70 backdrop-blur-xl p-8 md:p-10 rounded-[2rem] border border-white/80 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                      <CheckCircle size={20} />
                    </div>
                    <div>
                      <h2 className="font-serif text-xl text-brand-dark">Everything's in.</h2>
                      <p className="text-brand-dark/40 text-xs">Answers received · Payment confirmed · Report in progress</p>
                    </div>
                  </div>
                  <p className="text-brand-dark/60 text-sm font-lora leading-relaxed mb-6">
                    Your Business Clarity Report is being prepared and will appear here when it's ready.
                    You'll receive an email at <span className="font-bold text-brand-dark">{userEmail}</span> when it's available.
                  </p>
                </div>
              )}

              {/* Preview link */}
              {intakeData && (
                <button
                  onClick={onViewReport}
                  className="w-full text-left bg-white/50 backdrop-blur-xl p-5 rounded-2xl border border-white/60 hover:bg-white/70 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Activity size={16} className="text-brand-dark/30" />
                      <span className="text-sm text-brand-dark/50 font-lora">Review your preview report</span>
                    </div>
                    <ChevronRight size={16} className="text-brand-dark/20 group-hover:text-brand-mid transition-colors" />
                  </div>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Quick Stats (only if we have data) */}
        {intakeData && Object.keys(intakeData).length > 3 && (
          <div
            className="mb-8 animate-[fadeInUp_0.6s_ease-out_0.3s_both]"
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 mb-4">
              Snapshot
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(intakeData.business_model || intakeData.business_type) && (
                <div className="bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-white/60">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-1">
                    Model
                  </div>
                  <div className="font-serif text-sm text-brand-dark leading-tight">
                    {(intakeData.business_model || intakeData.business_type)?.split('(')[0]?.trim()}
                  </div>
                </div>
              )}
              {intakeData.team_size && (
                <div className="bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-white/60">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-1">
                    Team
                  </div>
                  <div className="font-serif text-sm text-brand-dark">
                    {intakeData.team_size}
                  </div>
                </div>
              )}
              {intakeData.hourly_rate && (
                <div className="bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-white/60">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-1">
                    Rate
                  </div>
                  <div className="font-serif text-sm text-brand-dark">
                    {intakeData.hourly_rate}
                  </div>
                </div>
              )}
              {(intakeData.current_revenue_estimate || intakeData.revenue) && (
                <div className="bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-white/60">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-1">
                    Revenue
                  </div>
                  <div className="font-serif text-sm text-brand-dark">
                    {intakeData.current_revenue_estimate || intakeData.revenue}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Diagnostic Result Summary (if exists) */}
        {hasReport && diagnosticResult && (
          <div
            className="mb-8 animate-[fadeInUp_0.6s_ease-out_0.35s_both]"
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 mb-4">
              Preliminary Findings
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/50 backdrop-blur-md p-5 rounded-2xl border border-white/60 text-center">
                <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-2">
                  Decision Load
                </div>
                <div
                  className={`font-serif text-lg font-bold ${
                    diagnosticResult.report.decisionLoad === 'HIGH'
                      ? 'text-red-600'
                      : diagnosticResult.report.decisionLoad === 'MODERATE'
                      ? 'text-yellow-600'
                      : 'text-green-600'
                  }`}
                >
                  {diagnosticResult.report.decisionLoad}
                </div>
              </div>
              <div className="bg-white/50 backdrop-blur-md p-5 rounded-2xl border border-white/60 text-center">
                <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-2">
                  Flow Friction
                </div>
                <div
                  className={`font-serif text-lg font-bold ${
                    diagnosticResult.report.flowFriction === 'HIGH'
                      ? 'text-red-600'
                      : diagnosticResult.report.flowFriction === 'MODERATE'
                      ? 'text-yellow-600'
                      : 'text-green-600'
                  }`}
                >
                  {diagnosticResult.report.flowFriction}
                </div>
              </div>
              <div className="bg-white/50 backdrop-blur-md p-5 rounded-2xl border border-white/60 text-center">
                <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-2">
                  Context Switching
                </div>
                <div
                  className={`font-serif text-lg font-bold ${
                    diagnosticResult.report.contextSwitching === 'HIGH'
                      ? 'text-red-600'
                      : diagnosticResult.report.contextSwitching === 'MODERATE'
                      ? 'text-yellow-600'
                      : 'text-green-600'
                  }`}
                >
                  {diagnosticResult.report.contextSwitching}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Frustration Quote (if they wrote one) */}
        {intakeData?.biggest_frustration && (
          <div
            className="mb-10 animate-[fadeInUp_0.6s_ease-out_0.4s_both]"
          >
            <div className="bg-white/40 backdrop-blur-md p-6 rounded-2xl border border-white/60">
              <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-3">
                What You Told Us
              </div>
              <p className="font-lora italic text-brand-dark/60 leading-relaxed">
                "{intakeData.biggest_frustration}"
              </p>
              <p className="text-[11px] text-brand-dark/30 mt-3 font-lora">
                We heard you. This is exactly what the diagnostic is built to untangle.
              </p>
            </div>
          </div>
        )}

        {/* Your Answers (editable review) */}
        {intakeData && Object.keys(intakeData).filter(k => !SKIP_KEYS.includes(k) && ANSWER_LABELS[k]).length > 0 && (
          <div
            className="mb-10 animate-[fadeInUp_0.6s_ease-out_0.45s_both]"
          >
            <button
              onClick={() => setShowAnswers(!showAnswers)}
              className="w-full flex items-center justify-between mb-4 group"
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30">
                Your Answers
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/20 group-hover:text-brand-mid transition-colors">
                  {showAnswers ? 'Hide' : 'Review'}
                </span>
                {showAnswers ? (
                  <ChevronUp size={14} className="text-brand-dark/20 group-hover:text-brand-mid transition-colors" />
                ) : (
                  <ChevronDown size={14} className="text-brand-dark/20 group-hover:text-brand-mid transition-colors" />
                )}
              </div>
            </button>

            <div className={`grid transition-all duration-300 ease-out ${showAnswers ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
              <div className="overflow-hidden">
                  <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/60 p-6">
                    <div className="space-y-4">
                      {Object.entries(intakeData)
                        .filter(([key]) => !SKIP_KEYS.includes(key) && ANSWER_LABELS[key])
                        .map(([key, value]) => (
                          <div key={key} className="flex items-start justify-between gap-4 py-2 border-b border-brand-dark/5 last:border-0">
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/30 mb-1">
                                {ANSWER_LABELS[key] || key}
                              </div>
                              <div className="text-sm text-brand-dark/70 font-lora leading-relaxed">
                                {Array.isArray(value) ? value.join(', ') : String(value)}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>

                    <button
                      onClick={onEditAnswers}
                      className="mt-6 w-full py-3 rounded-xl bg-brand-dark/5 hover:bg-brand-dark/10 transition-all flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-dark/50 hover:text-brand-dark/70"
                    >
                      <Pencil size={12} />
                      Edit Answers
                    </button>
                  </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          className="flex items-center justify-center pt-8 border-t border-brand-dark/5 animate-[fadeIn_0.6s_ease-out_0.5s_both]"
        >
          <div className="text-[10px] text-brand-dark/20 font-bold uppercase tracking-widest">
            {businessName || 'Afterload'}
          </div>
        </div>
      </div>
    </div>
  );
}
