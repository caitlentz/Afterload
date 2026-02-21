import React, { useEffect, useRef, useState } from 'react';
import { PhoneOff, BellOff, FileText, Video } from 'lucide-react';

type Rgba = [number, number, number, number];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);
const mixRgba = (from: Rgba, to: Rgba, t: number) =>
  `rgba(${Math.round(lerp(from[0], to[0], t))}, ${Math.round(lerp(from[1], to[1], t))}, ${Math.round(lerp(from[2], to[2], t))}, ${lerp(from[3], to[3], t).toFixed(3)})`;

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
            className="text-xs font-bold tracking-[0.2em] text-brand-mid/75 uppercase mb-6 animate-[fadeInUp_0.6s_ease-out_both]"
          >
            The Anti-Pitch
          </div>

          <h2
            className="text-5xl md:text-7xl font-serif text-brand-deep leading-[0.9] animate-[fadeInUp_0.6s_ease-out_0.1s_both]"
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
            className="mt-20 pt-12 border-t border-brand-dark/10 flex flex-col md:flex-row justify-between items-end gap-8 animate-[fadeIn_0.7s_ease-out_0.5s_both]"
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

const ListItem = ({ item, index, isLast }: { item: { icon: React.ReactNode; title: string; description: string }, index: number, isLast: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let frame: number | null = null;

    const update = () => {
      const node = ref.current;
      if (!node) return;

      const rect = node.getBoundingClientRect();
      const start = window.innerHeight * 0.75;
      const end = window.innerHeight * 0.25;
      const distance = start - end + rect.height;
      const progress = clamp((start - rect.top) / distance, 0, 1);

      let value = 0;
      if (progress < 0.2) value = progress / 0.2;
      else if (progress <= 0.8) value = 1;
      else value = (1 - progress) / 0.2;

      setActive(clamp(value, 0, 1));
    };

    const onScroll = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(() => {
        frame = null;
        update();
      });
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const numberScale = 1 + 0.25 * active;
  const iconScale = 1 + 0.25 * active;
  const backgroundColor = mixRgba([255, 255, 255, 0], [246, 246, 244, 0.5], active);
  const borderSideColor = mixRgba([240, 237, 234, 0], [240, 237, 234, 1], active);
  const borderBottomColor = isLast
    ? mixRgba([45, 40, 51, 0], [240, 237, 234, 1], active)
    : mixRgba([45, 40, 51, 0.1], [240, 237, 234, 1], active);
  const boxShadow = `0px 12px 8px -15px rgba(36, 14, 56, ${(0.5 * active).toFixed(3)})`;
  const numberColor = mixRgba([211, 196, 207, 0.2], [233, 225, 227, 1], active);
  const titleColor = mixRgba([153, 134, 146, 0.2], [153, 134, 146, 1], active);

  return (
    <div
      ref={ref}
      className="group relative border py-10 px-6 -mx-6 rounded-3xl transition-colors duration-500 animate-[fadeInUp_0.6s_ease-out_both]"
      style={{
        animationDelay: `${index * 0.1}s`,
        backgroundColor,
        borderTopColor: borderSideColor,
        borderLeftColor: borderSideColor,
        borderRightColor: borderSideColor,
        borderBottomColor,
        boxShadow,
      }}
    >
      <div className="flex flex-col relative z-10">
        <div className="flex justify-between items-start w-full mb-6">
          <span
            className="font-serif text-8xl leading-none select-none origin-left"
            style={{ color: numberColor, transform: `scale(${numberScale})` }}
          >
            0{index + 1}
          </span>
          <div
            className="w-12 h-12 rounded-full border border-brand-mid/60 bg-brand-soft/30 text-brand-mid/60 flex items-center justify-center origin-center"
            style={{ transform: `scale(${iconScale})` }}
          >
            {item.icon}
          </div>
        </div>
        <div className="pr-4 md:pr-8">
          <h3 className="text-sm font-bold tracking-[0.15em] uppercase mb-4 transition-colors duration-500" style={{ color: titleColor }}>
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
