import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
  key?: React.Key;
}

const FAQItem = ({ question, answer, isOpen, onClick }: FAQItemProps) => {
  return (
    <div className="border-b border-brand-dark/10 last:border-0">
      <button 
        onClick={onClick}
        className="w-full py-8 flex items-center justify-between text-left group"
      >
        <span className={`font-serif text-xl md:text-2xl transition-colors duration-300 ${isOpen ? 'text-brand-rich' : 'text-brand-dark group-hover:text-brand-rich/70'}`}>
          {question}
        </span>
        <div className={`shrink-0 ml-6 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${isOpen ? 'border-brand-rich bg-brand-rich text-white rotate-180' : 'border-brand-dark/20 text-brand-dark/40 group-hover:border-brand-dark/40'}`}>
          {isOpen ? <Minus size={14} /> : <Plus size={14} />}
        </div>
      </button>
      <div className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <p className="pb-8 font-lora text-lg text-brand-dark/70 leading-relaxed max-w-2xl">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Are you going to try to sell me coaching?",
      answer: "No. We hate discovery calls as much as you do. You get the data, and if you want help implementing it, you can ask. If not, we leave you alone."
    },
    {
      question: "What if I don't have all my numbers ready?",
      answer: "Estimates are fine. We aren't the IRS. We just need to know if you're drowning in $500 problems or $50,000 problems."
    },
    {
      question: "What exactly is this diagnostic?",
      answer: "A structured operational diagnostic that shows where your business is quietly depending on you — and where it doesn’t have to."
    },
    {
      question: "What do I get at the end?",
      answer: "A written diagnostic report with a bottleneck map, system-fit assessment, and founder load profile."
    },
    {
      question: "What will this change for me right away?",
      answer: "Clarity. You’ll know where your business is relying on you, where it’s under strain, and what actually matters next."
    }
  ];

  return (
    <section className="py-24 px-6 relative z-10">
      <div className="max-w-3xl mx-auto">

        <div className="mb-16">
          <div className="flex items-center gap-4 mb-6">
             <div className="h-px w-8 bg-brand-muted"></div>
             <span className="text-xs font-bold tracking-[0.2em] text-brand-primary uppercase">No Surprises</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-brand-dark">
            Real Talk
          </h2>
        </div>

        <div className="border-t border-brand-dark/10">
          {faqs.map((faq, idx) => (
            <FAQItem 
              key={idx}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === idx}
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            />
          ))}
        </div>

      </div>
    </section>
  );
}