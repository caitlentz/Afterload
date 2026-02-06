import React from 'react';
import { motion, Variants } from 'framer-motion';
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

const headingContainerVariants: Variants = {
  visible: { transition: { staggerChildren: 0.15 } }
};

const headingWordVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }
};

const listContainerVariants: Variants = {
  visible: { transition: { staggerChildren: 0.3 } }
};

const listItemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const lineVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.5, ease: 'easeOut' } }
};

const contentVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut', delay: 0.2 } }
};

const WhatYouGet: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-transparent relative z-10">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="bg-sage-300/15 rounded-[2.5rem] p-8 md:p-16 border border-white/80 shadow-[0_2px_8px_-3px_rgba(36,14,56,0.3)]"
        >
          <div className="max-w-3xl mx-auto">
            {/* Heading Section */}
            <motion.div 
              className="mb-20"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={headingContainerVariants}
            >
              <motion.div
                variants={headingWordVariants}
                className="mb-4"
              >
                <span className="text-xs font-bold tracking-[0.2em] text-brand-mid/70 uppercase">
                  Your Assets
                </span>
              </motion.div>

              <motion.h2 
                variants={headingContainerVariants}
                className="font-serif text-5xl md:text-7xl text-brand-dark mb-6 leading-tight"
              >
                <motion.span variants={headingWordVariants} className="inline-block text-brand-deep">Clarity, </motion.span><br />
                <motion.span variants={headingWordVariants} className="inline-block italic text-brand-rich/75"> delivered.</motion.span>
              </motion.h2>

              <motion.p 
                className="text-lg md:text-xl text-brand-dark/60 max-w-2xl font-lora"
                variants={headingWordVariants}
              > I sort the mess. You get something you can actually use.
              </motion.p>
            </motion.div>

            {/* Deliverables List */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={listContainerVariants}
            >
              {deliverables.map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={listItemVariants}
                  className="mt-12 first:mt-0"
                >
                  <motion.div 
                    className="h-px bg-brand-dark/10"
                    variants={lineVariants}
                    style={{ transformOrigin: 'left' }}
                  />
                  <motion.div
                    variants={contentVariants}
                    className="flex items-start gap-6 md:gap-8 pt-12"
                  >
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
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhatYouGet;