import React from 'react';
import { InfoLabel } from './InfoLabel';

export const SliderInput = ({ label, value, onChange, min = 0, max = 100, step = 0.1, suffix = "%", icon: Icon, tooltip }) => (
  <div className="group pt-2 relative">
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={12} className="text-slate-500" />}
        {tooltip ? <InfoLabel label={label} tooltip={tooltip}/> : <label className="text-xs font-medium text-slate-400 group-hover:text-slate-300 transition-colors">{label}</label>}
      </div>
      <div className="text-xs font-bold text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{value}{suffix}</div>
    </div>
    <input 
      type="range" min={min} max={max} step={step} value={value || 0} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-all"
    />
  </div>
);