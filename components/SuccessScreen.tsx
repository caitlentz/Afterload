import React from 'react';
import { CheckCircle, Mail } from 'lucide-react';

interface SuccessScreenProps {
  email?: string;
  onRestart: () => void;
}

export default function SuccessScreen({ email, onRestart }: SuccessScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-[fadeIn_0.6s_ease-out]">
      <div className="w-20 h-20 rounded-full bg-brand-deep text-white flex items-center justify-center mb-8 shadow-2xl">
        <CheckCircle size={40} />
      </div>
      <h2 className="text-4xl md:text-6xl font-serif text-brand-dark mb-6">Received.</h2>
      <p className="font-lora text-xl text-brand-dark/70 max-w-xl leading-relaxed mb-8">
        We are analyzing your operational profile now.
        <br/><br/>
        <span className="font-bold text-brand-dark">No account is needed.</span> Your Business Clarity Report will be sent directly to <span className="underline decoration-brand-rich/30">{email || "your inbox"}</span> within 5-7 business days.
      </p>
      <div className="flex flex-col gap-6 items-center">
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-brand-dark/10 shadow-sm text-xs font-bold uppercase tracking-widest text-brand-dark/50">
          <Mail size={14} />
          Watch for: "Your Afterload Diagnosis"
        </div>
        <button onClick={onRestart} className="text-sm text-brand-dark/40 hover:text-brand-dark underline mt-4">Return to Home</button>
      </div>
    </div>
  );
}
