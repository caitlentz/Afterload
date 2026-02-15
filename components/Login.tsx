import React, { useState } from 'react';
import { Mail, ArrowRight, Lock, ArrowLeft, CheckCircle, KeyRound } from 'lucide-react';
import { supabase } from '../utils/supabase';

interface LoginProps {
  onBack: () => void;
  onSuccess: (email: string) => void;
}

type Tab = 'password' | 'magic';
type Step = 'form' | 'sent' | 'signup';

export default function Login({ onBack, onSuccess }: LoginProps) {
  const [tab, setTab] = useState<Tab>('password');
  const [step, setStep] = useState<Step>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (authError) {
      // If user doesn't exist or hasn't set a password, nudge them to sign up
      if (
        authError.message.includes('Invalid login credentials') ||
        authError.message.includes('Email not confirmed')
      ) {
        setError('Invalid email or password. Need an account? Use "Create Account" below.');
      } else {
        setError(authError.message);
      }
    } else if (data.user?.email) {
      onSuccess(data.user.email);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setIsLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    setIsLoading(false);

    if (authError) {
      setError(authError.message);
    } else if (data.session?.user?.email) {
      // Auto-confirmed (email confirmations disabled) — sign in directly
      onSuccess(data.session.user.email);
    } else {
      // Email confirmation required — show check-inbox step
      setStep('sent');
    }
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    setIsLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      setStep('sent');
    }
  };

  const switchTab = (newTab: Tab) => {
    setTab(newTab);
    setStep('form');
    setError(null);
    setPassword('');
  };

  return (
    <section className="min-h-screen w-full flex flex-col items-center justify-center py-24 px-6 relative z-20">
      <div className="w-full max-w-md">

        {/* Back */}
        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-brand-dark/40 hover:text-brand-dark transition-colors text-xs font-bold uppercase tracking-widest"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>

        <div className="bg-white/70 p-10 md:p-12 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-white/90 relative overflow-hidden">

          {/* ── Sent / Confirm step ────────────────────── */}
          {step === 'sent' && (
            <div>
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-6">
                <CheckCircle size={20} />
              </div>
              <h2 className="text-3xl font-serif text-brand-dark mb-3">Check your inbox.</h2>
              <p className="text-brand-dark/50 font-lora text-sm mb-8">
                We sent a {tab === 'magic' ? 'login link' : 'confirmation email'} to{' '}
                <span className="font-bold text-brand-dark">{email}</span>.
                {tab === 'magic'
                  ? ' Click the link to sign in.'
                  : ' Confirm your email, then come back and log in.'}
              </p>
              <div className="p-4 rounded-xl bg-brand-bg border border-brand-dark/5 text-center mb-6">
                <p className="text-xs text-brand-dark/40">
                  Didn't get it? Check spam, or wait a moment and try again.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setStep('form'); setError(null); }}
                className="w-full text-center text-[10px] uppercase tracking-widest text-brand-dark/40 hover:text-brand-dark mt-4"
              >
                Go back
              </button>
            </div>
          )}

          {/* ── Sign Up step ──────────────────────────── */}
          {step === 'signup' && (
            <div>
              <div className="w-12 h-12 rounded-full bg-brand-deep text-white flex items-center justify-center mb-6 shadow-lg shadow-brand-deep/20">
                <KeyRound size={20} />
              </div>
              <h2 className="text-3xl font-serif text-brand-dark mb-3">Create Account</h2>
              <p className="text-brand-dark/50 font-lora text-sm mb-8">
                Set a password for <span className="font-bold text-brand-dark">{email}</span>.
              </p>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/40 ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full p-4 pl-12 rounded-xl bg-white border border-brand-dark/10 focus:border-brand-rich outline-none font-serif text-lg transition-all focus:ring-1 focus:ring-brand-rich/20"
                      autoFocus
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/20" size={18} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!password || password.length < 6 || isLoading}
                  className="w-full py-4 bg-brand-dark text-white rounded-xl font-bold tracking-widest uppercase text-xs hover:bg-brand-rich transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="animate-pulse">Creating account...</span>
                  ) : (
                    <>Create Account <ArrowRight size={14} /></>
                  )}
                </button>
              </form>

              <button
                type="button"
                onClick={() => { setStep('form'); setError(null); }}
                className="w-full text-center text-[10px] uppercase tracking-widest text-brand-dark/40 hover:text-brand-dark mt-6"
              >
                Go back
              </button>
            </div>
          )}

          {/* ── Main form step ────────────────────────── */}
          {step === 'form' && (
            <div>
              <div className="w-12 h-12 rounded-full bg-brand-deep text-white flex items-center justify-center mb-6 shadow-lg shadow-brand-deep/20">
                <Lock size={20} />
              </div>

              <h2 className="text-3xl font-serif text-brand-dark mb-3">Welcome Back.</h2>
              <p className="text-brand-dark/50 font-lora text-sm mb-6">
                Sign in to view your diagnostic and report.
              </p>

              {/* Tab switcher */}
              <div className="flex rounded-xl bg-brand-dark/5 p-1 mb-6">
                <button
                  type="button"
                  onClick={() => switchTab('password')}
                  className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                    tab === 'password'
                      ? 'bg-white text-brand-dark shadow-sm'
                      : 'text-brand-dark/40 hover:text-brand-dark/60'
                  }`}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => switchTab('magic')}
                  className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                    tab === 'magic'
                      ? 'bg-white text-brand-dark shadow-sm'
                      : 'text-brand-dark/40 hover:text-brand-dark/60'
                  }`}
                >
                  Magic Link
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* ── Password tab ── */}
              {tab === 'password' && (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/40 ml-1">
                      Email Address
                    </label>
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

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/40 ml-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Your password"
                        className="w-full p-4 pl-12 rounded-xl bg-white border border-brand-dark/10 focus:border-brand-rich outline-none font-serif text-lg transition-all focus:ring-1 focus:ring-brand-rich/20"
                      />
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/20" size={18} />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!email || !password || isLoading}
                    className="w-full py-4 bg-brand-dark text-white rounded-xl font-bold tracking-widest uppercase text-xs hover:bg-brand-rich transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <span className="animate-pulse">Signing in...</span>
                    ) : (
                      <>Sign In <ArrowRight size={14} /></>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!email) {
                        setError('Enter your email first.');
                        return;
                      }
                      setError(null);
                      setStep('signup');
                    }}
                    className="w-full text-center text-[10px] uppercase tracking-widest text-brand-dark/40 hover:text-brand-dark mt-2"
                  >
                    Don't have an account? <span className="underline">Create one</span>
                  </button>
                </form>
              )}

              {/* ── Magic Link tab ── */}
              {tab === 'magic' && (
                <form onSubmit={handleSendMagicLink} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/40 ml-1">
                      Email Address
                    </label>
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

                  <p className="text-center text-xs text-brand-dark/30 mt-2">
                    No password needed — we'll email you a secure link.
                  </p>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
