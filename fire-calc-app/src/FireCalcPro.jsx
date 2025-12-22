import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, ComposedChart, Bar
} from "recharts";
import {
  TrendingUp, Calendar, Target, Wallet, Plus, Trash2, RotateCcw, Eraser, Download, Scissors, Banknote, Clock, PieChart, ShieldAlert, ChevronDown, ChevronUp, ArrowRight, AlertCircle, AlertTriangle, CheckCircle2, Eye, EyeOff, CreditCard, Coins, PiggyBank, Landmark, ShieldCheck, Umbrella, BookOpen, Calculator, HelpCircle, Snowflake, Gift, Star, Trees
} from "lucide-react";

// --- 1. SEO & META INJECTION ---
const SEOManager = () => {
  useEffect(() => {
    document.title = "FIRE Calc Prime | Financial Independence Planner";
    // ... existing meta logic ...
  }, []);
  return null;
};

// --- 2. UTILS ---
const formatINR = (val) => {
  if (isNaN(val) || !isFinite(val)) return "₹0";
  const sign = val < 0 ? "-" : "";
  const absVal = Math.abs(val);
  if (absVal >= 10000000) return `${sign}₹${(absVal / 10000000).toFixed(2)} Cr`;
  if (absVal >= 100000) return `${sign}₹${(absVal / 100000).toFixed(2)} L`;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
};

const formatCompact = (val) => {
   if (isNaN(val) || !isFinite(val)) return "₹0";
   const absVal = Math.abs(val);
   let formattedNumber;
   if (absVal >= 10000000) formattedNumber = `${(absVal / 10000000).toFixed(2)}Cr`; 
   else if (absVal >= 100000) formattedNumber = `${(absVal / 100000).toFixed(1)}L`;
   else formattedNumber = `${(absVal / 1000).toFixed(0)}k`;
   return `₹${formattedNumber}`;
};

const sanitizeCSV = (str) => {
    if (typeof str === 'string' && (str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@'))) {
        return `'${str}`;
    }
    return str;
};

// --- 3. COMPONENTS (HOLIDAY THEME) ---

const Snowfall = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
    <style>{`
      @keyframes snow {
        0% { transform: translateY(-10vh) translateX(0); opacity: 1; }
        100% { transform: translateY(110vh) translateX(20px); opacity: 0.3; }
      }
      .snowflake {
        position: absolute;
        top: -10px;
        color: rgba(255, 255, 255, 0.15);
        animation: snow 10s linear infinite;
        font-size: 1rem;
      }
      .snowflake:nth-child(2n) { animation-duration: 12s; animation-delay: 1s; }
      .snowflake:nth-child(3n) { animation-duration: 8s; animation-delay: 2s; font-size: 0.8rem; }
      .snowflake:nth-child(4n) { animation-duration: 15s; animation-delay: 0s; font-size: 1.2rem; }
    `}</style>
    {[...Array(15)].map((_, i) => (
      <div key={i} className="snowflake" style={{ left: `${Math.random() * 100}vw`, animationDelay: `${Math.random() * 5}s` }}>❄</div>
    ))}
  </div>
);

const Card = ({ children, className = "", glow = "none" }) => {
  const glowStyles = {
    none: "border-white/5",
    green: "border-emerald-500/30 shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]", // Evergreen
    red: "border-rose-500/30 shadow-[0_0_20px_-5px_rgba(244,63,94,0.2)]",    // Berry Red
    gold: "border-amber-400/30 shadow-[0_0_20px_-5px_rgba(251,191,36,0.2)]"   // Star Gold
  };
  return (
    <div className={`bg-slate-900/80 backdrop-blur-md border rounded-2xl overflow-hidden transition-all duration-500 ${glowStyles[glow] || glowStyles.none} ${className} relative z-10`}>
      {children}
    </div>
  );
};

const CollapsibleSection = ({ title, icon: Icon, color, children, defaultOpen = false, rightContent = null }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  // Holiday tweak: Slightly warmer/festive borders on hover
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

const InfoLabel = ({ label, tooltip }) => (
    <div className="flex items-center gap-1.5 mb-1.5 group cursor-help w-max">
        <span className="text-xs font-medium text-slate-500 group-hover:text-emerald-400 transition-colors">{label}</span>
        <HelpCircle size={10} className="text-slate-600 group-hover:text-emerald-400 transition-colors"/>
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-56 p-3 bg-slate-950 border border-emerald-500/20 rounded-xl text-[10px] text-slate-300 shadow-2xl backdrop-blur-md z-50 pointer-events-none leading-relaxed">
            {tooltip}
        </div>
    </div>
);

const SliderInput = ({ label, value, onChange, min = 0, max = 100, step = 0.1, suffix = "%", icon: Icon, tooltip }) => (
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

const SmartInput = ({ value, onChange, prefix = "", suffix = "", label, placeholder = "", className = "", error = false, icon: Icon, iconColor="text-slate-500", tooltip }) => {
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
          className={`w-full bg-slate-950 text-slate-100 rounded-lg py-2.5 text-sm font-bold outline-none transition-all duration-200 placeholder:text-slate-800 font-mono shadow-inner
            ${Icon && prefix ? "pl-14" : Icon ? "pl-9" : prefix ? "pl-7" : "pl-3"} ${suffix ? "pr-8" : "pr-3"}
            ${error ? "border border-rose-500/50 focus:border-rose-500" : "border border-slate-800 focus:border-emerald-500/50 focus:bg-black focus:ring-1 focus:ring-emerald-500/20"}`}
        />
        {suffix && <span className="absolute right-3 text-slate-600 text-xs font-medium pointer-events-none select-none">{suffix}</span>}
      </div>
    </div>
  );
};

// --- 4. DOCUMENTATION CONTENT ---

const MathBlock = ({ title, formula, desc }) => (
    <div className="p-4 bg-black/40 border border-white/5 rounded-lg font-mono text-xs">
        <p className="text-slate-500 mb-2 font-bold uppercase tracking-wider">{title}</p>
        <div className="text-emerald-300 mb-2">{formula}</div>
        <p className="text-slate-400 italic">{desc}</p>
    </div>
);

const MethodologyTab = () => (
  <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
    <div className="text-center space-y-2 mb-12 relative z-10">
        <h2 className="text-3xl font-bold text-white">The Engineering Blueprint</h2>
        <p className="text-slate-400">Transparent logic. No hidden assumptions.</p>
    </div>

    <section className="space-y-4 relative z-10">
        <div className="flex items-center gap-3 text-emerald-400"><PieChart size={24}/><h3 className="text-xl font-bold">1. The Core Engine</h3></div>
        <Card className="p-6 bg-slate-900/50 border-slate-800 space-y-4">
            <MathBlock 
                title="Monthly Compound Growth"
                formula="Rate_Monthly = (1 + Rate_Annual)^(1/12) - 1"
                desc="We convert annual returns to monthly to capture the exact impact of monthly SIPs."
            />
            <MathBlock 
                title="Future Value Iteration"
                formula="Corpus[n] = (Corpus[n-1] + SIP) * (1 + Rate_Monthly)"
                desc="Calculated 360+ times (once for every month) to simulate the exact growth curve."
            />
        </Card>
    </section>

    <section className="space-y-4 relative z-10">
        <div className="flex items-center gap-3 text-rose-400"><ShieldCheck size={24}/><h3 className="text-xl font-bold">2. Taxes & Inflation</h3></div>
        <Card className="p-6 bg-slate-900/50 border-slate-800 space-y-4">
            <MathBlock 
                title="Tax Drag Simulation"
                formula="Effective_Return = Gross_Return * (1 - (Tax_Rate * 0.5))"
                desc="We dampen your equity returns by ~50% of the LTCG tax rate during the accumulation phase to account for eventual taxes."
            />
            <MathBlock 
                title="Real Value (Purchasing Power)"
                formula="Real_Value = Nominal_Value / (1 + Inflation)^Years"
                desc="This is the 'Deflator'. It tells you what your future ₹5 Crores is worth in today's buying power."
            />
        </Card>
    </section>
  </div>
);

// --- 5. MAIN LOGIC ---

const DEFAULT_STATE = {
  currentAge: 30, targetRetirementAge: 50, lifeExpectancy: 85,
  equityAssets: { mutualFunds: 500000, stocks: 200000 },
  stableAssets: { epf: 300000, ppf: 100000, nps: 0, gold: 50000, cash: 100000 }, 
  customAssets: [], 
  emergencyFund: 500000,
  annualIncome: 2400000, currentAnnualExpenses: 1200000,
  monthlySIP: { equity: 50000, stable: 10000 },
  sipStepUp: 10.0, salaryGrowth: 8.0, 
  retirementAnnualExpenses: 1200000,
  equityReturn: 12.0, stableReturn: 7.0, taxEquity: 12.5, taxStable: 30.0,
  safeWithdrawalRate: 3.5, inflationRate: 6.0,
  lifeEvents: [{ id: 1, name: "Kids Education", age: 48, cost: 4000000 }]
};

const ZERO_STATE = {
  ...DEFAULT_STATE, equityAssets: { mutualFunds: 0, stocks: 0 }, stableAssets: { epf: 0, ppf: 0, nps: 0, gold: 0, cash: 0 },
  customAssets: [], emergencyFund: 0, annualIncome: 0, currentAnnualExpenses: 0, monthlySIP: { equity: 0, stable: 0 }, lifeEvents: []
};

export default function FireCalcPro() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoaded, setIsLoaded] = useState(false);
  const [state, setState] = useState(DEFAULT_STATE);
  const [debouncedState, setDebouncedState] = useState(DEFAULT_STATE);
  const [showRealValue, setShowRealValue] = useState(false);
  
  useEffect(() => {
    const saved = localStorage.getItem("fireCalcData_v14.0"); 
    if (saved) { try { setState(JSON.parse(saved)); } catch (e) {} }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem("fireCalcData_v14.0", JSON.stringify(state));
    const timer = setTimeout(() => setDebouncedState(state), 200);
    return () => clearTimeout(timer);
  }, [state, isLoaded]);

  const updateState = useCallback((key, value) => setState(prev => ({ ...prev, [key]: value })), []);
  const updateNested = useCallback((parent, key, val) => setState(prev => ({ ...prev, [parent]: { ...prev[parent], [key]: val }})), []);
  
  const addCustomAsset = () => setState(prev => ({
      ...prev, customAssets: [...prev.customAssets, { id: Date.now(), name: "", value: 0, returnRate: 10.0, taxRate: 20.0 }] 
  }));
  const updateCustomAsset = (id, field, val) => setState(prev => ({
      ...prev, customAssets: prev.customAssets.map(a => a.id === id ? { ...a, [field]: val } : a)
  }));
  const removeCustomAsset = (id) => setState(prev => ({
      ...prev, customAssets: prev.customAssets.filter(a => a.id !== id)
  }));

  const addEvent = () => setState(prev => ({ ...prev, lifeEvents: [...prev.lifeEvents, { id: Date.now() + Math.random(), name: "New Goal", age: state.currentAge + 5, cost: 1000000 }] }));
  const removeEvent = (id) => setState(prev => ({ ...prev, lifeEvents: prev.lifeEvents.filter(e => e.id !== id) }));
  const updateEvent = (id, field, val) => setState(prev => ({ ...prev, lifeEvents: prev.lifeEvents.map(e => e.id === id ? { ...e, [field]: val } : e) }));
  const handleReset = () => { if(window.confirm("Reset to default?")) setState(DEFAULT_STATE); };
  const handleClear = () => { if(window.confirm("Clear all data?")) setState(ZERO_STATE); };

  // --- METRICS ---
  const totalEquity = Object.values(state.equityAssets).reduce((a, b) => a + (b || 0), 0);
  const totalStable = Object.values(state.stableAssets).reduce((a, b) => a + (b || 0), 0);
  const totalCustom = state.customAssets.reduce((a, b) => a + (b.value || 0), 0);
  const totalNetWorth = totalEquity + totalStable + totalCustom + state.emergencyFund;
  const monthlyIncome = state.annualIncome / 12;
  const monthlyExpenses = state.currentAnnualExpenses / 12;
  const totalSIP = state.monthlySIP.equity + state.monthlySIP.stable;
  const netCashflow = monthlyIncome - monthlyExpenses - totalSIP;
  const isSurplus = netCashflow >= 0;
  const emergencyCoverageMonths = monthlyExpenses > 0 ? (state.emergencyFund / monthlyExpenses).toFixed(1) : "N/A";

  // --- ENGINE ---
  const results = useMemo(() => {
    if (!isLoaded) return null;
    const s = debouncedState;
    
    const startEquity = Object.values(s.equityAssets).reduce((a, b) => a + (b||0), 0);
    const startStable = Object.values(s.stableAssets).reduce((a, b) => a + (b||0), 0);
    
    const rEquity = ((s.equityReturn) * (1 - (s.taxEquity/100) * 0.5)) / 100; 
    const rStable = (s.stableReturn * (1 - (s.taxStable/100))) / 100; 
    const effectiveInflation = s.inflationRate;
    
    const mrEquity = Math.pow(1 + rEquity, 1/12) - 1;
    const mrStable = Math.pow(1 + rStable, 1/12) - 1;
    
    const customAssetsGrowth = s.customAssets.map(asset => {
        const r = (asset.returnRate * (1 - (asset.taxRate/100) * 0.5)) / 100; 
        return { ...asset, mr: Math.pow(1 + r, 1/12) - 1, currentVal: asset.value || 0 };
    });

    const effectiveRetireAge = Math.min(Math.max(s.currentAge + 1, s.targetRetirementAge), 100);
    const monthsToProject = Math.max(0, (s.lifeExpectancy - s.currentAge) * 12);
    const monthsToRetire = Math.max(0, (effectiveRetireAge - s.currentAge) * 12);
    
    let curEquity = startEquity, curStable = startStable, curSipEquity = s.monthlySIP.equity, curSipStable = s.monthlySIP.stable;
    
    const data = [];
    let fireMonthIndex = -1, reached = false;
    const safeMonthsToProject = Math.min(monthsToProject, 1200);

    let yearlyWithdrawal = 0;

    for (let m = 1; m <= safeMonthsToProject; m++) {
        const isRetired = m > monthsToRetire;
        const currentAge = s.currentAge + (m/12);
        const isYearStart = (m-1) % 12 === 0;

        if (!isRetired && isYearStart && m > 1) {
            curSipEquity *= (1 + s.sipStepUp/100);
            curSipStable *= (1 + s.sipStepUp/100);
        }

        const annualExp = s.retirementAnnualExpenses * Math.pow(1 + effectiveInflation/100, m/12);
        const monthlyExp = annualExp / 12;
        
        const targetCorpus = (annualExp / (Math.max(0.1, s.safeWithdrawalRate)/100));

        if (!isRetired) {
            // ACCUMULATION
            curEquity += curSipEquity;
            curStable += curSipStable;
        } else {
            // DECUMULATION (Withdrawal)
            const liquidTotal = curEquity + curStable;
            if (liquidTotal > 0) {
                const eqRatio = curEquity / liquidTotal;
                curEquity -= monthlyExp * eqRatio;
                curStable -= monthlyExp * (1 - eqRatio);
            } else {
                curEquity -= monthlyExp; 
            }
            yearlyWithdrawal += monthlyExp;
        }

        // GROWTH (Applied to remaining balance)
        curEquity *= (1 + mrEquity);
        curStable *= (1 + mrStable);

        let totalCustomVal = 0;
        customAssetsGrowth.forEach(asset => {
            asset.currentVal *= (1 + asset.mr);
            totalCustomVal += asset.currentVal;
        });

        // EVENTS
        const eventHit = s.lifeEvents.find(e => Math.abs(e.age - currentAge) < 0.05 && !e.processed);
        let eventCost = 0;
        if (eventHit) {
             eventCost = eventHit.cost * Math.pow(1 + effectiveInflation/100, m/12);
             const liquidTotal = curEquity + curStable;
             if (liquidTotal > 0) {
                 const eqRatio = curEquity / liquidTotal;
                 curEquity -= eventCost * eqRatio;
                 curStable -= eventCost * (1 - eqRatio);
             } else {
                 curEquity -= eventCost;
             }
        }

        const total = curEquity + curStable + totalCustomVal;
        const deflator = Math.pow(1 + effectiveInflation/100, m/12);
        
        if (!reached && total >= targetCorpus && !isRetired) {
            reached = true;
            fireMonthIndex = m;
        }
        
        if (m % 12 === 0 || m === 1) {
            data.push({
                age: Math.floor(currentAge),
                balance: Math.round(total),
                realBalance: Math.round(total / deflator),
                equity: Math.round(curEquity),
                stable: Math.round(curStable),
                custom: Math.round(totalCustomVal),
                target: isRetired ? null : Math.round(targetCorpus),
                realTarget: isRetired ? null : Math.round(targetCorpus / deflator),
                event: Math.round(eventCost),
                withdrawal: Math.round(yearlyWithdrawal),
                realWithdrawal: Math.round(yearlyWithdrawal / deflator)
            });
            yearlyWithdrawal = 0; 
        }
    }

    const corpusAtRetirement = data.find(d => d.age === effectiveRetireAge)?.balance || 0;
    const realCorpusAtRetirement = data.find(d => d.age === effectiveRetireAge)?.realBalance || 0;
    const targetAtRetirement = data.find(d => d.age === effectiveRetireAge)?.target || 0;
    const realTargetAtRetirement = data.find(d => d.age === effectiveRetireAge)?.realTarget || 0;
    const gap = targetAtRetirement - corpusAtRetirement;
    const realGap = realTargetAtRetirement - realCorpusAtRetirement;

    let solutionSaveMore = 0, solutionWorkLonger = 0, solutionSpendLess = 0;

    if (gap > 0) {
        const totalSip = s.monthlySIP.equity + s.monthlySIP.stable;
        const eqWeight = totalSip > 0 ? s.monthlySIP.equity / totalSip : 0.6; 
        const blendR = (rEquity * eqWeight) + (rStable * (1-eqWeight));
        const ratePerMonth = blendR / 12;
        if (monthsToRetire > 0) {
             const pmt = (gap * ratePerMonth) / (Math.pow(1+ratePerMonth, monthsToRetire) - 1);
             solutionSaveMore = pmt * 0.85; 
        }
        const solveYear = data.find(d => d.balance >= d.target && d.age > effectiveRetireAge);
        solutionWorkLonger = solveYear ? solveYear.age - effectiveRetireAge : "> 30";
        const allowedAnnual = corpusAtRetirement * (s.safeWithdrawalRate/100);
        const allowedToday = allowedAnnual / Math.pow(1 + effectiveInflation/100, monthsToRetire/12);
        solutionSpendLess = Math.max(0, s.retirementAnnualExpenses - allowedToday);
    }

    return {
        projection: data, gap, realGap, fireAge: reached ? (s.currentAge + fireMonthIndex/12).toFixed(1) : null,
        solutions: { saveMore: Math.round(solutionSaveMore), workLonger: solutionWorkLonger, spendLess: Math.round(solutionSpendLess) },
        salaryVsStepUpWarning: s.sipStepUp > s.salaryGrowth,
        targetAtRetirement, 
        corpusAtRetirement
    };
  }, [debouncedState, isLoaded]);

  const handleDownload = () => {
    if(!results) return;
    const csv = ["Age,Balance,RealValue,Equity,Stable,Alternative,Target,Event", ...results.projection.map(r => [r.age, r.balance, r.realBalance, r.equity, r.stable, r.custom, r.target, sanitizeCSV(r.event)].join(","))].join("\n");
    const blob = new Blob([csv], {type: 'text/csv'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'FirePlan_Prime.csv'; a.click();
  };

  if (!isLoaded) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-emerald-400">Loading Holiday Magic...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 overflow-x-hidden relative">
      <SEOManager /> 
      <Snowfall /> {/* Snow animation */}
      
      <nav className="border-b border-white/5 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-emerald-600 to-teal-500 p-2 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Snowflake className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">FIRE Calc <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-rose-400">Prime</span></h1>
            </div>
          </div>
          
          <div className="hidden md:flex gap-1 bg-white/5 rounded-lg p-1 border border-white/5">
             <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-slate-800 text-white shadow-lg shadow-black/50' : 'text-slate-400 hover:text-slate-200'}`}>
                <Calculator size={14} /> Calculator
             </button>
             <button onClick={() => setActiveTab('docs')} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-300 ${activeTab === 'docs' ? 'bg-slate-800 text-white shadow-lg shadow-black/50' : 'text-slate-400 hover:text-slate-200'}`}>
                <BookOpen size={14} /> Blueprint
             </button>
          </div>

          <div className="flex gap-2">
            <button onClick={handleDownload} className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors"><Download size={18}/></button>
            <button onClick={handleReset} className="p-2 text-slate-400 hover:text-emerald-400 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors"><RotateCcw size={18}/></button>
            <button onClick={handleClear} className="p-2 text-slate-400 hover:text-rose-400 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors"><Eraser size={18}/></button>
          </div>
        </div>
      </nav>

      {/* MOBILE TAB SWITCHER */}
      <div className="md:hidden flex justify-center border-b border-white/5 p-2 relative z-10">
          <div className="flex gap-1 bg-white/5 rounded-lg p-1 w-full max-w-sm">
             <button onClick={() => setActiveTab('dashboard')} className={`flex-1 flex justify-center items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium ${activeTab === 'dashboard' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}><Calculator size={12} /> Calc</button>
             <button onClick={() => setActiveTab('docs')} className={`flex-1 flex justify-center items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium ${activeTab === 'docs' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}><BookOpen size={12} /> Docs</button>
          </div>
      </div>

      {activeTab === 'docs' ? <MethodologyTab /> : (
      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500 relative z-10">
        
        {/* INPUTS */}
        <div className="lg:col-span-4 space-y-4">
           
           <CollapsibleSection title="Cashflow Engine" icon={Gift} color="text-rose-500" defaultOpen={true}>
              <div className="space-y-4">
                 <div className="p-3 bg-slate-900/50 rounded-xl border border-white/5">
                    <div className="grid grid-cols-2 gap-3 mb-2">
                        <SmartInput label="Monthly Income (Post Tax)" value={state.annualIncome / 12} onChange={v=>updateState('annualIncome', v * 12)} icon={Banknote} iconColor="text-emerald-500" prefix="₹" />
                        <SmartInput label="Monthly Expense" value={state.currentAnnualExpenses / 12} onChange={v=>updateState('currentAnnualExpenses', v * 12)} icon={CreditCard} iconColor="text-rose-500" prefix="₹" />
                    </div>
                    <SliderInput label="Salary Growth (Yearly)" value={state.salaryGrowth} onChange={v=>updateState('salaryGrowth',v)} max={20} step={1} icon={TrendingUp} />
                 </div>
                 
                 <div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <SmartInput label="Equity SIP" value={state.monthlySIP.equity} onChange={v=>updateNested('monthlySIP','equity',v)} icon={Coins} iconColor="text-emerald-400" prefix="₹" />
                        <SmartInput label="Stable SIP (NPS, PPF)" value={state.monthlySIP.stable} onChange={v=>updateNested('monthlySIP','stable',v)} icon={PiggyBank} iconColor="text-rose-400" prefix="₹" />
                    </div>
                    <SliderInput label="SIP Step-Up (Yearly)" value={state.sipStepUp} onChange={v=>updateState('sipStepUp',v)} max={30} step={1} icon={TrendingUp} tooltip="How much you increase investments every year" />
                    {results?.salaryVsStepUpWarning && (
                        <p className="text-[10px] text-amber-500 mt-2 flex items-center gap-1 bg-amber-500/10 p-1.5 rounded">
                            <AlertCircle size={10}/> Warning: Your SIP Step-up is higher than Salary Growth.
                        </p>
                    )}
                 </div>
              </div>
           </CollapsibleSection>

           <CollapsibleSection title="Current Assets" icon={Trees} color="text-emerald-500" defaultOpen={false} rightContent={formatCompact(totalNetWorth)}>
              <div className="space-y-4">
                 
                 <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldCheck size={12} className="text-white"/> Safety Net
                        </p>
                        <div className="flex gap-1.5">
                            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">Now: {emergencyCoverageMonths}m</span>
                            {results && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${parseFloat(results.emergencyCoverageFuture) < parseFloat(emergencyCoverageMonths) ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                                    @Retire: {results.emergencyCoverageFuture}m
                                </span>
                            )}
                        </div>
                    </div>
                    <SmartInput label="Emergency Fund (Liquid)" value={state.emergencyFund} onChange={v=>updateState('emergencyFund',v)} icon={Umbrella} iconColor="text-slate-200" prefix="₹" />
                 </div>

                 <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-3">
                       <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Equity</p>
                       <p className="text-xs font-mono font-bold text-white bg-emerald-500/20 px-1.5 py-0.5 rounded">{formatCompact(totalEquity)}</p>
                    </div>
                    <div className="space-y-3">
                        <SmartInput label="Mutual Funds" value={state.equityAssets.mutualFunds} onChange={v=>updateNested('equityAssets','mutualFunds',v)} icon={TrendingUp} iconColor="text-emerald-400" prefix="₹" />
                        <SmartInput label="Direct Stock" value={state.equityAssets.stocks} onChange={v=>updateNested('equityAssets','stocks',v)} icon={PieChart} iconColor="text-emerald-400" prefix="₹" />
                    </div>
                 </div>
                 
                 <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-3">
                       <p className="text-xs font-bold text-rose-400 uppercase tracking-wider">Stable Assets</p>
                       <p className="text-xs font-mono font-bold text-white bg-rose-500/20 px-1.5 py-0.5 rounded">{formatCompact(totalStable)}</p>
                    </div>
                    <div className="space-y-3">
                        <SmartInput label="EPF/PPF/NPS" value={state.stableAssets.epf} onChange={v=>updateNested('stableAssets','epf',v)} icon={Landmark} iconColor="text-rose-400" prefix="₹" />
                        <SmartInput label="Gold/SGB/Cash" value={state.stableAssets.gold} onChange={v=>updateNested('stableAssets','gold',v)} icon={Coins} iconColor="text-amber-500" prefix="₹" />
                    </div>
                 </div>

                 {/* CUSTOM ASSETS SECTION */}
                 <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-3">
                       <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Alternatives</p>
                       <p className="text-xs font-mono font-bold text-white bg-amber-500/20 px-1.5 py-0.5 rounded">{formatCompact(totalCustom)}</p>
                    </div>
                    <div className="space-y-3">
                        {state.customAssets.map(asset => (
                            <div key={asset.id} className="flex gap-2 items-start">
                                <div className="flex-1 space-y-2">
                                    <input 
                                        className="w-full bg-slate-950 text-slate-100 rounded-lg py-2 px-3 text-xs font-medium outline-none border border-slate-800 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all placeholder:text-slate-600"
                                        value={asset.name}
                                        onChange={(e) => updateCustomAsset(asset.id, 'name', e.target.value)}
                                        placeholder="Asset Name (e.g. Plot)"
                                    />
                                    <SmartInput value={asset.value} onChange={v=>updateCustomAsset(asset.id, 'value', v)} prefix="₹" className="h-9 text-xs" />
                                </div>
                                <button onClick={()=>removeCustomAsset(asset.id)} className="p-2 text-slate-600 hover:text-red-400 mt-1"><Trash2 size={14}/></button>
                            </div>
                        ))}
                        <button onClick={addCustomAsset} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-slate-700 text-xs text-slate-500 hover:text-amber-400 hover:border-amber-500/50 transition-all font-bold uppercase tracking-wide">
                            <Plus size={14}/> Add Real Estate / Crypto
                        </button>
                    </div>
                 </div>
              </div>
           </CollapsibleSection>

           <CollapsibleSection title="Retirement Target" icon={Star} color="text-amber-400" defaultOpen={false}>
              <div className="grid grid-cols-3 gap-2 mb-4">
                 <SmartInput label="Age Now" value={state.currentAge} onChange={v=>updateState('currentAge',v)} />
                 <SmartInput label="Retire At" value={state.targetRetirementAge} onChange={v=>updateState('targetRetirementAge',v)} />
                 <SmartInput label="Live To" value={state.lifeExpectancy} onChange={v=>updateState('lifeExpectancy',v)} />
              </div>
              <SmartInput label="Target Retirement Spend (Annual)" value={state.retirementAnnualExpenses} onChange={v=>updateState('retirementAnnualExpenses',v)} icon={CreditCard} iconColor="text-rose-400" prefix="₹" tooltip="How much will you spend annually in retirement (in today's value)?" />
           </CollapsibleSection>

           <CollapsibleSection title="Assumptions & Returns" icon={Snowflake} color="text-white" defaultOpen={false}>
              <div className="space-y-6">
                 {/* STANDARD ASSETS */}
                 <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                    <SliderInput label="Equity Return" value={state.equityReturn} onChange={v=>updateState('equityReturn',v)} min={8} max={18} />
                    <SliderInput label="Stable Return" value={state.stableReturn} onChange={v=>updateState('stableReturn',v)} min={4} max={10} />
                 </div>
                 
                 {/* CUSTOM ASSET ASSUMPTIONS */}
                 {state.customAssets.length > 0 && (
                     <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 space-y-4">
                        <p className="text-[10px] font-bold uppercase text-amber-400">Alternative Asset Growth</p>
                        {state.customAssets.map(asset => (
                            <div key={asset.id} className="space-y-2">
                                <p className="text-xs text-slate-300 font-bold">{asset.name || "Unnamed Asset"}</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <SliderInput label="Return" value={asset.returnRate} onChange={v=>updateCustomAsset(asset.id, 'returnRate', v)} min={0} max={25} />
                                    <SmartInput label="Tax %" value={asset.taxRate} onChange={v=>updateCustomAsset(asset.id, 'taxRate', v)} suffix="%" className="h-8 text-xs"/>
                                </div>
                            </div>
                        ))}
                     </div>
                 )}

                 <div className="p-3 bg-white/5 rounded-xl">
                    <div className="grid grid-cols-2 gap-4">
                        <SmartInput label="Eq Tax (LTCG)" value={state.taxEquity} onChange={v=>updateState('taxEquity',v)} suffix="%" tooltip="Long Term Capital Gains Tax" />
                        <SmartInput label="Stable Assets Tax" value={state.taxStable} onChange={v=>updateState('taxStable',v)} suffix="%" tooltip="Usually taxed as per slab rates" />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-x-4">
                    <SliderInput label="Inflation" value={state.inflationRate} onChange={v=>updateState('inflationRate',v)} min={3} max={10} />
                    <SliderInput label="SWR" value={state.safeWithdrawalRate} onChange={v=>updateState('safeWithdrawalRate',v)} min={1} max={6} tooltip="Safe Withdrawal Rate: 3-4% is standard" />
                 </div>
              </div>
           </CollapsibleSection>

        </div>

        {/* OUTPUTS */}
        <div className="lg:col-span-8 space-y-6">
           
           {/* CASHFLOW & HERO CARDS */}
           <Card className="p-5 border-l-4 border-l-emerald-500 relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-900/50" glow={isSurplus ? "green" : "red"}>
               <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                     <div className={`p-3 rounded-full ${isSurplus ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {isSurplus ? <CheckCircle2 size={24}/> : <AlertTriangle size={24}/>}
                     </div>
                     <div>
                        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Cashflow Reality Check</h3>
                        <p className="text-xs text-slate-400 mt-1">
                           {isSurplus 
                              ? <span>You have a healthy surplus of <span className="text-emerald-400 font-bold">{formatCompact(netCashflow)}/mo</span></span>
                              : <span>You are running a deficit of <span className="text-red-400 font-bold">{formatCompact(Math.abs(netCashflow))}/mo</span></span>}
                        </p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono bg-black/40 p-3 rounded-xl border border-white/5 w-full md:w-auto justify-center shadow-inner">
                      <div className="text-center">
                          <div className="text-slate-500 text-[9px] uppercase mb-1">Income</div>
                          <div className="text-emerald-400 font-bold">{formatCompact(monthlyIncome)}</div>
                      </div>
                      <div className="text-slate-600">-</div>
                      <div className="text-center">
                          <div className="text-slate-500 text-[9px] uppercase mb-1">Spend</div>
                          <div className="text-rose-400 font-bold">{formatCompact(monthlyExpenses)}</div>
                      </div>
                      <div className="text-slate-600">-</div>
                      <div className="text-center">
                          <div className="text-slate-500 text-[9px] uppercase mb-1">SIP</div>
                          <div className="text-amber-400 font-bold">{formatCompact(totalSIP)}</div>
                      </div>
                      <ArrowRight size={14} className="text-slate-600 mx-1"/>
                      <div className="text-center">
                          <div className="text-slate-500 text-[9px] uppercase mb-1">Net</div>
                          <div className={`font-bold ${isSurplus ? 'text-white' : 'text-red-500'}`}>{formatCompact(Math.abs(netCashflow))}</div>
                      </div>
                  </div>
               </div>
           </Card>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6 relative overflow-hidden bg-gradient-to-br from-slate-900 to-black border-slate-800" glow={results?.gap > 0 ? "red" : "green"}>
                 <div className="relative z-10">
                    <div className="flex justify-between items-start">
                         <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Gap at Age {state.targetRetirementAge}</p>
                         <button onClick={() => setShowRealValue(!showRealValue)} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide bg-slate-800 border border-slate-700 px-2 py-1 rounded-md hover:bg-slate-700 transition-colors text-slate-300">
                            {showRealValue ? <Eye size={12} className="text-amber-400"/> : <EyeOff size={12}/>}
                            {showRealValue ? "Real Value" : "Nominal"}
                         </button>
                    </div>
                    {results && results.gap > 0 ? (
                        <>
                            <h2 className="text-4xl font-black text-rose-500 mb-1 tracking-tight">-{formatCompact(showRealValue ? results.realGap : results.gap)}</h2>
                            <p className="text-sm font-medium text-rose-400/60">Projected Shortfall</p>
                        </>
                    ) : (
                        <>
                            <h2 className="text-4xl font-black text-emerald-500 mb-1 tracking-tight">+{formatCompact(Math.abs(showRealValue ? results.realGap : results.gap))}</h2>
                            <p className="text-sm font-medium text-emerald-400/60">Projected Surplus</p>
                        </>
                    )}
                 </div>
              </Card>

              <Card className="p-6 relative overflow-hidden bg-gradient-to-br from-slate-900 to-black border-slate-800" glow="gold">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Freedom Date</p>
                  {results && results.fireAge ? (
                      <div className="flex items-end gap-3">
                          <h2 className="text-4xl font-black text-amber-400 tracking-tight">{results.fireAge}</h2>
                          <span className="text-sm font-medium text-slate-500 mb-1.5">Years Old</span>
                      </div>
                  ) : (
                      <h2 className="text-3xl font-black text-slate-600">Never</h2>
                  )}
                  <p className="text-xs text-slate-500 mt-2">Based on current trajectory</p>
              </Card>
           </div>

           {results && results.gap > 0 && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="group bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 hover:bg-amber-500/10 hover:border-amber-500/30 transition-all cursor-pointer">
                   <div className="flex items-center gap-2 mb-2">
                      <Banknote className="w-4 h-4 text-amber-400"/>
                      <span className="text-xs font-bold text-amber-300 uppercase">Save More</span>
                   </div>
                   <div className="text-xl font-bold text-slate-100 group-hover:text-white">+{formatCompact(results.solutions.saveMore)}<span className="text-xs text-slate-500 ml-1">/mo</span></div>
                </div>

                <div className="group bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all cursor-pointer">
                   <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-emerald-400"/>
                      <span className="text-xs font-bold text-emerald-300 uppercase">Work Longer</span>
                   </div>
                   <div className="text-xl font-bold text-slate-100 group-hover:text-white">+{results.solutions.workLonger} Years</div>
                </div>

                <div className="group bg-rose-500/5 border border-rose-500/10 rounded-xl p-4 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all cursor-pointer">
                   <div className="flex items-center gap-2 mb-2">
                      <Scissors className="w-4 h-4 text-rose-400"/>
                      <span className="text-xs font-bold text-rose-300 uppercase">Spend Less</span>
                   </div>
                   <div className="text-xl font-bold text-slate-100 group-hover:text-white">Cut {formatCompact(results.solutions.spendLess)}<span className="text-xs text-slate-500 ml-1">/yr</span></div>
                </div>
             </div>
           )}

           <Card className="h-[450px] p-4 flex flex-col bg-slate-900/40">
              <div className="flex justify-between items-center mb-6 px-2">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Wealth Trajectory ({showRealValue ? 'Real Value' : 'Nominal'})</h3>
                  <div className="flex gap-4 text-[10px]">
                      <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Equity</span>
                      <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Stable</span>
                      {state.customAssets.length > 0 && <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Alternatives</span>}
                      <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-red-400"></div> Withdrawal</span>
                  </div>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                 <ComposedChart data={results ? results.projection : []} margin={{top:10, right:10, left:0, bottom:0}}>
                    <defs>
                        <linearGradient id="gEq" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                        <linearGradient id="gStable" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient>
                        <linearGradient id="gCustom" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/><stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="age" stroke="#52525b" tick={{fontSize:10, fill:'#71717a'}} axisLine={false} tickLine={false} />
                    <YAxis stroke="#52525b" tickFormatter={formatCompact} tick={{fontSize:10, fill:'#71717a'}} axisLine={false} tickLine={false} />
                    <Tooltip 
                        contentStyle={{backgroundColor:'#020617', borderColor:'#334155', borderRadius:'12px', boxShadow:'0 10px 30px -10px rgba(0,0,0,0.8)'}}
                        itemStyle={{fontSize:'12px', fontWeight:700, fontFamily: 'monospace'}}
                        formatter={(val, name) => [formatINR(val), name === 'target' ? 'Required' : name === 'balance' ? 'Total' : name]}
                        labelFormatter={(label) => `Age ${label}`}
                    />
                    <Area type="monotone" dataKey="custom" stackId="1" stroke="#fbbf24" fill="url(#gCustom)" name="Alternatives" strokeWidth={2} />
                    <Area type="monotone" dataKey="stable" stackId="1" stroke="#f43f5e" fill="url(#gStable)" name="Stable Assets" strokeWidth={2} />
                    <Area type="monotone" dataKey="equity" stackId="1" stroke="#10b981" fill="url(#gEq)" name="Equity" strokeWidth={2} />
                    
                    <Bar dataKey="event" fill="#a855f7" name="Event" barSize={4} radius={[4, 4, 0, 0]} />

                    {/* NEW: Withdrawal Bar */}
                    <Bar 
                        dataKey={showRealValue ? "realWithdrawal" : "withdrawal"} 
                        fill="#ef4444" 
                        name="Withdrawal" 
                        barSize={4} 
                        radius={[4, 4, 0, 0]} 
                    />

                    {/* NEW: Explicit Line for Total Corpus (Net Worth) */}
                    <Line 
                        type="monotone" 
                        dataKey={showRealValue ? "realBalance" : "balance"} 
                        stroke="#ffffff" 
                        strokeWidth={2} 
                        dot={false} 
                        name="Total Corpus" 
                        activeDot={{ r: 6, strokeWidth: 0, fill: "#ffffff" }}
                    />

                    {/* HIDE TARGET LINE AFTER RETIREMENT */}
                    <Line 
                        type="stepAfter" 
                        dataKey={(dataPoint) => (dataPoint.age > state.targetRetirementAge ? null : (showRealValue ? dataPoint.realTarget : dataPoint.target))} 
                        stroke="#ef4444" 
                        strokeWidth={2} 
                        dot={false} 
                        strokeDasharray="4 4" 
                        name="Target" 
                    />
                    <ReferenceLine x={state.targetRetirementAge} stroke="#fff" strokeOpacity={0.2} label={{position:'insideTopRight', value:'RETIRE', fill:'#fff', fontSize:9, fontWeight:'bold', opacity:0.7}} />
                 </ComposedChart>
              </ResponsiveContainer>
           </Card>

           <Card className="p-5">
              <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                     <div className="p-1.5 rounded-lg bg-emerald-500/10">
                        <Calendar className="w-4 h-4 text-emerald-400" />
                     </div>
                     <h2 className="text-base font-bold text-zinc-100">Life Events</h2>
                  </div>
                  <button onClick={addEvent} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all shadow-lg shadow-emerald-500/20">
                      <Plus size={14}/> Add Event
                  </button>
              </div>
              <div className="space-y-3">
                 {state.lifeEvents.map(ev => (
                    <div key={ev.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-white/5 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
                        <div className="md:col-span-5">
                            <label className="text-[9px] uppercase text-zinc-500 font-bold ml-1 mb-1 block">Goal Name</label>
                            <input value={ev.name} onChange={e=>updateEvent(ev.id,'name',e.target.value)} className="w-full bg-transparent outline-none text-sm text-white font-medium placeholder-zinc-600" placeholder="e.g. Wedding"/>
                        </div>
                        <div className="md:col-span-2">
                             <label className="text-[9px] uppercase text-zinc-500 font-bold ml-1 mb-1 block">Age</label>
                             <SmartInput value={ev.age} onChange={v=>updateEvent(ev.id,'age',v)} className="h-8 text-xs"/>
                        </div>
                        <div className="md:col-span-4">
                             <label className="text-[9px] uppercase text-zinc-500 font-bold ml-1 mb-1 block">Cost (Today)</label>
                             <SmartInput value={ev.cost} onChange={v=>updateEvent(ev.id,'cost',v)} prefix="₹" className="h-8 text-xs"/>
                        </div>
                        <div className="md:col-span-1 flex justify-end">
                             <button onClick={()=>removeEvent(ev.id)} className="p-2 text-zinc-600 hover:text-red-400 bg-transparent hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                        </div>
                    </div>
                 ))}
                 {state.lifeEvents.length === 0 && (
                     <div className="text-center py-8 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/30">
                        <p className="text-xs text-zinc-500">No events added. Enjoy the smooth ride!</p>
                     </div>
                 )}
              </div>
           </Card>

        </div>
      </main>
      )}

      {/* SMART STICKY FOOTER */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-t border-white/10 p-4 z-50 pb-safe">
          <div className="flex flex-col gap-3">
             <div className="flex justify-between items-end">
                 <div>
                    <div className="text-[10px] uppercase font-bold text-zinc-500 mb-0.5">Projected Gap</div>
                    <div className={`text-xl font-bold ${results?.gap > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {results ? (results.gap > 0 ? '-' : '+') + formatCompact(Math.abs(showRealValue ? results.realGap : results.gap)) : '...'}
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-zinc-500 mb-0.5">Freedom Date</div>
                    <div className="text-lg font-bold text-indigo-400">{results?.fireAge ? `${results.fireAge} yrs` : 'Never'}</div>
                 </div>
             </div>
             {/* Mini Progress Bar */}
             {results && (
                 <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                     <div 
                        className={`h-full rounded-full ${results.gap > 0 ? 'bg-indigo-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, (results.corpusAtRetirement / results.targetAtRetirement) * 100)}%` }}
                     ></div>
                 </div>
             )}
          </div>
      </div>

    </div>
  );
}