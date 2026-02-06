import React from 'react';

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden z-0 pointer-events-none bg-brand-bg">
      <div className="absolute inset-0 w-full h-full">
        {/* Orb 1 — soft warm wash */}
        <div
          className="absolute -top-[20%] -left-[10%] w-[100vw] h-[50vw] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] bg-sage-300/40 blur-[150px] animate-[orb1_30s_ease-in-out_infinite]"
        />
      </div>
        {/* Orb 2 — cool accent */}
        <div
          className="absolute top-[20%] -right-[20%] w-[80vw] h-[80vw] rounded-[60%_40%_30%_70%/60%_30%_70%_40%] bg-brand-lilac/40 blur-[200px] animate-[orb2_25s_ease-in-out_infinite]"
        />
    </div>
  );
};

export default Background;
