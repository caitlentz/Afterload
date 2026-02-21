import React from 'react';

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden z-0 pointer-events-none bg-brand-bg">
      <div className="absolute inset-0 w-full h-full">
        {/* Orb 1 */}
        <div
          className="absolute -top-[20%] -left-[10%] w-[100vw] h-[50vw] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] bg-brand-soft/60 blur-[100px] animate-[orb1_30s_ease-in-out_infinite]"
        />
        {/* Orb 3 */}
        <div
          className="absolute -bottom-[20%] -left-[10%] w-[120vw] h-[120vw] rounded-[50%_50%_30%_70%/50%_50%_70%_60%] bg-sage-300/60 blur-[50px] animate-[orb3_32s_ease-in-out_infinite]"
        />
      </div>
      {/* Orb 2 */}
      <div
        className="absolute top-[20%] -right-[20%] w-[100vw] h-[100vw] rounded-[60%_40%_30%_70%/60%_30%_70%_40%] bg-brand-lilac/60 blur-[150px] animate-[orb2_25s_ease-in-out_infinite]"
      />
    </div>
  );
};

export default Background;
