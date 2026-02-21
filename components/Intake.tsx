import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, ArrowRight, RotateCcw, Lock } from 'lucide-react';
import { CLARITY_SESSION_QUESTIONS, ClarityQuestion } from '../utils/claritySessionQuestions';

// Types for initial intake
type InitialQuestionType = 'single' | 'multi' | 'text' | 'scale' | 'form';
type InitialOption = string | { value: string; label: string };
interface InitialQuestion {
  id: string;
  type: InitialQuestionType;
  text: string;
  helperText?: string;
  options?: InitialOption[];
  maxSelect?: number;
  placeholder?: string;
  dependsOn?: {
    questionId: string;
    requiredValue: any[];
  };
}

interface IntakeProps {
  onComplete: (answers: any, password?: string) => void;
  mode?: 'initial' | 'deep';
  initialDataMissing?: boolean;
  userEmail?: string | null;
  key?: React.Key;
}

// --- UNIVERSAL INITIAL INTAKE QUESTIONS (v2) ---
const UNIVERSAL_QUESTIONS: InitialQuestion[] = [
  {
    id: 'business_model',
    type: 'single',
    text: 'Which option is closest to your business model?',
    helperText: 'Choose the closest fit. It does not need to be perfect.',
    options: [
      {
        value: 'Standardized service',
        label: 'Standardized service (same offer each time, like monthly bookkeeping)',
      },
      {
        value: 'Creative service',
        label: 'Creative service (custom creative work, like design or content)',
      },
      {
        value: 'Expert service',
        label: 'Expert service (specialized expert problem-solving, like legal or tax work)',
      },
      {
        value: 'Advisory/coaching',
        label: 'Advisory/coaching (paid guidance, consulting, or coaching)',
      },
      {
        value: 'Hybrid model',
        label: 'Hybrid model (a mix of two or more options above)',
      },
    ],
  },
  {
    id: 'revenue_generation',
    type: 'single',
    text: 'Who does most of the client delivery work?',
    helperText: 'Choose based on a typical month.',
    options: [
      {
        value: 'Founder delivers majority of service',
        label: 'Founder delivers majority of service (I still do most delivery work)',
      },
      {
        value: 'Team delivers, founder reviews',
        label: 'Team delivers, founder reviews (team does the work, I still review/approve)',
      },
      {
        value: 'Team delivers independently',
        label: 'Team delivers independently (team runs end-to-end without me)',
      },
      {
        value: 'Mix of founder + team delivery',
        label: 'Mix of founder + team delivery (some delivery is mine, some is team-owned)',
      },
    ],
  },
  {
    id: 'two_week_absence',
    type: 'single',
    text: 'If you were fully offline for 2 weeks, what would happen?',
    helperText: 'Offline = no calls, email, Slack, text, or approvals.',
    options: [
      {
        value: 'Revenue drops immediately',
        label: 'Revenue drops immediately (sales or fulfillment slows right away)',
      },
      {
        value: 'Work slows significantly',
        label: 'Work slows significantly (things continue, but much slower)',
      },
      {
        value: 'Team continues but escalates decisions',
        label: 'Team continues but escalates decisions (bigger choices wait for me)',
      },
      {
        value: 'Business runs mostly normally',
        label: 'Business runs mostly normally (team and systems hold steady)',
      },
    ],
  },
  {
    id: 'final_decisions',
    type: 'single',
    text: 'Who usually makes the final call on client work?',
    helperText: 'Think scope changes, exceptions, quality calls, and deadlines.',
    options: [
      { value: 'Always me', label: 'Always me (almost every final decision comes to me)' },
      { value: 'Mostly me', label: 'Mostly me (team decides some things, I decide most)' },
      {
        value: 'Shared with senior team',
        label: 'Shared with senior team (decision authority is shared with leaders)',
      },
      { value: 'Rarely me', label: 'Rarely me (team can make most final decisions without me)' },
    ],
  },
  {
    id: 'project_stall',
    type: 'single',
    text: 'Where does work most often get stuck?',
    helperText: 'Pick the blocker you see most often.',
    options: [
      {
        value: 'Waiting on my approval',
        label: 'Waiting on my approval (work waits for my sign-off)',
      },
      {
        value: 'Waiting on team execution',
        label: 'Waiting on team execution (capacity, consistency, or ownership issues)',
      },
      {
        value: 'Waiting on clients',
        label: 'Waiting on clients (feedback, files, payment, or scheduling delays)',
      },
      {
        value: 'Hiring/staffing gaps',
        label: 'Hiring/staffing gaps (not enough people or missing key skills)',
      },
      { value: 'Nowhere obvious', label: 'Nowhere obvious (no clear repeat bottleneck)' },
    ],
  },
  {
    id: 'growth_limiter',
    type: 'single',
    text: 'What is the biggest thing limiting growth right now?',
    helperText: 'Choose the one that would make the biggest difference if fixed first.',
    options: [
      {
        value: 'Not enough qualified staff',
        label: 'Not enough qualified staff (hiring/training is the main block)',
      },
      {
        value: 'Not enough time',
        label: 'Not enough time (my calendar and attention are maxed out)',
      },
      {
        value: 'Inconsistent demand',
        label: 'Inconsistent demand (pipeline and lead flow are uneven)',
      },
      {
        value: 'Pricing structure',
        label: 'Pricing structure (rates, packages, or margins limit growth)',
      },
      {
        value: 'Operational inefficiency',
        label: 'Operational inefficiency (handoffs, tools, process, or rework slow us down)',
      },
    ],
  },
  {
    id: 'process_documentation',
    type: 'single',
    text: 'How documented are your core processes right now?',
    helperText: 'Think SOPs, checklists, templates, and decision rules.',
    options: [
      {
        value: 'Mostly in my head',
        label: 'Mostly in my head (team still needs me to explain steps)',
      },
      {
        value: 'Light documentation',
        label: 'Light documentation (some docs exist, but they are incomplete)',
      },
      {
        value: 'Documented but not used',
        label: 'Documented but not used (docs exist, but day-to-day work ignores them)',
      },
      {
        value: 'Fully documented and followed',
        label: 'Fully documented and followed (team regularly uses the docs)',
      },
    ],
  },
  {
    id: 'roles_handled',
    type: 'single',
    text: 'How many different roles are you personally covering each week?',
    helperText: 'Count real context-switching roles, not job titles.',
    options: [
      { value: '1–2', label: '1-2 roles (for example, leadership + sales)' },
      { value: '3–4', label: '3-4 roles (for example, leadership, sales, delivery, hiring)' },
      { value: '5–6', label: '5-6 roles (you switch across many functions each week)' },
      { value: '7+', label: '7+ roles (you are the fallback person for almost everything)' },
    ],
  },
  {
    id: 'client_relationship',
    type: 'single',
    text: 'How do clients relate to your business today?',
    helperText: 'Choose the one that feels most true for your typical client.',
    options: [
      {
        value: 'Clients hire me specifically',
        label: 'Clients hire me specifically (my name is the main reason they buy)',
      },
      {
        value: 'Clients hire the firm but expect me involved',
        label: 'Clients hire the firm but expect me involved (they still want me involved)',
      },
      {
        value: 'Clients are assigned to team members',
        label: 'Clients are assigned to team members (team owns delivery relationships)',
      },
      {
        value: 'No founder involvement needed',
        label: 'No founder involvement needed (client work runs without me)',
      },
    ],
  },
  {
    id: 'key_member_leaves',
    type: 'single',
    text: 'If a key team member left unexpectedly, what would happen first?',
    helperText: 'Pick the most realistic immediate impact.',
    options: [
      {
        value: 'Revenue drops',
        label: 'Revenue drops (we lose capacity or clients quickly)',
      },
      {
        value: 'Delivery slows',
        label: 'Delivery slows (deadlines slip and output quality drops)',
      },
      {
        value: 'Temporary disruption',
        label: 'Temporary disruption (short-term disruption, then recovery)',
      },
      {
        value: 'Minimal impact',
        label: 'Minimal impact (backup coverage and systems absorb it)',
      },
    ],
  },
  {
    id: 'pricing_decisions',
    type: 'single',
    text: 'How are final pricing decisions made?',
    helperText: 'Think proposals, exceptions, discounts, and package changes.',
    options: [
      { value: 'Only by me', label: 'Only by me (all pricing authority sits with me)' },
      {
        value: 'I approve final pricing',
        label: 'I approve final pricing (team drafts, I still sign off)',
      },
      {
        value: 'Senior team sets pricing',
        label: 'Senior team sets pricing (leaders own pricing within clear guardrails)',
      },
      {
        value: 'Fixed pricing structure',
        label: 'Fixed pricing structure (set menu/rules reduce approval needs)',
      },
    ],
  },
  {
    id: 'interruption_frequency',
    type: 'single',
    text: 'How often are you interrupted to make decisions?',
    helperText: 'Include Slack pings, calls, texts, and quick asks.',
    options: [
      {
        value: 'Constantly throughout the day',
        label: 'Constantly throughout the day (focus blocks are hard to protect)',
      },
      {
        value: 'Multiple times daily',
        label: 'Multiple times daily (interruptions are frequent)',
      },
      {
        value: 'A few times per week',
        label: 'A few times per week (interruptions happen, but not nonstop)',
      },
      {
        value: 'Rarely',
        label: 'Rarely (team usually resolves decisions without me)',
      },
    ],
  },
  {
    id: 'hiring_situation',
    type: 'single',
    text: 'What best describes your hiring/staffing reality?',
    helperText: 'Answer for your current quarter, not your long-term plan.',
    options: [
      {
        value: 'Actively hiring, hard to find talent',
        label: 'Actively hiring, hard to find talent (open roles are hard to fill)',
      },
      {
        value: 'Hiring occasionally',
        label: 'Hiring occasionally (some openings, not urgent across the board)',
      },
      {
        value: 'Fully staffed',
        label: 'Fully staffed (current team can handle current demand)',
      },
      {
        value: 'Overstaffed',
        label: 'Overstaffed (capacity currently exceeds demand)',
      },
    ],
  },
  {
    id: 'free_capacity',
    type: 'single',
    text: 'If you fixed one thing to free your time fastest, what would it be?',
    helperText: 'Pick the highest-leverage move for the next 2-3 months.',
    options: [
      {
        value: 'Delegating approvals',
        label: 'Delegating approvals (fewer decisions routed to me)',
      },
      {
        value: 'Hiring more staff',
        label: 'Hiring more staff (more hands and better role coverage)',
      },
      {
        value: 'Better systems',
        label: 'Better systems (automation, SOPs, templates, and clearer handoffs)',
      },
      {
        value: 'Raising prices',
        label: 'Raising prices (less volume pressure for the same or better margin)',
      },
      {
        value: 'Reducing client load',
        label: 'Reducing client load (fewer accounts to stabilize quality and pace)',
      },
    ],
  },
  {
    id: 'current_state',
    type: 'single',
    text: 'Which statement best matches your business right now?',
    helperText: 'Choose the one that feels true most weeks.',
    options: [
      {
        value: 'Growing but strained',
        label: 'Growing but strained (demand is up, but team/systems are under pressure)',
      },
      {
        value: 'Stable but capped',
        label: 'Stable but capped (predictable, but hard to break through)',
      },
      {
        value: 'Chaotic and reactive',
        label: 'Chaotic and reactive (frequent firefighting and last-minute pivots)',
      },
      {
        value: 'Profitable but founder-heavy',
        label: 'Profitable but founder-heavy (financially okay, but still depends on me)',
      },
      {
        value: 'Unsure',
        label: 'Unsure (hard to assess clearly right now)',
      },
    ],
  },
  {
    id: 'contact',
    type: 'form',
    text: 'Last step: where should we send your diagnostic?',
    helperText: "We'll generate your mini personalized diagnostic right after this.",
  },
];
// Determine clarity session track from intake data (supports both v1 and v2)
function determineClarityTrack(intakeData: Record<string, any> | null): 'A' | 'B' | 'C' {
    const answer = intakeData?.business_model || intakeData?.business_type;
    if (!answer) return 'B';
    const lower = answer.toLowerCase();
    if (lower.includes('standardized')) return 'A';
    if (lower.includes('advisory') || lower.includes('coaching')) return 'C';
    if (lower.includes('creative') || lower.includes('expert')) return 'B';
    if (lower.includes('hybrid')) return 'B';
    // Legacy business_type fallback
    if (lower.includes('logistics')) return 'A';
    if (lower.includes('consulting')) return 'C';
    return 'B';
}


export default function Intake({ onComplete, mode = 'initial', initialDataMissing = false, userEmail }: IntakeProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [contactForm, setContactForm] = useState({ firstName: '', email: userEmail || '', businessName: '', website: '', specificType: '', password: '' });
  
  const STORAGE_KEY = `afterload_intake_progress_${mode}`;
  const [canRestore, setCanRestore] = useState(false);

  // Sync userEmail into contactForm when auth loads asynchronously
  useEffect(() => {
    if (userEmail && !contactForm.email) {
      setContactForm(prev => ({ ...prev, email: userEmail }));
    }
  }, [userEmail]);

  const [clarityQuestions, setClarityQuestions] = useState<ClarityQuestion[]>([]);
  const [showRecoveryForm, setShowRecoveryForm] = useState(initialDataMissing && mode === 'deep');

  useEffect(() => {
    let cancelled = false;

    async function loadQuestions() {
      if (mode === 'deep') {
        const savedIntake = localStorage.getItem('afterload_intake');
        const intakeData = savedIntake ? JSON.parse(savedIntake) : null;
        const lookupEmail = (userEmail || intakeData?.email || '').trim().toLowerCase();

        if (lookupEmail) {
          try {
            const { fetchShippedQuestionPack } = await import('../utils/database');
            const shippedPack = await fetchShippedQuestionPack(lookupEmail);
            if (!cancelled && shippedPack?.questions?.length) {
              setShowRecoveryForm(false);
              setClarityQuestions(shippedPack.questions as ClarityQuestion[]);
            } else if (!cancelled) {
              if (!intakeData && initialDataMissing) {
                setShowRecoveryForm(true);
                setClarityQuestions([]);
              } else {
                setShowRecoveryForm(false);
                const track = determineClarityTrack(intakeData);
                const filtered = CLARITY_SESSION_QUESTIONS.filter(q =>
                  q.tracks.includes('UNIVERSAL') || q.tracks.includes(track)
                );
                setClarityQuestions(filtered);
              }
            }
          } catch (e) {
            console.error('Error loading shipped question pack:', e);
          }
        } else if (!cancelled) {
          if (!intakeData && initialDataMissing) {
            setShowRecoveryForm(true);
            setClarityQuestions([]);
          } else {
            setShowRecoveryForm(false);
            const track = determineClarityTrack(intakeData);
            const filtered = CLARITY_SESSION_QUESTIONS.filter(q =>
              q.tracks.includes('UNIVERSAL') || q.tracks.includes(track)
            );
            setClarityQuestions(filtered);
          }
        }
      }

      // Recovery logic...
      const savedProgress = localStorage.getItem(STORAGE_KEY);
      if (savedProgress) {
        try {
          const parsed = JSON.parse(savedProgress);
          if (parsed && (Object.keys(parsed.answers || {}).length > 0 || parsed.step > 0)) {
            setCanRestore(true);
          }
        } catch (e) {
          console.error("Error checking saved session", e);
        }
      }
    }

    loadQuestions();
    return () => { cancelled = true; };
  }, [mode, initialDataMissing, STORAGE_KEY, userEmail]);
  
  // Save progress effect...
  useEffect(() => {
      if (step > 0 || Object.keys(answers).length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, answers, contactForm }));
      }
  }, [step, answers, contactForm, STORAGE_KEY]);

  const handleRestore = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setAnswers(parsed.answers || {});
            setStep(parsed.step || 0);
            if (mode === 'initial') {
                setContactForm(parsed.contactForm || { firstName: '', email: '', businessName: '', website: '', specificType: '', password: '' });
            }
            setCanRestore(false);
          } catch (e) { console.error("Error restoring session", e); }
      }
  };

  const activeInitialQuestions = UNIVERSAL_QUESTIONS;
  const questions = mode === 'initial' ? activeInitialQuestions : clarityQuestions;
  const currentQ = questions[step];

  const getOptionValue = (option: InitialOption): string =>
    typeof option === 'string' ? option : option.value;
  const getOptionLabel = (option: InitialOption): string =>
    typeof option === 'string' ? option : option.label;
  
  const totalSteps = questions.length;
  const progress = totalSteps > 0 ? ((step + 1) / totalSteps) * 100 : 0;

  const handleNext = (answersOverride?: Record<string, any>) => {
    const currentAnswers = answersOverride || answers;

    let nextStep = step + 1;
    while (nextStep < questions.length) {
        const nextQ = questions[nextStep];
        if (nextQ.dependsOn) {
            const dependencyAnswer = currentAnswers[nextQ.dependsOn.questionId];
            if (nextQ.dependsOn.requiredValue.includes(dependencyAnswer)) {
                break; // Dependency met
            } else {
                nextStep++; // Skip
            }
        } else {
            break; // No dependency
        }
    }

    if (nextStep >= questions.length) {
        const { password: _pw, ...contactWithoutPassword } = contactForm;
        const finalAnswers = {
          ...currentAnswers,
          ...contactWithoutPassword,
          ...(mode === 'deep' ? { _deepDiveComplete: true } : {}),
        };
        localStorage.removeItem(STORAGE_KEY);
        onComplete(finalAnswers, contactForm.password || undefined);
    } else {
        setStep(nextStep);
    }
  };

  const handlePrev = () => {
    let prevStep = step - 1;
    while (prevStep >= 0) {
        const prevQ = questions[prevStep];
        if (prevQ.dependsOn) {
            const dependencyAnswer = answers[prevQ.dependsOn.questionId];
            if (prevQ.dependsOn.requiredValue.includes(dependencyAnswer)) {
                break;
            } else {
                prevStep--; 
            }
        } else {
            break;
        }
    }

    if (prevStep >= 0) {
        setStep(prevStep);
    }
  };
  
  const handleSingleSelect = (option: string) => {
    const newAnswers = { ...answers, [currentQ.id]: option };
    setAnswers(newAnswers);
    setTimeout(() => handleNext(newAnswers), 200);
  };
  const handleMultiSelect = (option: string) => {
    const currentSelected = (answers[currentQ.id] as string[]) || [];
    let newSelected;
    if (currentSelected.includes(option)) {
      newSelected = currentSelected.filter(item => item !== option);
    } else {
      if (currentQ.maxSelect && currentSelected.length >= currentQ.maxSelect) return;
      newSelected = [...currentSelected, option];
    }
    setAnswers(prev => ({ ...prev, [currentQ.id]: newSelected }));
  };
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, id?: string) => {
    setAnswers(prev => ({ ...prev, [id || currentQ.id]: e.target.value }));
  };
  const handleContactChange = (field: string, value: string) => {
      setContactForm(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    if (!currentQ) return false;
    if (currentQ.type === 'form') {
      if (mode !== 'initial') return true;
      const hasName = !!contactForm.firstName;
      const hasEmail = !!(contactForm.email || userEmail);
      const hasPassword = !!userEmail || contactForm.password.length >= 6;
      return hasName && hasEmail && hasPassword;
    }
    const ans = answers[currentQ.id];
    if (currentQ.type === 'multi') return ans && ans.length > 0;
    if (currentQ.type === 'text' || currentQ.type === 'dollar') return true; 
    return !!ans;
  };
  
  if (showRecoveryForm) {
      return (
          <section id="intake-recovery" className="w-full min-h-screen flex flex-col items-center justify-center py-24 px-6 relative z-10">
              <div className="max-w-xl w-full bg-white/70 backdrop-blur-3xl p-12 md:p-16 rounded-[2.5rem] shadow-glass text-center border border-white/90">
                  <h3 className="text-2xl md:text-3xl font-serif text-brand-dark leading-tight mb-4">Resume Your Session</h3>
                  <div className="space-y-4 text-left">
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/40 ml-1">First Name</label>
                        <input type="text" value={contactForm.firstName} onChange={(e) => handleContactChange('firstName', e.target.value)} className="w-full p-4 rounded-xl bg-white border border-brand-dark/10 focus:border-brand-rich outline-none font-serif text-lg" placeholder="Jane"/>
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/40 ml-1">Email</label>
                        <input type="email" value={contactForm.email} onChange={(e) => handleContactChange('email', e.target.value)} className="w-full p-4 rounded-xl bg-white border border-brand-dark/10 focus:border-brand-rich outline-none font-serif text-lg" placeholder="jane@company.com"/>
                     </div>
                      <button onClick={() => { localStorage.setItem('afterload_intake', JSON.stringify(contactForm)); setShowRecoveryForm(false); }} disabled={!contactForm.firstName || !contactForm.email} className="w-full mt-4 px-8 py-3 rounded-full bg-brand-deep text-white font-bold tracking-wider text-xs uppercase flex items-center justify-center gap-2 transition-all hover:bg-brand-rich shadow-lg disabled:opacity-50 disabled:shadow-none">Continue <ArrowRight size={14} /></button>
                  </div>
              </div>
          </section>
      );
  }

  const renderQuestionContent = () => {
      if (!currentQ) return null;
      switch (currentQ.type) {
          case 'single':
              return currentQ.options?.map((option, idx) => {
                const optionValue = getOptionValue(option);
                const optionLabel = getOptionLabel(option);
                const isSelected = answers[currentQ.id] === optionValue;
                return (
                  <button
                    key={`${optionValue}-${idx}`}
                    onClick={() => handleSingleSelect(optionValue)}
                    className={`w-full p-4 text-left rounded-xl border transition-all duration-200 group flex items-center justify-between gap-3 ${isSelected ? 'bg-brand-deep text-white border-brand-deep shadow-lg scale-[1.01]' : 'bg-white border-brand-dark/5 hover:border-brand-rich/30 text-brand-dark/80 hover:bg-brand-light/30'}`}
                  >
                    <span className="font-medium text-sm md:text-base leading-snug">{optionLabel}</span>
                    {isSelected && <Check size={18} />}
                  </button>
                );
              });
          case 'multi':
              return currentQ.options?.map((option, idx) => {
                const optionValue = getOptionValue(option);
                const optionLabel = getOptionLabel(option);
                const isSelected = (answers[currentQ.id] as string[] || []).includes(optionValue);
                return (
                  <button
                    key={`${optionValue}-${idx}`}
                    onClick={() => handleMultiSelect(optionValue)}
                    className={`w-full p-4 text-left rounded-xl border transition-all duration-200 group flex items-center justify-between gap-3 ${isSelected ? 'bg-brand-rich/5 border-brand-rich text-brand-deep shadow-sm' : 'bg-white border-brand-dark/5 hover:border-brand-rich/30 text-brand-dark/80 hover:bg-brand-light/30'}`}
                  >
                    <span className="font-medium text-sm md:text-base leading-snug">{optionLabel}</span>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-brand-rich border-brand-rich text-white' : 'border-brand-dark/20 bg-white'}`}>
                      {isSelected && <Check size={12} />}
                    </div>
                  </button>
                );
              });
          case 'text': return <textarea value={answers[currentQ.id] || ''} onChange={(e) => handleTextChange(e)} placeholder={currentQ.placeholder} className="w-full h-40 p-5 rounded-xl bg-white border border-brand-dark/10 focus:border-brand-rich focus:ring-1 focus:ring-brand-rich outline-none resize-none font-lora text-lg placeholder:text-brand-dark/30" />;
          case 'dollar': return <input type="text" value={answers[currentQ.id] || ''} onChange={(e) => handleTextChange(e)} placeholder={currentQ.placeholder} className="w-full p-4 rounded-xl bg-white border border-brand-dark/10 focus:border-brand-rich outline-none font-serif text-lg text-center" />;
          case 'form':
              if (mode === 'initial') return (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/40 ml-1">First Name</label>
                      <input type="text" value={contactForm.firstName} onChange={(e) => handleContactChange('firstName', e.target.value)} className="w-full p-4 rounded-xl bg-white border border-brand-dark/10 focus:border-brand-rich outline-none font-serif text-lg" placeholder="Jane" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/40 ml-1">Email</label>
                      {userEmail ? (
                        <div className="w-full p-4 rounded-xl bg-brand-dark/5 border border-brand-dark/10 font-serif text-lg text-brand-dark/60">{userEmail}</div>
                      ) : (
                        <input type="email" value={contactForm.email} onChange={(e) => handleContactChange('email', e.target.value)} className="w-full p-4 rounded-xl bg-white border border-brand-dark/10 focus:border-brand-rich outline-none font-serif text-lg" placeholder="jane@company.com" />
                      )}
                    </div>
                  </div>
                  {!userEmail && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/40 ml-1 flex items-center gap-1.5">
                        <Lock size={10} className="text-brand-dark/30" />
                        Create Password
                      </label>
                      <input type="password" value={contactForm.password} onChange={(e) => handleContactChange('password', e.target.value)} className="w-full p-4 rounded-xl bg-white border border-brand-dark/10 focus:border-brand-rich outline-none font-serif text-lg" placeholder="At least 6 characters" />
                      {contactForm.password.length > 0 && contactForm.password.length < 6 && (
                        <p className="text-[10px] text-red-400 ml-1 mt-1">Password must be at least 6 characters</p>
                      )}
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/40 ml-1">Business Name</label>
                    <input type="text" value={contactForm.businessName} onChange={(e) => handleContactChange('businessName', e.target.value)} className="w-full p-4 rounded-xl bg-white border border-brand-dark/10 focus:border-brand-rich outline-none font-serif text-lg" placeholder="Acme Inc." />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/40 ml-1">Website <span className="text-brand-dark/20">(optional)</span></label>
                      <input type="url" value={contactForm.website} onChange={(e) => handleContactChange('website', e.target.value)} className="w-full p-4 rounded-xl bg-white border border-brand-dark/10 focus:border-brand-rich outline-none font-serif text-lg" placeholder="yoursite.com" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/40 ml-1">Industry Type</label>
                      <input type="text" value={contactForm.specificType} onChange={(e) => handleContactChange('specificType', e.target.value)} className="w-full p-4 rounded-xl bg-white border border-brand-dark/10 focus:border-brand-rich outline-none font-serif text-lg" placeholder="e.g. HVAC" />
                    </div>
                  </div>
                </div>
              );
              if (currentQ.id === 'superpower_audit') return (<div className="space-y-4"> <input type="text" value={answers.superpower_1 || ''} onChange={(e) => handleTextChange(e, 'superpower_1')} placeholder="Skill 1" className="w-full p-4 rounded-xl bg-white border border-brand-dark/10 focus:border-brand-rich outline-none font-serif text-lg" /> <input type="text" value={answers.superpower_2 || ''} onChange={(e) => handleTextChange(e, 'superpower_2')} placeholder="Skill 2" className="w-full p-4 rounded-xl bg-white border border-brand-dark/10 focus:border-brand-rich outline-none font-serif text-lg" /> </div>);
          default: return null;
      }
  };

  return (
    <section id="intake" className="w-full min-h-screen flex flex-col items-center justify-center py-24 px-6 relative z-10">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-12 md:mb-16 relative">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-rich/20 bg-brand-soft/30 backdrop-blur-md text-[10px] font-bold tracking-[0.2em] uppercase text-brand-rich mb-8 relative z-10 animate-[fadeInUp_0.5s_ease-out_both]">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-rich shadow-brand-rich/50"/>
              {mode === 'initial' ? 'The Diagnostic' : 'Clarity Session'}
           </div>
           <h2 className="relative z-10 text-5xl md:text-7xl font-serif text-brand-deep leading-[0.9] animate-[fadeInUp_0.5s_ease-out_0.1s_both]">
             {mode === 'initial' ? "Let's Start Here." : "Architected Clarity."}
           </h2>
        </div>

        <div className="max-w-xl w-full mx-auto bg-white/70 backdrop-blur-3xl p-12 md:p-16 rounded-[2.5rem] shadow-glass text-center border border-white/90 relative overflow-hidden animate-[fadeInUp_0.5s_ease-out_0.2s_both]">
             <div className="flex justify-between items-center mb-10">
                 <div className="text-[10px] font-bold tracking-widest text-brand-dark/30 uppercase">
                    {`Question ${step + 1} / ${totalSteps}`}
                 </div>
                 <div className="w-24 h-1 bg-brand-dark/5 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-rich" style={{ width: `${progress}%`, transition: 'width 0.5s ease-out' }}/>
                 </div>
             </div>

             <div key={`${mode}-${step}`} className="w-full flex-grow flex flex-col animate-[fadeIn_0.3s_ease-out_both]">
                    {currentQ && <>
                        <div className="mb-8 min-h-[8rem]">
                            <h3 className="text-2xl md:text-3xl font-serif text-brand-dark leading-tight mb-2">{currentQ.text}</h3>
                            {currentQ.helperText && <p className="text-sm text-brand-dark/40 italic">{currentQ.helperText}</p>}
                        </div>
                        <div className="space-y-3 flex-grow">{renderQuestionContent()}</div>
                    </>}
                    <div className="mt-10">
                        <div className="w-full flex justify-between items-center pt-6 border-t border-brand-dark/5">
                            {(step === 0 && canRestore) ? (
                                 <button onClick={handleRestore} className="px-4 py-2 rounded-lg bg-brand-dark/5 hover:bg-brand-dark/10 text-brand-dark/60 hover:text-brand-rich transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 animate-[scaleIn_0.3s_ease-out_both]"><RotateCcw size={12} />Resume Session</button>
                            ) : (
                                <button onClick={handlePrev} disabled={step === 0} className={`text-sm font-medium text-brand-dark/40 hover:text-brand-dark transition-colors flex items-center gap-2 ${step === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}><ArrowLeft size={14} /> Back</button>
                            )}
                            
                            {currentQ?.type !== 'single' && (
                                <button onClick={() => handleNext()} disabled={!canProceed()} className={`px-8 py-3 rounded-full bg-brand-deep text-white font-bold tracking-wider text-xs uppercase flex items-center gap-2 transition-all hover:bg-brand-rich shadow-lg disabled:opacity-50 disabled:shadow-none`}>{currentQ?.type === 'form' ? (mode === 'initial' ? (userEmail ? 'Get Report' : 'Create Account & Get Report') : 'Submit Answers') : 'Next'} <ArrowRight size={14} /></button>
                            )}
                        </div>
                    </div>
                </div>
        </div>
      </div>
    </section>
  );
}
