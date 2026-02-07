import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, ArrowRight, RotateCcw } from 'lucide-react';
import { DEEP_DIVE_QUESTIONS, DeepQuestion } from '../utils/deepDiveQuestions';

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

type BusinessType = 'time_bound' | 'decision_heavy' | 'founder_led' | null;

interface IntakeProps {
  onComplete: (answers: any) => void;
  mode?: 'initial' | 'deep';
  initialDataMissing?: boolean;
  userEmail?: string | null;
  key?: React.Key;
}

// Initial Intake Questions (unchanged)
const ROUTING_QUESTION: InitialQuestion = {
  id: 'business_type', type: 'single', text: "Which best describes your operational model?", helperText: "This helps us identify which specific constraint logic applies to you.",
  options: ['Creative Services (Design, Branding, Event Planning)', 'Expert Services (Law, Medicine, Engineering)', 'Logistics & Trades (Construction, Manufacturing, Custom Fab)', 'Coaching & Consulting (Education, Training)', 'Standardized / Personal Services (Salons, Wellness, Other)']
};
const TEAM_SIZE_QUESTION: InitialQuestion = {
  id: 'team_size', type: 'single', text: "How large is your team (excluding you)?", helperText: "Include full-time and consistent contractors",
  options: ['Just me (Solopreneur)', '1-2 people', '3-5 people', '6-10 people', '11-20 people', '20+ people']
};
// Reusing previously defined initial questions for brevity as they haven't changed in structure, 
// just mapped differently in track logic below.
const TIME_BOUND_QUESTIONS: InitialQuestion[] = [ TEAM_SIZE_QUESTION, { id: 'capacity_utilization', type: 'single', text: "How full is your schedule typically?", options: ['Struggling to fill appointments', 'Comfortable - some open slots', 'Mostly booked', 'Completely full, turning people away', 'Overbooked - running behind constantly'] }, { id: 'absence_impact', type: 'single', text: "What happens when you're not there for a day?", options: ['Business runs fine without me', 'Team handles it, minor hiccups', 'Appointments get rescheduled', 'Revenue drops immediately', 'Everything stops'] }, { id: 'hourly_rate', type: 'single', text: "What's your effective hourly rate?", options: ['Under $50/hour', '$50-$100/hour', '$100-$150/hour', '$150-$250/hour', '$250-$400/hour', 'Over $400/hour'] }, { id: 'growth_blocker', type: 'single', text: "What stops you from taking on more clients right now?", options: ['Not enough demand', 'Not enough hours in the day', "Can't find/train good people", "Don't have systems to scale", 'Already at capacity but not profitable enough'] }, { id: 'doc_state', type: 'single', text: "Where are your processes or SOPs documented?", options: ['Centralized system', 'Employee handbook', 'Notes everywhere', "It's all in my head"] }, { id: 'current_revenue_estimate', type: 'single', text: "What's your approximate annual revenue?", options: ['Under $100k', '$100k - $250k', '$250k - $500k', '$500k - $1M', '$1M - $2M', 'Over $2M'] }, { id: 'time_theft', type: 'multi', text: "What eats your time between actual service delivery?", maxSelect: 2, options: ['Scheduling/rebooking', 'Chasing payments', 'Answering repetitive questions', 'Fixing mistakes', 'Managing team', 'Supply management'] }, { id: 'biggest_frustration', type: 'text', text: "What's the single most frustrating thing about running this business right now?" }, { id: 'contact', type: 'form', text: "Lets do this" }];
const DECISION_HEAVY_QUESTIONS: InitialQuestion[] = [ TEAM_SIZE_QUESTION, { id: 'decision_backlog', type: 'single', text: "How many things are waiting on your input right now?", options: ['Nothing', '1-3 things', '5-10 things', '10+ things', "Lost count"] }, { id: 'approval_frequency', type: 'single', text: "How often does work stop waiting for you to review?", options: ['Rarely', 'Once a day', 'Multiple times a day', "Constantly"] }, { id: 'context_switching', type: 'single', text: "How many times do you get interrupted per day?", options: ['Rarely', '3-5 times', '10+ times', 'Non-stop'] }, { id: 'mental_energy', type: 'single', text: "By the end of the day, how do you feel mentally?", options: ['Energized', 'Tired but satisfied', 'Drained', 'Fried'] }, { id: 'hourly_rate', type: 'single', text: "Effective hourly rate?", options: ['Under $50', '$50-$100', '$100-$150', '$150-$250', '$250-$400', 'Over $400'] }, { id: 'doc_state', type: 'single', text: "Where are SOPs documented?", options: ['Centralized', 'Handbook', 'Notes', "Head"] }, { id: 'doc_usage', type: 'single', text: "Do people use the docs?", options: ['Yes', 'Sometimes', 'Rarely', 'No'] }, { id: 'delegation_blocker', type: 'single', text: "Why don't you delegate more?", options: ['I do', "No context", 'Faster myself', "Quality trust", 'Client expects me'] }, { id: 'project_pile_up', type: 'single', text: "Where do projects get stuck?", options: ['Waiting on client', 'Waiting on me', "Team confusion", 'Scope creep', 'Quality issues'] }, { id: 'contact', type: 'form', text: "Lets do this" }];
const FOUNDER_LED_QUESTIONS: InitialQuestion[] = [ TEAM_SIZE_QUESTION, { id: 'revenue_dependency', type: 'single', text: "If you stopped client work for 2 weeks, what happens to revenue?", options: ['No change', 'Dips slightly', 'Drops significantly', 'Goes to zero'] }, { id: 'client_expectation', type: 'single', text: "Do clients expect YOU specifically?", options: ["Fine with team", 'Prefer me', 'Expect me on major things', "Only me"] }, { id: 'delegation_fear', type: 'single', text: "What scares you most about delegating?", options: ['Not scared', "Quality issues", 'Client unhappy', "They don't need me", "Lose edge"] }, { id: 'identity_attachment', type: 'single', text: "Identity attachment to 'doing the work'?", options: ["Business owner", 'Shifting', "Practitioner", "I AM the work"] }, { id: 'hourly_rate', type: 'single', text: "Effective hourly rate?", options: ['Under $50', '$50-$100', '$100-$150', '$150-$250', '$250-$400', 'Over $400'] }, { id: 'team_capability', type: 'single', text: "Could team do what you do at 80% quality?", options: ['Yes', 'Yes with training', 'Maybe years', 'No'] }, { id: 'contact', type: 'form', text: "Lets do this" }];


function getInitialQuestionSet(businessType: BusinessType): InitialQuestion[] {
  switch (businessType) {
    case 'time_bound': return TIME_BOUND_QUESTIONS;
    case 'decision_heavy': return DECISION_HEAVY_QUESTIONS;
    case 'founder_led': return FOUNDER_LED_QUESTIONS;
    default: return DECISION_HEAVY_QUESTIONS;
  }
}

function mapAnswerToBusinessType(answer: string | undefined): BusinessType {
  if (!answer) return null;
  if (answer.includes('Logistics') || answer.includes('Standardized')) return 'time_bound';
  if (answer.includes('Coaching') || answer.includes('Consulting')) return 'founder_led';
  return 'decision_heavy'; // Creative, Expert
}

// Updated per PDF: 
// Track A: Time-Bound
// Track B: Decision-Heavy
// Track C: Founder-Led
function determineDeepDiveTrack(answer: string | undefined): 'A' | 'B' | 'C' {
    if (!answer) return 'B'; 
    if (answer.includes('Logistics') || answer.includes('Standardized')) return 'A';
    if (answer.includes('Coaching') || answer.includes('Consulting')) return 'C';
    return 'B'; // Creative, Expert
}


export default function Intake({ onComplete, mode = 'initial', initialDataMissing = false, userEmail }: IntakeProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [direction, setDirection] = useState(1);
  const [contactForm, setContactForm] = useState({ firstName: '', email: userEmail || '', businessName: '', website: '', specificType: '' });
  const [initialBusinessType, setInitialBusinessType] = useState<BusinessType>(null);
  const [isRoutingPhase, setIsRoutingPhase] = useState(true);
  
  const STORAGE_KEY = `afterload_intake_progress_${mode}`;
  const [canRestore, setCanRestore] = useState(false);

  // Sync userEmail into contactForm when auth loads asynchronously
  useEffect(() => {
    if (userEmail && !contactForm.email) {
      setContactForm(prev => ({ ...prev, email: userEmail }));
    }
  }, [userEmail]);

  const [deepDiveQuestions, setDeepDiveQuestions] = useState<DeepQuestion[]>([]);
  const [showRecoveryForm, setShowRecoveryForm] = useState(initialDataMissing && mode === 'deep');

  useEffect(() => {
    if (mode === 'deep') {
        const savedIntake = localStorage.getItem('afterload_intake');
        const intakeData = savedIntake ? JSON.parse(savedIntake) : null;
        
        if (!intakeData && initialDataMissing) {
            setShowRecoveryForm(true);
        } else {
            setShowRecoveryForm(false);
            const track = determineDeepDiveTrack(intakeData?.business_type);
            const filtered = DEEP_DIVE_QUESTIONS.filter(q => 
                q.tracks.includes('UNIVERSAL') || q.tracks.includes(track)
            );
            setDeepDiveQuestions(filtered);
        }
    } else {
        setIsRoutingPhase(true);
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
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, answers, contactForm, initialBusinessType, isRoutingPhase }));
      }
  }, [step, answers, contactForm, initialBusinessType, isRoutingPhase, STORAGE_KEY]);

  const handleRestore = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setAnswers(parsed.answers || {});
            setStep(parsed.step || 0);
            if (mode === 'initial') {
                setContactForm(parsed.contactForm || { firstName: '', email: '', businessName: '', website: '', specificType: '' });
                setInitialBusinessType(parsed.initialBusinessType || null);
                setIsRoutingPhase(parsed.isRoutingPhase !== undefined ? parsed.isRoutingPhase : true);
            }
            setCanRestore(false);
          } catch (e) { console.error("Error restoring session", e); }
      }
  };

  const activeInitialQuestions = isRoutingPhase ? [ROUTING_QUESTION] : getInitialQuestionSet(initialBusinessType);
  const questions = mode === 'initial' ? activeInitialQuestions : deepDiveQuestions;
  const currentQ = questions[step];
  
  const totalSteps = questions.length;
  const progress = totalSteps > 0 ? ((step + 1) / totalSteps) * 100 : 0;

  const handleNext = (answersOverride?: Record<string, any>) => {
    const currentAnswers = answersOverride || answers;
    setDirection(1);

    if (mode === 'initial' && isRoutingPhase) {
        const selectedType = mapAnswerToBusinessType(currentAnswers['business_type']);
        setInitialBusinessType(selectedType);
        setIsRoutingPhase(false);
        setStep(0);
        return;
    }
    
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
        const finalAnswers = { ...currentAnswers, ...contactForm, businessType: initialBusinessType };
        localStorage.removeItem(STORAGE_KEY);
        onComplete(finalAnswers);
    } else {
        setStep(nextStep);
    }
  };

  const handlePrev = () => {
    setDirection(-1);
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
    } else if (mode === 'initial' && !isRoutingPhase) {
        setIsRoutingPhase(true);
        setStep(0);
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
              if (mode === 'initial') return (<div className="space-y-4"> <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> <div className="space-y-1"> <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/40 ml-1">First Name</label> <input type="text" value={contactForm.firstName} onChange={(e) => handleContactChange('firstName', e.target.value)} className="w-full p-4 rounded-xl bg-white border border-brand-dark/10 focus:border-brand-rich outline-none font-serif text-lg" placeholder="Jane" /> </div> <div className="space-y-1"> <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/40 ml-1">Email</label> {userEmail ? (<div className="w-full p-4 rounded-xl bg-brand-dark/5 border border-brand-dark/10 font-serif text-lg text-brand-dark/60">{userEmail}</div>) : (<input type="email" value={contactForm.email} onChange={(e) => handleContactChange('email', e.target.value)} className="w-full p-4 rounded-xl bg-white border border-brand-dark/10 focus:border-brand-rich outline-none font-serif text-lg" placeholder="jane@company.com" />)} </div> </div> <div className="space-y-1"> <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/40 ml-1">Business Name</label> <input type="text" value={contactForm.businessName} onChange={(e) => handleContactChange('businessName', e.target.value)} className="w-full p-4 rounded-xl bg-white border border-brand-dark/10 focus:border-brand-rich outline-none font-serif text-lg" placeholder="Acme Inc." /> </div> </div>);
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
              {mode === 'initial' ? 'The Diagnostic' : 'Deep Dive'}
           </div>
           <h2 className="relative z-10 text-5xl md:text-7xl font-serif text-brand-deep leading-[0.9] animate-[fadeInUp_0.5s_ease-out_0.1s_both]">
             {mode === 'initial' ? "Let's Start Here." : "Architected Clarity."}
           </h2>
        </div>

        <div className="max-w-xl w-full mx-auto bg-white/70 backdrop-blur-3xl p-12 md:p-16 rounded-[2.5rem] shadow-glass text-center border border-white/90 relative overflow-hidden animate-[fadeInUp_0.5s_ease-out_0.2s_both]">
             <div className="flex justify-between items-center mb-10">
                 <div className="text-[10px] font-bold tracking-widest text-brand-dark/30 uppercase">
                    {(mode === 'initial' && isRoutingPhase) ? 'Getting Started' : `Question ${step + 1} / ${totalSteps}`}
                 </div>
                 <div className="w-24 h-1 bg-brand-dark/5 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-rich" style={{ width: `${progress}%`, transition: 'width 0.5s ease-out' }}/>
                 </div>
             </div>

             <div key={`${mode}-${step}`} className="w-full flex-grow flex flex-col animate-[fadeIn_0.3s_ease-out_both]">
                    {currentQ && <>
                        <div className="mb-8 min-h-[8rem]">
                            <h3 className="text-2xl md:text-3xl font-serif text-brand-dark leading-tight mb-4">{currentQ.text}</h3>
                        </div>
                        <div className="space-y-3 flex-grow">{renderQuestionContent()}</div>
                    </>}
                    <div className="mt-10">
                        <div className="w-full flex justify-between items-center pt-6 border-t border-brand-dark/5">
                            {(step === 0 && (mode === 'deep' || isRoutingPhase) && canRestore) ? (
                                 <button onClick={handleRestore} className="px-4 py-2 rounded-lg bg-brand-dark/5 hover:bg-brand-dark/10 text-brand-dark/60 hover:text-brand-rich transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 animate-[scaleIn_0.3s_ease-out_both]"><RotateCcw size={12} />Resume Session</button>
                            ) : (
                                <button onClick={handlePrev} disabled={step === 0 && (mode === 'deep' || isRoutingPhase)} className={`text-sm font-medium text-brand-dark/40 hover:text-brand-dark transition-colors flex items-center gap-2 ${step === 0 && (mode === 'deep' || isRoutingPhase) ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}><ArrowLeft size={14} /> Back</button>
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