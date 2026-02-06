import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const Background: React.FC = () => {
  const { scrollYProgress } = useScroll();

  // Orb 1: Moves gently + Rotate Clockwise
  const x1 = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);
  const y1 = useTransform(scrollYProgress, [0, 1], ['-10%', '20%']);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 120]);

  // Orb 2: Moves opposing + Rotate Counter-Clockwise
  const x2 = useTransform(scrollYProgress, [0, 1], ['10%', '-5%']);
  const y2 = useTransform(scrollYProgress, [0, 1], ['10%', '-20%']);
  const rotate2 = useTransform(scrollYProgress, [0, 1], [0, -90]);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden z-0 pointer-events-none bg-brand-bg">
      <div className="absolute inset-0 w-full h-full">
        {/* Orb 1 — soft warm wash */}
        <motion.div
          style={{ x: x1, y: y1, rotate: rotate1, willChange: 'transform' }}
          className="absolute -top-[20%] -left-[10%] w-[100vw] h-[50vw] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] bg-sage-300/40 blur-[150px]"
        />
      </div>
        {/* Orb 2 — cool accent */}
        <motion.div
          style={{ x: x2, y: y2, rotate: rotate2, willChange: 'transform' }}
          className="absolute top-[20%] -right-[20%] w-[80vw] h-[80vw] rounded-[60%_40%_30%_70%/60%_30%_70%_40%] bg-brand-lilac/40 blur-[200px]"
        />

    </div>
  );
};

export default Background;