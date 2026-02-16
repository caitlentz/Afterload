import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, ArrowRight, RotateCcw } from 'lucide-react';
import { CLARITY_SESSION_QUESTIONS, ClarityQuestion } from '../utils/claritySessionQuestions';

// Types for initial intake
type InitialQuestionType = 'single' | 'multi' | 'text' | 'scale' | 'form';
interface InitialQuestion {
  id: string;
  type: InitialQuestionType;
  text: string;
  helperText?: string;
  options?: string[];
  maxSelect?: number;
  placeholder?: string;
  dependsOn?: {
    questionId: string;
    requiredValue: any[];
  };
}

interface IntakeProps {
  onComplete: (answers: any) => void;
  mode?: 'initial' | 'deep';
  initialDataMissing?: boolean;
  userEmail?: string | null;
  key?: React.Key;
}

// --- UNIVERSAL INITIAL INTAKE QUESTIONS (v2) ---
const UNIVERSAL_QUESTIONS: InitialQuestion[] = [
  { id: 'business_model', type: 'single', text: "What best describes your business model?",
    options: ['Standardized service', 'Creative service', 'Expert service', 'Advisory/coaching', 'Hybrid model'] },
  { id: 'revenue_generation', type: 'single', text: "How is revenue primarily generated?",
    options: ['Founder delivers majority of service', 'Team delivers, founder reviews', 'Team delivers independently', 'Mix of founder + team delivery'] },
  { id: 'two_week_absence', type: 'single', text: "If you step away for 2 weeks, what happens?",
    options: ['Revenue drops immediately', 'Work slows significantly', 'Team continues but escalates decisions', 'Business runs mostly normally'] },
  { id: 'final_decisions', type: 'single', text: "Who makes final decisions on client work?",
    options: ['Always me', 'Mostly me', 'Shared with senior team', 'Rarely me'] },
  { id: 'project_stall', type: 'single', text: "Where do projects most often stall?",
    options: ['Waiting on my approval', 'Waiting on team execution', 'Waiting on clients', 'Hiring/staffing gaps', 'Nowhere obvious'] },
  { id: 'growth_limiter', type: 'single', text: "What limits your growth right now?",
    options: ['Not enough qualified staff', 'Not enough time', 'Inconsistent demand', 'Pricing structure', 'Operational inefficiency'] },
  { id: 'process_documentation', type: 'single', text: "How documented are your processes?",
    options: ['Mostly in my head', 'Light documentation', 'Documented but not used', 'Fully documented and followed'] },
  { id: 'roles_handled', type: 'single', text: "How many roles do you personally handle?",
    options: ['1\u20132', '3\u20134', '5\u20136', '7+'] },
  { id: 'client_relationship', type: 'single', text: "How are client relationships structured?",
    options: ['Clients hire me specifically', 'Clients hire the firm but expect me involved', 'Clients are assigned to team members', 'No founder involvement needed'] },
  { id: 'key_member_leaves', type: 'single', text: "What happens when a key team member leaves?",
    options: ['Revenue drops', 'Delivery slows', 'Temporary disruption', 'Minimal impact'] },
  { id: 'pricing_decisions', type: 'single', text: "How are pricing decisions made?",
    options: ['Only by me', 'I approve final pricing', 'Senior team sets pricing', 'Fixed pricing structure'] },
  { id: 'interruption_frequency', type: 'single', text: "How often are you interrupted for decisions?",
    options: ['Constantly throughout the day', 'Multiple times daily', 'A few times per week', 'Rarely'] },
  { id: 'hiring_situation', type: 'single', text: "What describes your hiring situation?",
    options: ['Actively hiring, hard to find talent', 'Hiring occasionally', 'Fully staffed', 'Overstaffed'] },
  { id: 'free_capacity', type: 'single', text: "What would free up the most capacity?",
    options: ['Delegating approvals', 'Hiring more staff', 'Better systems', 'Raising prices', 'Reducing client load'] },
  { id: 'current_state', type: 'single', text: "What best describes your current state?",
    options: ['Growing but strained', 'Stable but capped', 'Chaotic and reactive', 'Profitable but founder-heavy', 'Unsure'] },
  { id: 'contact', type: 'form', text: "Lets do this", helperText: "We'll generate your mini personalized diagnostic immediately" }
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
  const [contactForm, setContactForm] = useState({ firstName: '', email: userEmail || '', businessName: '', website: '', specificType: '' });
  
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
    if (mode === 'deep') {
        const savedIntake = localStorage.getItem('afterload_intake');
        const intakeData = savedIntake ? JSON.parse(savedIntake) : null;
        
        if (!intakeData && initialDataMissing) {
            setShowRecoveryForm(true);
        } else {
            setShowRecoveryForm(false);
            const track = determineClarityTrack(intakeData);
            const filtered = CLARITY_SESSION_QUESTIONS.filter(q =>
                q.tracks.includes('UNIVERSAL') || q.tracks.includes(track)
            );
            setClarityQuestions(filtered);
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
        } catch (e) { console.error("Error checking saved session", e); }
    }
  }, [mode, initialDataMissing, STORAGE_KEY]);
  
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
                setContactForm(parsed.contactForm || { firstName: '', email: '', businessName: '', website: '', specificType: '' });
            }
            setCanRestore(false);
          } catch (e) { console.error("Error restoring session", e); }
      }
  };

  const activeInitialQuestions = UNIVERSAL_QUESTIONS;
  const questions = mode === 'initial' ? activeInitialQuestions : clarityQuestions;
  const currentQ = questions[step];
  
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
        const finalAnswers = {
          ...currentAnswers,
          ...contactForm,
          ...(mode === 'deep' ? { _deepDiveComplete: true } : {}),
        };
        localStorage.removeItem(STORAGE_KEY);
        onComplete(finalAnswers);
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
    if (currentQ.type === 'form') return mode === 'initial' ? (contactForm.firstName && (contactForm.email || userEmail)) : true;
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
          case 'single': return currentQ.options?.map((option, idx) => <button key={idx} onClick={() => handleSingleSelect(option)} className={`w-full p-4 text-left rounded-xl border transition-all duration-200 group flex items-center justify-between ${answers[currentQ.id] === option ? 'bg-brand-deep text-white border-brand-deep shadow-lg scale-[1.01]' : 'bg-white border-brand-dark/5 hover:border-brand-rich/30 text-brand-dark/80 hover:bg-brand-light/30'}`}><span className="font-medium text-sm md:text-base">{option}</span>{answers[currentQ.id] === option && <Check size={18} />}</button>);
          case 'multi': return currentQ.options?.map((option, idx) => { const isSelected = (answers[currentQ.id] as string[] || []).includes(option); return (<button key={idx} onClick={() => handleMultiSelect(option)} className={`w-full p-4 text-left rounded-xl border transition-all duration-200 group flex items-center justify-between ${isSelected ? 'bg-brand-rich/5 border-brand-rich text-brand-deep shadow-sm' : 'bg-white border-brand-dark/5 hover:border-brand-rich/30 text-brand-dark/80 hover:bg-brand-light/30'}`}><span className="font-medium text-sm md:text-base">{option}</span><div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-brand-rich border-brand-rich text-white' : 'border-brand-dark/20 bg-white'}`}>{isSelected && <Check size={12} />}</div></button>); });
          case 'text': return <textarea value={answers[currentQ.id] || ''} onChange={(e) => handleTextChange(e)} placeholder={currentQ.placeholder} className="w-full h-40 p-5 rounded-xl bg-white border border-brand-dark/10 focus:border-brand-rich focus:ring-1 focus:ring-brand-rich outline-none resize-none font-lora text-lg placeholder:text-brand-dark/30" />;
          case 'dollar': return <input type="text" value={answers[currentQ.id] || ''} onChange={(e) => handleTextChange(e)} placeholder={currentQ.placeholder} className="w-full p-4 rounded-xl bg-white border border-brand-dark/10 focus:border-brand-rich outline-none font-serif text-lg text-center" />;
          case 'form':
              if (mode === 'initial') return (<div className="space-y-4"> <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> <div className="space-y-1"> <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/40 ml-1">First Name</label> <input type="text" value={contactForm.firstName} onChange={(e) => handleContactChange('firstName', e.target.value)} className="w-full p-4 rounded-xl bg-white border border-brand-dark/10 focus:border-brand-rich outline-none font-serif text-lg" placeholder="Jane" /> </div> <div className="space-y-1"> <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/40 ml-1">Email</label> {userEmail ? (<div className="w-full p-4 rounded-xl bg-brand-dark/5 border border-brand-dark/10 font-serif text-lg text-brand-dark/60">{userEmail}</div>) : (<input type="email" value={contactForm.email} onChange={(e) => handleContactChange('email', e.target.value)} className="w-full p-4 rounded-xl bg-white border border-brand-dark/10 focus:border-brand-rich outline-none font-serif text-lg" placeholder="jane@company.com" />)} </div> </div> <div className="space-y-1"> <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/40 ml-1">Business Name</label> <input type="text" value={contactForm.businessName} onChange={(e) => handleContactChange('businessName', e.target.value)} className="w-full p-4 rounded-xl bg-white border border-brand-dark/10 focus:border-brand-rich outline-none font-serif text-lg" placeholder="Acme Inc." /> </div> <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> <div className="space-y-1"> <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/40 ml-1">Website <span className="text-brand-dark/20">(optional)</span></label> <input type="url" value={contactForm.website} onChange={(e) => handleContactChange('website', e.target.value)} className="w-full p-4 rounded-xl bg-white border border-brand-dark/10 focus:border-brand-rich outline-none font-serif text-lg" placeholder="yoursite.com" /> </div> <div className="space-y-1"> <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/40 ml-1">Industry Type</label> <input type="text" value={contactForm.specificType} onChange={(e) => handleContactChange('specificType', e.target.value)} className="w-full p-4 rounded-xl bg-white border border-brand-dark/10 focus:border-brand-rich outline-none font-serif text-lg" placeholder="e.g. HVAC" /> </div> </div> </div>);
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
                                <button onClick={() => handleNext()} disabled={!canProceed()} className={`px-8 py-3 rounded-full bg-brand-deep text-white font-bold tracking-wider text-xs uppercase flex items-center gap-2 transition-all hover:bg-brand-rich shadow-lg disabled:opacity-50 disabled:shadow-none`}>{currentQ?.type === 'form' ? (mode === 'initial' ? 'Get Report' : 'Submit Answers') : 'Next'} <ArrowRight size={14} /></button>
                            )}
                        </div>
                    </div>
                </div>
        </div>
      </div>
    </section>
  );
}