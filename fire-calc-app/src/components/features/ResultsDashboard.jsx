import React from 'react';
import { 
  Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, ComposedChart, Bar 
} from "recharts";
import { 
  CheckCircle2, AlertTriangle, ArrowRight, Eye, EyeOff, Skull, Banknote, Clock, Scissors, Calculator 
} from "lucide-react";
import { Card } from '../ui/Card';
import { formatCompact, formatINR } from '../../utils/formatters';
import { LifeEventsList } from './LifeEventsList';
import { DetailedTable } from './DetailedTable.jsx';

export const ResultsDashboard = ({ 
  results, state, hasData, netCashflow, monthlyIncome, monthlyExpenses, totalSIP, 
  showRealValue, setShowRealValue, addEvent, updateEvent, toggleEventType, removeEvent 
}) => {
  
  if (!hasData) return (
     <div className="flex flex-col items-center justify-center h-[500px] p-8 bg-zinc-900/30 rounded-3xl border border-white/5 text-center backdrop-blur-sm animate-in fade-in duration-700">
         <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6 shadow-2xl border border-white/10 relative">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
            <Calculator size={40} className="text-emerald-400 relative z-10" />
         </div>
         <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Your Financial Future Awaits</h3>
         <p className="text-zinc-400 max-w-sm leading-relaxed mb-6">
           Enter your current income, assets, and goals on the left to instantly visualize your path to freedom.
         </p>
         <div className="flex gap-2 text-xs font-mono text-zinc-600 uppercase tracking-widest">
           <span>• Inflation Adjusted</span>
           <span>• Tax Optimized</span>
         </div>
     </div>
  );

  return (
    <div className="space-y-6">
       
       {/* TOP CARDS GRID */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"> {/* Changed to 3 columns for Monte Carlo */}
         
         {/* 1. GAP CARD */}
         <Card className="p-6 relative overflow-hidden bg-gradient-to-br from-slate-900 to-black border-slate-800" glow={results?.gap > 0 ? "red" : "green"}>
             <div className="relative z-10">
                <div className="flex justify-between items-start">
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Gap at Age {state.targetRetirementAge}</p>
                     <button onClick={() => setShowRealValue(!showRealValue)} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide bg-slate-800 border border-slate-700 px-2 py-1 rounded-md hover:bg-slate-700 transition-colors text-slate-300">
                        {showRealValue ? <Eye size={12} className="text-amber-400"/> : <EyeOff size={12}/>}
                        {showRealValue ? "Real" : "Nominal"}
                     </button>
                </div>
                {results && results.gap > 0 ? (
                    <>
                        <h2 className="text-3xl font-black text-rose-500 mb-1 tracking-tight">-{formatCompact(showRealValue ? results.realGap : results.gap)}</h2>
                        <p className="text-xs font-medium text-rose-400/60">Shortfall</p>
                    </>
                ) : (
                    <>
                        <h2 className="text-3xl font-black text-emerald-500 mb-1 tracking-tight">+{formatCompact(Math.abs(showRealValue ? results.realGap : results.gap))}</h2>
                        <p className="text-xs font-medium text-green-400/60">Surplus</p>
                    </>
                )}
                {results.bankruptcyAge && (
                   <div className="mt-3 flex items-center gap-2 bg-red-900/30 p-2 rounded-lg border border-red-800/50">
                       <Skull size={14} className="text-red-500"/>
                       <p className="text-[10px] text-red-300 font-bold">
                           Empty at age {results.bankruptcyAge}
                       </p>
                   </div>
                )}
             </div>
         </Card>

         {/* 2. FREEDOM DATE CARD */}
         <Card className="p-6 relative overflow-hidden bg-gradient-to-br from-slate-900 to-black border-slate-800" glow="gold">
             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Freedom Date</p>
             {results && results.fireAge ? (
                 <div className="flex items-end gap-2">
                     <h2 className="text-3xl font-black text-amber-400 tracking-tight">{results.fireAge}</h2>
                     <span className="text-xs font-medium text-slate-500 mb-1.5">Years Old</span>
                 </div>
             ) : (
                 <h2 className="text-2xl font-black text-slate-600">Never</h2>
             )}
             {results.bankruptcyAge ? (
                 <p className="text-[10px] text-red-500 mt-2 font-bold">Money lasts until: {results.bankruptcyAge} yrs</p>
             ) : (
                  <p className="text-[10px] text-emerald-500 mt-2 font-bold">Wealth sustains forever! 🚀</p>
             )}
         </Card>

         {/* 3. MONTE CARLO CARD (NEW) */}
         {results?.monteCarlo ? (
            <Card className="p-6 relative overflow-hidden bg-gradient-to-br from-slate-900 to-black border-slate-800" glow={results.monteCarlo.successRate > 80 ? "green" : "gold"}>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Calculator size={14} /> Success Probability
                </p>
                
                <div className="flex items-end gap-2 mb-2">
                    <h2 className={`text-3xl font-black tracking-tight ${results.monteCarlo.successRate > 80 ? "text-emerald-400" : results.monteCarlo.successRate > 50 ? "text-amber-400" : "text-rose-400"}`}>
                        {Math.round(results.monteCarlo.successRate)}%
                    </h2>
                </div>
                 <div className="relative group">
    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1 cursor-help">
        <Calculator size={14} /> Monte Carlo (10k Runs) <HelpCircle size={10}/>
    </p>
    {/* Tooltip on Hover */}
    <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-64 p-3 bg-slate-900 border border-slate-700 rounded-lg shadow-xl text-[10px] text-slate-300 z-50">
        We ran 10,000 simulations of your life. In each, market returns were randomized (Equity ±15%, Debt ±4%).
        <br/><br/>
        <strong>{Math.round(results.monteCarlo.successRate)}% Success</strong> means in that many scenarios, you died with money left in the bank.
    </div>
</div>

<div className="flex items-end gap-2 mb-2">
    <h2 className={`text-3xl font-black tracking-tight ${results.monteCarlo.successRate > 90 ? "text-emerald-400" : results.monteCarlo.successRate > 75 ? "text-emerald-200" : results.monteCarlo.successRate > 50 ? "text-amber-400" : "text-rose-400"}`}>
        {Math.round(results.monteCarlo.successRate)}%
    </h2>
</div>

<p className="text-[10px] text-slate-400 leading-relaxed mb-3">
    Probability that your wealth lasts your entire life, accounting for market crashes and volatility.
    {results.monteCarlo.successRate < 90 && (
        <span className="block mt-1 text-amber-400 font-bold">
            Consider reducing spending or increasing equity to improve this.
        </span>
    )}
</p>
                <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
                    In <strong>{results.monteCarlo.successRate.toFixed(0)}/100</strong> simulations, you never run out of money.
                </p>

                <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-2">
                    <div>
                        <p className="text-[9px] text-slate-500 uppercase font-bold">Median End</p>
                        <p className="text-[10px] font-bold text-slate-300">{formatCompact(results.monteCarlo.medianFinalCorpus)}</p>
                    </div>
                    <div>
                        <p className="text-[9px] text-slate-500 uppercase font-bold">Worst Case</p>
                        <p className="text-[10px] font-bold text-rose-300">{formatCompact(results.monteCarlo.worstCaseFinalCorpus)}</p>
                    </div>
                </div>
            </Card>
         ) : (
            // Placeholder if MC hasn't run yet or data is missing
            <div className="hidden lg:block"></div>
         )}
       </div>

       {/* SOLUTIONS GRID */}
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

       {/* MAIN CHART */}
       <Card className="h-[450px] p-4 flex flex-col bg-slate-900/40">
          <div className="flex justify-between items-center mb-6 px-2">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Wealth Trajectory ({showRealValue ? 'Real Value' : 'Nominal'})</h3>
              <div className="flex gap-4 text-[10px]">
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Equity</span>
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Stable</span>
                  {state.customAssets.length > 0 && <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Alternatives</span>}
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-red-400"></div> Withdrawal</span>
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-cyan-400"></div> Safety Net</span>
              </div>
          </div>
          <ResponsiveContainer width="100%" height="100%">
             <ComposedChart data={results ? results.projection : []} margin={{top:10, right:10, left:0, bottom:0}}>
                <defs>
                    <linearGradient id="gEq" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                    <linearGradient id="gStable" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient>
                    <linearGradient id="gCustom" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/><stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/></linearGradient>
                    <linearGradient id="gEmergency" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/><stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="age" stroke="#52525b" tick={{fontSize:10, fill:'#71717a'}} axisLine={false} tickLine={false} />
                <YAxis 
                    stroke="#52525b" 
                    tickFormatter={formatCompact} 
                    tick={{fontSize:10, fill:'#71717a'}} 
                    axisLine={false} 
                    tickLine={false} 
                    domain={[0, 'auto']} 
                />
                <Tooltip 
                    contentStyle={{backgroundColor:'#020617', borderColor:'#334155', borderRadius:'12px', boxShadow:'0 10px 30px -10px rgba(0,0,0,0.8)'}}
                    itemStyle={{fontSize:'12px', fontWeight:700, fontFamily: 'monospace'}}
                    formatter={(val, name) => [formatINR(val), name === 'target' ? 'Required' : name === 'balance' ? 'Total' : name]}
                    labelFormatter={(label) => `Age ${label}`}
                />
                <Area type="monotone" dataKey="custom" stackId="1" stroke="#fbbf24" fill="url(#gCustom)" name="Alternatives" strokeWidth={2} />
                <Area type="monotone" dataKey="stable" stackId="1" stroke="#f43f5e" fill="url(#gStable)" name="Stable Assets" strokeWidth={2} />
                <Area type="monotone" dataKey="equity" stackId="1" stroke="#10b981" fill="url(#gEq)" name="Equity" strokeWidth={2} />
                
                {/* Emergency Fund Area */}
                <Area type="monotone" dataKey={showRealValue ? "realEmergency" : "emergency"} stackId="0" stroke="#06b6d4" fill="url(#gEmergency)" name="Safety Net" strokeWidth={2} strokeDasharray="5 5" />
                
                <Bar dataKey="event" fill="#a855f7" name="Event" barSize={4} radius={[4, 4, 0, 0]} />
                <Bar 
                    dataKey={showRealValue ? "realWithdrawal" : "withdrawal"} 
                    fill="#ef4444" 
                    name="Withdrawal" 
                    barSize={4} 
                    radius={[4, 4, 0, 0]} 
                />
                <Line 
                    type="monotone" 
                    dataKey={showRealValue ? "realBalance" : "balance"} 
                    stroke="#ffffff" 
                    strokeWidth={2} 
                    dot={false} 
                    name="Total Corpus" 
                    activeDot={{ r: 6, strokeWidth: 0, fill: "#ffffff" }}
                />
                <Line 
                    type="stepAfter" 
                    dataKey={(dataPoint) => (dataPoint.age > state.targetRetirementAge ? null : (showRealValue ? dataPoint.realTarget : dataPoint.target))} 
                    stroke="#ef4444" 
                    strokeWidth={2} 
                    dot={false} 
                    strokeDasharray="4 4" 
                    name="Target" 
                />
                <ReferenceLine x={state.targetRetirementAge} stroke="#fff" strokeOpacity={0.1} label={{position:'insideTopRight', value:'RETIRE', fill:'#fff', fontSize:9, fontWeight:'bold', opacity:0.7}} />
             </ComposedChart>
          </ResponsiveContainer>
       </Card>

       <LifeEventsList state={state} addEvent={addEvent} updateEvent={updateEvent} toggleEventType={toggleEventType} removeEvent={removeEvent} />
       <DetailedTable projection={results?.projection} targetRetirementAge={state.targetRetirementAge} />
    </div>
  );
};
