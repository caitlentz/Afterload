import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
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
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold tracking-[0.2em] text-brand-mid/90 uppercase mb-6"
          >
            The Anti-Pitch
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif text-brand-deep leading-[0.9]"
          >
            Protect <br />
            <span className="italic text-brand-deep/70">your energy.</span>
          </motion.h2>
        </div>

        {/* Vertical Editorial List */}
        <div className="space-y-4">
          {items.map((item, index) => (
            <ListItem key={index} item={item} index={index} isLast={index === items.length - 1} />
          ))}
        </div>
        
        {/* Footer Quote Area matching screenshot */}
        <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-20 pt-12 border-t border-brand-dark/10 flex flex-col md:flex-row justify-between items-end gap-8"
        >
            <p className="font-lora italic text-brand-dark/60 text-lg md:text-xl max-w-md leading-relaxed">
                "The industry is built on dependency. Afterload is built on autonomy."
            </p>
            
            <div className="flex items-center gap-4 opacity-30">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-dark">Signal Only</span>
                <div className="w-16 h-px bg-brand-dark"></div>
            </div>
        </motion.div>

      </div>
    </section>
  );
}

const ListItem = ({ item, index, isLast }: { item: any, index: number, isLast: boolean, key?: React.Key }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 75%", "end 25%"]
  });

  // Create a bell-curve activation zone in the center of the viewport
  const active = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  // Interpolate styles based on active state
  // Background: Transparent -> cream-50 (with opacity)
  const backgroundColor = useTransform(active, [0, 1], ["rgba(255, 255, 255, 0)", "rgba(246, 246, 244, 0.5)"]); 
  
  // Borders: 
  // Side/Top borders fade from transparent to brand-pale
  const borderSideColor = useTransform(active, [0, 1], ["rgba(240, 237, 234, 0)", "rgba(240, 237, 234, 1)"]);
  // Bottom border transitions from faint separator to brand-pale
  const borderBottomColor = useTransform(
      active, 
      [0, 1], 
      [isLast ? "rgba(45, 40, 51, 0)" : "rgba(45, 40, 51, 0.1)", "rgba(240, 237, 234, 1)"]
  ); 

  // Shadow: None -> Large soft shadow
  const shadow = useTransform(active, [0, 1], ["0px 0px 0px 0px rgba(0,0,0,0)", "0px 12px 8px -15px rgba(36,14,56,.5)"]);
  
  // Scales
  const scale = useTransform(active, [0, 1], [1, 1.05]);
  
  // Text Colors
  // Number: Faint purple -> Brand soft
  const numberColor = useTransform(active, [0, 1], ["rgba(211, 196, 207, 1)", "rgba(233, 225, 227, 1)"]); 
  // Title: Faint mid -> Brand mid
  const titleColor = useTransform(active, [0, 1], ["rgba(153, 134, 146, 1)", "rgba(153, 134, 146, 1)"]); 

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
      style={{
          backgroundColor,
          borderTopColor: borderSideColor,
          borderLeftColor: borderSideColor,
          borderRightColor: borderSideColor,
          borderBottomColor: borderBottomColor,
          boxShadow: shadow
      }}
      className="group relative border py-10 px-6 -mx-6 rounded-3xl transition-colors duration-500"
    >
      <div className="flex flex-col relative z-10">
        
        {/* Top Row: Number & Icon */}
        <div className="flex justify-between items-start w-full mb-6">
            <motion.span 
                style={{ color: numberColor, scale }}
                className="font-serif text-8xl leading-none select-none origin-left"
            >
                0{index + 1}
            </motion.span>
            
            <motion.div 
                style={{ scale }}
                className="w-12 h-12 rounded-full border border-brand-mid/60 bg-brand-soft/30 text-brand-mid/60 flex items-center justify-center origin-center"
            >
                {item.icon}
            </motion.div>
        </div>

        {/* Content Row */}
        <div className="pr-4 md:pr-8">
            <motion.h3 
                style={{ color: titleColor }}
                className="text-sm font-bold tracking-[0.15em] uppercase mb-4"
            >
                {item.title}
            </motion.h3>
            <p className="font-serif text-xl md:text-3xl text-brand-primary/80 leading-tight">
                {item.description}
            </p>
        </div>

      </div>
    </motion.div>
  )
}