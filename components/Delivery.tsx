import React from 'react';
import { useInView } from '../utils/useInView';
import { Map, Zap, ArrowRight } from 'lucide-react';

const deliverables = [
  {
    title: "Constraint Analysis",
    body: "We identify your <b>primary operational bottleneck</b> — whether it's capacity, cognitive overload, or founder dependency — and map the root cause, not just the symptoms.",
    icon: Map
  },
  {
    title: "Operational Health Map",
    body: "A stage-by-stage assessment across your business lifecycle: sales, onboarding, delivery, approvals, growth, systems, and transferability. <b>Green, yellow, or red</b> — no guessing.",
    icon: Zap
  },
  {
    title: "Phased Roadmap",
    body: "What to fix first, what to <b>ignore for now</b>, and a clear next step: DIY path, scoped fix, or full implementation build. <b>No pressure attached</b> — just clarity.",
    icon: ArrowRight
  }
];

const WhatYouGet: React.FC = () => {
  const { ref: inViewRef, isInView } = useInView();
  return (
    <section className="py-24 px-6 bg-transparent relative z-10">
      <div className="max-w-4xl mx-auto">
        <div
          ref={inViewRef}
          className={`bg-sage-300/15 rounded-[2.5rem] p-8 md:p-16 border border-white/80 shadow-[0_2px_8px_-3px_rgba(36,14,56,0.3)] ${isInView ? 'animate-[scaleIn_0.8s_ease-out_both]' : 'opacity-0'}`}
        >
          <div className="max-w-3xl mx-auto">
            {/* Heading Section */}
            <div className="mb-20">
              <div className="mb-4">
                <span className={`text-xs font-bold tracking-[0.2em] text-brand-mid/70 uppercase transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  Your Assets
                </span>
              </div>

              <h2 className="font-serif text-5xl md:text-7xl text-brand-dark mb-6 leading-tight">
                <span className={`inline-block text-brand-deep transition-all duration-700 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>Clarity, </span><br />
                <span className={`inline-block italic text-brand-rich/75 transition-all duration-700 delay-200 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}> delivered.</span>
              </h2>

              <p
                className={`text-lg md:text-xl text-brand-dark/60 max-w-2xl font-lora transition-all duration-700 delay-300 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              > I sort the mess. You get something you can actually use.
              </p>
            </div>

            {/* Deliverables List */}
            <div>
              {deliverables.map((item, idx) => (
                <div
                  key={idx}
                  className="mt-12 first:mt-0"
                  style={{ animation: isInView ? `fadeInUp 0.6s ease-out ${idx * 0.2}s both` : 'none', opacity: isInView ? undefined : 0 }}
                >
                  <div className="h-px bg-brand-dark/10" />
                  <div className="flex items-start gap-6 md:gap-8 pt-12">
                    <div className="mt-1 text-brand-accent/80">
                      <item.icon size={50} strokeWidth={.5} />
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl text-brand-deep mb-2">{item.title}</h3>
                      <p
                        className="text-brand-deep/70 text-base leading-relaxed font-lora"
                        dangerouslySetInnerHTML={{ __html: item.body }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatYouGet;