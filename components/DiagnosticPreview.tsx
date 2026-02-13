import React from 'react';
import { AlertTriangle, ArrowRight, Lock, Eye, Shield, Sparkles, Clock, Activity } from 'lucide-react';
import { PreviewResult, LifecycleStage } from '../utils/previewEngine';

interface DiagnosticProps {
  onHome: () => void;
  onUnlock: () => void;
  preview: PreviewResult | null;
  key?: React.Key;
}

const DependencyBadge = ({ level }: { level: PreviewResult['founderDependency'] }) => {
  const colors = {
    CRITICAL: 'bg-red-100 text-red-800 border-red-200',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
    MODERATE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    LOW: 'bg-green-100 text-green-800 border-green-200',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${colors[level]}`}>
      {level}
    </span>
  );
};

const HorizonBadge = ({ level, label }: { level: string; label: string }) => {
  const colors: Record<string, string> = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${colors[level] || colors.moderate}`}>
      {label}
    </span>
  );
};

const LifecycleDot = ({ status }: { status: LifecycleStage['status'] }) => {
  const colors: Record<string, string> = {
    healthy: 'bg-green-400',
    stressed: 'bg-yellow-400',
    critical: 'bg-red-400',
    unknown: 'bg-brand-dark/10',
  };
  return (
    <div className="relative flex items-center justify-center shrink-0">
      <div className={`w-3 h-3 rounded-full ${colors[status]}`} />
      {status === 'critical' && (
        <div className={`absolute w-3 h-3 rounded-full ${colors[status]} animate-ping opacity-40`} />
      )}
    </div>
  );
};

const StatusLabel = ({ status }: { status: LifecycleStage['status'] }) => {
  const labels: Record<string, { text: string; className: string }> = {
    healthy: { text: 'Healthy', className: 'text-green-600' },
    stressed: { text: 'Stressed', className: 'text-yellow-600' },
    critical: { text: 'Critical', className: 'text-red-600' },
    unknown: { text: 'Unknown', className: 'text-brand-dark/25' },
  };
  const config = labels[status] || labels.unknown;
  return (
    <span className={`text-[9px] font-bold uppercase tracking-widest ${config.className}`}>
      {config.text}
    </span>
  );
};

export default function DiagnosticPreview({ onHome, onUnlock, preview }: DiagnosticProps) {
  if (!preview) return null;

  return (
    <div className="flex flex-col min-h-screen w-full relative overflow-hidden">

      {/* HEADER */}
      <div className="w-full max-w-3xl mx-auto pt-32 px-6 mb-16 text-center relative z-10">
        <div
          className="flex flex-col items-center gap-5 animate-[fadeInUp_0.6s_ease-out_both]"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-brand-dark/5 text-brand-mid shadow-sm">
            <Eye size={12} className="text-brand-mid/60" />
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase">Preview Report</span>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl text-brand-dark leading-[1] tracking-tight">
            {preview.businessName}
          </h1>
          <p className="text-brand-dark/40 text-sm">
            {preview.date} · {preview.trackLabel} Track
          </p>
        </div>
      </div>

      <main className="w-full max-w-3xl mx-auto px-6 pb-32 relative z-10">

        {/* PRIMARY CONSTRAINT */}
        <section
          className="mb-12 animate-[fadeInUp_0.6s_ease-out_0.1s_both]"
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 mb-4">
            Your Primary Constraint
          </div>
          <div className="bg-brand-dark text-white p-8 md:p-12 rounded-[2rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
            <div className="relative z-10">
              <h2 className="font-serif text-3xl md:text-5xl mb-4">{preview.constraintLabel}</h2>
              <p className="font-lora text-white/75 text-lg leading-relaxed">
                {preview.constraintDescription}
              </p>
            </div>
          </div>
        </section>

        {/* FOUNDER DEPENDENCY */}
        <section
          className="mb-12 animate-[fadeInUp_0.6s_ease-out_0.15s_both]"
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 mb-4">
            Founder Dependency
          </div>
          <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/80 shadow-[0_2px_8px_-3px_rgba(36,14,56,0.1)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl text-brand-dark">How much does this business need you?</h3>
              <DependencyBadge level={preview.founderDependency} />
            </div>
            <p className="text-brand-dark/60 text-sm font-lora leading-relaxed">
              {preview.founderDependencySignal}
            </p>
          </div>
        </section>

        {/* SUSTAINABILITY HORIZON */}
        <section
          className="mb-12 animate-[fadeInUp_0.6s_ease-out_0.2s_both]"
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 mb-4">
            Sustainability Horizon
          </div>
          <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/80 shadow-[0_2px_8px_-3px_rgba(36,14,56,0.1)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl text-brand-dark flex items-center gap-3">
                <Clock size={18} className="text-brand-mid/60" />
                How long can this hold?
              </h3>
              <HorizonBadge level={preview.sustainabilityHorizon.pressureLevel} label={preview.sustainabilityHorizon.label} />
            </div>
            <p className="text-brand-dark/60 text-sm font-lora leading-relaxed mb-5">
              {preview.sustainabilityHorizon.description}
            </p>
            {preview.sustainabilityHorizon.factors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {preview.sustainabilityHorizon.factors.map((factor, idx) => (
                  <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full bg-brand-dark/5 text-[10px] font-bold uppercase tracking-wider text-brand-dark/40">
                    {factor}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* LIFECYCLE HEATMAP */}
        <section
          className="mb-12 animate-[fadeInUp_0.6s_ease-out_0.25s_both]"
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 mb-4">
            Operational Health Map
          </div>
          <div className="bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] border border-white/80 shadow-[0_2px_8px_-3px_rgba(36,14,56,0.1)]">
            <div className="space-y-2">
              {preview.lifecycle.map((stage) => (
                <div key={stage.id} className="flex items-center gap-4 py-3 border-b border-brand-dark/5 last:border-0">
                  <LifecycleDot status={stage.status} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-brand-dark">{stage.label}</div>
                    <div className="text-xs text-brand-dark/40 font-lora">{stage.signal}</div>
                  </div>
                  <StatusLabel status={stage.status} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RISK SIGNALS — the "oh shit" section */}
        {preview.riskSignals.length > 0 && (
          <section
            className="mb-12 animate-[fadeInUp_0.6s_ease-out_0.3s_both]"
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 mb-4">
              What We See
            </div>
            <div className="space-y-3">
              {preview.riskSignals.map((signal, idx) => (
                <div
                  key={idx}
                  className="bg-white/50 backdrop-blur-md p-5 rounded-2xl border border-white/60 flex items-start gap-4"
                >
                  <div className="w-6 h-6 rounded-full bg-brand-dark/5 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle size={12} className="text-brand-mid" />
                  </div>
                  <p className="text-sm text-brand-dark/80 leading-relaxed">{signal}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SUCCESS TRAP */}
        <section
          className="mb-12 animate-[fadeInUp_0.6s_ease-out_0.35s_both]"
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 mb-4">
            The Success Trap
          </div>
          <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/60">
            <p className="font-lora text-brand-dark/70 text-lg leading-relaxed italic">
              {preview.successTrap}
            </p>
          </div>
        </section>

        {/* WHAT WE KNOW vs WHAT WE NEED */}
        <section
          className="mb-16 animate-[fadeInUp_0.6s_ease-out_0.4s_both]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* What We Know */}
            <div className="bg-sage-300/15 backdrop-blur-md p-6 rounded-[2rem] border border-white/80">
              <div className="flex items-center gap-2 mb-4">
                <Eye size={14} className="text-brand-dark/50" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/50">
                  What We Know
                </span>
              </div>
              <div className="space-y-2">
                {preview.whatWeKnow.map((item, idx) => (
                  <div key={idx} className="text-sm text-brand-dark/70 py-2 border-b border-brand-dark/5 last:border-0">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* What We Need (locked) */}
            <div className="bg-brand-dark/[0.03] backdrop-blur-md p-6 rounded-[2rem] border border-brand-dark/10 relative overflow-hidden">
              <div className="absolute inset-0 backdrop-blur-[2px]" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Lock size={14} className="text-brand-dark/30" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30">
                    Full Report Reveals
                  </span>
                </div>
                <div className="space-y-2">
                  {preview.whatWeNeedToFind.map((item, idx) => (
                    <div key={idx} className="text-sm text-brand-dark/30 py-2 border-b border-brand-dark/5 last:border-0">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LOCKED SECTIONS — visual tease */}
        <section
          className="mb-16 animate-[fadeInUp_0.6s_ease-out_0.45s_both]"
        >
          <div className="space-y-3 opacity-40">
            {['Process Heatmap', 'Pressure Point Analysis', 'Annual Friction Cost', 'Three-Phase Roadmap'].map((section) => (
              <div key={section} className="bg-white/40 p-6 rounded-2xl border border-brand-dark/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock size={14} className="text-brand-dark/30" />
                  <span className="font-serif text-brand-dark/50">{section}</span>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/20">Locked</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section
          className="text-center animate-[fadeInUp_0.6s_ease-out_0.5s_both]"
        >
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
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={onUnlock}
                className="px-10 py-4 bg-brand-dark text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-brand-dark/80 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                Continue to Deep Dive <ArrowRight size={14} />
              </button>
              <p className="text-[10px] text-brand-dark/30 max-w-xs">
                25 targeted questions. About 10 minutes. Free to answer — payment comes after.
              </p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
