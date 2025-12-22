import React from 'react';
import { HelpCircle } from "lucide-react";

export const InfoLabel = ({ label, tooltip }) => (
    <div className="flex items-center gap-1.5 mb-1.5 group cursor-help w-max">
        <span className="text-xs font-medium text-slate-500 group-hover:text-emerald-400 transition-colors">{label}</span>
        <HelpCircle size={10} className="text-slate-600 group-hover:text-emerald-400 transition-colors"/>
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-56 p-3 bg-slate-950 border border-emerald-500/20 rounded-xl text-[10px] text-slate-300 shadow-2xl backdrop-blur-md z-50 pointer-events-none leading-relaxed">
            {tooltip}
        </div>
    </div>
);