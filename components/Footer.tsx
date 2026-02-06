import React from 'react';

interface FooterProps {
  onLoginClick?: () => void;
}

export default function Footer({ onLoginClick }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-16 px-6 border-t border-brand-dark/5 bg-transparent relative z-10 mt-12">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-deep" />
          <span className="font-serif text-sm text-brand-dark/40">Afterload</span>
          <span className="text-[10px] text-brand-dark/20 uppercase tracking-widest ml-2">© {currentYear}</span>
        </div>

        {onLoginClick && (
          <button
            onClick={onLoginClick}
            className="text-[10px] text-brand-dark/30 hover:text-brand-dark/60 uppercase tracking-widest transition-colors"
          >
            Login
          </button>
        )}
      </div>
    </footer>
  );
}
