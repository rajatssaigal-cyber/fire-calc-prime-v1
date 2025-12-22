import React, { useMemo } from 'react';
import { 
  Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, ComposedChart, Bar, Legend
} from "recharts";
import { 
  CheckCircle2, AlertTriangle, ArrowRight, Eye, EyeOff, Skull, Banknote, Clock, Scissors, Calculator 
} from "lucide-react";
import { Card } from '../ui/Card';
import { formatCompact, formatINR } from '../../utils/formatters';
import { LifeEventsList } from './LifeEventsList.jsx';

export const ResultsDashboard = ({ 
  results, baselineResults, state, hasData, netCashflow, monthlyIncome, monthlyExpenses, totalSIP, 
  showRealValue, setShowRealValue, addEvent, updateEvent, toggleEventType, removeEvent 
}) => {
  const isSurplus = netCashflow >= 0;

  // --- MERGE DATA FOR CHART ---
  // We need to merge baselineResults into the main results for the chart to plot both
  const chartData = useMemo(() => {
    if (!results) return [];
    if (!baselineResults) return results.projection;

    // Create a map of baseline data by Age for fast lookup
    const baselineMap = new Map();
    baselineResults.projection.forEach(p => baselineMap.set(p.age, p));

    return results.projection.map(curr => {
        const base = baselineMap.get(curr.age);
        return {
            ...curr,
            baselineBalance: base ? base.balance : null,
            realBaselineBalance: base ? base.realBalance : null,
        };
    });
  }, [results, baselineResults]);
  
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
       <Card className="p-5 border-l-4 border-l-emerald-500 relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-900/50" glow={isSurplus ? "green" : "red"}>
           <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
              <div className="flex items-center gap-4 w-full md:w-auto">
                 <div className={`p-3 rounded-full ${isSurplus ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {isSurplus ? <CheckCircle2 size={24}/> : <AlertTriangle size={24}/>}
                 </div>
                 <div>
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Cashflow Reality Check</h3>
                    <p className="text-xs text-slate-400 mt-1">
                       {isSurplus 
                          ? <span>You have a healthy surplus of <span className="text-green-400 font-bold">{formatCompact(netCashflow)}/mo</span></span>
                          : <span>You are running a deficit of <span className="text-red-400 font-bold">{formatCompact(Math.abs(netCashflow))}/mo</span></span>}
                    </p>
                 </div>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono bg-black/40 p-3 rounded-xl border border-white/5 w-full md:w-auto justify-center shadow-inner">
                  <div className="text-center">
                      <div className="text-slate-500 text-[9px] uppercase mb-1">Income</div>
                      <div className="text-green-400 font-bold">{formatCompact(monthlyIncome)}</div>
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
                        <div className="flex items-center gap-2">
                             <p className="text-sm font-medium text-rose-400/60">Projected Shortfall</p>
                             {baselineResults && (
                                <span className="text-xs bg-white/5 px-1.5 py-0.5 rounded text-slate-400">
                                   (vs {formatCompact(showRealValue ? baselineResults.realGap : baselineResults.gap)})
                                </span>
                             )}
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="text-4xl font-black text-emerald-500 mb-1 tracking-tight">+{formatCompact(Math.abs(showRealValue ? results.realGap : results.gap))}</h2>
                         <div className="flex items-center gap-2">
                             <p className="text-sm font-medium text-green-400/60">Projected Surplus</p>
                             {baselineResults && (
                                <span className="text-xs bg-white/5 px-1.5 py-0.5 rounded text-slate-400">
                                   (vs {formatCompact(Math.abs(showRealValue ? baselineResults.realGap : baselineResults.gap))})
                                </span>
                             )}
                         </div>
                    </>
                )}
                {results.bankruptcyAge && (
                   <div className="mt-3 flex items-center gap-2 bg-red-900/30 p-2 rounded-lg border border-red-800/50">
                       <Skull size={16} className="text-red-500"/>
                       <p className="text-[10px] text-red-300 font-bold">
                           CRITICAL: Money runs out at age {results.bankruptcyAge}!
                       </p>
                   </div>
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
             {baselineResults && (
                <p className="text-xs text-slate-400 mt-2">
                    Baseline: {baselineResults.fireAge ? `${baselineResults.fireAge} yrs` : 'Never'}
                    <span className={`ml-2 font-bold ${parseFloat(results.fireAge) < parseFloat(baselineResults.fireAge) ? 'text-green-400' : 'text-red-400'}`}>
                        ({parseFloat(results.fireAge) < parseFloat(baselineResults.fireAge) ? '-' : '+'}{(Math.abs(results.fireAge - baselineResults.fireAge)).toFixed(1)})
                    </span>
                </p>
             )}
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
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-red-400"></div> Withdrawal</span>
                  {baselineResults && (
                      <span className="flex items-center gap-1.5"><div className="w-6 h-0.5 bg-slate-500 border-t border-dashed border-slate-400"></div> Baseline</span>
                  )}
              </div>
          </div>
          <ResponsiveContainer width="100%" height="100%">
             <ComposedChart data={chartData} margin={{top:10, right:10, left:0, bottom:0}}>
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
                    formatter={(val, name) => [formatINR(val), name === 'target' ? 'Required' : name === 'balance' ? 'Total' : name === 'baselineBalance' ? 'Baseline' : name]}
                    labelFormatter={(label) => `Age ${label}`}
                />
                
                {/* GHOST LINE (BASELINE) */}
                {baselineResults && (
                     <Line 
                        type="monotone" 
                        dataKey={showRealValue ? "realBaselineBalance" : "baselineBalance"} 
                        stroke="#94a3b8" 
                        strokeWidth={2} 
                        strokeDasharray="5 5"
                        dot={false} 
                        name="Baseline"
                        activeDot={false}
                    />
                )}

                <Area type="monotone" dataKey="custom" stackId="1" stroke="#fbbf24" fill="url(#gCustom)" name="Alternatives" strokeWidth={2} />
                <Area type="monotone" dataKey="stable" stackId="1" stroke="#f43f5e" fill="url(#gStable)" name="Stable Assets" strokeWidth={2} />
                <Area type="monotone" dataKey="equity" stackId="1" stroke="#10b981" fill="url(#gEq)" name="Equity" strokeWidth={2} />
                
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
    </div>
  );
};
