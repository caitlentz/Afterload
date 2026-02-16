import React from 'react';
import { ArrowRight, Lock, Eye, Shield, Target, TrendingUp, AlertTriangle, Zap } from 'lucide-react';
import { PreviewResult } from '../utils/previewEngine';

interface DiagnosticProps {
  onHome: () => void;
  onUnlock: () => void;
  preview: PreviewResult | null;
  key?: React.Key;
}

export default function DiagnosticPreview({ onHome, onUnlock, preview }: DiagnosticProps) {
  if (!preview) return null;

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
