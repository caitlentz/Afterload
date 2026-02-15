import React from 'react';
import { PhoneOff, BellOff, FileText, Video } from 'lucide-react';

export default function AntiPitch() {
  const items = [
    {
      icon: <PhoneOff size={22} strokeWidth={1} />,
      title: "No Discovery Calls",
      description: "I'm not going to sell you a call. No discovery funnels. No pressure.",
    },
    {
      icon: <BellOff size={22} strokeWidth={1} />,
      title: "No False Urgency",
      description: "I won't manufacture crises. Artificial pressure destroys executive function. We build for calm, not chaos.",
    },
    {
      icon: <FileText size={22} strokeWidth={1} />,
      title: "No Generic Playbooks",
      description: "I won't hand you a template that works for 'everyone else.' We map the specific friction in your reality.",
    },
    {
      icon: <Video size={22} strokeWidth={1} />,
      title: "No Time Denial",
      description: "I won't pretend you have unlimited executive function. Built for low-bandwidth reality.",
    }
  ];

  return (
    <section className="py-24 md:py-40 px-6 relative z-10">
      <div className="max-w-2xl mx-auto">

        {/* Header - New variation */}
        <div className="text-center mb-24 md:mb-32">
          <div
            className="text-xs font-bold tracking-[0.2em] text-brand-mid/90 uppercase mb-6"
          >
            The Anti-Pitch
          </div>

          <h2
            className="text-5xl md:text-7xl font-serif text-brand-deep leading-[0.9]"
          >
            Protect <br />
            <span className="italic text-brand-deep/70">your energy.</span>
          </h2>
        </div>

        {/* Vertical Editorial List */}
        <div className="space-y-4">
          {items.map((item, index) => (
            <ListItem key={index} item={item} index={index} isLast={index === items.length - 1} />
          ))}
        </div>

        {/* Footer Quote Area matching screenshot */}
        <div
            className="mt-20 pt-12 border-t border-brand-dark/10 flex flex-col md:flex-row justify-between items-end gap-8"
        >
            <p className="font-lora italic text-brand-dark/60 text-lg md:text-xl max-w-md leading-relaxed">
                "The industry is built on dependency. Afterload is built on autonomy."
            </p>

            <div className="flex items-center gap-4 opacity-30">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-dark">Signal Only</span>
                <div className="w-16 h-px bg-brand-dark"></div>
            </div>
        </div>

      </div>
    </section>
  );
}

const ListItem = ({ item, index, isLast }: { item: any, index: number, isLast: boolean }) => {
  return (
    <div
      className="group relative border py-10 px-6 -mx-6 rounded-3xl bg-cream-50/50 border-brand-pale shadow-[0_12px_8px_-15px_rgba(36,14,56,0.5)]"
    >
      <div className="flex flex-col relative z-10 animate-[fadeInUp_0.6s_ease-out_both]" style={{ animationDelay: `${index * 0.1}s` }}>
        <div className="flex justify-between items-start w-full mb-6">
          <span className="font-serif text-8xl leading-none select-none origin-left text-brand-soft">
            0{index + 1}
          </span>
          <div className="w-12 h-12 rounded-full border border-brand-mid/60 bg-brand-soft/30 text-brand-mid/60 flex items-center justify-center">
            {item.icon}
          </div>
        </div>
        <div className="pr-4 md:pr-8">
          <h3 className="text-sm font-bold tracking-[0.15em] uppercase mb-4 text-brand-mid transition-colors duration-500">
            {item.title}
          </h3>
          <p className="font-serif text-xl md:text-3xl text-brand-primary/80 leading-tight">
            {item.description}
          </p>
        </div>
      </div>
    </div>
  );
};
