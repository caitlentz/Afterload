import React, { useState, useEffect, lazy, Suspense, Component, type ErrorInfo, type ReactNode } from 'react';
import Hero from './components/Hero';
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
const Background = lazy(() => import('./components/Background'));

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


export default function App() {
  // 1. Initialize State
  const [currentView, setCurrentView] = useState<View>(() => {
    return (localStorage.getItem(STORAGE.VIEW) as View) || View.HOME;
  });

  const [userEmail, setUserEmail] = useState<string | null>(() => {
    // Restore dev email if it was set (for dev skip button persistence)
    return localStorage.getItem('afterload_dev_email') || null;
  });
  const [authReady, setAuthReady] = useState(false);

  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(() => {
    const saved = localStorage.getItem(STORAGE.PREVIEW);
    return saved ? JSON.parse(saved) : null;
  });

  const [intakeData, setIntakeData] = useState<IntakeResponse | null>(() => {
    const saved = localStorage.getItem(STORAGE.INTAKE);
    return saved ? JSON.parse(saved) : null;
  });

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    depositPaid: false,
    balancePaid: false,
    depositDate: null,
    balanceDate: null,
  });

  // Clear chunk reload flag on successful mount
  useEffect(() => { sessionStorage.removeItem('afterload_chunk_reload'); }, []);

  // Fetch payment status whenever we have an email (lazy-loads database module)
  useEffect(() => {
    if (userEmail) {
      import('./utils/database').then(({ getPaymentStatus }) =>
        getPaymentStatus(userEmail).then(setPaymentStatus)
      );
    }
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
            setCurrentView(View.DASHBOARD);
            window.history.replaceState({}, '', window.location.pathname);
          }
        } else {
          // No real session — if we're stuck on a view that needs auth, go home
          // BUT don't override if user just returned from Stripe payment
          const params = new URLSearchParams(window.location.search);
          const returningFromStripe = params.get('success') === 'true' || sessionStorage.getItem('afterload_payment_pending') === 'true';
          const savedView = localStorage.getItem(STORAGE.VIEW);
          if (savedView === View.DASHBOARD && !returningFromStripe) {
            setCurrentView(View.HOME);
            localStorage.setItem(STORAGE.VIEW, View.HOME);
          }
        }
        setAuthReady(true);
      });

      const { data } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
        if (session?.user?.email) {
          setUserEmail(session.user.email);
          if (_event === 'SIGNED_IN') {
            setCurrentView(View.DASHBOARD);
            if (window.location.hash) {
              window.history.replaceState({}, '', window.location.pathname);
            }
          }
        } else {
          setUserEmail(null);
        }
      });
      subscription = data.subscription;
    });

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(start);
    } else {
      setTimeout(start, 150);
    }

    return () => { cancelled = true; subscription?.unsubscribe(); };
  }, []);

  // 3. Handle Stripe Redirects, "Resume" Links, and Admin Access
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let returnedFromStripe = false;

    if (params.get('success') === 'true' || params.get('resume') === 'true') {
        window.history.replaceState({}, '', window.location.pathname);
        // Always go to Dashboard — auth will resolve and populate userEmail.
        // The Dashboard renders conditionally on userEmail, and the auth listener
        // will set it once loaded. If they're truly not logged in, the auth check
        // in effect #2 will handle it.
        setCurrentView(View.DASHBOARD);
        returnedFromStripe = true;
    }
    // Detect return from Stripe Buy Button (redirects to root with no params)
    if (sessionStorage.getItem('afterload_payment_pending') === 'true') {
        sessionStorage.removeItem('afterload_payment_pending');
        setCurrentView(View.DASHBOARD);
        returnedFromStripe = true;
    }

    // If returning from Stripe, re-fetch payment status after a delay (webhook may still be processing)
    if (returnedFromStripe) {
      const fetchPayment = () => {
        const email = userEmail || localStorage.getItem('afterload_dev_email');
        if (email) {
          import('./utils/database').then(({ getPaymentStatus }) =>
            getPaymentStatus(email).then(setPaymentStatus)
          );
        }
      };
      // Fetch immediately, then again after webhook has time to process
      fetchPayment();
      setTimeout(fetchPayment, 3000);
      setTimeout(fetchPayment, 8000);
    }

    // Secret admin route: ?admin=true
    if (params.get('admin') === 'true') {
        setCurrentView(View.ADMIN);
    }
  }, []);

  // 4. Persist local state on change
  useEffect(() => {
    localStorage.setItem(STORAGE.VIEW, currentView);
    if (intakeData) localStorage.setItem(STORAGE.INTAKE, JSON.stringify(intakeData));
    if (previewResult) localStorage.setItem(STORAGE.PREVIEW, JSON.stringify(previewResult));
  }, [currentView, intakeData, previewResult]);

  const navigate = (view: View) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInitialIntakeComplete = async (answers: IntakeResponse) => {
    const { runPreviewDiagnostic } = await import('./utils/previewEngine');
    const preview = runPreviewDiagnostic(answers);
    setPreviewResult(preview);
    setIntakeData(answers);
    navigate(View.DIAGNOSTIC_PREVIEW);

    // Save to Supabase (non-blocking)
    const email = answers.email || userEmail;
    if (email) {
      const [{ determineTrack }, { saveIntakeResponse, saveDiagnosticResult }] = await Promise.all([
        import('./utils/diagnosticEngine'),
        import('./utils/database'),
      ]);
      const track = determineTrack(answers.business_type);
      const intakeId = await saveIntakeResponse(email, 'initial', answers, track);
      saveDiagnosticResult(email, 'preview', preview, intakeId || undefined);
    }
  };

  const handleDeepIntakeComplete = async (finalAnswers: any) => {
    const merged = { ...intakeData, ...finalAnswers };
    setIntakeData(merged);
    navigate(View.SUCCESS);

    // Save to Supabase (non-blocking)
    const email = merged.email || userEmail;
    if (email) {
      const [{ determineTrack }, { saveIntakeResponse }] = await Promise.all([
        import('./utils/diagnosticEngine'),
        import('./utils/database'),
      ]);
      const track = determineTrack(merged.business_type);
      saveIntakeResponse(email, 'deep', merged, track);
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
      localStorage.removeItem(STORAGE.INTAKE);
      localStorage.removeItem(STORAGE.PREVIEW);
      localStorage.removeItem('afterload_intake_progress_initial');
      localStorage.removeItem('afterload_intake_progress_deep');
      setIntakeData(null);
      setPreviewResult(null);
      // Stay on dashboard so they see the fresh state
      navigate(View.DASHBOARD);
  };

  const successEmail = intakeData?.email || userEmail;

  // While auth is loading, show HOME instead of a loading spinner.
  // Once auth resolves, currentView will be corrected to the right view.
  const needsAuth = currentView === View.DASHBOARD || currentView === View.ADMIN;
  const activeView = (!authReady && needsAuth) ? View.HOME : currentView;

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-brand-dark font-sans selection:bg-brand-accent selection:text-brand-dark">
      <Suspense fallback={<div className="fixed inset-0 bg-brand-bg" />}>
        <Background />
      </Suspense>

      {/* Header - Centered Pill Style */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center py-8 pointer-events-none">
        <div
          className="pointer-events-auto bg-white/80 backdrop-blur-md px-1 py-1 rounded-full border border-black/5 shadow-sm flex items-center gap-1 animate-[slideDown_0.8s_cubic-bezier(0.22,1,0.36,1)_0.2s_both]"
        >
            <button
              onClick={() => navigate(View.HOME)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                activeView === View.HOME
                  ? 'bg-white shadow-sm text-brand-dark'
                  : 'text-brand-dark/50 hover:text-brand-dark'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${activeView === View.HOME ? 'bg-brand-dark' : 'bg-transparent'}`} />
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
                        className="px-5 py-2 rounded-full flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-brand-dark/60 hover:bg-brand-dark/5 transition-all"
                    >
                        <User size={12} />
                        Dashboard
                    </button>
                )
            ) : (
                activeView === View.HOME ? (
                    <button
                      onClick={() => navigate(View.LOGIN)}
                      className="px-5 py-2 rounded-full text-xs font-semibold tracking-widest uppercase text-brand-dark/60 hover:text-brand-dark/60 hover:bg-brand-dark/5 transition-all"
                    >
                      Login
                    </button>
                ) : (
                   <div className="px-5 py-2 rounded-full text-xs font-semibold tracking-widest uppercase bg-brand-dark text-white shadow-sm flex items-center gap-2">
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
                  onViewReport={() => navigate(View.DIAGNOSTIC_PREVIEW)}
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
              <DiagnosticPreview preview={previewResult} onHome={() => navigate(View.HOME)} onUnlock={() => navigate(View.PAYMENT)} />
            )}
            {activeView === View.PAYMENT && (
              <PaymentGate
                onBack={() => navigate(View.DIAGNOSTIC_PREVIEW)}
                onSuccess={() => navigate(userEmail ? View.DASHBOARD : View.SUCCESS)}
                cost={300}
              />
            )}
            {activeView === View.CLARITY_SESSION && (
              <Intake mode="deep" initialDataMissing={!intakeData} onComplete={handleDeepIntakeComplete} />
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
              <FullReport intakeData={intakeData} onBack={() => navigate(View.DASHBOARD)} />
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
