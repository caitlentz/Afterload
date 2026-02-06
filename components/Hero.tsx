import React from 'react';
import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion';
import { ArrowRight, ArrowDown } from 'lucide-react';
import SelfDiagnosis from './SelfDiagnosis';
import Delivery from './Delivery';
import Outcome from './Outcome';
import AntiPitch from './AntiPitch';
import FAQ from './FAQ';
import Intake from './Intake';
import Footer from './Footer';
import { IntakeResponse } from '../utils/diagnosticEngine';

interface HeroProps {
  onDiagnosticComplete: (answers: IntakeResponse) => void;
  onLoginClick: () => void;
  key?: React.Key;
}

const smoothEase = [0.22, 1, 0.36, 1] as [number, number, number, number];

export default function Hero({ onDiagnosticComplete, onLoginClick }: HeroProps) {
  const { scrollY } = useScroll();
  const borderRotate = useTransform(scrollY, [0, 2500], [0, 360]); // Slower rotation
  // Replaced hex codes with Tailwind variables where possible, ensuring arbitrary values map to theme
  const cardBackground = useMotionTemplate`
    linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)) padding-box,
    linear-gradient(${borderRotate}deg, #F5F2F6, #E4D8D0, #D3C4CF, #F5F2F6) border-box
  `;
  
  const handleScrollToIntake = () => {
    const intakeSection = document.getElementById('intake');
    if (intakeSection) {
      intakeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className="flex flex-col w-full"
    >
      {/* 1. HERO SECTION */}
      <section className="relative flex flex-col items-center justify-start w-full max-w-6xl mx-auto overflow-hidden">
        
        {/* VIEWPORT 1: TITLE & ORB */}
        <div className="min-h-[90vh] md:min-h-screen w-full flex flex-col items-center justify-center relative px-4">
            
            {/* Subtle Center Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] max-w-[600px] max-h-[600px] pointer-events-none z-0 flex items-center justify-center">
                <motion.div
                    animate={{ scale: [1, 1.03, 1], opacity: [0.5, 0.65, 0.5] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-40 h-40 md:w-56 md:h-56 rounded-full z-10 blur-[80px] bg-[radial-gradient(circle_at_center,theme(colors.brand.accent)_50%,theme(colors.sage.300)_100%)]"
                />
            </div>

            {/* Headline */}
            <div className="relative z-10 w-full max-w-6xl">
                <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        y: { delay: 0.2, duration: 1.2, ease: smoothEase },
                        opacity: { delay: 0.2, duration: 1, ease: "linear" },
                    }}
                    className="relative font-serif tracking-tighter w-full py-12 md:py-20 flex flex-col items-center"
                >
                    {/* Pre-title Label */}
                    <div className="text-[10px] md:text-xs font-sans font-bold tracking-[0.3em] uppercase text-brand-mid mb-6 md:mb-8 text-center">
                        The End State Is
                    </div>

                    <div 
                      className="relative z-10 bg-[linear-gradient(40deg,theme(colors.brand.accent),theme(colors.sage.500),theme(colors.lavender.800),theme(colors.lavender.500),theme(colors.sage.500)_100%)] text-transparent bg-clip-text p-1 md:p-2 w-full"
                      style={{ 
                        filter: `drop-shadow(0 0 1px rgba(49, 13, 86, 0.15)) drop-shadow(0 1px 4px rgba(168, 150, 202, 0.25))`
                      }}
                    >
                      {/* Architected - Left Aligned */}
                      <h1 className="text-left w-full leading-[.9]">
                        <span className="block text-[clamp(3.5rem,17vw,9.5rem)]">Architected</span>
                        <span className="block text-[clamp(3.5rem,18vw,9.5rem)] pl-[2vw]"></span>
                      </h1>
                      
                      {/* Calm - Right Aligned & Italic */}
                      <h1 className="text-right w-full pr-2 md:pr-4 leading-[0.85] -mt-2 md:-mt-6">
                        <span className="italic font-light text-[clamp(4.5rem,27vw,19rem)]">Calm.</span>
                      </h1>
                    </div>
                </motion.div>
            </div>

             {/* Connector Line Start */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-8 left-0 right-0 mx-auto w-fit flex flex-col items-center gap-4 text-brand-mid"
            >
                <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-center">Discover The Disconnect</div>
                <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: 60 }}
                    transition={{ delay: 1.8, duration: 1.2, ease: "easeInOut" }}
                    className="w-px bg-gradient-to-b from-brand-soft/80 to-brand-mid"
                />
            </motion.div>
        </div>

        {/* VIEWPORT 2: PARADOX & CTA */}
        <div className="w-full flex flex-col items-center relative z-10 pb-24 px-4">
            
            {/* Connecting Line Continuation */}
            <div className="flex flex-col items-center mb-10 opacity-60 text-brand-mid">
                <div className="w-px h-16 bg-gradient-to-b from-brand-mid to-transparent" />
                <ArrowDown size={20} className="mt-[-8px]" />
            </div>

            {/* The Paradox Card */}
            <motion.div 
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 1, ease: smoothEase }}
            style={{ background: cardBackground }}
            className="w-full max-w-xl backdrop-blur-xl backdrop-saturate-150 border-[2px] border-transparent rounded-[2.5rem] p-6 pt-12 md:p-10 md:pt-14 shadow-[0_20px_40px_-15px_rgba(160,147,180,0.65),inset_0_0_0_1px_rgba(255,255,255,0.4)] text-center relative z-10">

            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 inline-block px-6 py-2 rounded-full bg-lavender-50/80 text-[10px] font-bold tracking-[0.2em] uppercase shadow-sm border border-brand-dark/5 whitespace-nowrap z-20 text-brand-primary">
                The Paradox
            </div>

            <h2 className="relative z-10 text-[10px] sm:text-xs font-bold tracking-[0.05em] sm:tracking-[0.15em] font-sans text-brand-dark uppercase mb-6 leading-relaxed whitespace-nowrap">
                Your business grew. <span className="text-brand-dark/50">Your systems didn't.</span>
            </h2>

            <div className="relative z-10 flex items-center justify-center w-full max-w-[240px] mx-auto mb-8 opacity-30">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-dark to-brand-dark"></div>
                <div className="w-2.5 h-2.5 border border-brand-dark rotate-45 mx-0 bg-transparent"></div>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent via-brand-dark to-brand-dark"></div>
            </div>

            <p className="relative z-10 font-lora text-l md:text-xl text-brand-dark/80 leading-relaxed">
                Afterload’s diagnostic shows where your business is quietly leaning on you —
                and where the strain is coming from. No calls. No pressure. No implementation.

            </p>
            </motion.div>

            {/* CTA Button */}
            <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 1, ease: smoothEase }}
            className="mt-12 z-10"
            >
            <motion.button 
                onClick={handleScrollToIntake}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                className="group relative px-10 py-5 bg-gradient-to-br from-brand-rich to-brand-deep rounded-full text-white shadow-[0_20px_40px_-15px_rgba(62,28,85,0.4)] hover:shadow-[0_25px_50px_-12px_rgba(62,28,85,0.6)] transition-all duration-300 overflow-hidden ring-1 ring-white/10"
            >
                {/* Light Sweep Animation */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                  initial={{ x: '-150%' }}
                  whileHover={{ x: '150%' }}
                  transition={{ duration: 1, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.5 }}
                />

                <div className="relative flex items-center justify-center gap-3">
                  <span className="text-xs font-bold tracking-[0.2em] uppercase">Start Diagnostic</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform text-brand-soft" />
                </div>
            </motion.button>
            <div className="mt-4 text-[10px] text-brand-mid/90 uppercase tracking-widest text-center">
                No Sales Calls. No Guilt.
            </div>
            </motion.div>
        </div>
      </section>

      <SelfDiagnosis onStartIntake={handleScrollToIntake} />

      <AntiPitch />
      
      <Delivery />

      <FAQ />

      <Intake onComplete={onDiagnosticComplete} />

      <Footer onLoginClick={onLoginClick} />
    </motion.div>
  );
}