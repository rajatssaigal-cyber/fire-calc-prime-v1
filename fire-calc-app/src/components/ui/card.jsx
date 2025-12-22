import React from 'react';

export const Card = ({ children, className = "", glow = "none" }) => {
  const glowStyles = {
    none: "border-white/5",
    green: "border-emerald-500/30 shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]", 
    red: "border-rose-500/30 shadow-[0_0_20px_-5px_rgba(244,63,94,0.2)]",    
    gold: "border-amber-400/30 shadow-[0_0_20px_-5px_rgba(251,191,36,0.2)]"    
  };
  return (
    <div className={`bg-slate-900/80 backdrop-blur-md border rounded-2xl overflow-hidden transition-all duration-500 ${glowStyles[glow] || glowStyles.none} ${className} relative z-10`}>
      {children}
    </div>
  );
};