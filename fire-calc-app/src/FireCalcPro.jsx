import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { 
  Calculator, BookOpen, Download, RotateCcw, Eraser, Snowflake, BarChart3, 
  ShieldCheck, AlertTriangle, TrendingUp, FileText, MoreVertical, X 
} from "lucide-react";

// --- IMPORTS ---
import { calculateProjection } from './utils/fireMath';
import { sanitizeCSV, formatCompact } from './utils/formatters';
import { SEOManager } from './components/SEOManager';
import { Snowfall } from './components/ui/Snowfall';
import { MethodologyTab } from './components/docs/MethodologyTab';
import { generatePDFReport } from './utils/pdfGenerator';
import { trackCalculation } from './utils/analytics';

// --- FEATURE SECTIONS ---
import { InputSection } from './components/features/InputSection';
import { ResultsDashboard } from './components/features/ResultsDashboard';
import { ScenarioTabs } from './components/features/ScenarioTabs';
import { CompareTab } from './components/features/CompareTab';
import { UserGuideModal } from './components/features/UserGuideModal';
import { AuthButton } from './components/features/AuthButton';
import { usePersistence } from './hooks/usePersistence';
import { useAuth } from './contexts/AuthContext';

const DEFAULT_STATE = {
  scenarioName: "Base Plan",
  currentAge: 30, targetRetirementAge: 50, lifeExpectancy: 85,
  equityAssets: { mutualFunds: 500000, stocks: 200000 },
  
  
  stableAssets: { epf: 300000, gold: 500000 }, 
  customAssets: [], 
  liabilities: [],
  emergencyFund: 500000,
  annualIncome: 2400000, currentAnnualExpenses: 1200000,
  monthlySIP: { equity: 50000, stable: 10000 },
  sipStepUp: 10.0, salaryGrowth: 8.0, 
  retirementAnnualExpenses: 1200000,
  equityReturn: 12.0, stableReturn: 7.0, taxEquity: 12.5, taxStable: 30.0,
  safeWithdrawalRate: 3.5, inflationRate: 6.0,
  stressTest: false,
  taxHarvesting: false,
  flexibilityMode: false,
  lifeEvents: [{ id: 1, name: "Kids Education", age: 48, cost: 4000000, type: 'one-time', endAge: 0 }]
};

export default function FireCalcPro() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user } = useAuth();
  
  // Mobile Menu State
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Worker State
  const [mcResults, setMcResults] = useState(null);
  const [isMcLoading, setIsMcLoading] = useState(false);
  
  // --- 1. PERSISTENCE HOOK ---
  const { data: persistentData, saveData, isDataLoaded } = usePersistence(DEFAULT_STATE);
  
  // --- 2. LOCAL STATE ---
  const [scenarios, setScenarios] = useState({ "default": DEFAULT_STATE });
  const [activeScenarioId, setActiveScenarioId] = useState("default");
  const [showRealValue, setShowRealValue] = useState(false);
  
  // --- FIX: Sync Logic ---
  useEffect(() => {
      if(isDataLoaded && persistentData) {
          setScenarios(persistentData.scenarios);
          setActiveScenarioId(persistentData.activeId);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDataLoaded, user]); 

  // Derived State
  const state = scenarios[activeScenarioId] || DEFAULT_STATE; 
  const [debouncedState, setDebouncedState] = useState(DEFAULT_STATE);

  // Persistence Saver (Auto-Save)
  useEffect(() => {
    if (isDataLoaded) {
       saveData({ scenarios, activeId: activeScenarioId });
    }
    const timer = setTimeout(() => setDebouncedState(state), 200);
    return () => clearTimeout(timer);
  }, [scenarios, activeScenarioId, isDataLoaded, state]); 

  // --- WORKER EFFECT (Monte Carlo) ---
  useEffect(() => {
    const hasData = (debouncedState.annualIncome > 0 || debouncedState.currentAnnualExpenses > 0 || (debouncedState.equityAssets.mutualFunds + debouncedState.stableAssets.epf) > 0);
    
    if (!hasData || debouncedState.targetRetirementAge <= debouncedState.currentAge) {
        setMcResults(null);
        return;
    }

    setIsMcLoading(true);
    const worker = new Worker(new URL('./utils/mcWorker.js', import.meta.url), { type: 'module' });

    worker.onmessage = (e) => {
        setMcResults(e.data);
        setIsMcLoading(false);
        worker.terminate();
    };

    worker.postMessage({ state: debouncedState, iterations: 10000 });

    return () => { worker.terminate(); };
  }, [debouncedState]);

  // --- 4. SCENARIO ACTIONS ---
  const handleAddScenario = () => {
    const newId = `plan_${Date.now()}`;
    const newName = `Scenario ${Object.keys(scenarios).length + 1}`;
    setScenarios(prev => ({
        ...prev,
        [newId]: { ...state, scenarioName: newName }
    }));
    setActiveScenarioId(newId);
  };

  const handleDeleteScenario = (id) => {
    const newScenarios = { ...scenarios };
    delete newScenarios[id];
    setScenarios(newScenarios);
    if (id === activeScenarioId) {
        setActiveScenarioId(Object.keys(newScenarios)[0]);
    }
  };

  const handleRenameScenario = (id, newName) => {
    setScenarios(prev => ({
        ...prev,
        [id]: { ...prev[id], scenarioName: newName }
    }));
  };

  // --- 5. DATA UPDATERS ---
  const updateState = useCallback((key, value) => {
      setScenarios(prev => ({
          ...prev,
          [activeScenarioId]: { ...prev[activeScenarioId], [key]: value }
      }));
  }, [activeScenarioId]);

  const updateNested = useCallback((parent, key, val) => {
      setScenarios(prev => ({
          ...prev,
          [activeScenarioId]: { 
              ...prev[activeScenarioId], 
              [parent]: { ...prev[activeScenarioId][parent], [key]: val } 
          }
      }));
  }, [activeScenarioId]);
   
  const addCustomAsset = () => {
      setScenarios(prev => {
        const curr = prev[activeScenarioId];
        return {
            ...prev,
            [activeScenarioId]: { ...curr, customAssets: [...curr.customAssets, { id: Date.now(), name: "", value: 0, returnRate: 10.0, taxRate: 20.0 }] }
        };
      });
  };

  const updateCustomAsset = (id, field, val) => {
      setScenarios(prev => {
        const curr = prev[activeScenarioId];
        return {
            ...prev,
            [activeScenarioId]: { 
                ...curr, 
                customAssets: curr.customAssets.map(a => a.id === id ? { ...a, [field]: val } : a) 
            }
        };
      });
  };

  const removeCustomAsset = (id) => {
      setScenarios(prev => {
        const curr = prev[activeScenarioId];
        return {
            ...prev,
            [activeScenarioId]: { ...curr, customAssets: curr.customAssets.filter(a => a.id !== id) }
        };
      });
  };

  const addLiability = () => {
    setScenarios(prev => {
      const currentScenario = prev[activeScenarioId];
      return {
        ...prev,
        [activeScenarioId]: {
          ...currentScenario,
          liabilities: [...(currentScenario.liabilities||[]), { id: Date.now(), name: 'Home Loan', monthlyEMI: 30000, outstandingAmount: 2500000, endAge: currentScenario.currentAge + 15 }]
        }
      };
    });
  };

  const updateLiability = (id, field, value) => {
    setScenarios(prev => {
      const currentScenario = prev[activeScenarioId];
      return {
        ...prev,
        [activeScenarioId]: {
          ...currentScenario,
          liabilities: (currentScenario.liabilities||[]).map(l => l.id === id ? { ...l, [field]: field === 'name' ? value : parseFloat(value) || 0 } : l)
        }
      };
    });
  };

  const removeLiability = (id) => {
    setScenarios(prev => {
      const currentScenario = prev[activeScenarioId];
      return {
        ...prev,
        [activeScenarioId]: {
          ...currentScenario,
          liabilities: (currentScenario.liabilities||[]).filter(l => l.id !== id)
        }
      };
    });
  };
   
  const updateEvents = (fn) => {
      setScenarios(prev => {
          const curr = prev[activeScenarioId];
          return { ...prev, [activeScenarioId]: { ...curr, lifeEvents: fn(curr.lifeEvents) } };
      });
  };

  const addEvent = () => updateEvents(events => [...events, { id: Date.now() + Math.random(), name: "New Goal", age: state.currentAge + 5, cost: 1000000, type: 'one-time', endAge: 0 }]);
  const removeEvent = (id) => updateEvents(events => events.filter(e => e.id !== id));
  const updateEvent = (id, field, val) => updateEvents(events => events.map(e => e.id === id ? { ...e, [field]: val } : e));
  const toggleEventType = (id) => updateEvents(events => events.map(e => e.id === id ? { ...e, type: e.type === 'recurring' ? 'one-time' : 'recurring' } : e));

  const handleReset = () => { 
      if(window.confirm("Reset current scenario to default?")) {
          setScenarios(prev => ({
              ...prev,
              [activeScenarioId]: { ...DEFAULT_STATE, scenarioName: prev[activeScenarioId].scenarioName }
          }));
      }
  };

  const handleClear = () => {
    if(window.confirm("Clear all data in this scenario?")) {
        setScenarios(prev => ({
            ...prev,
            [activeScenarioId]: {
                ...DEFAULT_STATE,
                scenarioName: prev[activeScenarioId].scenarioName,
                annualIncome: 0, currentAnnualExpenses: 0,
                equityAssets: { mutualFunds: 0, stocks: 0 },
                stableAssets: { epf: 0, ppf: 0, nps: 0, gold: 0, cash: 0 },
                customAssets: [], liabilities: [], emergencyFund: 0,
                monthlySIP: { equity: 0, stable: 0 }
            }
        }));
    }
  };

  // --- 6. ENGINE CALL ---
  const results = useMemo(() => {
    if (!isDataLoaded || !state) return null;
    const projectionResult = calculateProjection(debouncedState);
    
    // ANALYTICS TRACKING (Debounced)
    trackCalculation(debouncedState, projectionResult);

    return {
        ...projectionResult,
        monteCarlo: mcResults,
        isMcLoading: isMcLoading
    };
  }, [debouncedState, isDataLoaded, state, mcResults, isMcLoading]);

  // Derived Metrics
  const totalEquity = state ? Object.values(state.equityAssets).reduce((a, b) => a + (b || 0), 0) : 0;
  const totalStable = state ? Object.values(state.stableAssets).reduce((a, b) => a + (b || 0), 0) : 0;
  const totalCustom = state ? state.customAssets.reduce((a, b) => a + (b.value || 0), 0) : 0;
  const liabilitiesList = state?.liabilities || [];
  const totalDebt = liabilitiesList.reduce((a, b) => a + (parseFloat(b.outstandingAmount) || 0), 0);
  const totalEMI = liabilitiesList.reduce((a, b) => a + (parseFloat(b.monthlyEMI) || 0), 0);
  const totalNetWorth = totalEquity + totalStable + totalCustom + (state?.emergencyFund || 0) - totalDebt;

  const monthlyIncome = state ? state.annualIncome / 12 : 0;
  const monthlyBaseExpenses = state ? state.currentAnnualExpenses / 12 : 0;
  const totalMonthlySpend = monthlyBaseExpenses + totalEMI;
  const totalSIP = state ? state.monthlySIP.equity + state.monthlySIP.stable : 0;
  const netCashflow = monthlyIncome - totalMonthlySpend - totalSIP;
  
  const maxLoanAge = liabilitiesList.reduce((max, l) => Math.max(max, l.endAge || 0), 0);
  const emergencyCoverageMonths = totalMonthlySpend > 0 ? (state.emergencyFund / totalMonthlySpend).toFixed(1) : "N/A";
   
  const hasData = useMemo(() => {
    if(!state) return false;
    return (state.annualIncome > 0 || state.currentAnnualExpenses > 0 || totalNetWorth > 0 || (state.monthlySIP.equity + state.monthlySIP.stable) > 0);
  }, [state, totalNetWorth]);

  const handleDownload = () => {
    if(!results) return;
    const csv = ["Age,NetWorth,RealValue,Equity,Stable,Alternative,EmergencyFund,Target,Event", ...results.projection.map(r => [r.age, r.balance, r.realBalance, r.equity, r.stable, r.custom, r.emergency, r.target, sanitizeCSV(r.event)].join(","))].join("\n");
    const blob = new Blob([csv], {type: 'text/csv'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `FirePlan_${state.scenarioName.replace(/\s+/g, '_')}.csv`; a.click();
  };

  if (!isDataLoaded) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-emerald-400 font-mono animate-pulse">Loading Your Financial Data...</div>;

  return (
<div key={user ? user.uid : 'guest'} className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 overflow-x-hidden relative">
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
             <button onClick={() => setActiveTab('compare')} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-300 ${activeTab === 'compare' ? 'bg-slate-800 text-white shadow-lg shadow-black/50' : 'text-slate-400 hover:text-slate-200'}`}>
                <BarChart3 size={14} /> Compare
             </button>
             <button onClick={() => setActiveTab('docs')} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-300 ${activeTab === 'docs' ? 'bg-slate-800 text-white shadow-lg shadow-black/50' : 'text-slate-400 hover:text-slate-200'}`}>
                <BookOpen size={14} /> Blueprint
             </button>
          </div>

          <div className="flex gap-2 items-center relative">
            {/* AUTH BUTTON */}
            <AuthButton />

            {/* --- FIX: MOBILE MENU TOGGLE --- */}
            {/* 1. Desktop: Show Buttons Normally */}
            <div className="hidden md:flex items-center gap-2">
                <div className="w-px h-8 bg-white/10 mx-1"></div>
                <button onClick={handleReset} className="p-2 text-slate-400 hover:text-emerald-400 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors" title="Reset Scenario">
                    <RotateCcw size={18}/>
                </button>
                <button onClick={handleClear} className="p-2 text-slate-400 hover:text-rose-400 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors" title="Clear All Data">
                    <Eraser size={18}/>
                </button>
                <div className="w-px h-8 bg-white/10 mx-1"></div>
                <button onClick={handleDownload} className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors" title="Export CSV">
                    <Download size={18}/>
                </button>
                <button onClick={() => generatePDFReport(state, results)} className="p-2 text-slate-400 hover:text-emerald-400 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors" title="Download Report">
                    <FileText size={18}/>
                </button>
            </div>

            {/* 2. Mobile: Show Menu Toggle */}
            <button 
                className="md:hidden p-2 text-slate-400 hover:text-white bg-white/5 rounded-lg border border-white/5 ml-1"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
                {showMobileMenu ? <X size={20} /> : <MoreVertical size={20} />}
            </button>

            {/* 3. Mobile Dropdown */}
            {showMobileMenu && (
                <div className="absolute top-14 right-0 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 flex flex-col gap-1 md:hidden z-[60] animate-in slide-in-from-top-2">
                    <button onClick={() => { handleReset(); setShowMobileMenu(false); }} className="flex items-center gap-3 px-3 py-3 text-sm text-slate-300 hover:bg-white/5 rounded-lg text-left">
                        <RotateCcw size={16} className="text-emerald-400" /> Reset Plan
                    </button>
                    <button onClick={() => { handleClear(); setShowMobileMenu(false); }} className="flex items-center gap-3 px-3 py-3 text-sm text-slate-300 hover:bg-white/5 rounded-lg text-left">
                        <Eraser size={16} className="text-rose-400" /> Clear Data
                    </button>
                    <div className="h-px bg-white/10 my-1"></div>
                    <button onClick={() => { handleDownload(); setShowMobileMenu(false); }} className="flex items-center gap-3 px-3 py-3 text-sm text-slate-300 hover:bg-white/5 rounded-lg text-left">
                        <Download size={16} className="text-blue-400" /> Export CSV
                    </button>
                    <button onClick={() => { generatePDFReport(state, results); setShowMobileMenu(false); }} className="flex items-center gap-3 px-3 py-3 text-sm text-slate-300 hover:bg-white/5 rounded-lg text-left">
                        <FileText size={16} className="text-amber-400" /> Download PDF
                    </button>
                </div>
            )}
            {/* --- FIX END --- */}

          </div>
        </div>
      </nav>

      {/* MOBILE TAB SWITCHER */}
      <div className="md:hidden flex justify-center border-b border-white/5 p-2 relative z-10">
          <div className="flex gap-1 bg-white/5 rounded-lg p-1 w-full max-w-sm">
             <button onClick={() => setActiveTab('dashboard')} className={`flex-1 flex justify-center items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium ${activeTab === 'dashboard' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}><Calculator size={12} /> Calc</button>
             <button onClick={() => setActiveTab('compare')} className={`flex-1 flex justify-center items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium ${activeTab === 'compare' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}><BarChart3 size={12} /> Compare</button>
             <button onClick={() => setActiveTab('docs')} className={`flex-1 flex justify-center items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium ${activeTab === 'docs' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}><BookOpen size={12} /> Docs</button>
          </div>
      </div>

      {activeTab === 'docs' ? (
          <MethodologyTab />
      ) : activeTab === 'compare' ? (
          <main className="max-w-7xl mx-auto p-4 md:p-8 pb-40 lg:pb-8 relative z-10">
              <CompareTab scenarios={scenarios} />
          </main>
      ) : (
      <main className="max-w-7xl mx-auto p-4 md:p-8 pb-40 lg:pb-8 animate-in fade-in duration-500 relative z-10">
        <div className={`mb-8 p-5 rounded-xl border flex flex-col md:flex-row justify-between items-center gap-6 shadow-lg transition-all ${netCashflow >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full mt-1 ${netCashflow >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {netCashflow >= 0 ? <ShieldCheck size={28} /> : <AlertTriangle size={28} />}
                </div>
                <div>
                    <h3 className={`font-bold text-base uppercase tracking-wider ${netCashflow >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {netCashflow >= 0 ? 'Cashflow Healthy' : 'Cashflow Deficit'}
                    </h3>
                    <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                        You have a {netCashflow >= 0 ? 'surplus' : 'deficit'} of <strong className={netCashflow >= 0 ? "text-white" : "text-rose-400"}>{formatCompact(Math.abs(netCashflow))}/mo</strong> available.
                    </p>
                    {totalEMI > 0 && maxLoanAge > state.currentAge && (
                        <div className="mt-3 flex items-center gap-2 text-xs bg-slate-900/60 py-1.5 px-3 rounded-lg border border-white/5 w-fit">
                            <TrendingUp size={14} className="text-emerald-400" />
                            <span className="text-slate-400">
                                Cashflow jumps by <strong className="text-emerald-300">+{formatCompact(totalEMI)}</strong> at Age {maxLoanAge} (Debt Free)
                            </span>
                        </div>
                    )}
                </div>
            </div>
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex flex-wrap justify-center items-center gap-4 text-xs">
                <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Income</p>
                    <p className="font-mono font-bold text-emerald-400 text-sm">{formatCompact(monthlyIncome)}</p>
                </div>
                <span className="text-slate-600 font-bold">-</span>
                <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Base Exp</p>
                    <p className="font-mono font-bold text-slate-200 text-sm">{formatCompact(monthlyBaseExpenses)}</p>
                </div>
                {totalEMI > 0 && (
                    <>
                    <span className="text-slate-600 font-bold">-</span>
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">EMI</p>
                        <p className="font-mono font-bold text-rose-400 text-sm">{formatCompact(totalEMI)}</p>
                    </div>
                    </>
                )}
                <span className="text-slate-600 font-bold">-</span>
                <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">SIP</p>
                    <p className="font-mono font-bold text-amber-400 text-sm">{formatCompact(totalSIP)}</p>
                </div>
                <span className="text-slate-600 font-bold">=</span>
                <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Net</p>
                    <p className={`font-mono font-bold text-sm ${netCashflow >= 0 ? 'text-white' : 'text-rose-500'}`}>{formatCompact(netCashflow)}</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="col-span-1 lg:col-span-12">
                <ScenarioTabs 
                    scenarios={scenarios} 
                    activeId={activeScenarioId} 
                    onSwitch={setActiveScenarioId} 
                    onAdd={handleAddScenario}
                    onDelete={handleDeleteScenario}
                    onRename={handleRenameScenario}
                />
            </div>
            <div className="lg:col-span-4">
                <InputSection 
                    state={state}
                    updateState={updateState}
                    updateNested={updateNested}
                    addCustomAsset={addCustomAsset}
                    updateCustomAsset={updateCustomAsset}
                    removeCustomAsset={removeCustomAsset}
                    addLiability={addLiability}
                    updateLiability={updateLiability}
                    removeLiability={removeLiability}
                    results={results}
                    totalNetWorth={totalNetWorth}
                    totalEquity={totalEquity}
                    totalStable={totalStable}
                    totalCustom={totalCustom}
                    emergencyCoverageMonths={emergencyCoverageMonths}
                />
            </div>
            <div className="lg:col-span-8">
                <ResultsDashboard 
                    results={results}
                    state={state}
                    updateState={updateState}
                    hasData={hasData}
                    netCashflow={netCashflow}
                    monthlyIncome={monthlyIncome}
                    monthlyExpenses={monthlyBaseExpenses} 
                    totalSIP={totalSIP}
                    showRealValue={showRealValue}
                    setShowRealValue={setShowRealValue}
                    addEvent={addEvent}
                    updateEvent={updateEvent}
                    toggleEventType={toggleEventType}
                    removeEvent={removeEvent}
                />
            </div>
        </div>
      </main>
      )}

      {activeTab === 'dashboard' && (
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
      )}
      <UserGuideModal />
    </div>
  );
}
