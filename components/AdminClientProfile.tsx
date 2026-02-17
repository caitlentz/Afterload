import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import {
  ArrowLeft, User, Globe, Briefcase, Activity, AlertTriangle, Shield,
  Wrench, ArrowRight, MessageSquare, Send, DollarSign, CheckCircle,
  RotateCcw, ChevronDown
} from 'lucide-react';
import {
  ClientData, PaymentRecord, STAGE_CONFIG,
  getClientStage, getBusinessInfo, formatDate, formatDateTime, formatCents,
  scoreColor, ScoreBadge
} from '../utils/adminTypes';
import {
  saveAdminNote, saveAdminTaggedNote, deleteAdminNote,
  fetchReportOverrides, fetchQuestionPack,
  ReportOverride, QuestionPack
} from '../utils/database';
import { runDiagnostic, IntakeResponse } from '../utils/diagnosticEngine';
import { runPreviewDiagnostic, PreviewResult } from '../utils/previewEngine';
import { getPreviewEligibility } from '../utils/normalizeIntake';

const ReportEditor = lazy(() => import('./ReportEditor'));
const QuestionPackEditor = lazy(() => import('./QuestionPackEditor'));

// ─── Props ──────────────────────────────────────────────────────────

interface AdminClientProfileProps {
  client: ClientData;
  payments: PaymentRecord[];
  onBack: () => void;
  onDataChanged: () => void;
}

// ─── Component ──────────────────────────────────────────────────────

export default function AdminClientProfile({
  client,
  payments,
  onBack,
  onDataChanged,
}: AdminClientProfileProps) {
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [overrides, setOverrides] = useState<ReportOverride[]>([]);
  const [questionPack, setQuestionPack] = useState<QuestionPack | null>(null);
  const [packLoaded, setPackLoaded] = useState(false);

  // Derived data
  const clientPayments = payments.filter(
    p => p.email?.toLowerCase() === client.email?.toLowerCase() && p.status === 'succeeded'
  );
  const stage = getClientStage(client, payments);
  const stageInfo = STAGE_CONFIG[stage];

  const latestIntake = [...(client.intake_responses || [])]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  const initialIntake = client.intake_responses?.find(r => r.mode === 'initial');
  const deepIntake = client.intake_responses?.find(r => r.mode === 'deep');
  const hasClaritySession = !!deepIntake;
  const answers = latestIntake?.answers || {};
  const biz = getBusinessInfo(answers);

  // Run preview diagnostic from initial intake
  const previewResult: PreviewResult | null = (() => {
    if (!initialIntake?.answers) return null;
    try {
      return runPreviewDiagnostic(initialIntake.answers);
    } catch (e) {
      console.error('Error running preview for', client.email, e);
      return null;
    }
  })();
  const previewEligibility = initialIntake?.answers ? getPreviewEligibility(initialIntake.answers) : null;

  // Run full diagnostic from deep intake
  const fullReport = (() => {
    if (!deepIntake?.answers) return null;
    try {
      return runDiagnostic(deepIntake.answers).report;
    } catch (e) {
      console.error('Error running diagnostic for', client.email, e);
      return null;
    }
  })();

  // Load report overrides
  const loadOverrides = useCallback(async () => {
    const data = await fetchReportOverrides(client.id);
    setOverrides(data);
  }, [client.id]);

  useEffect(() => { loadOverrides(); }, [loadOverrides]);

  // Load question pack
  const loadQuestionPack = useCallback(async () => {
    const data = await fetchQuestionPack(client.id);
    setQuestionPack(data);
    setPackLoaded(true);
  }, [client.id]);

  useEffect(() => { loadQuestionPack(); }, [loadQuestionPack]);

  // ─── Admin Actions ────────────────────────────────────────────────

  const handleSaveNote = async () => {
    const text = noteText.trim();
    if (!text) return;
    setSavingNote(true);
    await saveAdminNote(client.id, text);
    setNoteText('');
    setSavingNote(false);
    onDataChanged();
  };

  const handleMarkDelivered = async () => {
    await saveAdminTaggedNote(client.id, `Report delivered on ${new Date().toLocaleDateString()}`, 'delivered');
    onDataChanged();
  };

  const handleUnmarkDelivered = async () => {
    const deliveredNote = client.admin_notes?.find((n) => n.note?.includes('[delivered]'));
    if (!deliveredNote) return;
    await deleteAdminNote(deliveredNote.id);
    onDataChanged();
  };

  const handleReleaseReport = async () => {
    await saveAdminTaggedNote(client.id, `Report released for client viewing on ${new Date().toLocaleDateString()}`, 'report-released');
    onDataChanged();
  };

  return (
    <div className="min-h-screen w-full pt-28 pb-20 px-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ─── Header ─── */}
        <div className="flex items-start gap-4 animate-[fadeInUp_0.4s_ease-out_both]">
          <button
            onClick={onBack}
            className="mt-1 w-10 h-10 rounded-full bg-white/70 border border-brand-dark/10 flex items-center justify-center text-brand-dark/40 hover:text-brand-dark hover:bg-white transition-all shrink-0"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-serif text-2xl md:text-3xl text-brand-dark">
                {client.first_name || biz.firstName || client.email.split('@')[0]}
              </h1>
              {(client.business_name || biz.businessName) && (
                <span className="text-brand-dark/30 text-lg">— {client.business_name || biz.businessName}</span>
              )}
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap ${stageInfo.color}`}>
                {stageInfo.label}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-sm text-brand-dark/40">{client.email}</span>
              <span className="text-[10px] text-brand-dark/25">Client since {formatDate(client.created_at)}</span>
            </div>
          </div>
        </div>

        {/* ─── Business Information Card ─── */}
        <div className="bg-gradient-to-br from-brand-dark/[0.03] to-brand-dark/[0.01] rounded-xl p-5 border border-brand-dark/5 animate-[fadeInUp_0.4s_ease-out_0.05s_both]">
          <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-4 flex items-center gap-2">
            <Briefcase size={12} />
            Business Information
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/25 mb-0.5">Name</div>
                <div className="text-sm text-brand-dark font-medium">
                  {client.first_name || biz.firstName || '—'}
                </div>
              </div>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/25 mb-0.5">Email</div>
                <div className="text-sm text-brand-dark/70">{client.email}</div>
              </div>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/25 mb-0.5">Business Name</div>
                <div className="text-sm text-brand-dark font-medium">
                  {client.business_name || biz.businessName || '—'}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/25 mb-0.5">Website</div>
                <div className="text-sm text-brand-dark/70 flex items-center gap-1.5">
                  {biz.website ? (
                    <>
                      <Globe size={12} className="text-brand-mid/50 shrink-0" />
                      <a href={biz.website.startsWith('http') ? biz.website : `https://${biz.website}`}
                        target="_blank" rel="noopener noreferrer"
                        className="underline underline-offset-2 hover:text-brand-mid transition-colors truncate">
                        {biz.website}
                      </a>
                    </>
                  ) : '—'}
                </div>
              </div>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/25 mb-0.5">Industry / Type</div>
                <div className="text-sm text-brand-dark font-medium">
                  {biz.industryType || '—'}
                </div>
              </div>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/25 mb-0.5">Business Model</div>
                <div className="text-sm text-brand-dark/70">
                  {(answers.business_model || answers.business_type)?.split('(')[0]?.trim() || '—'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Payment History ─── */}
        {clientPayments.length > 0 && (
          <div className="animate-[fadeInUp_0.4s_ease-out_0.1s_both]">
            <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-3 flex items-center gap-2">
              <DollarSign size={12} />
              Payment History
            </div>
            <div className="space-y-2">
              {clientPayments.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 px-3 bg-white/60 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={12} className="text-emerald-500" />
                    <span className="text-xs font-medium text-brand-dark/70 capitalize">{p.payment_type}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-brand-dark">{formatCents(p.amount_cents)}</span>
                    <span className="text-[10px] text-brand-dark/30">{formatDateTime(p.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Preview Output ─── */}
        {previewResult && (
          <div className="bg-white/50 backdrop-blur-md rounded-xl border border-white/60 p-5 space-y-4 animate-[fadeInUp_0.4s_ease-out_0.15s_both]">
            <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 flex items-center gap-2">
              <Activity size={12} />
              Preview Diagnostic Output
            </div>

            {/* Constraints */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-red-50/50 rounded-lg p-3 border border-red-100/50">
                <div className="text-[9px] font-bold uppercase tracking-wider text-red-400 mb-1">Primary Constraint</div>
                <div className="text-sm text-brand-dark font-medium">{previewResult.primaryConstraint.label}</div>
                <div className="text-[10px] text-brand-dark/40 mt-0.5">{previewResult.primaryConstraint.type}</div>
              </div>
              <div className="bg-amber-50/50 rounded-lg p-3 border border-amber-100/50">
                <div className="text-[9px] font-bold uppercase tracking-wider text-amber-500 mb-1">Secondary Constraint</div>
                <div className="text-sm text-brand-dark font-medium">{previewResult.secondaryConstraint.label}</div>
                <div className="text-[10px] text-brand-dark/40 mt-0.5">{previewResult.secondaryConstraint.type}</div>
              </div>
            </div>

            {previewEligibility && (
              <div className="bg-brand-dark/[0.03] rounded-lg p-3 border border-brand-dark/10 space-y-2">
                <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/35">Operational Pattern Metadata</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="text-xs text-brand-dark/60">
                    Pattern: <span className="font-medium text-brand-dark">{previewEligibility.metadata.pattern}</span>
                  </div>
                  <div className="text-xs text-brand-dark/60">
                    Confidence: <span className="font-medium text-brand-dark">{previewEligibility.metadata.confidence}</span>
                  </div>
                  <div className="text-xs text-brand-dark/60">
                    Founder score: <span className="font-medium text-brand-dark">{previewEligibility.metadata.founderDependencyScore}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="text-xs text-brand-dark/60">
                    Primary: <span className="font-medium text-brand-dark">{previewEligibility.metadata.primaryConstraint.label}</span>
                    <span className="text-brand-dark/40"> ({previewEligibility.metadata.primaryConstraint.type}, {previewEligibility.metadata.primaryConstraint.score})</span>
                  </div>
                  <div className="text-xs text-brand-dark/60">
                    Secondary: <span className="font-medium text-brand-dark">{previewEligibility.metadata.secondaryConstraint.label}</span>
                    <span className="text-brand-dark/40"> ({previewEligibility.metadata.secondaryConstraint.type}, {previewEligibility.metadata.secondaryConstraint.score})</span>
                  </div>
                </div>
                <p className="text-xs text-brand-dark/50 font-lora leading-relaxed">
                  {previewEligibility.metadata.rationale}
                </p>
              </div>
            )}

            {/* Snapshot */}
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/25 mb-1">Constraint Snapshot</div>
              <p className="text-xs text-brand-dark/60 font-lora leading-relaxed">{previewResult.constraintSnapshot}</p>
            </div>

            {/* Compound narrative */}
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/25 mb-1">Compound Narrative</div>
              <p className="text-xs text-brand-dark/60 font-lora leading-relaxed">{previewResult.constraintCompoundNarrative}</p>
            </div>

            {/* Exposure metrics */}
            {previewResult.exposureMetrics.length > 0 && (
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/25 mb-1">Exposure Metrics</div>
                <div className="space-y-1">
                  {previewResult.exposureMetrics.map((m, i) => (
                    <div key={i} className="text-xs text-brand-dark/50 flex items-start gap-2">
                      <span className="text-brand-dark/20 mt-0.5">&bull;</span>
                      {m}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk + Trajectory + Tension */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/25 mb-1">Continuity Risk</div>
                <p className="text-[11px] text-brand-dark/50 font-lora leading-relaxed">{previewResult.continuityRisk}</p>
              </div>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/25 mb-1">Load Trajectory</div>
                <p className="text-[11px] text-brand-dark/50 font-lora leading-relaxed">{previewResult.loadTrajectory}</p>
              </div>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/25 mb-1">Structural Tension</div>
                <p className="text-[11px] text-brand-dark/50 font-lora leading-relaxed">{previewResult.structuralTension}</p>
              </div>
            </div>
          </div>
        )}

        {/* ─── Question Pack Editor ─── */}
        {initialIntake && packLoaded && (
          <div className="bg-white/50 backdrop-blur-md rounded-xl border border-white/60 p-5 animate-[fadeInUp_0.4s_ease-out_0.2s_both]">
            <Suspense fallback={<div className="animate-pulse h-32 bg-brand-dark/5 rounded-xl" />}>
              <QuestionPackEditor
                clientId={client.id}
                clientEmail={client.email}
                intakeAnswers={initialIntake.answers}
                previewResult={previewResult}
                existingPack={questionPack}
                onPackSaved={loadQuestionPack}
              />
            </Suspense>
          </div>
        )}

        {/* ─── Quick Context Grid ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-[fadeInUp_0.4s_ease-out_0.25s_both]">
          {(answers.business_model || answers.business_type) && (
            <div className="bg-white/60 rounded-xl p-3">
              <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-1">Model</div>
              <div className="text-sm text-brand-dark font-medium">{(answers.business_model || answers.business_type)?.split('(')[0]?.trim()}</div>
            </div>
          )}
          {latestIntake?.track && (
            <div className="bg-white/60 rounded-xl p-3">
              <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-1">Track</div>
              <div className="text-sm text-brand-dark font-medium">
                {latestIntake.track === 'A' ? 'Time-Bound' : latestIntake.track === 'B' ? 'Decision-Heavy' : 'Founder-Led'}
              </div>
            </div>
          )}
          {answers.team_size && (
            <div className="bg-white/60 rounded-xl p-3">
              <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-1">Team</div>
              <div className="text-sm text-brand-dark font-medium">{answers.team_size}</div>
            </div>
          )}
          {answers.hourly_rate && (
            <div className="bg-white/60 rounded-xl p-3">
              <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-1">Rate</div>
              <div className="text-sm text-brand-dark font-medium">{answers.hourly_rate}</div>
            </div>
          )}
        </div>

        {/* ─── Founder's Voice ─── */}
        {answers.biggest_frustration && (
          <div className="bg-brand-dark/[0.02] rounded-xl p-4 border border-brand-dark/5 animate-[fadeInUp_0.4s_ease-out_0.3s_both]">
            <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-2">In Their Words</div>
            <p className="font-lora italic text-brand-dark/70 leading-relaxed">"{answers.biggest_frustration}"</p>
          </div>
        )}

        {/* ─── Automated Scores (deep intake only) ─── */}
        {fullReport?.compositeScores && (
          <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out_0.35s_both]">
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-3 flex items-center gap-2">
                <Activity size={12} />
                Automated Scores
              </div>
              <div className="space-y-2">
                <ScoreBadge label="Founder Risk" level={fullReport.compositeScores.founderRisk.level} score={fullReport.compositeScores.founderRisk.score} />
                <ScoreBadge label="System Health" level={fullReport.compositeScores.systemHealth.level} score={fullReport.compositeScores.systemHealth.score} />
                <ScoreBadge label="Delegation Readiness" level={fullReport.compositeScores.delegationReadiness.level} score={fullReport.compositeScores.delegationReadiness.score} />
                <ScoreBadge label="Burnout Risk" level={fullReport.compositeScores.burnoutRisk.level} score={fullReport.compositeScores.burnoutRisk.score} />
              </div>
            </div>

            {/* Key Signals */}
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-3 flex items-center gap-2">
                <AlertTriangle size={12} />
                Key Signals
              </div>
              <div className="space-y-1.5">
                {[
                  ...fullReport.compositeScores.founderRisk.signals,
                  ...fullReport.compositeScores.burnoutRisk.signals,
                  ...fullReport.compositeScores.systemHealth.signals,
                  ...fullReport.compositeScores.delegationReadiness.signals,
                ]
                  .filter((s: string, i: number, arr: string[]) => arr.indexOf(s) === i)
                  .slice(0, 12)
                  .map((signal: string, i: number) => (
                    <div key={i} className="text-sm text-brand-dark/60 flex items-start gap-2 py-1">
                      <span className="text-brand-dark/20 mt-0.5">&bull;</span>
                      {signal}
                    </div>
                  ))}
              </div>
            </div>

            {/* Process Heatmap */}
            {fullReport.heatmap && (
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-3 flex items-center gap-2">
                  <Wrench size={12} />
                  Process Map
                </div>
                <div className="flex flex-wrap gap-2">
                  {fullReport.heatmap.map((s: any) => (
                    <div
                      key={s.name}
                      className={`px-3 py-2 rounded-lg text-xs font-medium ${
                        s.status === 'RED' ? 'bg-red-100 text-red-700' :
                        s.status === 'YELLOW' ? 'bg-amber-100 text-amber-700' :
                        s.status === 'GREEN' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-400'
                      }`}
                      title={s.signal}
                    >
                      {s.name}
                      <span className="ml-1 opacity-60">- {s.signal}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Roadmap Phases */}
            {fullReport.phases && (
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-3 flex items-center gap-2">
                  <ArrowRight size={12} />
                  Automated Roadmap
                </div>
                <div className="space-y-2">
                  {fullReport.phases.map((phase: any, i: number) => (
                    <div key={i} className="bg-white/60 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-brand-dark/30">Phase {i + 1}</span>
                        <span className="font-medium text-sm text-brand-dark">{phase.name}</span>
                      </div>
                      <p className="text-xs text-brand-dark/50 mb-1">{phase.description}</p>
                      <p className="text-xs text-brand-dark/70 font-medium">{phase.actionItem}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Primary Constraint */}
            {fullReport && (
              <div className="bg-brand-dark/[0.03] rounded-xl p-4 border border-brand-dark/5">
                <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-2 flex items-center gap-2">
                  <Shield size={12} />
                  Constraint: {fullReport.primaryConstraint} - {fullReport.constraintSolutionCategory}
                </div>
                <p className="text-sm text-brand-dark/60 leading-relaxed mb-3">{fullReport.constraintDescription}</p>
                <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-2">Success Trap</div>
                <p className="text-sm text-brand-dark/50 font-lora leading-relaxed">{fullReport.successTrapNarrative}</p>
              </div>
            )}
          </div>
        )}

        {/* ─── Report Editor (deep intake only) ─── */}
        {hasClaritySession && fullReport && (
          <div className="bg-white/50 backdrop-blur-md rounded-xl border border-white/60 p-5 animate-[fadeInUp_0.4s_ease-out_0.4s_both]">
            <Suspense fallback={<div className="animate-pulse h-32 bg-brand-dark/5 rounded-xl" />}>
              <ReportEditor
                clientId={client.id}
                fullReport={fullReport}
                overrides={overrides}
                onOverridesChange={loadOverrides}
              />
            </Suspense>
          </div>
        )}

        {/* ─── Action Buttons ─── */}
        {stage !== 'delivered' && (stage === 'balance_paid' || stage === 'clarity_done') && (
          <div className="space-y-2 animate-[fadeInUp_0.4s_ease-out_0.45s_both]">
            {hasClaritySession && !client.admin_notes?.some((n: any) => n.note?.includes('[report-released]')) && (
              <button
                onClick={handleReleaseReport}
                className="w-full py-3 rounded-xl bg-brand-deep text-white text-xs font-bold uppercase tracking-widest hover:bg-brand-dark transition-colors flex items-center justify-center gap-2"
              >
                <Shield size={14} />
                Release Report to Client
              </button>
            )}
            {client.admin_notes?.some((n: any) => n.note?.includes('[report-released]')) && (
              <div className="flex items-center gap-2 py-2 px-3 bg-purple-50 rounded-xl">
                <CheckCircle size={12} className="text-purple-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Report released — client can view in-app</span>
              </div>
            )}
            <button
              onClick={handleMarkDelivered}
              className="w-full py-3 rounded-xl bg-green-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle size={14} />
              Mark as Delivered
            </button>
          </div>
        )}
        {stage === 'delivered' && (
          <button
            onClick={handleUnmarkDelivered}
            className="w-full py-3 rounded-xl bg-amber-500 text-white text-xs font-bold uppercase tracking-widest hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 animate-[fadeInUp_0.4s_ease-out_0.45s_both]"
          >
            <RotateCcw size={14} />
            Unmark Delivered
          </button>
        )}

        {/* ─── Raw Answers ─── */}
        {Object.keys(answers).length > 0 && (
          <details className="group animate-[fadeInUp_0.4s_ease-out_0.5s_both]">
            <summary className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 cursor-pointer hover:text-brand-dark/50 transition-colors flex items-center gap-2">
              <ChevronDown size={12} className="group-open:rotate-180 transition-transform" />
              Raw Answers ({Object.keys(answers).length} fields)
            </summary>
            <div className="mt-3 space-y-2 bg-white/50 backdrop-blur-md rounded-xl border border-white/60 p-5">
              {Object.entries(answers)
                .filter(([_, v]) => v !== null && v !== undefined && v !== '')
                .map(([key, value]) => (
                  <div key={key} className="flex items-start gap-3 py-1 border-b border-brand-dark/5 last:border-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/30 w-40 shrink-0">{key}</span>
                    <span className="text-sm text-brand-dark/70">
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </span>
                  </div>
                ))}
            </div>
          </details>
        )}

        {/* ─── Admin Notes ─── */}
        <div className="animate-[fadeInUp_0.4s_ease-out_0.55s_both]">
          <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-3 flex items-center gap-2">
            <MessageSquare size={12} />
            Your Notes
          </div>

          {client.admin_notes?.length > 0 && (
            <div className="space-y-2 mb-3">
              {[...client.admin_notes]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map(note => (
                  <div key={note.id} className="bg-white/60 rounded-lg p-3">
                    <p className="text-sm text-brand-dark/70">
                      {note.note.startsWith('[delivered]') ? (
                        <span className="flex items-center gap-2">
                          <CheckCircle size={12} className="text-green-500" />
                          <span className="text-green-700 font-medium">{note.note.replace('[delivered] ', '')}</span>
                        </span>
                      ) : note.note.startsWith('[report-released]') ? (
                        <span className="flex items-center gap-2">
                          <Shield size={12} className="text-purple-500" />
                          <span className="text-purple-700 font-medium">{note.note.replace('[report-released] ', '')}</span>
                        </span>
                      ) : (
                        note.note
                      )}
                    </p>
                    <p className="text-[10px] text-brand-dark/30 mt-1">
                      {formatDateTime(note.created_at)}
                    </p>
                  </div>
                ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveNote(); }}
              placeholder="Add a note..."
              className="flex-1 px-4 py-2 rounded-xl bg-white border border-brand-dark/10 text-sm focus:outline-none focus:border-brand-mid"
            />
            <button
              onClick={handleSaveNote}
              disabled={savingNote || !noteText.trim()}
              className="px-4 py-2 rounded-xl bg-brand-dark text-white text-xs font-bold uppercase tracking-wider disabled:opacity-40 hover:bg-brand-deep transition-colors flex items-center gap-1"
            >
              <Send size={12} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
