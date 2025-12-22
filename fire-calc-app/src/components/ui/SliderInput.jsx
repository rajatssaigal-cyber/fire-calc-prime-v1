import React, { useEffect, useState } from 'react';
import { InfoLabel } from './InfoLabel';

export const SliderInput = ({ label, value, onChange, min = 0, max = 100, step = 0.1, suffix = "%", icon: Icon, tooltip }) => {
  const [localVal, setLocalVal] = useState(value);

  // Sync local state when parent value changes
  useEffect(() => {
    setLocalVal(value);
  }, [value]);

  const handleManualChange = (e) => {
    let val = e.target.value;
    // Allow empty string for typing
    if (val === '') {
        setLocalVal(''); 
        return;
    }
    
    // Parse and clamp
    const num = parseFloat(val);
    if (!isNaN(num)) {
        setLocalVal(num); // Keep UI fluid
        onChange(num);    // Send valid number to parent
    }
  };

  return (
    <div className="group pt-2 relative">
      <div className="flex justify-between items-end mb-2">
        <div className="flex items-center gap-2 mb-1">
          {Icon && <Icon size={14} className="text-slate-500" />}
          {tooltip ? (
              <InfoLabel label={label} tooltip={tooltip}/>
          ) : (
              <label className="text-xs font-medium text-slate-400 group-hover:text-slate-300 transition-colors">{label}</label>
          )}
        </div>
        
        {/* MANUAL INPUT BOX */}
        <div className="flex items-center bg-slate-900 border border-slate-700 rounded-md overflow-hidden focus-within:border-emerald-500/50 transition-colors w-20">
            <input 
                type="number"
                min={min} 
                max={max} 
                step={step}
                value={localVal}
                onChange={handleManualChange}
                className="w-full bg-transparent text-right text-xs font-bold text-emerald-400 p-1 outline-none appearance-none"
            />
            <span className="text-[10px] text-slate-500 pr-1.5 select-none font-medium">{suffix.replace(' ','')}</span>
        </div>
      </div>
      
      <input 
        type="range" min={min} max={max} step={step} value={value || 0} 
        onChange={(e) => {
            const v = parseFloat(e.target.value);
            setLocalVal(v);
            onChange(v);
        }}
        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-all"
      />
    </div>
  );
};
