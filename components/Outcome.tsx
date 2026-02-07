import React, { useRef } from 'react';
// Outcome.tsx is currently unused (not imported anywhere)

const steps = [
  {
    num: "01",
    title: "Fast Intake",
    body: "<b>5 minutes. No essays.</b> Just enough signal for us to see the core problem. We respect your time and executive function."
  },
  {
    num: "02",
    title: "Targeted Questions",
    body: "We analyze your intake to ask <b>what actually matters</b> — not a generic business quiz. This is about precision, not volume."
  },
  {
    num: "03",
    title: "Actionable Diagnostic",
    body: "You get a clear map and a direct recommendation. <b>No call required.</b> It's a concrete plan you can use immediately."
  }
];

interface StepCardProps {
    num: string;
    title: string;
    body: string;
    progress: any; // MotionValue
}

const StepCard: React.FC<StepCardProps> = ({ num, title, body, progress }) => {
    const scale = useTransform(progress, [0, 0.3, 0.6, 0.9], [0.95, 1, 1, 0.95]);
    const y = useTransform(progress, [0, 1], ['10px', '-10px']);

    return (
        <motion.div 
            style={{ scale, y }}
            // Reduced vertical spacing
            className="py-12 md:min-h-[60vh] flex items-center justify-center relative"
        >
            <div className="relative w-full p-8 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/60 shadow-lg">
                <span className="absolute -top-16 -left-4 font-serif text-8xl text-cream-50/80 -z-10 select-none">
                    {num}
                </span>
                <h3 className="font-serif text-3xl text-primary mb-3">{title}</h3>
                <p 
                    className="text-primary/70 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: body }}
                />
            </div>
        </motion.div>
    );
};

interface ProcessProps {
    onStartIntake?: () => void;
}

const Process: React.FC<ProcessProps> = ({ onStartIntake }) => {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ['start center', 'end end']
    });

    const pathLength = useTransform(scrollYProgress, [0, 0.9], [0, 1]);
    const dotY = useTransform(scrollYProgress, [0, 1], ['5%', '95%']);

    return (
        <section ref={targetRef} id="process" className="py-24 px-6 relative">
            <div className="text-center mb-20 max-w-2xl mx-auto">
                <h2 className="font-serif text-5xl md:text-7xl text-primary mb-4">
                    The Process In <br /><span className="italic text-lavender-500">
                    3 Steps</span>
                </h2>
                <p className="text-md text-primary/60 font-sans">
                    A simple, async process designed to unblock you, not overwhelm you.
                </p>
            </div>

            <div className="relative max-w-4xl mx-auto md:grid md:grid-cols-[auto_1fr] gap-12">
                {/* SVG Timeline */}
                <div className="hidden md:block sticky top-32 h-[calc(100vh-8rem)]">
                    <svg width="40" height="100%" viewBox="0 0 40 500" preserveAspectRatio="xMidYMin meet">
                        {/* The full path */}
                        <path
                            d="M 20 25 V 475"
                            stroke="#EBE5F0"
                            strokeWidth="4"
                            fill="none"
                        />
                        {/* The animated path */}
                        <motion.path
                            d="M 20 25 V 475"
                            stroke="url(#gradient)"
                            strokeWidth="4"
                            fill="none"
                            style={{ pathLength }}
                        />
                        {/* The glowing dot */}
                        <motion.circle 
                           cx="20"
                           cy={dotY}
                           r="8"
                           fill="white"
                           stroke="#7C5A92"
                           strokeWidth="3"
                        />
                        <motion.circle 
                           cx="20"
                           cy={dotY}
                           r="16"
                           fill="#7C5A92"
                           style={{ opacity: useTransform(scrollYProgress, p => p > 0 && p < 1 ? 0.2 : 0) }}
                        />

                        <defs>
                            <linearGradient id="gradient" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="500">
                                <stop stopColor="#7C5A92"/>
                                <stop offset="1" stopColor="#A091B4"/>
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* Steps Content */}
                <div>
                    {steps.map((step, idx) => {
                        const stepStart = idx / steps.length;
                        const stepEnd = (idx + 1) / steps.length;
                        const stepProgress = useTransform(scrollYProgress, [stepStart, stepEnd], [0, 1]);
                        
                        return <StepCard key={idx} {...step} progress={stepProgress} />;
                    })}
                </div>
            </div>
        </section>
    );
};

export default Process;