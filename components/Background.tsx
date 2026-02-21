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
      {/* Orb 3 — center bloom */}
      <div
        className="absolute top-[28%] left-[20%] w-[55vw] h-[55vw] rounded-[47%_53%_34%_66%/56%_42%_58%_44%] bg-brand-newGlow/35 blur-[170px] animate-[orb3_32s_ease-in-out_infinite]"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.25),transparent_58%)]" />
    </div>
  );
};

export default Background;
