import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Check } from 'lucide-react';

// Workaround for custom element type safety
const StripeBuyButton = 'stripe-buy-button' as any;

interface PaymentGateProps {
  onBack: () => void;
  onSuccess: () => void;
  cost: number;
  key?: React.Key;
}

const smoothEase = [0.22, 1, 0.36, 1] as [number, number, number, number];

const deliverables = [
  'Full constraint analysis with root cause mapping',
  'Operational health assessment across 7 business stages',
  'Founder dependency score with specific decoupling steps',
  'Phased roadmap — what to fix first, what to ignore',
  'Clear next-step recommendation (DIY, scoped fix, or full build)',
];

export default function PaymentGate({ onBack, onSuccess }: PaymentGateProps) {

  useEffect(() => {
    if (!document.querySelector('script[src="https://js.stripe.com/v3/buy-button.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/buy-button.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="min-h-screen w-full relative z-20 overflow-y-auto">
      <div className="w-full max-w-3xl mx-auto px-6 pt-32 pb-24">

        {/* Back button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-brand-dark/40 hover:text-brand-dark transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <ArrowLeft size={14} />
            <span>Back to Preview</span>
          </button>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: smoothEase }}
          className="bg-white/70 backdrop-blur-3xl rounded-[2.5rem] border border-white/90 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 md:p-12 pb-0 text-center">
            <div className="w-14 h-14 rounded-full bg-brand-dark text-white flex items-center justify-center mx-auto mb-6">
              <Shield size={24} />
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-brand-dark mb-3 leading-tight">
              Business Clarity Report
            </h2>
            <p className="font-lora text-brand-dark/50 max-w-md mx-auto leading-relaxed text-sm">
              A deep-dive diagnostic built from 25 targeted questions about your operations,
              delivered as a comprehensive report within 5–7 business days.
            </p>
          </div>

          {/* Pricing */}
          <div className="p-8 md:p-12 text-center">
            <div className="inline-flex flex-col items-center">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-serif text-5xl text-brand-dark">$300</span>
                <span className="text-xs font-bold uppercase tracking-widest text-brand-dark/40">deposit</span>
              </div>
              <div className="h-px w-12 bg-brand-dark/10 my-3" />
              <p className="text-[11px] uppercase tracking-widest text-brand-dark/40 mb-1">
                Total: $1,200
              </p>
              <p className="text-[10px] text-brand-dark/30 italic">
                $900 balance due before delivery
              </p>
            </div>
          </div>

          {/* What's Included */}
          <div className="px-8 md:px-12 pb-8">
            <div className="bg-sage-300/15 rounded-[2rem] p-6 md:p-8 border border-white/80">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 mb-5">
                What You Get
              </div>
              <div className="space-y-4">
                {deliverables.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-brand-dark/5 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={10} className="text-brand-dark/50" />
                    </div>
                    <span className="text-sm text-brand-dark/70 font-lora leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stripe Button */}
          <div className="px-8 md:px-12 pb-6">
            <div className="w-full flex justify-center">
              <StripeBuyButton
                buy-button-id="buy_btn_1SvrmjAw6xE6hpmR5znaLuMI"
                publishable-key="pk_live_51RKvWMAw6xE6hpmRkoExos4LVjkBKK1lnRONIYbE5YmjjOTG74wTZZaG4NtORAkHa4CwIDlVECpF7sIbpIOgAt5h00FZUbgWIL"
              />
            </div>
          </div>

          {/* Guarantee */}
          <div className="px-8 md:px-12 pb-8">
            <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/60 p-5 text-center">
              <p className="text-[11px] leading-relaxed text-brand-dark/50 max-w-sm mx-auto">
                <span className="font-bold text-brand-dark/70">Guarantee:</span> If we can't identify
                at least one structural constraint, you get a full refund. No questions.
              </p>
            </div>
          </div>

          {/* Already paid */}
          <div className="px-8 md:px-12 pb-10">
            <div className="pt-6 border-t border-brand-dark/5 flex justify-center">
              <button
                onClick={onSuccess}
                className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/30 hover:text-brand-dark/60 transition-colors"
              >
                Already paid? <span className="underline">Continue here</span>
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
