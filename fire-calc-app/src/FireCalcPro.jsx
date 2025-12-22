import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Calculator, BookOpen, Download, RotateCcw, Eraser, Snowflake, GitCompare, XCircle } from "lucide-react";

// --- IMPORTS ---
import { calculateProjection } from './utils/fireMath';
import { sanitizeCSV } from './utils/formatters';
import { SEOManager } from './components/SEOManager';
import { Snowfall } from './components/ui/Snowfall';
import { MethodologyTab } from './components/docs/MethodologyTab';

// --- FEATURE SECTIONS ---
import { InputSection } from './components/features/InputSection';
import { ResultsDashboard } from './components/features/ResultsDashboard';

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
  lifeEvents: [{ id: 1, name: "Kids Education", age: 48, cost: 4000000, type: 'one-time', endAge: 0 }]
};

export default function FireCalcPro() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoaded, setIsLoaded] = useState(false);
  
  // CURRENT STATE
  const [state, setState] = useState(DEFAULT_STATE);
  const [debouncedState, setDebouncedState] = useState(DEFAULT_STATE);
  
  // COMPARISON STATE
  const [baselineState, setBaselineState] = useState(null);

  const [showRealValue, setShowRealValue] = useState(false);
  
  // --- PERSISTENCE ---
  useEffect(() => {
    try {
        const saved = localStorage.getItem("fireCalcData_v15.3"); 
        if (saved) { setState(JSON.parse(saved)); }
    } catch (e) {
        console.warn("Storage access denied", e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
        try {
            localStorage.setItem("fireCalcData_v15.3", JSON.stringify(state));
        } catch (e) {}
    }
    const timer = setTimeout(() => setDebouncedState(state), 200);
    return () => clearTimeout(timer);
  }, [state, isLoaded]);

  // --- STATE UPDATERS ---
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

  const addEvent = () => setState(prev => ({ ...prev, lifeEvents: [...prev.lifeEvents, { id: Date.now() + Math.random(), name: "New Goal", age: state.currentAge + 5, cost: 1000000, type: 'one-time', endAge: 0 }] }));
  const removeEvent = (id) => setState(prev => ({ ...prev, lifeEvents: prev.lifeEvents.filter(e => e.id !== id) }));
  const updateEvent = (id, field, val) => setState(prev => ({ ...prev, lifeEvents: prev.lifeEvents.map(e => e.id === id ? { ...e, [field]: val } : e) }));
  const toggleEventType = (id) => setState(prev => ({ 
      ...prev, lifeEvents: prev.lifeEvents.map(e => e.id === id ? { ...e, type: e.type === 'recurring' ? 'one-time' : 'recurring' } : e) 
  }));

  const handleReset = () => { if(window.confirm("Reset to default?")) setState(DEFAULT_STATE); };
  const handleClear = () => { if(window.confirm("Clear all data?")) setState(DEFAULT_STATE); };

  // --- BASELINE LOGIC ---
  const toggleBaseline = () => {
    if (baselineState) {
        setBaselineState(null); // Clear baseline
    } else {
        setBaselineState(state); // Lock current as baseline
    }
  };

  // --- METRICS ---
  const totalEquity = Object.values(state.equityAssets).reduce((a, b) => a + (b || 0), 0);
  const totalStable = Object.values(state.stableAssets).reduce((a, b) => a + (b || 0), 0);
  const totalCustom = state.customAssets.reduce((a, b) => a + (b.value || 0), 0);
  const totalNetWorth = totalEquity + totalStable + totalCustom + state.emergencyFund;
  const monthlyIncome = state.annualIncome / 12;
  const monthlyExpenses = state.currentAnnualExpenses / 12;
  const totalSIP = state.monthlySIP.equity + state.monthlySIP.stable;
  const netCashflow = monthlyIncome - monthlyExpenses - totalSIP;
  const emergencyCoverageMonths = monthlyExpenses > 0 ? (state.emergencyFund / monthlyExpenses).toFixed(1) : "N/A";

  // --- ENGINE CALLS ---
  // 1. Current Results
  const results = useMemo(() => {
    if (!isLoaded) return null;
    return calculateProjection(debouncedState);
  }, [debouncedState, isLoaded]);

  // 2. Baseline Results (Only calculate if baseline exists)
  const baselineResults = useMemo(() => {
    if (!baselineState) return null;
    return calculateProjection(baselineState);
  }, [baselineState]);

  const hasData = useMemo(() => {
    return (state.annualIncome > 0 || state.currentAnnualExpenses > 0 || totalNetWorth > 0 || (state.monthlySIP.equity + state.monthlySIP.stable) > 0);
  }, [state, totalNetWorth]);

  const handleDownload = () => {
    if(!results) return;
    const csv = ["Age,NetWorth,RealValue,Equity,Stable,Alternative,EmergencyFund,Target,Event", ...results.projection.map(r => [r.age, r.balance, r.realBalance, r.equity, r.stable, r.custom, r.emergency, r.target, sanitizeCSV(r.event)].join(","))].join("\n");
    const blob = new Blob([csv], {type: 'text/csv'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'FirePlan_Prime.csv'; a.click();
  };

  if (!isLoaded) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-emerald-400">Loading Holiday Magic...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 overflow-x-hidden relative">
      <SEOManager /> 
      <Snowfall /> 
      
      {/* NAVBAR */}
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
            <button 
                onClick={toggleBaseline} 
                className={`p-2 rounded-lg border transition-all duration-300 flex items-center gap-2 ${baselineState ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' : 'text-slate-400 hover:text-white bg-white/5 border-white/5'}`}
                title={baselineState ? "Clear Baseline" : "Lock Baseline for Comparison"}
            >
                {baselineState ? <XCircle size={18} /> : <GitCompare size={18}/>}
                <span className="text-xs font-bold hidden md:inline">{baselineState ? "Clear Comparison" : "Compare"}</span>
            </button>
            
            <div className="w-px bg-white/10 mx-1"></div>

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
      <main className="max-w-7xl mx-auto p-4 md:p-8 pb-40 lg:pb-8 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500 relative z-10">
        
        {/* LEFT COLUMN: INPUTS */}
        <div className="lg:col-span-4">
            <InputSection 
                state={state}
                updateState={updateState}
                updateNested={updateNested}
                addCustomAsset={addCustomAsset}
                updateCustomAsset={updateCustomAsset}
                removeCustomAsset={removeCustomAsset}
                results={results}
                totalNetWorth={totalNetWorth}
                totalEquity={totalEquity}
                totalStable={totalStable}
                totalCustom={totalCustom}
                emergencyCoverageMonths={emergencyCoverageMonths}
            />
        </div>

        {/* RIGHT COLUMN: DASHBOARD */}
        <div className="lg:col-span-8">
            <ResultsDashboard 
                results={results}
                baselineResults={baselineResults} // NEW PROP
                state={state}
                hasData={hasData}
                netCashflow={netCashflow}
                monthlyIncome={monthlyIncome}
                monthlyExpenses={monthlyExpenses}
                totalSIP={totalSIP}
                showRealValue={showRealValue}
                setShowRealValue={setShowRealValue}
                addEvent={addEvent}
                updateEvent={updateEvent}
                toggleEventType={toggleEventType}
                removeEvent={removeEvent}
            />
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
                        {results ? (results.gap > 0 ? '-' : '+') + (results.projection ? (Math.abs(showRealValue ? results.realGap : results.gap) >= 100000 ? (Math.abs(showRealValue ? results.realGap : results.gap)/100000).toFixed(1) + 'L' : Math.abs(showRealValue ? results.realGap : results.gap)/1000 + 'k') : '0') : '...'}
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
