import React from 'react';
import { AlertCircle, MessageSquare, PauseCircle, Scaling, BatteryMedium } from 'lucide-react';

const symptomsList = [
  {
    icon: AlertCircle,
    title: "The Accidental Bottleneck",
    text: "<b>You are the bottleneck.</b> Every approval waits for you. Your team is blocked, even when you try not to be.",
    highlight: "Decision Fatigue",
    iconColor: "text-lavender-400/70",
    glowColor: "bg-lavender-400",
    pillStyle: "bg-lavender-50 text-lavender-900 border border-lavender-200",
  },
  {
    icon: MessageSquare,
    title: "Tribal Knowledge",
    text: "Work lives in Slack, texts, and <b>someone's memory (usually yours).</b> There is no single source of truth.",
    highlight: "Information Silos",
    iconColor: "text-lavender-400/70",
    glowColor: "bg-sage-400",
    pillStyle: "bg-cream-50 text-sage-700 border border-sage-200",
  },
  {
    icon: PauseCircle,
    title: "Ownership Void",
    text: "Your team pauses because <b>approvals and ownership aren't clean.</b> Initiatives stall without your direct push.",
    highlight: "Passive Waiting",
    iconColor: "text-lavender-400/70",
    glowColor: "bg-lavender-600",
    pillStyle: "bg-lavender-100 text-lavender-950 border border-lavender-300",
  },
  {
    icon: Scaling,
    title: "Tool Fatigue",
    text: "You've tried new tools. It helped for a week, then chaos took over. Now it's <b>just another login to ignore.</b>",
    highlight: "System Decay",
    iconColor: "text-lavender-400/70",
    glowColor: "bg-lavender-300",
    pillStyle: "bg-lavender-50 text-brand-deep border border-lavender-200",
  },
  {
    icon: BatteryMedium,
    title: "Low-Capacity Failure",
    text: "You need structure that still works on your <b>low-capacity days</b>, not just when you're hyper-focused.",
    highlight: "Sustainability",
    iconColor: "text-lavender-400/70",
    glowColor: "bg-brand-primary",
    pillStyle: "bg-white text-brand-primary border border-lavender-200",
  }
];

interface SymptomCardProps {
  item: typeof symptomsList[0];
  index: number;
}

const SymptomCard: React.FC<SymptomCardProps> = ({ item, index }) => {
  return (
    <div
      className="mb-4 md:mb-6 last:mb-0 relative animate-[fadeInUp_0.6s_ease-out_both]"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="group relative p-6 md:p-8 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-sm transition-all duration-500 hover:shadow-md hover:bg-white/50 overflow-hidden">

        <div className="relative z-10 flex items-start gap-2 md:gap-2">
            <div className="shrink-0 mt-1">
                <div className="w-15 h-15">
                    <item.icon size={70} strokeWidth={0.3} className={item.iconColor} />
                </div>
            </div>

            <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${item.pillStyle}`}>
                 {item.highlight}
              </span>
                </div>
                <p
                  className="text-sm md:text-base text-lavender-700/90 font-sans leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: item.text }}
                />
            </div>
        </div>
      </div>
    </div>
  );
};

interface SymptomsProps {
  onStartIntake?: () => void;
}

const Symptoms: React.FC<SymptomsProps> = ({ onStartIntake }) => {
  return (
    <section id="symptoms" className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 md:gap-24">

        {/* Connecting Line (The Spine) */}
        <div className="absolute left-[50%] md:left-[70%] top-40 bottom-20 w-px bg-gradient-to-b from-transparent via-brand-rich/20 to-transparent md:-translate-x-1/2" />

        {/* Sticky Header Section */}
        <div className="md:w-5/12">
            <div className="sticky top-32">
                <div className="mb-8">
                    <h2 className="relative z-10 text-6xl md:text-8xl font-serif text-brand-deep leading-[0.85] mb-10 tracking-tight">
            This is <br className="md:hidden"/>
            <span className="italic font-light bg-gradient-to-br from-brand-deep via-brand-rich to-brand-deep bg-clip-text text-transparent">probably</span>{' '}
            <span className="relative inline-block font-semibold bg-gradient-to-br from-brand-deep via-brand-rich to-brand-deep bg-clip-text text-transparent pb-1">
               you.
               {/* Underline decoration */}
               <svg
                className="absolute -bottom-2 md:-bottom-4 left-0 w-full h-3 md:h-4 text-brand-rich/30 origin-left"
                viewBox="0 0 100 15"
                preserveAspectRatio="none"
               >
                 <path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
               </svg>
            </span>
          </h2>
          {/* Side Quote Style */}
          <div
            className="relative z-10 flex justify-center mt-10 animate-[fadeInLeft_0.6s_ease-out_both]"
          >
            <div className="border-l-2 border-sage-400/30 pl-6 py-1 max-w-sm text-left">
                <p className="font-serif italic text-lg text-sage-600/80 leading-relaxed">
                    If any of this feels uncomfortably accurate, you're in the right place.
                </p>
            </div>
          </div>
        </div>
            </div>
        </div>

        {/* List Section */}
        <div className="md:w-7/12">
            {symptomsList.map((item, idx) => (
                <SymptomCard key={idx} item={item} index={idx} />
            ))}
        </div>

      </div>
    </section>
  );
};

export default Symptoms;