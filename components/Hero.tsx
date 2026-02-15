import React, { lazy, Suspense, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { IntakeResponse } from '../utils/diagnosticEngine';
import Footer from './Footer';

const Intake = lazy(() => import('./Intake'));

interface HeroProps {
  onDiagnosticComplete: (answers: IntakeResponse) => void;
  onLoginClick: () => void;
  userEmail?: string | null;
}

/* ── Static Data ──────────────────────────────────────────────── */

const problems = [
  {
    title: 'You are the bottleneck',
    body: 'Every approval, every decision, every client issue routes through you. Your team waits. Work stalls.',
  },
  {
    title: 'Nothing is written down',
    body: "Processes live in your head, in Slack threads, in someone's memory. If you disappeared for a week, things would break.",
  },
  {
    title: "You've tried tools before",
    body: 'New software, new systems, new workflows. They work for a week, then entropy wins. The problem was never the tool.',
  },
  {
    title: 'Low days cost you everything',
    body: "When your energy drops, the whole business slows down. There's no system that runs without your executive function at full capacity.",
  },
];

const deliverables = [
  {
    title: 'Constraint Analysis',
    body: 'We identify your primary operational bottleneck \u2014 whether it\u2019s capacity, cognitive overload, or founder dependency \u2014 and map the root cause.',
  },
  {
    title: 'Operational Health Map',
    body: 'A stage-by-stage assessment across sales, delivery, approvals, and systems. Green, yellow, or red. No guessing.',
  },
  {
    title: 'Phased Roadmap',
    body: 'What to fix first, what to ignore for now, and a clear next step. DIY path, scoped fix, or full implementation. No pressure attached.',
  },
];

const steps = [
  {
    label: 'Step 1',
    title: 'Take the diagnostic',
    body: 'Answer a structured intake about your business, team, and operations. Takes about 15 minutes. Free.',
  },
  {
    label: 'Step 2',
    title: 'Get your preview',
    body: 'Immediately see where your primary bottleneck is and what constraint pattern your business fits. This preview is free.',
  },
  {
    label: 'Step 3',
    title: 'Unlock the full report',
    body: 'Pay $1,200 to unlock your complete constraint analysis, health map, and phased roadmap. Written for you, not a template.',
  },
];

const faqs = [
  {
    question: 'Is this a sales funnel for consulting?',
    answer:
      'No. The diagnostic is the product. If you want help implementing the recommendations, you can ask. If not, you keep the report and we leave you alone.',
  },
  {
    question: 'What exactly do I get for $1,200?',
    answer:
      'A written constraint analysis, an operational health map, and a phased roadmap. All specific to your business. Not a template.',
  },
  {
    question: "What if I don't have all my numbers ready?",
    answer:
      "Estimates are fine. We need to know the shape of the problem, not your exact P&L. Directional accuracy is enough.",
  },
  {
    question: 'How long does it take?',
    answer:
      'The intake takes about 15 minutes. You get your preview immediately. The full report is delivered after a clarity session, typically within one week.',
  },
  {
    question: 'Is this built for neurodivergent founders?',
    answer:
      "Yes. The diagnostic, the report structure, and the recommendations are all designed to work on low-bandwidth days. No walls of text. No 90-day action plans you'll never touch.",
  },
];

/* ── Component ────────────────────────────────────────────────── */

export default function Hero({
  onDiagnosticComplete,
  onLoginClick,
  userEmail,
}: HeroProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleScrollToIntake = () => {
    const el = document.getElementById('intake');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex flex-col w-full">

      {/* ── 1. HERO ───────────────────────────────────────────── */}
      <section className="w-full px-6 pt-32 pb-20 md:pt-40 md:pb-28 relative overflow-hidden">

        {/* Abstract hero visual — large faded logo behind headline */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] w-[280px] h-[280px] md:w-[420px] md:h-[420px] opacity-[0.06] pointer-events-none select-none">
          <img src="/logo.png" alt="" className="w-full h-full object-contain" draggable={false} />
        </div>

        <div
          className="max-w-2xl mx-auto text-center relative z-10"
          style={{ animation: 'fadeIn 0.8s ease-out' }}
        >
          {/* Logo mark */}
          <div className="flex justify-center mb-6" style={{ animation: 'fadeIn 0.6s ease-out' }}>
            <img src="/logo.png" alt="Afterload" className="w-10 h-10 md:w-12 md:h-12" />
          </div>

          <p
            className="text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-brand-mid mb-8"
            style={{ animation: 'fadeInUp 0.7s ease-out 0.1s backwards' }}
          >
            Operational Diagnostic for Founder-Led Businesses
          </p>

          <h1
            className="font-serif text-4xl md:text-6xl lg:text-7xl text-brand-dark leading-[1.1] mb-6"
            style={{ animation: 'fadeInUp 0.7s ease-out 0.2s backwards' }}
          >
            Your business grew.
            <br />
            <span className="italic text-brand-rich">Your systems didn't.</span>
          </h1>

          <p
            className="font-sans text-lg md:text-xl text-brand-primary leading-relaxed max-w-xl mx-auto mb-10"
            style={{ animation: 'fadeInUp 0.7s ease-out 0.35s backwards' }}
          >
            Afterload maps where your business depends on you — and gives you a
            plan to change that.
          </p>

          <div style={{ animation: 'fadeInUp 0.7s ease-out 0.5s backwards' }}>
            <button
              onClick={handleScrollToIntake}
              className="px-8 py-4 bg-brand-deep text-white text-sm font-semibold tracking-wide rounded-full hover:bg-brand-rich hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Start the Diagnostic
            </button>

            <p className="mt-4 text-sm text-brand-mid">
              Free intake. No calls. No pressure.
            </p>
            <p className="mt-2 text-xs text-brand-mid/60">
              Full diagnostic: $1,200
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. PROBLEM ────────────────────────────────────────── */}
      <section className="w-full px-6 py-20 md:py-28 bg-brand-pale">
        <div
          className="max-w-3xl mx-auto"
          style={{ animation: 'fadeInUp 0.7s ease-out 0.1s backwards' }}
        >
          <p className="text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-brand-mid mb-4">
            The Pattern
          </p>
          <h2 className="font-serif text-3xl md:text-5xl text-brand-dark mb-12 md:mb-16">
            Sound familiar?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {problems.map((item, idx) => (
              <div
                key={item.title}
                className="border-t border-brand-dark/10 pt-6"
                style={{ animation: `fadeInUp 0.6s ease-out ${0.15 + idx * 0.1}s backwards` }}
              >
                <h3 className="font-sans text-sm font-semibold tracking-wide uppercase text-brand-deep mb-3">
                  {item.title}
                </h3>
                <p className="font-serif text-lg text-brand-primary leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. WHAT YOU GET ───────────────────────────────────── */}
      <section className="w-full px-6 py-20 md:py-28">
        <div className="max-w-4xl mx-auto">
          <p
            className="text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-brand-mid mb-4"
            style={{ animation: 'fadeInUp 0.7s ease-out 0.1s backwards' }}
          >
            What You Get
          </p>
          <h2
            className="font-serif text-3xl md:text-5xl text-brand-dark mb-12 md:mb-16"
            style={{ animation: 'fadeInUp 0.7s ease-out 0.15s backwards' }}
          >
            Three deliverables. Zero fluff.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {deliverables.map((item, idx) => (
              <div
                key={item.title}
                className="group"
                style={{ animation: `fadeInUp 0.6s ease-out ${0.2 + idx * 0.1}s backwards` }}
              >
                <span className="font-serif text-5xl text-brand-soft block mb-4 group-hover:text-brand-accent transition-colors duration-300">
                  0{idx + 1}
                </span>
                <h3 className="font-sans text-sm font-semibold tracking-wide uppercase text-brand-deep mb-3">
                  {item.title}
                </h3>
                <p className="font-serif text-base text-brand-primary leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. HOW IT WORKS ───────────────────────────────────── */}
      <section className="w-full px-6 py-20 md:py-28 bg-sage-300/30">
        <div className="max-w-4xl mx-auto">
          <p
            className="text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-brand-mid mb-4"
            style={{ animation: 'fadeInUp 0.7s ease-out 0.1s backwards' }}
          >
            How It Works
          </p>
          <h2
            className="font-serif text-3xl md:text-5xl text-brand-dark mb-12 md:mb-16"
            style={{ animation: 'fadeInUp 0.7s ease-out 0.15s backwards' }}
          >
            Three steps to clarity.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {steps.map((step, idx) => (
              <div
                key={step.title}
                className="border-l-2 border-brand-deep/30 pl-6 hover:border-brand-deep transition-colors duration-300"
                style={{ animation: `fadeInUp 0.6s ease-out ${0.2 + idx * 0.1}s backwards` }}
              >
                <p className="text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-brand-mid mb-2">
                  {step.label}
                </p>
                <h3 className="font-serif text-xl text-brand-dark mb-3">
                  {step.title}
                </h3>
                <p className="font-sans text-sm text-brand-primary leading-relaxed">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. FAQ ────────────────────────────────────────────── */}
      <section className="w-full px-6 py-20 md:py-28">
        <div className="max-w-2xl mx-auto">
          <p className="text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-brand-mid mb-4">
            Questions
          </p>
          <h2 className="font-serif text-3xl md:text-5xl text-brand-dark mb-12">
            Before you start.
          </h2>

          <div className="border-t border-brand-dark/10">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border-b border-brand-dark/10">
                <button
                  onClick={() =>
                    setOpenFaq(openFaq === idx ? null : idx)
                  }
                  className="w-full py-6 flex items-center justify-between text-left group"
                >
                  <span
                    className={`font-serif text-lg md:text-xl pr-4 transition-colors duration-200 ${
                      openFaq === idx
                        ? 'text-brand-deep'
                        : 'text-brand-dark group-hover:text-brand-rich'
                    }`}
                  >
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-brand-mid transition-transform duration-200 ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-200 ${
                    openFaq === idx
                      ? 'grid-rows-[1fr] opacity-100'
                      : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pb-6 font-sans text-base text-brand-primary leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA repeat before intake ──────────────────────────── */}
      <section className="w-full px-6 py-16 text-center">
        <p className="font-serif text-2xl md:text-3xl text-brand-dark mb-6">
          Ready to see where the strain is?
        </p>
        <button
          onClick={handleScrollToIntake}
          className="px-8 py-4 bg-brand-deep text-white text-sm font-semibold tracking-wide rounded-full hover:bg-brand-rich hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          Start the Diagnostic
        </button>
      </section>

      {/* ── 6. INTAKE (existing component) ────────────────────── */}
      <Suspense fallback={<div className="min-h-[60vh]" />}>
        <Intake onComplete={onDiagnosticComplete} userEmail={userEmail} />
      </Suspense>

      {/* ── 7. FOOTER (existing component) ────────────────────── */}
      <Footer onLoginClick={onLoginClick} />
    </div>
  );
}
