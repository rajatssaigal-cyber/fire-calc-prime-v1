import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from "lucide-react";

export const CollapsibleSection = ({ title, icon: Icon, color, children, defaultOpen = false, rightContent = null }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="mb-4 bg-slate-900/60 border border-white/5 rounded-xl overflow-hidden transition-all duration-300 hover:border-emerald-500/20 relative z-10">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-slate-950 border border-white/5 group-hover:border-${color.split('-')[1]}-500/50 transition-colors shadow-inner`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <span className="text-sm font-bold text-slate-200 tracking-tight">{title}</span>
        </div>
        <div className="flex items-center gap-3">
            {rightContent && <div className="text-xs font-mono font-medium text-slate-400 bg-black/40 px-2 py-1 rounded border border-white/5">{rightContent}</div>}
            {isOpen ? <ChevronUp size={16} className="text-slate-500"/> : <ChevronDown size={16} className="text-slate-500"/>}
        </div>
      </button>
      
      <div className={`overflow-hidden transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isOpen ? 'max-h-[1500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-4 pt-0">
          {children}
        </div>
      </div>
    </div>
  );
};