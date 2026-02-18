import React from 'react';
import { ArrowRight, Lock, Eye, Shield, Target, TrendingUp, AlertTriangle, Zap } from 'lucide-react';
import { PreviewResult } from '../utils/previewEngine';

interface DiagnosticProps {
  onHome: () => void;
  onUnlock: () => void | Promise<void>;
  preview: PreviewResult | null;
  key?: React.Key;
}

export default function DiagnosticPreview({ onHome, onUnlock, preview }: DiagnosticProps) {
  const [requesting, setRequesting] = React.useState(false);

  const handleCreateQuestionnaire = async () => {
    if (requesting) return;
    setRequesting(true);
    try {
      await onUnlock();
    } finally {
      setRequesting(false);
    }
  };

  if (!preview) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white/70 backdrop-blur-xl rounded-3xl border border-white/80 p-8 text-center">
          <h2 className="font-serif text-2xl text-brand-dark mb-2">Building your mini report</h2>
          <p className="text-sm text-brand-dark/50 font-lora mb-6">
            Your preview is being generated. If this takes more than a few seconds, go back and reopen it.
          </p>
          <button
            onClick={onHome}
            className="px-6 py-3 rounded-full bg-brand-dark text-white text-xs font-bold uppercase tracking-widest hover:bg-brand-deep transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    );
  }
  const score = preview.founderDependencyScore ?? 0;
  const level = preview.founderDependencyLevel ?? 'LOW';
  const markerColor =
    score >= 81 ? 'text-red-500' :
    score >= 61 ? 'text-orange-500' :
    score >= 31 ? 'text-amber-500' :
    'text-emerald-500';

  return (
    <div className="flex flex-col min-h-screen w-full relative overflow-hidden">

      {/* HEADER */}
      <div className="w-full max-w-3xl mx-auto pt-32 px-6 mb-16 text-center relative z-10">
        <div className="flex flex-col items-center gap-5 animate-[fadeInUp_0.6s_ease-out_both]">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-brand-dark/5 text-brand-mid shadow-sm">
            <Eye size={12} className="text-brand-mid/60" />
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase">Preview Report</span>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl text-brand-dark leading-[1] tracking-tight">
            {preview.businessName}
          </h1>
          <p className="text-brand-dark/40 text-sm">
            {preview.date}
          </p>
        </div>
      </div>

      <main className="w-full max-w-3xl mx-auto px-6 pb-32 relative z-10">

        {/* SECTION 1: CONSTRAINT SNAPSHOT */}
        <section className="mb-12 animate-[fadeInUp_0.6s_ease-out_0.1s_both]">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 mb-4">
            Constraint Snapshot
          </div>
          <div className="bg-brand-dark text-white p-8 md:p-12 rounded-[2rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
            <div className="relative z-10">
              <div className="mb-6">
                <div className="relative h-1 rounded-full bg-white/15 overflow-visible">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500 opacity-80" />
                  <div
                    className={`absolute -top-2 -translate-x-1/2 text-sm leading-none ${markerColor}`}
                    style={{ left: `${Math.max(0, Math.min(100, score))}%` }}
                  >
                    ●
                  </div>
                </div>
                <div className="mt-3 text-[11px] tracking-wider uppercase text-white/70 font-bold">
                  {score}/100 · {level} Dependency
                </div>
              </div>
              <p className="font-lora text-white/85 text-lg leading-relaxed">
                {preview.constraintSnapshot}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: TOP TWO CONSTRAINT DIMENSIONS */}
        <section className="mb-12 animate-[fadeInUp_0.6s_ease-out_0.15s_both]">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 mb-4">
            Top Two Constraint Dimensions
          </div>
          <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/80 shadow-[0_2px_8px_-3px_rgba(36,14,56,0.1)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="font-serif text-xl text-brand-dark">{preview.primaryConstraint.label}</span>
              </div>
              <span className="hidden sm:block text-brand-dark/20">+</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-400" />
                <span className="font-serif text-lg text-brand-dark/70">{preview.secondaryConstraint.label}</span>
              </div>
            </div>
            <p className="text-brand-dark/60 text-sm font-lora leading-relaxed">
              {preview.constraintCompoundNarrative}
            </p>
          </div>
        </section>

        {/* SECTION 3: STRUCTURAL EXPOSURE METRICS */}
        <section className="mb-12 animate-[fadeInUp_0.6s_ease-out_0.2s_both]">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 mb-4">
            Structural Exposure
          </div>
          <div className="bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] border border-white/80 shadow-[0_2px_8px_-3px_rgba(36,14,56,0.1)]">
            <div className="space-y-1">
              {preview.exposureMetrics.map((metric, idx) => (
                <div key={idx} className="flex items-start gap-3 py-3 border-b border-brand-dark/5 last:border-0">
                  <div className="w-5 h-5 rounded-full bg-brand-dark/5 flex items-center justify-center shrink-0 mt-0.5">
                    <Target size={10} className="text-brand-mid" />
                  </div>
                  <span className="text-sm text-brand-dark/75">{metric}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4: CONTINUITY RISK */}
        <section className="mb-12 animate-[fadeInUp_0.6s_ease-out_0.25s_both]">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 mb-4">
            Continuity Risk
          </div>
          <div className="bg-white/50 backdrop-blur-md p-6 rounded-2xl border border-white/60 flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle size={14} className="text-red-500" />
            </div>
            <p className="text-sm text-brand-dark/80 leading-relaxed font-medium">
              {preview.continuityRisk}
            </p>
          </div>
        </section>

        {/* SECTION 5: LOAD TRAJECTORY */}
        <section className="mb-12 animate-[fadeInUp_0.6s_ease-out_0.3s_both]">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 mb-4">
            Load Trajectory
          </div>
          <div className="bg-white/50 backdrop-blur-md p-6 rounded-2xl border border-white/60 flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
              <TrendingUp size={14} className="text-orange-500" />
            </div>
            <p className="text-sm text-brand-dark/70 leading-relaxed font-lora italic">
              {preview.loadTrajectory}
            </p>
          </div>
        </section>

        {/* SECTION 6: STRUCTURAL TENSION */}
        <section className="mb-16 animate-[fadeInUp_0.6s_ease-out_0.35s_both]">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 mb-4">
            Structural Tension
          </div>
          <div className="bg-brand-dark/[0.04] backdrop-blur-md p-6 rounded-2xl border border-brand-dark/10 flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-brand-dark/5 flex items-center justify-center shrink-0">
              <Zap size={14} className="text-brand-deep" />
            </div>
            <p className="text-sm text-brand-dark/80 leading-relaxed font-medium">
              {preview.structuralTension}
            </p>
          </div>
        </section>

        {/* LOCKED SECTIONS — visual tease */}
        <section className="mb-16 animate-[fadeInUp_0.6s_ease-out_0.4s_both]">
          <div className="space-y-3">
            {[
              {
                title: 'Pressure Point Analysis',
                bullets: [
                  'Identifies your top 3 operational bottlenecks',
                  'Maps where approvals stall flow',
                  'Shows idle time vs productive delivery time',
                ],
              },
              {
                title: 'Annual Friction Cost',
                bullets: [
                  'Estimates the annual cost of operational drag',
                  'Quantifies lost capacity and delay cost',
                  'Compares cost of inaction vs cost to fix',
                ],
              },
              {
                title: 'Three-Phase Roadmap',
                bullets: [
                  'Weeks 1-2: fast stabilization moves',
                  'Weeks 3-8: structural system upgrades',
                  'Months 3-6: ceiling removal for scale',
                ],
              },
            ].map((section) => (
              <div key={section.title} className="bg-white/50 p-6 rounded-2xl border border-brand-dark/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Lock size={14} className="text-brand-dark/30" />
                    <span className="font-serif text-brand-dark/70">{section.title}</span>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/25">Locked</span>
                </div>
                <div className="space-y-1.5">
                  {section.bullets.map((bullet) => (
                    <div key={bullet} className="text-xs text-brand-dark/45 flex items-start gap-2">
                      <span className="mt-0.5">→</span>
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center animate-[fadeInUp_0.6s_ease-out_0.45s_both]">
          <div className="bg-sage-300/15 backdrop-blur-xl p-10 md:p-14 rounded-[2.5rem] border border-white/80 shadow-[0_2px_8px_-3px_rgba(36,14,56,0.15)]">
            <div className="w-14 h-14 rounded-full bg-brand-dark text-white flex items-center justify-center mx-auto mb-6">
              <Shield size={24} />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl text-brand-dark mb-3">
              This is what we can see from the surface.
            </h2>
            <p className="font-lora text-brand-dark/50 max-w-lg mx-auto mb-8 leading-relaxed">
              The full Business Clarity Report goes deeper — 25 targeted questions that map your exact bottleneck,
              calculate the cost, and build a phased roadmap specific to your business.
            </p>
            <div className="text-left max-w-xl mx-auto mb-8 bg-white/60 rounded-2xl border border-white/70 p-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/35 mb-2">What Happens Next</div>
              <div className="text-xs text-brand-dark/60 space-y-1.5">
                <div>The next 25 questions are free to answer.</div>
                <div>You’ll see your tailored operational analysis foundation after completion.</div>
                <div>To unlock full outputs (friction-cost model, pressure-point analysis, and 90-day roadmap), payment happens after the clarity session.</div>
                <div>One-time payment: $495.</div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={handleCreateQuestionnaire}
                disabled={requesting}
                className="px-10 py-4 bg-brand-dark text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-brand-dark/80 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {requesting ? 'Sending Request...' : 'Create My Clarity Questionnaire'} <ArrowRight size={14} />
              </button>
              <p className="text-[10px] text-brand-dark/30 max-w-xs">
                We’ll notify admin you want to continue, then take you into the clarity session.
              </p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
