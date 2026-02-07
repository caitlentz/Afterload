import React, { useState } from 'react';

import { Mail, ArrowRight, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '../utils/supabase';

interface LoginProps {
  onBack: () => void;
  onSuccess: (email: string) => void;
  key?: React.Key;
}

export default function Login({ onBack, onSuccess }: LoginProps) {
  const [step, setStep] = useState<'email' | 'sent'>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    setIsLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setStep('sent');
    }
  };

  return (
    <section className="min-h-screen w-full flex flex-col items-center justify-center py-24 px-6 relative z-20">
      <div className="w-full max-w-md">

        {/* Navigation */}
        <button
            onClick={onBack}
            className="mb-8 flex items-center gap-2 text-brand-dark/40 hover:text-brand-dark transition-colors text-xs font-bold uppercase tracking-widest"
        >
            <ArrowLeft size={14} />
            <span>Back</span>
        </button>

        <div
            className="animate-[fadeInUp_0.5s_ease-out_both] bg-white/70 backdrop-blur-3xl p-10 md:p-12 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-white/90 relative overflow-hidden"
        >
                {step === 'email' ? (
                    <div key="step-email" className="animate-[fadeIn_0.3s_ease-out_both]">
                        <div className="w-12 h-12 rounded-full bg-brand-deep text-white flex items-center justify-center mb-6 shadow-lg shadow-brand-deep/20">
                            <Lock size={20} />
                        </div>

                        <h2 className="text-3xl font-serif text-brand-dark mb-3">Welcome Back.</h2>
                        <p className="text-brand-dark/50 font-lora text-sm mb-8">
                            Enter your email and we'll send you a secure login link. No passwords needed.
                        </p>

                        {error && (
                            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSendMagicLink} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/40 ml-1">Email Address</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@company.com"
                                        className="w-full p-4 pl-12 rounded-xl bg-white border border-brand-dark/10 focus:border-brand-rich outline-none font-serif text-lg transition-all focus:ring-1 focus:ring-brand-rich/20"
                                        autoFocus
                                    />
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/20" size={18} />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!email || isLoading}
                                className="w-full py-4 bg-brand-dark text-white rounded-xl font-bold tracking-widest uppercase text-xs hover:bg-brand-rich transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <span className="animate-pulse">Sending...</span>
                                ) : (
                                    <>Send Login Link <ArrowRight size={14} /></>
                                )}
                            </button>
                        </form>

                    </div>
                ) : (
                    <div key="step-sent" className="animate-[fadeIn_0.3s_ease-out_both]">
                        <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-6">
                            <CheckCircle size={20} />
                        </div>

                        <h2 className="text-3xl font-serif text-brand-dark mb-3">Check your inbox.</h2>
                        <p className="text-brand-dark/50 font-lora text-sm mb-8">
                            We sent a login link to <span className="font-bold text-brand-dark">{email}</span>. Click the link to sign in — no code needed.
                        </p>

                        <div className="p-4 rounded-xl bg-brand-bg border border-brand-dark/5 text-center mb-6">
                            <p className="text-xs text-brand-dark/40">
                                Didn't get it? Check spam, or wait a moment and try again.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => { setStep('email'); setError(null); }}
                            className="w-full text-center text-[10px] uppercase tracking-widest text-brand-dark/40 hover:text-brand-dark mt-4"
                        >
                            Use a different email
                        </button>
                    </div>
                )}
        </div>
      </div>
    </section>
  );
}
