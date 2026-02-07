import React, { useMemo } from 'react';
import {
  ArrowLeft, Printer, AlertTriangle, Check, Lock, Clock, Activity,
  Shield, Sparkles, Eye, ChevronRight, Target, TrendingUp, Zap, Heart,
  DollarSign, Users, FileText, ArrowRight, BarChart3, Layers
} from 'lucide-react';
import {
  runDiagnostic, ReportData, IntakeResponse, HeatmapStage, CompositeScores,
  FrictionCostEstimate, ExtractionReadiness, DelegationItem,
  EnrichedPhase, EnrichedPressurePoint
} from '../utils/diagnosticEngine';

// ============================================================
// PROPS
// ============================================================

interface FullReportProps {
  intakeData: IntakeResponse | null;
  onBack: () => void;
}

// ============================================================
// SHARED DESIGN TOKENS
// ============================================================

const glassCard = 'bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/80 shadow-[0_2px_8px_-3px_rgba(36,14,56,0.1)]';
const darkCard = 'bg-brand-dark text-white p-8 md:p-12 rounded-[2rem] relative overflow-hidden';
const sectionLabel = 'text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 mb-4';

// ============================================================
// SEVERITY HELPERS
// ============================================================

type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'STRONG' | 'ADEQUATE' | 'FRAGILE' | 'BROKEN' | 'READY' | 'CLOSE' | 'NOT_YET' | 'BLOCKED' | 'HEALTHY' | 'AT_RISK' | 'UNKNOWN';

function severityColor(level: SeverityLevel): string {
  const map: Record<string, string> = {
    CRITICAL: 'bg-red-100 text-red-800 border-red-200',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
    MODERATE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    LOW: 'bg-green-100 text-green-800 border-green-200',
    STRONG: 'bg-green-100 text-green-800 border-green-200',
    ADEQUATE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    FRAGILE: 'bg-orange-100 text-orange-800 border-orange-200',
    BROKEN: 'bg-red-100 text-red-800 border-red-200',
    READY: 'bg-green-100 text-green-800 border-green-200',
    CLOSE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    NOT_YET: 'bg-orange-100 text-orange-800 border-orange-200',
    BLOCKED: 'bg-red-100 text-red-800 border-red-200',
    HEALTHY: 'bg-green-100 text-green-800 border-green-200',
    AT_RISK: 'bg-orange-100 text-orange-800 border-orange-200',
    UNKNOWN: 'bg-brand-dark/5 text-brand-dark/40 border-brand-dark/10',
  };
  return map[level] || map.UNKNOWN;
}

function severityBorderColor(level: SeverityLevel): string {
  const map: Record<string, string> = {
    CRITICAL: 'border-l-red-400',
    HIGH: 'border-l-orange-400',
    MODERATE: 'border-l-yellow-400',
    LOW: 'border-l-green-400',
    STRONG: 'border-l-green-400',
    ADEQUATE: 'border-l-yellow-400',
    FRAGILE: 'border-l-orange-400',
    BROKEN: 'border-l-red-400',
    READY: 'border-l-green-400',
    CLOSE: 'border-l-yellow-400',
    NOT_YET: 'border-l-orange-400',
    BLOCKED: 'border-l-red-400',
    HEALTHY: 'border-l-green-400',
    AT_RISK: 'border-l-orange-400',
    UNKNOWN: 'border-l-brand-dark/10',
  };
  return map[level] || 'border-l-brand-dark/10';
}

function scoreRingColor(score: number): string {
  if (score >= 70) return 'text-green-500';
  if (score >= 50) return 'text-yellow-500';
  if (score >= 30) return 'text-orange-500';
  return 'text-red-500';
}

function formatDollarCompact(n: number): string {
  if (n >= 1000) return `$${Math.round(n / 1000)}k`;
  return `$${Math.round(n)}`;
}

// ============================================================
// BADGE COMPONENTS
// ============================================================

const SeverityBadge = ({ level }: { level: SeverityLevel }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${severityColor(level)}`}>
    {level.replace('_', ' ')}
  </span>
);

const HeatmapDot = ({ status }: { status: HeatmapStage['status'] }) => {
  const colors: Record<string, string> = {
    GREEN: 'bg-green-400',
    YELLOW: 'bg-yellow-400',
    RED: 'bg-red-400',
    UNKNOWN: 'bg-brand-dark/10',
  };
  return (
    <div className="relative flex items-center justify-center shrink-0">
      <div className={`w-3 h-3 rounded-full ${colors[status]}`} />
      {status === 'RED' && (
        <div className={`absolute w-3 h-3 rounded-full ${colors[status]} animate-ping opacity-40`} />
      )}
    </div>
  );
};

const HeatmapStatusLabel = ({ status }: { status: HeatmapStage['status'] }) => {
  const labels: Record<string, { text: string; className: string }> = {
    GREEN: { text: 'Healthy', className: 'text-green-600' },
    YELLOW: { text: 'Stressed', className: 'text-yellow-600' },
    RED: { text: 'Critical', className: 'text-red-600' },
    UNKNOWN: { text: 'Unknown', className: 'text-brand-dark/25' },
  };
  const config = labels[status] || labels.UNKNOWN;
  return (
    <span className={`text-[9px] font-bold uppercase tracking-widest ${config.className}`}>
      {config.text}
    </span>
  );
};

const ExtractionFactorDot = ({ status }: { status: 'green' | 'yellow' | 'red' }) => {
  const colors = { green: 'bg-green-400', yellow: 'bg-yellow-400', red: 'bg-red-400' };
  return <div className={`w-2.5 h-2.5 rounded-full ${colors[status]} shrink-0`} />;
};

const DelegationReadinessBadge = ({ readiness }: { readiness: DelegationItem['readiness'] }) => {
  const config: Record<string, { label: string; className: string }> = {
    NOW: { label: 'Delegate Now', className: 'bg-green-100 text-green-800 border-green-200' },
    AFTER_SYSTEMS: { label: 'After Systems', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    AFTER_HIRING: { label: 'After Hiring', className: 'bg-orange-100 text-orange-800 border-orange-200' },
    FOUNDER_ONLY: { label: 'Founder Only', className: 'bg-red-100 text-red-800 border-red-200' },
  };
  const c = config[readiness] || config.AFTER_SYSTEMS;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${c.className}`}>
      {c.label}
    </span>
  );
};

// ============================================================
// SCORE RING (SVG donut)
// ============================================================

const ScoreRing = ({ score, size = 64 }: { score: number; size?: number }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={4} className="text-brand-dark/5" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={4}
          className={scoreRingColor(score)} strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-brand-dark">{score}</span>
      </div>
    </div>
  );
};

// ============================================================
// SECTION 1: REPORT HEADER
// ============================================================

const ReportHeader = ({ report, onBack }: { report: ReportData; onBack: () => void }) => (
  <div className="w-full max-w-3xl mx-auto pt-24 md:pt-32 px-6 mb-16 text-center relative z-10">
    {/* Back + Print buttons (hidden in print) */}
    <div className="flex items-center justify-between mb-12 print:hidden animate-[fadeIn_0.4s_ease-out_both]">
      <button onClick={onBack}
        className="flex items-center gap-2 text-brand-dark/40 hover:text-brand-dark transition-colors text-xs font-bold uppercase tracking-widest">
        <ArrowLeft size={14} />
        <span>Back</span>
      </button>
      <button onClick={() => window.print()}
        className="flex items-center gap-2 text-brand-dark/40 hover:text-brand-dark transition-colors text-xs font-bold uppercase tracking-widest">
        <Printer size={14} />
        <span>Print</span>
      </button>
    </div>

    <div className="flex flex-col items-center gap-5 animate-[fadeInUp_0.6s_ease-out_both]">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-brand-dark/5 text-brand-mid shadow-sm">
        <Shield size={12} className="text-brand-mid/60" />
        <span className="text-[10px] font-bold tracking-[0.15em] uppercase">Business Clarity Report</span>
      </div>
      <h1 className="font-serif text-4xl md:text-6xl text-brand-dark leading-[1] tracking-tight">
        {report.businessName}
      </h1>
      <p className="text-brand-dark/40 text-sm">
        {report.date} · {report.trackLabel} Track
      </p>
      <p className="text-[10px] text-brand-dark/20 uppercase tracking-widest mt-2">
        Prepared by Afterload
      </p>
    </div>
  </div>
);

// ============================================================
// SECTION 2: EXECUTIVE SUMMARY
// ============================================================

const ExecutiveSummary = ({ report }: { report: ReportData }) => (
  <section className="mb-12 animate-[fadeInUp_0.6s_ease-out_0.1s_both]">
    <div className={sectionLabel}>Executive Summary</div>
    <div className={darkCard}>
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="relative z-10">
        <p className="font-lora text-white/85 text-lg md:text-xl leading-relaxed mb-8">
          {report.executiveSummary}
        </p>
        {report.frictionCost.totalRange.high > 0 && (
          <div className="bg-white/10 rounded-2xl p-6 text-center">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">
              Estimated Annual Friction Cost
            </div>
            <div className="font-serif text-3xl md:text-4xl text-white">
              {formatDollarCompact(report.frictionCost.totalRange.low)} – {formatDollarCompact(report.frictionCost.totalRange.high)}
            </div>
            <div className="text-[10px] text-white/30 mt-2 uppercase tracking-wider">
              {report.frictionCost.confidenceLevel} estimate
            </div>
          </div>
        )}
      </div>
    </div>
  </section>
);

// ============================================================
// SECTION 3: SCORE CARDS
// ============================================================

const scoreCardMeta: {
  key: keyof CompositeScores;
  label: string;
  icon: React.ReactNode;
  descriptorFn: (level: string) => string;
}[] = [
  {
    key: 'founderRisk',
    label: 'Founder Risk',
    icon: <Users size={16} />,
    descriptorFn: (l) =>
      l === 'CRITICAL' ? 'Business cannot function without the founder' :
      l === 'HIGH' ? 'Significant structural dependency on founder' :
      l === 'MODERATE' ? 'Some dependency, but manageable' :
      'Founder has successfully distributed key functions',
  },
  {
    key: 'systemHealth',
    label: 'System Health',
    icon: <Layers size={16} />,
    descriptorFn: (l) =>
      l === 'BROKEN' ? 'No documented systems — everything lives in someone\'s head' :
      l === 'FRAGILE' ? 'Systems exist but are fragmented or unused' :
      l === 'ADEQUATE' ? 'Core systems work, with room for improvement' :
      'Well-documented, actively used operational systems',
  },
  {
    key: 'delegationReadiness',
    label: 'Delegation Readiness',
    icon: <ArrowRight size={16} />,
    descriptorFn: (l) =>
      l === 'BLOCKED' ? 'Major blockers to delegation — structural work needed first' :
      l === 'NOT_YET' ? 'Foundation needs building before delegation can work' :
      l === 'CLOSE' ? 'Almost ready — one or two pieces missing' :
      'Ready to begin meaningful delegation',
  },
  {
    key: 'burnoutRisk',
    label: 'Burnout Risk',
    icon: <Heart size={16} />,
    descriptorFn: (l) =>
      l === 'CRITICAL' ? 'Burnout is imminent or already happening' :
      l === 'HIGH' ? 'Current pace is unsustainable — timeline is short' :
      l === 'MODERATE' ? 'Manageable stress, but watch the trajectory' :
      'Sustainable workload and pace',
  },
  {
    key: 'pricingHealth',
    label: 'Pricing Health',
    icon: <DollarSign size={16} />,
    descriptorFn: (l) =>
      l === 'CRITICAL' ? 'Pricing is likely amplifying operational problems' :
      l === 'AT_RISK' ? 'Pricing may not reflect true cost of delivery' :
      l === 'UNKNOWN' ? 'Insufficient data to assess' :
      'Pricing appears healthy relative to cost structure',
  },
];

const ScoreCards = ({ scores }: { scores: CompositeScores }) => (
  <section className="mb-12 animate-[fadeInUp_0.6s_ease-out_0.15s_both]">
    <div className={sectionLabel}>Your Numbers at a Glance</div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {scoreCardMeta.map(({ key, label, icon, descriptorFn }) => {
        const data = scores[key];
        return (
          <div key={key}
            className={`${glassCard} p-6 border-l-4 ${severityBorderColor(data.level as SeverityLevel)}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-brand-dark/40">{icon}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-dark/60">{label}</span>
                </div>
                <SeverityBadge level={data.level as SeverityLevel} />
              </div>
              <ScoreRing score={data.score} size={56} />
            </div>
            <p className="text-xs text-brand-dark/50 font-lora leading-relaxed">
              {descriptorFn(data.level)}
            </p>
          </div>
        );
      })}
    </div>
  </section>
);

// ============================================================
// SECTION 4: PRIMARY CONSTRAINT (deep version)
// ============================================================

const constraintLabels: Record<string, string> = {
  'COGNITIVE-BOUND': 'Cognitive Overload',
  'POLICY-BOUND': 'Missing Structure',
  'TIME-BOUND': 'Capacity Ceiling',
  'UNKNOWN': 'Under Analysis',
};

const PrimaryConstraint = ({ report }: { report: ReportData }) => (
  <section className="mb-12 animate-[fadeInUp_0.6s_ease-out_0.2s_both]">
    <div className={sectionLabel}>Your Primary Constraint</div>
    <div className={darkCard}>
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/60 text-[10px] font-bold uppercase tracking-widest mb-6">
          <Target size={10} />
          {report.constraintSolutionCategory}
        </div>
        <h2 className="font-serif text-3xl md:text-5xl mb-4">
          {constraintLabels[report.primaryConstraint] || report.primaryConstraint}
        </h2>
        <p className="font-lora text-white/75 text-lg leading-relaxed mb-6">
          {report.constraintDescription}
        </p>
        <div className="bg-white/10 rounded-2xl p-6">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">
            What this means for {report.businessName}
          </div>
          <p className="font-lora text-white/60 text-sm leading-relaxed">
            The bottleneck sits at <span className="text-white font-medium">{report.bottleneckStage}</span>.
            {report.frictionCost.totalRange.high > 0 && (
              <> At current scale, this constraint costs an estimated <span className="text-white font-medium">{formatDollarCompact(report.frictionCost.totalRange.low)} – {formatDollarCompact(report.frictionCost.totalRange.high)}/year</span> in friction.</>
            )} The roadmap below is designed to relieve this specific pressure point.
          </p>
        </div>
      </div>
    </div>
  </section>
);

// ============================================================
// SECTION 5: PROCESS HEALTH MAP
// ============================================================

const remediation: Record<string, string> = {
  'Lead Gen': 'Implement a CRM or simple intake form that auto-captures leads with no manual step.',
  'Triage': 'Document qualification criteria so the team can screen independently.',
  'Sales': 'Create proposal templates the team can customize without founder input.',
  'Onboarding': 'Build an onboarding checklist or automation that triggers on booking.',
  'Fulfillment': 'Write a "Definition of Done" for core deliverables so the team knows the standard.',
  'Review': 'Shift to spot-check QC instead of reviewing every deliverable.',
  'Close-Out': 'Automate final invoice, feedback request, and offboarding communication.',
};

const ProcessHealthMap = ({ heatmap }: { heatmap: HeatmapStage[] }) => (
  <section className="mb-12 animate-[fadeInUp_0.6s_ease-out_0.25s_both]">
    <div className={sectionLabel}>Operational Health Map</div>
    <div className={`${glassCard} p-6 md:p-8`}>
      {/* Pipeline visual */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
        {heatmap.map((stage, idx) => {
          const dotColor = stage.status === 'GREEN' ? 'bg-green-400' :
            stage.status === 'YELLOW' ? 'bg-yellow-400' :
            stage.status === 'RED' ? 'bg-red-400' : 'bg-brand-dark/10';
          return (
            <React.Fragment key={stage.name}>
              <div className="flex flex-col items-center min-w-[70px]">
                <div className={`w-4 h-4 rounded-full ${dotColor} mb-1`} />
                <span className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/40 text-center leading-tight">
                  {stage.name}
                </span>
              </div>
              {idx < heatmap.length - 1 && (
                <ChevronRight size={12} className="text-brand-dark/15 shrink-0 mt-[-12px]" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Detail rows */}
      <div className="space-y-2">
        {heatmap.map((stage) => (
          <div key={stage.name}>
            <div className="flex items-center gap-4 py-3 border-b border-brand-dark/5 last:border-0">
              <HeatmapDot status={stage.status} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-brand-dark">{stage.name}</div>
                <div className="text-xs text-brand-dark/40 font-lora">{stage.signal}</div>
              </div>
              <HeatmapStatusLabel status={stage.status} />
            </div>
            {stage.status === 'RED' && (
              <div className="ml-7 pl-4 border-l-2 border-red-200 py-3 mb-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1">Remediation</div>
                <p className="text-xs text-brand-dark/50 font-lora leading-relaxed">
                  {remediation[stage.name] || 'Document the standard for this stage and assign ownership.'}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ============================================================
// SECTION 6: PRESSURE POINTS
// ============================================================

const PressurePoints = ({ points }: { points: EnrichedPressurePoint[] }) => {
  if (points.length === 0) return null;
  return (
    <section className="mb-12 animate-[fadeInUp_0.6s_ease-out_0.3s_both]">
      <div className={sectionLabel}>Pressure Points</div>
      <div className="space-y-4">
        {points.map((point, idx) => (
          <div key={idx} className={`${glassCard} p-6 md:p-8`}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-8 h-8 rounded-full bg-brand-dark/5 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle size={14} className="text-brand-mid" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-xl text-brand-dark mb-1">{point.title}</h3>
                <p className="text-sm text-brand-dark/60 font-lora leading-relaxed">{point.finding}</p>
              </div>
            </div>

            {/* Root causes */}
            <div className="ml-12 mb-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-dark/30 mb-2">Root Causes</div>
              <ul className="space-y-1.5">
                {point.rootCause.map((cause, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-dark/20 mt-1.5 shrink-0" />
                    <span className="text-sm text-brand-dark/60 font-lora leading-relaxed">{cause}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cost impact pill */}
            {point.costImpact && (
              <div className="ml-12 mb-4">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-red-50 border border-red-100 text-xs font-medium text-red-700">
                  <DollarSign size={10} className="mr-1" />
                  {point.costImpact}
                </span>
              </div>
            )}

            {/* Opportunity reframe */}
            {point.opportunity && (
              <div className="ml-12 bg-green-50/60 rounded-xl p-4 border border-green-100/60">
                <div className="flex items-start gap-2">
                  <TrendingUp size={12} className="text-green-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-green-800/80 font-lora leading-relaxed">{point.opportunity}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

// ============================================================
// SECTION 7: SUCCESS TRAP
// ============================================================

const SuccessTrap = ({ narrative }: { narrative: string }) => (
  <section className="mb-12 animate-[fadeInUp_0.6s_ease-out_0.35s_both]">
    <div className={sectionLabel}>The Success Trap</div>
    <div className="bg-white/40 backdrop-blur-md p-8 md:p-10 rounded-[2rem] border border-white/60">
      <p className="font-lora text-brand-dark/70 text-lg md:text-xl leading-relaxed italic">
        {narrative}
      </p>
    </div>
  </section>
);

// ============================================================
// SECTION 8: DELEGATION READINESS
// ============================================================

const DelegationReadiness = ({
  extraction,
  matrix,
  businessName,
}: {
  extraction: ExtractionReadiness;
  matrix: DelegationItem[];
  businessName: string;
}) => {
  const extractionLabels: Record<string, string> = {
    READY: 'Ready for extraction',
    CLOSE: 'Getting close',
    EARLY: 'Early stages',
    ENTANGLED: 'Deeply entangled',
  };

  return (
    <section className="mb-12 animate-[fadeInUp_0.6s_ease-out_0.4s_both]">
      <div className={sectionLabel}>Delegation Readiness</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Extraction Readiness */}
        <div className={`${glassCard} p-6`}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-serif text-lg text-brand-dark">Extraction Readiness</h3>
            <ScoreRing score={extraction.score} size={52} />
          </div>
          <SeverityBadge level={extraction.level as SeverityLevel} />
          <p className="text-xs text-brand-dark/40 mt-2 mb-5 font-lora">
            {extractionLabels[extraction.level]}
          </p>
          <div className="space-y-3">
            {extraction.factors.map((factor, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <ExtractionFactorDot status={factor.status} />
                <div>
                  <div className="text-xs font-bold text-brand-dark/70">{factor.label}</div>
                  <div className="text-[11px] text-brand-dark/40 font-lora">{factor.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delegation Matrix */}
        <div className={`${glassCard} p-6`}>
          <h3 className="font-serif text-lg text-brand-dark mb-5">Delegation Matrix</h3>
          {matrix.length > 0 ? (
            <div className="space-y-4">
              {matrix.map((item, idx) => (
                <div key={idx} className="border-b border-brand-dark/5 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-brand-dark">{item.responsibility}</span>
                    <DelegationReadinessBadge readiness={item.readiness} />
                  </div>
                  <p className="text-[11px] text-brand-dark/40 font-lora leading-relaxed">{item.reasoning}</p>
                  {item.prerequisite && (
                    <p className="text-[10px] text-brand-mid/60 mt-1 font-lora">
                      → {item.prerequisite}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-brand-dark/40 font-lora italic">
              No specific responsibilities were provided during intake.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

// ============================================================
// SECTION 9: FINANCIAL HEALTH CHECK
// ============================================================

const FinancialHealthCheck = ({ report }: { report: ReportData }) => {
  const pricing = report.compositeScores.pricingHealth;
  const fc = report.frictionCost;
  const hasData = pricing.level !== 'UNKNOWN' || fc.totalRange.high > 0;

  if (!hasData) return null;

  return (
    <section className="mb-12 animate-[fadeInUp_0.6s_ease-out_0.42s_both]">
      <div className={sectionLabel}>Financial Health Check</div>
      <div className={glassCard}>
        {/* Pricing Health */}
        {pricing.level !== 'UNKNOWN' && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl text-brand-dark flex items-center gap-3">
                <DollarSign size={18} className="text-brand-mid/60" />
                Pricing Health
              </h3>
              <div className="flex items-center gap-3">
                <ScoreRing score={pricing.score} size={48} />
                <SeverityBadge level={pricing.level as SeverityLevel} />
              </div>
            </div>
            {pricing.signals.length > 0 && (
              <div className="space-y-2">
                {pricing.signals.map((signal, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-dark/20 mt-1.5 shrink-0" />
                    <span className="text-sm text-brand-dark/60 font-lora">{signal}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Friction Cost Breakdown */}
        {fc.totalRange.high > 0 && (
          <div>
            <div className="h-px bg-brand-dark/5 mb-8" />
            <h3 className="font-serif text-xl text-brand-dark mb-5 flex items-center gap-3">
              <BarChart3 size={18} className="text-brand-mid/60" />
              Annual Friction Cost
            </h3>
            <div className="space-y-3 mb-6">
              {/* Low-value hours */}
              {fc.lowValueHoursCost.annualCost.high > 0 && (
                <div className="flex items-center justify-between py-2 border-b border-brand-dark/5">
                  <div>
                    <div className="text-sm text-brand-dark/70">Low-value hours (founder doing admin work)</div>
                    <div className="text-[11px] text-brand-dark/30 font-lora">{fc.lowValueHoursCost.weeklyHours} hrs/week × hourly rate × 48 weeks</div>
                  </div>
                  <span className="text-sm font-medium text-brand-dark/70 whitespace-nowrap">
                    {formatDollarCompact(fc.lowValueHoursCost.annualCost.low)} – {formatDollarCompact(fc.lowValueHoursCost.annualCost.high)}
                  </span>
                </div>
              )}

              {/* Revenue leakage */}
              {fc.revenueLeakage.acknowledged && fc.revenueLeakage.estimate.high > 0 && (
                <div className="flex items-center justify-between py-2 border-b border-brand-dark/5">
                  <div>
                    <div className="text-sm text-brand-dark/70">Revenue leakage (operational delays)</div>
                    <div className="text-[11px] text-brand-dark/30 font-lora">Estimated 3–8% of annual revenue</div>
                  </div>
                  <span className="text-sm font-medium text-brand-dark/70 whitespace-nowrap">
                    {formatDollarCompact(fc.revenueLeakage.estimate.low)} – {formatDollarCompact(fc.revenueLeakage.estimate.high)}
                  </span>
                </div>
              )}

              {/* Tool zombie cost */}
              {fc.toolZombieCost.annualWaste > 0 && (
                <div className="flex items-center justify-between py-2 border-b border-brand-dark/5">
                  <div>
                    <div className="text-sm text-brand-dark/70">Unused software subscriptions</div>
                    <div className="text-[11px] text-brand-dark/30 font-lora">{formatDollarCompact(fc.toolZombieCost.monthlyWaste)}/month estimated</div>
                  </div>
                  <span className="text-sm font-medium text-brand-dark/70 whitespace-nowrap">
                    {formatDollarCompact(fc.toolZombieCost.annualWaste)}
                  </span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="bg-brand-dark/[0.03] rounded-2xl p-5 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-brand-dark">Estimated Total</div>
                <div className="text-[10px] text-brand-dark/30 uppercase tracking-wider">{fc.confidenceLevel} estimate</div>
              </div>
              <span className="font-serif text-2xl text-brand-dark">
                {formatDollarCompact(fc.totalRange.low)} – {formatDollarCompact(fc.totalRange.high)}
              </span>
            </div>
            <p className="text-[10px] text-brand-dark/25 mt-3 text-center italic">
              These are directional estimates based on your responses — not audited financials.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

// ============================================================
// SECTION 10: YOUR ROADMAP
// ============================================================

const phaseIcons = [
  <Zap size={18} />,
  <FileText size={18} />,
  <TrendingUp size={18} />,
];

const YourRoadmap = ({ phases }: { phases: EnrichedPhase[] }) => (
  <section className="mb-12 animate-[fadeInUp_0.6s_ease-out_0.45s_both]">
    <div className={sectionLabel}>Your Roadmap</div>
    <div className="space-y-4 relative">
      {/* Connector line */}
      <div className="absolute left-6 top-8 bottom-8 w-px bg-brand-dark/10 hidden md:block print:hidden" />

      {phases.map((phase, idx) => (
        <div key={idx} className={`${glassCard} p-6 md:p-8 relative`}>
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-full bg-brand-dark text-white flex items-center justify-center shrink-0 relative z-10">
              {phaseIcons[idx] || <ChevronRight size={18} />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h3 className="font-serif text-xl text-brand-dark">{phase.name}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-brand-dark/5 text-[10px] font-bold uppercase tracking-wider text-brand-dark/40">
                  {phase.timeframe}
                </span>
              </div>
              <p className="text-sm text-brand-dark/50 font-lora leading-relaxed">{phase.description}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 ml-0 md:ml-16">
            {phase.actions.map((action, aIdx) => (
              <div key={aIdx} className="bg-white/50 rounded-xl p-4 border border-white/60">
                <p className="text-sm text-brand-dark/80 leading-relaxed mb-2">{action.task}</p>
                <div className="flex items-start gap-2">
                  <Check size={10} className="text-green-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-green-700/60 font-lora leading-relaxed">
                    {action.whatGoodLooksLike}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Success criteria */}
          <div className="mt-5 ml-0 md:ml-16 bg-brand-dark/[0.03] rounded-xl p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-dark/30 mb-1">
              Success Criteria
            </div>
            <p className="text-xs text-brand-dark/60 font-lora">{phase.successCriteria}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

// ============================================================
// SECTION 11: WHAT WE HEARD
// ============================================================

const WhatWeHeard = ({
  founderVoice,
  businessName,
}: {
  founderVoice: ReportData['founderVoice'];
  businessName: string;
}) => {
  const hasContent = founderVoice.biggestFrustration || founderVoice.strategicWorkMissing || (founderVoice.superpowers && founderVoice.superpowers.length > 0);
  if (!hasContent) return null;

  return (
    <section className="mb-12 animate-[fadeInUp_0.6s_ease-out_0.5s_both]">
      <div className={sectionLabel}>What We Heard</div>
      <div className={`${glassCard} p-6 md:p-8`}>
        {/* Biggest frustration */}
        {founderVoice.biggestFrustration && (
          <div className="mb-8">
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-dark/30 mb-3">
              In Your Words
            </div>
            <div className="bg-brand-dark/[0.03] rounded-2xl p-5 border-l-4 border-brand-mid/30">
              <p className="font-lora text-brand-dark/70 text-lg leading-relaxed italic">
                &ldquo;{founderVoice.biggestFrustration}&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* Strategic work missing */}
        {founderVoice.strategicWorkMissing && (
          <div className="mb-8">
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-dark/30 mb-3">
              Strategic Work You&apos;re Missing
            </div>
            <p className="text-sm text-brand-dark/70 font-lora leading-relaxed">
              You said you&apos;re &ldquo;too busy&rdquo; for: <span className="font-medium text-brand-dark">{founderVoice.strategicWorkMissing}</span>
            </p>
            <p className="text-xs text-brand-dark/40 font-lora mt-2">
              The roadmap above is designed to create space for exactly this.
            </p>
          </div>
        )}

        {/* Superpowers */}
        {founderVoice.superpowers && founderVoice.superpowers.length > 0 && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-dark/30 mb-3">
              Your Superpowers
            </div>
            <div className="flex flex-wrap gap-3 mb-3">
              {founderVoice.superpowers.map((sp, idx) => (
                <span key={idx}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-dark text-white text-sm font-medium">
                  <Sparkles size={12} />
                  {sp}
                </span>
              ))}
            </div>
            <p className="text-xs text-brand-dark/40 font-lora italic">
              These are what make {businessName} special. The goal isn&apos;t to replace them — it&apos;s to free you up to do more of this.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

// ============================================================
// SECTION 12: NEXT STEPS
// ============================================================

const NextSteps = ({ phases, onBack }: { phases: EnrichedPhase[]; onBack: () => void }) => {
  const steps: string[] = [];
  // Pull first two actions from Phase 1
  if (phases[0]) {
    phases[0].actions.slice(0, 2).forEach(a => steps.push(a.task));
  }
  // CTA as third step
  steps.push('Book a 30-minute walkthrough to discuss this report and ask questions.');

  return (
    <section className="animate-[fadeInUp_0.6s_ease-out_0.55s_both]">
      <div className={sectionLabel}>Next Steps</div>
      <div className="bg-sage-300/15 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] border border-white/80 shadow-[0_2px_8px_-3px_rgba(36,14,56,0.15)]">
        <h2 className="font-serif text-2xl md:text-3xl text-brand-dark mb-6">
          Where to go from here
        </h2>
        <div className="space-y-4 mb-8">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-brand-dark text-white flex items-center justify-center shrink-0 text-sm font-bold">
                {idx + 1}
              </div>
              <p className="text-sm text-brand-dark/70 font-lora leading-relaxed pt-1.5">{step}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <p className="text-[10px] text-brand-dark/30 uppercase tracking-widest">
            Prepared by Afterload · Business Clarity Report
          </p>
        </div>
      </div>
    </section>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function FullReport({ intakeData, onBack }: FullReportProps) {
  const report = useMemo(
    () => (intakeData ? runDiagnostic(intakeData).report : null),
    [intakeData]
  );

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-brand-dark/40 font-lora">No intake data available.</p>
        <button onClick={onBack} className="mt-4 text-sm text-brand-mid underline">Go back</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full relative overflow-hidden">
      <ReportHeader report={report} onBack={onBack} />
      <main className="w-full max-w-3xl mx-auto px-6 pb-32 relative z-10">
        <ExecutiveSummary report={report} />
        <ScoreCards scores={report.compositeScores} />
        <PrimaryConstraint report={report} />
        <ProcessHealthMap heatmap={report.heatmap} />
        <PressurePoints points={report.enrichedPressurePoints} />
        <SuccessTrap narrative={report.successTrapNarrative} />
        <DelegationReadiness
          extraction={report.extractionReadiness}
          matrix={report.delegationMatrix}
          businessName={report.businessName}
        />
        <FinancialHealthCheck report={report} />
        <YourRoadmap phases={report.enrichedPhases} />
        <WhatWeHeard founderVoice={report.founderVoice} businessName={report.businessName} />
        <NextSteps phases={report.enrichedPhases} onBack={onBack} />
      </main>
    </div>
  );
}
