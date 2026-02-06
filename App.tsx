import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence, motion, useScroll } from 'framer-motion';
import Hero from './components/Hero';
import Background from './components/Background';
import { IntakeResponse } from './utils/diagnosticEngine';
import { runPreviewDiagnostic, PreviewResult } from './utils/previewEngine';
import { supabase } from './utils/supabase';
import { saveIntakeResponse, saveDiagnosticResult, getPaymentStatus, PaymentStatus } from './utils/database';
import { determineTrack } from './utils/diagnosticEngine';
import { CheckCircle, Mail, User } from 'lucide-react';

// Lazy-load views that aren't needed on initial page load
const Intake = lazy(() => import('./components/Intake'));
const DiagnosticPreview = lazy(() => import('./components/DiagnosticPreview'));
const PaymentGate = lazy(() => import('./components/PaymentGate'));
const Login = lazy(() => import('./components/Login'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const AdminView = lazy(() => import('./components/AdminView'));

enum View {
  HOME = 'HOME',
  DIAGNOSTIC_PREVIEW = 'DIAGNOSTIC_PREVIEW',
  PAYMENT = 'PAYMENT',
  DEEP_INTAKE = 'DEEP_INTAKE',
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

// Premium Easing Curve
const transitionConfig = { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

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

  const { scrollYProgress } = useScroll();

  // Fetch payment status whenever we have an email
  useEffect(() => {
    if (userEmail) {
      getPaymentStatus(userEmail).then(setPaymentStatus);
    }
  }, [userEmail]);

  // 2. Supabase Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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

    return () => subscription.unsubscribe();
  }, []);

  // 3. Handle Stripe Redirects, "Resume" Links, and Admin Access
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let returnedFromStripe = false;

    if (params.get('success') === 'true' || params.get('resume') === 'true') {
        window.history.replaceState({}, '', window.location.pathname);
        // If logged in, go to dashboard; otherwise show success screen
        if (userEmail) {
          setCurrentView(View.DASHBOARD);
        } else {
          setCurrentView(View.SUCCESS);
        }
        returnedFromStripe = true;
    }
    // Detect return from Stripe Buy Button (redirects to root with no params)
    // If we flagged a payment as pending and user lands back on the site, route appropriately
    if (sessionStorage.getItem('afterload_payment_pending') === 'true') {
        sessionStorage.removeItem('afterload_payment_pending');
        if (userEmail) {
          setCurrentView(View.DASHBOARD);
        } else {
          setCurrentView(View.SUCCESS);
        }
        returnedFromStripe = true;
    }

    // If returning from Stripe, re-fetch payment status (webhook may have already fired)
    if (returnedFromStripe && userEmail) {
      // Small delay to give webhook time to process
      setTimeout(() => {
        getPaymentStatus(userEmail).then(setPaymentStatus);
      }, 2000);
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
    const preview = runPreviewDiagnostic(answers);
    setPreviewResult(preview);
    setIntakeData(answers);
    navigate(View.DIAGNOSTIC_PREVIEW);

    // Save to Supabase (non-blocking)
    const email = answers.email || userEmail;
    if (email) {
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

  // Don't render until we know auth state (prevents flash)
  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="animate-pulse text-brand-dark/30 text-sm font-bold uppercase tracking-widest">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-brand-dark font-sans selection:bg-brand-accent selection:text-brand-dark">
      <Background />

      {/* Header - Centered Pill Style */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center py-8 pointer-events-none">
        <motion.div
          className="absolute top-0 left-0 right-0 h-[3px] bg-brand-rich/60 origin-left"
          style={{ scaleX: scrollYProgress }}
        />

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...transitionConfig, delay: 0.2 }}
          className="pointer-events-auto bg-white/80 backdrop-blur-md px-1 py-1 rounded-full border border-black/5 shadow-sm flex items-center gap-1"
        >
            <button
              onClick={() => navigate(View.HOME)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                currentView === View.HOME
                  ? 'bg-white shadow-sm text-brand-dark'
                  : 'text-brand-dark/50 hover:text-brand-dark'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${currentView === View.HOME ? 'bg-brand-dark' : 'bg-transparent'}`} />
              <span className="font-serif italic">Afterload</span>
            </button>

            <div className="w-px h-4 bg-black/10 mx-1"></div>

            {userEmail ? (
                currentView === View.DASHBOARD ? (
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
                currentView === View.HOME ? (
                    <button
                      onClick={() => navigate(View.LOGIN)}
                      className="px-5 py-2 rounded-full text-xs font-semibold tracking-widest uppercase text-brand-dark/60 hover:text-brand-dark/60 hover:bg-brand-dark/5 transition-all"
                    >
                      Login
                    </button>
                ) : (
                   <div className="px-5 py-2 rounded-full text-xs font-semibold tracking-widest uppercase bg-brand-dark text-white shadow-sm flex items-center gap-2">
                     {currentView === View.DIAGNOSTIC_PREVIEW && "Preview"}
                     {currentView === View.PAYMENT && "Secure Checkout"}
                     {currentView === View.DEEP_INTAKE && "Deep Dive"}
                     {currentView === View.SUCCESS && "Confirmed"}
                     {currentView === View.LOGIN && "Member Access"}
                   </div>
                )
            )}
        </motion.div>
      </header>

      <main className="relative z-10 w-full min-h-screen flex flex-col">
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-brand-bg"><div className="animate-pulse text-brand-dark/30 text-sm font-bold uppercase tracking-widest">Loading...</div></div>}>
          <AnimatePresence mode="wait">
            {currentView === View.HOME && (
              <Hero key="hero" onDiagnosticComplete={handleInitialIntakeComplete} onLoginClick={() => navigate(View.LOGIN)} />
            )}

            {currentView === View.DASHBOARD && userEmail && (
              <Dashboard
                  key="dashboard"
                  userEmail={userEmail}
                  intakeData={intakeData}
                  diagnosticResult={null}
                  paymentStatus={paymentStatus}
                  onViewReport={() => navigate(View.DIAGNOSTIC_PREVIEW)}
                  onResumeIntake={() => navigate(View.DEEP_INTAKE)}
                  onStartPayment={() => navigate(View.PAYMENT)}
                  onEditAnswers={handleEditAnswers}
                  onResetDiagnostic={handleResetDiagnostic}
                  onUpdateIntake={handleUpdateIntake}
                  onLogout={handleLogout}
              />
            )}

            {currentView === View.DIAGNOSTIC_PREVIEW && (
              <DiagnosticPreview key="preview" preview={previewResult} onHome={() => navigate(View.HOME)} onUnlock={() => navigate(View.PAYMENT)} />
            )}
            {currentView === View.PAYMENT && (
              <PaymentGate key="payment" onBack={() => navigate(View.DIAGNOSTIC_PREVIEW)} onSuccess={() => navigate(View.DASHBOARD)} cost={300} />
            )}
            {currentView === View.DEEP_INTAKE && (
              <Intake key="deep-intake" mode="deep" initialDataMissing={!intakeData} onComplete={handleDeepIntakeComplete} />
            )}
            {currentView === View.SUCCESS && (
              <SuccessScreen key="success" email={successEmail || undefined} onRestart={handleRestart} />
            )}
            {currentView === View.LOGIN && (
              <Login key="login" onBack={() => navigate(View.HOME)} onSuccess={handleLoginSuccess} />
            )}
            {currentView === View.ADMIN && (
              <AdminView key="admin" />
            )}
          </AnimatePresence>
        </Suspense>
      </main>
    </div>
  );
}

const SuccessScreen = ({ email, onRestart }: { email?: string, onRestart: () => void, key?: React.Key }) => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
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
  </motion.div>
);
