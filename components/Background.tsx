import React from 'react';

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden z-0 pointer-events-none bg-brand-bg">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(253,252,247,0.92)_0%,rgba(247,244,246,0.84)_45%,rgba(240,237,234,0.8)_100%)]" />
      <div className="absolute inset-0 w-full h-full">
        {/* Orb 1 */}
        <div
          className="absolute -top-[20%] -left-[10%] w-[100vw] h-[50vw] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] bg-brand-soft/70 blur-[128px] animate-[orb1_30s_ease-in-out_infinite]"
        />
        {/* Orb 3 */}
        <div
          className="absolute -bottom-[20%] -left-[10%] w-[120vw] h-[120vw] rounded-[50%_50%_30%_70%/50%_50%_70%_60%] bg-sage-300/70 blur-[92px] animate-[orb3_32s_ease-in-out_infinite]"
        />
      </div>
      {/* Orb 2 */}
      <div
        className="absolute top-[20%] -right-[20%] w-[100vw] h-[100vw] rounded-[60%_40%_30%_70%/60%_30%_70%_40%] bg-brand-lilac/70 blur-[170px] animate-[orb2_25s_ease-in-out_infinite]"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(50% 36% at 24% 18%, rgba(156, 175, 156, 0.2), transparent 72%), radial-gradient(44% 32% at 78% 76%, rgba(247, 244, 246, 0.26), transparent 74%)',
        }}
      />
    </div>
  );
};

export default Background;
