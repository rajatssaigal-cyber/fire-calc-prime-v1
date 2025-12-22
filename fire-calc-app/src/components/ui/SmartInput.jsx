import React, { useState, useEffect } from 'react';
import { InfoLabel } from './InfoLabel';

export const SmartInput = ({ value, onChange, prefix = "", suffix = "", label, placeholder = "", className = "", error = false, icon: Icon, iconColor="text-slate-500", tooltip }) => {
  const [localValue, setLocalValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      const safeVal = (isNaN(value) || !isFinite(value)) ? 0 : value;
      setLocalValue(safeVal === 0 ? "" : new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(safeVal));
    }
  }, [value, isFocused]);

  const handleChange = (e) => {
    const raw = e.target.value.replace(/,/g, '');
    if (raw.length > 12) return; 
    if (raw === "" || /^-?[0-9]*\.?[0-9]*$/.test(raw)) {
        setLocalValue(e.target.value);
        const num = parseFloat(raw);
        onChange(isNaN(num) ? 0 : num);
    }
  };

  return (
    <div className={`group relative ${className}`}>
      {label && (tooltip ? <InfoLabel label={label} tooltip={tooltip}/> : <label className={`text-xs font-medium mb-1.5 block transition-colors ${error ? 'text-rose-400' : 'text-slate-500 group-focus-within:text-emerald-400'}`}>{label}</label>)}
      <div className="relative flex items-center">
        {Icon && <div className="absolute left-3 z-10 pointer-events-none"><Icon size={16} className={`${iconColor} transition-colors group-focus-within:text-white`} /></div>}
        {prefix && <span className={`absolute text-slate-500 text-sm font-bold pointer-events-none select-none transition-colors group-focus-within:text-slate-300 ${Icon ? "left-9" : "left-3"}`}>{prefix}</span>}
        <input
          type="text" inputMode="decimal" value={localValue}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full bg-slate-950 text-slate-100 rounded-lg py-2.5 text-base md:text-sm font-bold outline-none transition-all duration-200 placeholder:text-slate-800 font-mono shadow-inner
            ${Icon && prefix ? "pl-14" : Icon ? "pl-9" : prefix ? "pl-7" : "pl-3"} ${suffix ? "pr-8" : "pr-3"}
            ${error ? "border border-rose-500/50 focus:border-rose-500" : "border border-slate-800 focus:border-emerald-500/50 focus:bg-black focus:ring-1 focus:ring-emerald-500/20"}`}
        />
        {suffix && <span className="absolute right-3 text-slate-600 text-xs font-medium pointer-events-none select-none">{suffix}</span>}
      </div>
    </div>
  );
};