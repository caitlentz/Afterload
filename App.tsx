import React, { useState, useEffect, lazy, Suspense, Component, type ErrorInfo, type ReactNode } from 'react';
import Hero from './components/Hero';
import Background from './components/Background';
import { User } from 'lucide-react';

// Type-only imports — erased at compile time, zero bundle cost
import type { IntakeResponse } from './utils/diagnosticEngine';
import type { PreviewResult } from './utils/previewEngine';
import type { PaymentStatus } from './utils/database';

// ─── Error Boundary for lazy-loaded chunks ─────────────────────────
// Catches failed dynamic imports (stale hashes after deploy) and auto-reloads
interface ChunkBoundaryProps { children: ReactNode }
interface ChunkBoundaryState { hasError: boolean }

class ChunkErrorBoundary extends Component<ChunkBoundaryProps, ChunkBoundaryState> {
  state: ChunkBoundaryState = { hasError: false };
  static getDerivedStateFromError(): ChunkBoundaryState { return { hasError: true }; }
  componentDidCatch(error: Error, _info: ErrorInfo) {
    if (error.message?.includes('dynamically imported module') || error.message?.includes('Loading chunk')) {
      // Stale chunk — reload once to get fresh assets
      const reloaded = sessionStorage.getItem('afterload_chunk_reload');
      if (!reloaded) {
        sessionStorage.setItem('afterload_chunk_reload', '1');
        window.location.reload();
      }
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center max-w-sm">
            <h2 className="font-serif text-2xl text-brand-dark mb-3">Something went wrong</h2>
            <p className="text-brand-dark/50 text-sm mb-6">A new version may have been deployed. Try refreshing.</p>
            <button
              onClick={() => { sessionStorage.removeItem('afterload_chunk_reload'); window.location.reload(); }}
              className="px-6 py-3 rounded-xl bg-brand-dark text-white text-xs font-bold uppercase tracking-widest hover:bg-brand-deep transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Lazy-load views that aren't needed on initial page load
const Intake = lazy(() => import('./components/Intake'));
const DiagnosticPreview = lazy(() => import('./components/DiagnosticPreview'));
const PaymentGate = lazy(() => import('./components/PaymentGate'));
const Login = lazy(() => import('./components/Login'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const AdminView = lazy(() => import('./components/AdminView'));
const FullReport = lazy(() => import('./components/FullReport'));
const SuccessScreen = lazy(() => import('./components/SuccessScreen'));

enum View {
  HOME = 'HOME',
  DIAGNOSTIC_PREVIEW = 'DIAGNOSTIC_PREVIEW',
  PAYMENT = 'PAYMENT',
  CLARITY_SESSION = 'CLARITY_SESSION',
  FULL_REPORT = 'FULL_REPORT',
  SUCCESS = 'SUCCESS',
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  ADMIN = 'ADMIN'
}

// Storage Keys (still used for intake/result caching locally)
const STORAGE = {
  INTAKE: 'afterload_intake',
  PREVIEW: 'afterload_preview',
  VIEW: 'afterload_view',
};

const CLARITY_REQUEST_KEY_PREFIX = 'afterload_clarity_request_';

function buildClarityRequestKey(email: string) {
  return `${CLARITY_REQUEST_KEY_PREFIX}${email.trim().toLowerCase()}`;
}

function readClarityRequestEmailsFromStorage(): string[] {
  const emails: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (key.startsWith(CLARITY_REQUEST_KEY_PREFIX)) {
        const email = key.slice(CLARITY_REQUEST_KEY_PREFIX.length).trim().toLowerCase();
        if (email) emails.push(email);
      }
    }
  } catch {
    // Ignore storage access issues
  }
  return emails;
}


export default function App() {
  // 1. Initialize State
  const [currentView, setCurrentView] = useState<View>(() => {
    const saved = localStorage.getItem(STORAGE.VIEW) as View;
    // Never restore ADMIN from localStorage — it must be accessed via ?admin=true
    if (saved === View.ADMIN) return View.HOME;
    return saved || View.HOME;
  });

  const [userEmail, setUserEmail] = useState<string | null>(() => {
    // Restore dev email if it was set (for dev skip button persistence)
    return localStorage.getItem('afterload_dev_email') || null;
  });
  const [authReady, setAuthReady] = useState(false);
  const [returnedFromStripe, setReturnedFromStripe] = useState(false);

  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(() => {
    const saved = localStorage.getItem(STORAGE.PREVIEW);
    return saved ? JSON.parse(saved) : null;
  });

  const [intakeData, setIntakeData] = useState<IntakeResponse | null>(() => {
    const saved = localStorage.getItem(STORAGE.INTAKE);
    return saved ? JSON.parse(saved) : null;
  });

  const [questionPackStatus, setQuestionPackStatus] = useState<'none' | 'draft' | 'shipped'>('none');
  const [clarityRequestPending, setClarityRequestPending] = useState(false);
  const [skipAutoRecovery, setSkipAutoRecovery] = useState(false);

  const rankQuestionPackStatus = (status: 'none' | 'draft' | 'shipped') => {
    if (status === 'shipped') return 2;
    if (status === 'draft') return 1;
    return 0;
  };

  // TEMPORARY: Paywall disabled — treat everyone as paid
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    depositPaid: true,
    balancePaid: true,
    depositDate: null,
    balanceDate: null,
    paid: true,
    paidDate: new Date().toISOString(),
  });

  // Clear chunk reload flag on successful mount
  useEffect(() => { sessionStorage.removeItem('afterload_chunk_reload'); }, []);

  // Keep a local flag for whether the user explicitly requested clarity questionnaire creation.
  useEffect(() => {
    const candidateEmails = [userEmail, intakeData?.email]
      .filter((v): v is string => !!v)
      .map(v => v.trim().toLowerCase())
      .filter((v, i, arr) => arr.indexOf(v) === i);

    if (candidateEmails.length === 0) {
      setClarityRequestPending(false);
      return;
    }

    const hasRequest = candidateEmails.some(email => !!localStorage.getItem(buildClarityRequestKey(email)));
    setClarityRequestPending(hasRequest);
  }, [userEmail, intakeData?.email]);

  // Fetch question pack status when user/intake email is available.
  // Uses both sources so auth-email mismatch doesn't hide shipped packs.
  useEffect(() => {
    const intakeEmail = intakeData?.email;
    const candidateEmails = [userEmail, intakeEmail, ...readClarityRequestEmailsFromStorage()]
      .filter((v): v is string => !!v)
      .map(v => v.trim().toLowerCase())
      .filter((v, i, arr) => arr.indexOf(v) === i);

    if (candidateEmails.length === 0) return;

    let cancelled = false;

    const refreshQuestionPackStatus = async () => {
      const { fetchQuestionPackStatus, fetchShippedQuestionPack } = await import('./utils/database');
      let best: 'none' | 'draft' | 'shipped' = 'none';
      for (const email of candidateEmails) {
        const status = await fetchQuestionPackStatus(email);
        if (rankQuestionPackStatus(status) > rankQuestionPackStatus(best)) {
          best = status;
        }
        if (best === 'shipped') break;

        // Defensive fallback: if status RPC misses but shipped pack exists, treat as shipped.
        const shippedPack = await fetchShippedQuestionPack(email);
        if (shippedPack?.questions?.length) {
          best = 'shipped';
          break;
        }
      }
      if (!cancelled) setQuestionPackStatus(best);
    };

    refreshQuestionPackStatus();
    const intervalId = window.setInterval(refreshQuestionPackStatus, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [userEmail, intakeData?.email]);

  // Recover intake data for returning users (new device/session).
  useEffect(() => {
    if (!userEmail || intakeData || skipAutoRecovery) return;

    let cancelled = false;

    const recoverIntake = async () => {
      const { fetchIntakeByEmail } = await import('./utils/database');
      const recovered = await fetchIntakeByEmail(userEmail);
      if (!recovered || cancelled) return;

      setIntakeData(recovered as IntakeResponse);
      try {
        const { runPreviewDiagnostic } = await import('./utils/previewEngine');
        if (!cancelled) setPreviewResult(runPreviewDiagnostic(recovered as IntakeResponse));
      } catch (e) {
        console.error('recoverIntake preview error:', e);
      }
    };

    recoverIntake();
    return () => {
      cancelled = true;
    };
  }, [userEmail, intakeData, skipAutoRecovery]);

  // Ensure preview is always available whenever intake data exists.
  useEffect(() => {
    if (!intakeData || previewResult) return;

    let cancelled = false;
    import('./utils/previewEngine')
      .then(({ runPreviewDiagnostic }) => {
        if (!cancelled) setPreviewResult(runPreviewDiagnostic(intakeData));
      })
      .catch((e) => {
        console.error('preview regeneration error:', e);
      });

    return () => { cancelled = true; };
  }, [intakeData, previewResult]);

  // Helper: fetch payment status for a given email
  // TEMPORARY: Paywall disabled — always return paid
  const refreshPaymentStatus = async (_email: string) => {
    const alwaysPaid: PaymentStatus = {
      depositPaid: true,
      balancePaid: true,
      depositDate: null,
      balanceDate: null,
      paid: true,
      paidDate: new Date().toISOString(),
    };
    setPaymentStatus(alwaysPaid);
    return alwaysPaid;
  };

  // Fetch payment status whenever we have an email (lazy-loads database module)
  // Also check intake email as fallback (Stripe checkout may use a different email)
  useEffect(() => {
    if (!userEmail) return;
    const checkPayment = async () => {
      const status = await refreshPaymentStatus(userEmail);
      // If not paid via auth email, also try the intake form email
      if (!status.paid && intakeData?.email && intakeData.email.toLowerCase() !== userEmail.toLowerCase()) {
        const { getPaymentStatus } = await import('./utils/database');
        const altStatus = await getPaymentStatus(intakeData.email);
        if (altStatus.paid) {
          setPaymentStatus(altStatus);
        }
      }
    };
    checkPayment();
  }, [userEmail]);

  // 2. Supabase Auth Listener (lazy-loads supabase module, deferred to not compete with first paint)
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined;
    let cancelled = false;

    // Defer the Supabase SDK download until the browser is idle,
    // so it doesn't compete with rendering the Hero.
    const start = () => import('./utils/supabase').then(({ supabase }) => {
      if (cancelled) return;
      supabase.auth.getSession().then(({ data: { session } }: any) => {
        if (session?.user?.email) {
          setUserEmail(session.user.email);
          if (window.location.hash.includes('access_token') || window.location.hash.includes('type=magiclink')) {
            setCurrentView(prev => prev === View.ADMIN ? prev : View.DASHBOARD);
            window.history.replaceState({}, '', window.location.pathname);
          }
          // If user returned from Stripe and now has auth, upgrade to Dashboard
          setCurrentView(prev => (prev === View.SUCCESS) ? View.DASHBOARD : prev);
        } else {
          // No Supabase session — but if we have a localStorage email
          // (from password login), keep using it
          const devEmail = localStorage.getItem('afterload_dev_email');
          if (devEmail) {
            setUserEmail(devEmail);
          } else {
            // Truly no auth — if we're stuck on Dashboard, go home
            // BUT don't override if user just returned from Stripe
            const isStripeReturn = sessionStorage.getItem('afterload_stripe_return') === 'true';
            if (!isStripeReturn) {
              const savedView = localStorage.getItem(STORAGE.VIEW);
              if (savedView === View.DASHBOARD) {
                localStorage.setItem(STORAGE.VIEW, View.HOME);
                setCurrentView(View.HOME);
              }
            }
          }
        }
        setAuthReady(true);
      });

      const { data } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
        if (session?.user?.email) {
          setUserEmail(session.user.email);
          if (_event === 'SIGNED_IN') {
            // Don't override ADMIN view
            setCurrentView(prev => prev === View.ADMIN ? prev : View.DASHBOARD);
            if (window.location.hash) {
              window.history.replaceState({}, '', window.location.pathname);
            }
          }
        } else if (_event === 'SIGNED_OUT') {
          // Only clear email on explicit sign-out, not on missing session
          setUserEmail(null);
          localStorage.removeItem('afterload_dev_email');
        }
        // If no session but we have a localStorage email, keep using it
      });
      subscription = data.subscription;
    });

    // Start after first paint — no arbitrary wait
    setTimeout(start, 0);

    return () => { cancelled = true; subscription?.unsubscribe(); };
  }, []);

  // 3. Handle Stripe Redirects, "Resume" Links, and Admin Access (detection only)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let stripeReturn = false;

    if (params.get('success') === 'true' || params.get('resume') === 'true') {
        window.history.replaceState({}, '', window.location.pathname);
        stripeReturn = true;
    }
    // Detect return from Stripe Buy Button (redirects to root with no params)
    if (sessionStorage.getItem('afterload_payment_pending') === 'true') {
        sessionStorage.removeItem('afterload_payment_pending');
        stripeReturn = true;
    }

    if (stripeReturn) {
      setReturnedFromStripe(true);
      // Flag so the auth listener (which runs async) won't override our view
      sessionStorage.setItem('afterload_stripe_return', 'true');
      // If user has auth, go to Dashboard. Otherwise go to Success screen.
      // We check localStorage since Supabase session hasn't loaded yet.
      const hasDevEmail = !!localStorage.getItem('afterload_dev_email');
      // Default to SUCCESS for unauthenticated users — the auth listener
      // will upgrade to DASHBOARD if a session is found.
      setCurrentView(hasDevEmail ? View.DASHBOARD : View.SUCCESS);
    }

    // Secret admin route: ?admin=true
    if (params.get('admin') === 'true') {
        setCurrentView(View.ADMIN);
    }
  }, []);

  // 3b. Poll payment status after Stripe return — waits for email to be available
  useEffect(() => {
    if (!returnedFromStripe) return;
    // Try multiple email sources: auth, dev email, or intake form email
    const intakeEmail = (() => {
      try {
        const saved = localStorage.getItem(STORAGE.INTAKE);
        return saved ? JSON.parse(saved).email : null;
      } catch { return null; }
    })();
    const email = userEmail || localStorage.getItem('afterload_dev_email') || intakeEmail;
    if (!email) return; // Will re-run when userEmail becomes available

    let cancelled = false;
    const pollPayment = async (attempts: number) => {
      if (cancelled) return;
      const status = await refreshPaymentStatus(email);
      if (status.paid) {
        setReturnedFromStripe(false);
        sessionStorage.removeItem('afterload_stripe_return');
        // If user has auth, upgrade to Dashboard to show paid state
        if (userEmail) {
          setCurrentView(View.DASHBOARD);
        }
      } else if (attempts <= 0) {
        setReturnedFromStripe(false);
        sessionStorage.removeItem('afterload_stripe_return');
      } else {
        setTimeout(() => pollPayment(attempts - 1), 3000);
      }
    };
    pollPayment(10); // 10 attempts × 3s = 30 seconds max

    return () => { cancelled = true; };
  }, [returnedFromStripe, userEmail]);

  // 4. Eagerly load Stripe script when user approaches payment
  // Instead of just preloading, actually inject the <script> tag early so the
  // Buy Button web component is already registered when PaymentGate mounts.
  useEffect(() => {
    if (
      currentView === View.CLARITY_SESSION ||
      currentView === View.DIAGNOSTIC_PREVIEW ||
      currentView === View.PAYMENT
    ) {
      if (!document.querySelector('script[src="https://js.stripe.com/v3/buy-button.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/buy-button.js';
        script.async = true;
        document.head.appendChild(script);
      }
    }
  }, [currentView]);

  // 5. Persist local state on change
  useEffect(() => {
    localStorage.setItem(STORAGE.VIEW, currentView);
    if (intakeData) localStorage.setItem(STORAGE.INTAKE, JSON.stringify(intakeData));
    if (previewResult) localStorage.setItem(STORAGE.PREVIEW, JSON.stringify(previewResult));
  }, [currentView, intakeData, previewResult]);

  const navigate = (view: View) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewPreview = async () => {
    if (!previewResult && intakeData) {
      try {
        const { runPreviewDiagnostic } = await import('./utils/previewEngine');
        setPreviewResult(runPreviewDiagnostic(intakeData));
      } catch (e) {
        console.error('handleViewPreview error:', e);
      }
    }
    navigate(View.DIAGNOSTIC_PREVIEW);
  };

  const handleCreateClarityQuestionnaire = async () => {
    const email = intakeData?.email || userEmail;

    if (email) {
      const normalizedEmail = email.trim().toLowerCase();
      const signalKey = `afterload_clarity_request_${normalizedEmail}`;

      if (!localStorage.getItem(signalKey)) {
        try {
          const [{ signalClarityQuestionnaireRequest }, { supabase }] = await Promise.all([
            import('./utils/database'),
            import('./utils/supabase'),
          ]);

          await signalClarityQuestionnaireRequest(normalizedEmail, {
            firstName: intakeData?.firstName,
            businessName: intakeData?.businessName,
            website: intakeData?.website,
          });

          // Optional lightweight alert channel for admin inbox integrations.
          void supabase.functions.invoke('notify-submission', {
            body: {
              email: normalizedEmail,
              mode: 'clarity-request',
              clientName: intakeData?.firstName || null,
              businessName: intakeData?.businessName || null,
            },
          }).catch((notifyError) => {
            console.error('clarity-request notify error:', notifyError);
          });

          localStorage.setItem(signalKey, new Date().toISOString());
        } catch (e) {
          console.error('handleCreateClarityQuestionnaire error:', e);
        }
      }
    }

    if (email) {
      localStorage.setItem(buildClarityRequestKey(email), new Date().toISOString());
      setClarityRequestPending(true);
    }

    navigate(View.DASHBOARD);
  };

  const handleInitialIntakeComplete = async (answers: IntakeResponse, password?: string) => {
    const { runPreviewDiagnostic } = await import('./utils/previewEngine');
    const preview = runPreviewDiagnostic(answers);
    setPreviewResult(preview);
    setIntakeData(answers);
    setSkipAutoRecovery(false);

    const email = answers.email || userEmail;

    // If password provided and user not already logged in, create account and go to Dashboard
    if (password && email && !userEmail) {
      try {
        const { supabase } = await import('./utils/supabase');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });

        if (!signUpError && signUpData.session?.user?.email) {
          // Auto-confirmed — sign in directly
          setUserEmail(signUpData.session.user.email);
          localStorage.setItem('afterload_dev_email', signUpData.session.user.email);
          navigate(View.DASHBOARD);
        } else if (!signUpError && signUpData.user && !signUpData.session) {
          // Email confirmation required — still go to Dashboard but store email
          setUserEmail(email);
          localStorage.setItem('afterload_dev_email', email);
          navigate(View.DASHBOARD);
        } else {
          // Sign-up failed (duplicate email, etc.) — fall back to preview + magic link
          console.warn('Sign-up failed, falling back to magic link:', signUpError?.message);
          navigate(View.DIAGNOSTIC_PREVIEW);
          supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: window.location.origin },
          });
        }
      } catch (err) {
        // Supabase import or network error — fall back gracefully
        console.warn('Account creation failed, showing preview:', err);
        navigate(View.DIAGNOSTIC_PREVIEW);
      }
    } else if (userEmail) {
      // Already logged in — go straight to Dashboard
      navigate(View.DASHBOARD);
    } else {
      // No password provided — legacy flow, show preview directly
      navigate(View.DIAGNOSTIC_PREVIEW);
    }

    // Save to Supabase (non-blocking)
    if (email) {
      const [{ determineTrack }, { saveIntakeResponse, saveDiagnosticResult }] = await Promise.all([
        import('./utils/diagnosticEngine'),
        import('./utils/database'),
      ]);
      const track = determineTrack(answers.business_type, answers.business_model);
      const intakeId = await saveIntakeResponse(email, 'initial', answers, track);
      saveDiagnosticResult(email, 'preview', preview, intakeId || undefined);

      // Notify admin (non-blocking, fire-and-forget)
      import('./utils/supabase').then(({ supabase }) => {
        supabase.functions.invoke('notify-submission', {
          body: { email, mode: 'initial', track, clientName: answers.firstName },
        });
      });
    }
  };

  const handleDeepIntakeComplete = async (finalAnswers: any) => {
    const merged = { ...intakeData, ...finalAnswers };
    setIntakeData(merged);
    navigate(View.PAYMENT);

    // Save to Supabase (non-blocking)
    const email = merged.email || userEmail;
    if (email) {
      const [{ determineTrack }, { saveIntakeResponse }] = await Promise.all([
        import('./utils/diagnosticEngine'),
        import('./utils/database'),
      ]);
      const track = determineTrack(merged.business_type, merged.business_model);
      saveIntakeResponse(email, 'deep', merged, track);

      // Notify admin of deep intake completion (fire-and-forget)
      import('./utils/supabase').then(({ supabase }) => {
        supabase.functions.invoke('notify-submission', {
          body: { email, mode: 'deep', track, clientName: merged.firstName },
        });
      });
    }
  };

  const handleLoginSuccess = (email: string) => {
      setUserEmail(email);
      localStorage.setItem('afterload_dev_email', email);
      navigate(View.DASHBOARD);
  };

  const handleLogout = async () => {
      const { supabase } = await import('./utils/supabase');
      await supabase.auth.signOut();
      setUserEmail(null);
      localStorage.removeItem('afterload_dev_email');
      navigate(View.HOME);
  };

  const handleRestart = () => {
      localStorage.removeItem(STORAGE.INTAKE);
      localStorage.removeItem(STORAGE.PREVIEW);
      localStorage.removeItem(STORAGE.VIEW);
      window.location.reload();
  };

  const handleEditAnswers = () => {
      // Go back to intake — the intake component will restore saved progress
      navigate(View.HOME);
  };

  const handleUpdateIntake = (updates: Partial<IntakeResponse>) => {
      setIntakeData(prev => prev ? { ...prev, ...updates } : updates as IntakeResponse);
  };

  const handleResetDiagnostic = () => {
      [userEmail, intakeData?.email]
        .filter((v): v is string => !!v)
        .forEach((email) => localStorage.removeItem(buildClarityRequestKey(email)));
      localStorage.removeItem(STORAGE.INTAKE);
      localStorage.removeItem(STORAGE.PREVIEW);
      localStorage.removeItem('afterload_intake_progress_initial');
      localStorage.removeItem('afterload_intake_progress_deep');
      setSkipAutoRecovery(true);
      setIntakeData(null);
      setPreviewResult(null);
      setQuestionPackStatus('none');
      setClarityRequestPending(false);
      // Stay on dashboard so they see the fresh state
      navigate(View.DASHBOARD);
  };

  const successEmail = intakeData?.email || userEmail;

  // While auth is loading, show HOME instead of a loading spinner.
  // Once auth resolves, currentView will be corrected to the right view.
  const needsAuth = currentView === View.DASHBOARD;
  const activeView = (!authReady && needsAuth) ? View.HOME : currentView;

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-brand-dark font-sans selection:bg-brand-accent selection:text-brand-dark">
      <Background />

      {/* Header - Centered Pill Style */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center py-8 pointer-events-none">
        <div
          className="pointer-events-auto relative overflow-hidden bg-white/70 backdrop-blur-xl px-1 py-1 rounded-full border border-white/80 shadow-[0_12px_32px_-18px_rgba(62,28,85,0.45)] flex items-center gap-1 animate-[fadeInDown_0.7s_ease-out_both]"
        >
            <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.55)_48%,transparent_100%)] animate-[sheenSlide_8s_linear_infinite]" />
            <button
              onClick={() => navigate(View.HOME)}
              className={`relative z-10 px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                activeView === View.HOME
                  ? 'bg-white/90 shadow-sm text-brand-dark'
                  : 'text-brand-dark/50 hover:text-brand-dark'
              }`}
            >
              <img src="/logo.png" alt="" className="w-5 h-5" />
              <span className="font-serif italic">Afterload</span>
            </button>

            <div className="w-px h-4 bg-black/10 mx-1"></div>

            {userEmail ? (
                activeView === View.DASHBOARD ? (
                   <div className="px-5 py-2 rounded-full flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-brand-dark/50">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Dashboard
                   </div>
                ) : (
                    <button
                        onClick={() => navigate(View.DASHBOARD)}
                        className="relative z-10 px-5 py-2 rounded-full flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-brand-dark/60 hover:bg-brand-dark/5 transition-all"
                    >
                        <User size={12} />
                        Dashboard
                    </button>
                )
            ) : (
                activeView === View.HOME ? (
                    <button
                      onClick={() => navigate(View.LOGIN)}
                      className="relative z-10 px-5 py-2 rounded-full text-xs font-semibold tracking-widest uppercase text-brand-dark/60 hover:text-brand-dark/60 hover:bg-brand-dark/5 transition-all"
                    >
                      Login
                    </button>
                ) : (
                   <div className="relative z-10 px-5 py-2 rounded-full text-xs font-semibold tracking-widest uppercase bg-brand-dark text-white shadow-sm flex items-center gap-2">
                     {activeView === View.DIAGNOSTIC_PREVIEW && "Preview"}
                     {activeView === View.PAYMENT && "Secure Checkout"}
                     {activeView === View.CLARITY_SESSION && "Clarity Session"}
                     {activeView === View.FULL_REPORT && "Your Report"}
                     {activeView === View.SUCCESS && "Confirmed"}
                     {activeView === View.LOGIN && "Member Access"}
                   </div>
                )
            )}
        </div>
      </header>

      <main className="relative z-10 w-full min-h-screen flex flex-col">
        <ChunkErrorBoundary>
        <Suspense fallback={<div className="min-h-screen bg-brand-bg" />}>
            {activeView === View.HOME && (
              <Hero onDiagnosticComplete={handleInitialIntakeComplete} onLoginClick={() => navigate(View.LOGIN)} userEmail={userEmail} />
            )}

            {activeView === View.DASHBOARD && userEmail && (
              <Dashboard
                  userEmail={userEmail}
                  intakeData={intakeData}
                  diagnosticResult={null}
                  paymentStatus={paymentStatus}
                  questionPackStatus={questionPackStatus}
                  clarityRequestPending={clarityRequestPending}
                  onViewReport={handleViewPreview}
                  onViewFullReport={() => navigate(View.FULL_REPORT)}
                  onDiagnosticComplete={handleInitialIntakeComplete}
                  onResumeIntake={() => navigate(View.CLARITY_SESSION)}
                  onStartPayment={() => navigate(View.PAYMENT)}
                  onEditAnswers={handleEditAnswers}
                  onResetDiagnostic={handleResetDiagnostic}
                  onUpdateIntake={handleUpdateIntake}
                  onLogout={handleLogout}
              />
            )}

            {activeView === View.DIAGNOSTIC_PREVIEW && (
              <DiagnosticPreview
                preview={previewResult}
                onHome={() => navigate(View.HOME)}
                onUnlock={handleCreateClarityQuestionnaire}
              />
            )}
            {activeView === View.PAYMENT && (
              <PaymentGate
                onBack={() => navigate(View.CLARITY_SESSION)}
                onSuccess={() => {
                  const email = userEmail || intakeData?.email;
                  if (email) refreshPaymentStatus(email);
                  setReturnedFromStripe(true);
                  navigate(userEmail ? View.DASHBOARD : View.SUCCESS);
                }}
                cost={1200}
                email={userEmail || intakeData?.email}
              />
            )}
            {activeView === View.CLARITY_SESSION && (
              <Intake
                mode="deep"
                initialDataMissing={!intakeData}
                userEmail={userEmail}
                onComplete={handleDeepIntakeComplete}
              />
            )}
            {activeView === View.SUCCESS && (
              <SuccessScreen
                email={successEmail}
                onRestart={handleRestart}
                onLogin={() => navigate(View.LOGIN)}
              />
            )}
            {activeView === View.LOGIN && (
              <Login onBack={() => navigate(View.HOME)} onSuccess={handleLoginSuccess} />
            )}
            {activeView === View.FULL_REPORT && (
              <FullReport intakeData={intakeData} userEmail={userEmail} onBack={() => navigate(View.DASHBOARD)} />
            )}
            {activeView === View.ADMIN && (
              <AdminView />
            )}
        </Suspense>
        </ChunkErrorBoundary>
      </main>
    </div>
  );
}
