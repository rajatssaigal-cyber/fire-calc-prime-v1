import React from 'react';
import { 
  Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, ComposedChart, Bar 
} from "recharts";
import { 
  Eye, EyeOff, Skull, Banknote, Clock, Scissors, Calculator, HelpCircle 
} from "lucide-react";
import { Card } from '../ui/Card';
import { formatCompact, formatINR } from '../../utils/formatters';
import { LifeEventsList } from './LifeEventsList';
import { DetailedTable } from './DetailedTable.jsx';

export const ResultsDashboard = ({ 
  results, state, hasData, showRealValue, setShowRealValue, 
  addEvent, updateEvent, toggleEventType, removeEvent 
}) => {
  
  if (!hasData) return null; // Handled by parent or empty state

  return (
    <div className="space-y-6">
       
       {/* GRID FIX: 
           1. 'items-start' prevents the shorter cards from stretching to match the tallest one.
           2. We use 'grid-cols-1 md:grid-cols-3' to keep them in one row on desktop.
       */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
         
         {/* 1. GAP CARD */}
         <Card className="p-5 relative overflow-hidden bg-gradient-to-br from-slate-900 to-black border-slate-800" glow={results?.gap > 0 ? "red" : "green"}>
             <div className="flex justify-between items-start mb-2">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gap at Age {state.targetRetirementAge}</p>
                 <button onClick={() => setShowRealValue(!showRealValue)} className="opacity-50 hover:opacity-100 transition-opacity">
                    {showRealValue ? <Eye size={14} className="text-emerald-400"/> : <EyeOff size={14} className="text-slate-500"/>}
                 </button>
             </div>
             
             {results && results.gap > 0 ? (
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-rose-500 tracking-tight">-{formatCompact(showRealValue ? results.realGap : results.gap)}</h2>
                    <p className="text-xs font-medium text-rose-400/60">Shortfall</p>
                </div>
             ) : (
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-emerald-500 tracking-tight">+{formatCompact(Math.abs(showRealValue ? results.realGap : results.gap))}</h2>
                    <p className="text-xs font-medium text-emerald-500/60">Surplus</p>
                </div>
             )}
             
             {results.bankruptcyAge && (
                <div className="mt-3 flex items-center gap-2 bg-red-900/20 p-2 rounded-md border border-red-900/30">
                    <Skull size={12} className="text-red-400"/>
                    <p className="text-[10px] text-red-300 font-bold">Runs out at age {results.bankruptcyAge}</p>
                </div>
             )}
         </Card>

         {/* 2. FREEDOM DATE CARD */}
         <Card className="p-5 relative overflow-hidden bg-gradient-to-br from-slate-900 to-black border-slate-800" glow="gold">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Freedom Date</p>
             {results && results.fireAge ? (
                 <div className="flex items-baseline gap-2">
                     <h2 className="text-3xl font-black text-amber-400 tracking-tight">{results.fireAge}</h2>
                     <span className="text-xs font-bold text-slate-600">Years Old</span>
                 </div>
             ) : (
                 <h2 className="text-2xl font-black text-slate-600">Never</h2>
             )}
             <p className="text-[10px] text-slate-500 mt-2 font-medium">
                {results.bankruptcyAge ? `Wealth lasts until ${results.bankruptcyAge}` : "Wealth sustains forever 🚀"}
             </p>
         </Card>

         {/* 3. MONTE CARLO CARD (COMPACT VERSION) */}
         {results?.monteCarlo ? (
            <Card className="p-5 relative overflow-hidden bg-gradient-to-br from-slate-900 to-black border-slate-800" glow={results.monteCarlo.successRate > 80 ? "green" : "gold"}>
                <div className="flex justify-between items-start mb-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                         Success Probability
                    </p>
                    <div className="group relative">
                        <HelpCircle size={12} className="text-slate-600 cursor-help"/>
                        <div className="absolute right-0 top-6 w-48 p-2 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300 hidden group-hover:block z-50 shadow-xl">
                            Based on 10,000 simulations with randomized market returns.
                        </div>
                    </div>
                </div>
                
                <div className="flex items-baseline gap-2 mb-3">
                    <h2 className={`text-3xl font-black tracking-tight ${results.monteCarlo.successRate > 80 ? "text-emerald-400" : results.monteCarlo.successRate > 50 ? "text-amber-400" : "text-rose-400"}`}>
                        {Math.round(results.monteCarlo.successRate)}%
                    </h2>
                    <span className="text-[10px] font-bold text-slate-600">Safe</span>
                </div>

                <div className="pt-3 border-t border-white/5 grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">Median End</p>
                        <p className="text-xs font-bold text-slate-300">{formatCompact(results.monteCarlo.medianFinalCorpus)}</p>
                    </div>
                    <div>
                        <p className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">Worst Case</p>
                        <p className="text-xs font-bold text-rose-300">{formatCompact(results.monteCarlo.worstCaseFinalCorpus)}</p>
                    </div>
                </div>
            </Card>
         ) : (
            <div className="hidden md:block"></div> 
         )}
       </div>

       {/* SOLUTIONS SUGGESTIONS */}
       {results && results.gap > 0 && (
         <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <Banknote className="w-3 h-3 text-amber-400"/>
                  <span className="text-[10px] font-bold text-amber-300 uppercase">Save</span>
               </div>
               <div className="text-sm font-bold text-slate-200">+{formatCompact(results.solutions.saveMore)}<span className="text-[10px] text-slate-500">/mo</span></div>
            </div>

            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-emerald-400"/>
                  <span className="text-[10px] font-bold text-emerald-300 uppercase">Work</span>
               </div>
               <div className="text-sm font-bold text-slate-200">+{results.solutions.workLonger} Yrs</div>
            </div>

            <div className="bg-rose-500/5 border border-rose-500/10 rounded-lg p-3 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <Scissors className="w-3 h-3 text-rose-400"/>
                  <span className="text-[10px] font-bold text-rose-300 uppercase">Cut</span>
               </div>
               <div className="text-sm font-bold text-slate-200">{formatCompact(results.solutions.spendLess)}<span className="text-[10px] text-slate-500">/yr</span></div>
            </div>
         </div>
       )}

       {/* MAIN CHART */}
       <Card className="h-[400px] p-4 flex flex-col bg-slate-900/40">
          <div className="flex justify-between items-center mb-4 px-1">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Wealth Trajectory</h3>
              {/* Legend */}
              <div className="flex gap-3 text-[9px] font-medium text-slate-400">
                  <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Equity</span>
                  <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> Stable</span>
                  <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-sm bg-cyan-400"></div> Safety Net</span>
              </div>
          </div>
          <ResponsiveContainer width="100%" height="100%">
             <ComposedChart data={results ? results.projection : []} margin={{top:5, right:5, left:-20, bottom:0}}>
                <defs>
                    <linearGradient id="gEq" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                    <linearGradient id="gStable" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient>
                    <linearGradient id="gCustom" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/><stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/></linearGradient>
                    <linearGradient id="gEmergency" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/><stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                <XAxis dataKey="age" stroke="#52525b" tick={{fontSize:9, fill:'#52525b'}} axisLine={false} tickLine={false} />
                <YAxis 
                    stroke="#52525b" 
                    tickFormatter={(val) => formatCompact(val, true)} 
                    tick={{fontSize:9, fill:'#52525b'}} 
                    axisLine={false} 
                    tickLine={false} 
                    domain={[0, 'auto']} 
                />
                <Tooltip 
                    contentStyle={{backgroundColor:'#09090b', borderColor:'#27272a', borderRadius:'8px', fontSize:'11px'}}
                    itemStyle={{padding:0}}
                    formatter={(val, name) => [formatINR(val), name === 'target' ? 'Required' : name === 'balance' ? 'Total' : name]}
                    labelFormatter={(label) => `Age ${label}`}
                />
                <Area type="monotone" dataKey="custom" stackId="1" stroke="#fbbf24" fill="url(#gCustom)" name="Alternatives" strokeWidth={1} />
                <Area type="monotone" dataKey="stable" stackId="1" stroke="#f43f5e" fill="url(#gStable)" name="Stable" strokeWidth={1} />
                <Area type="monotone" dataKey="equity" stackId="1" stroke="#10b981" fill="url(#gEq)" name="Equity" strokeWidth={1} />
                <Area type="monotone" dataKey={showRealValue ? "realEmergency" : "emergency"} stackId="0" stroke="#06b6d4" fill="url(#gEmergency)" name="Safety Net" strokeWidth={1} strokeDasharray="4 4" />
                
                <Bar dataKey="event" fill="#a855f7" name="Event" barSize={2} radius={[2, 2, 0, 0]} />
                <Bar 
                    dataKey={showRealValue ? "realWithdrawal" : "withdrawal"} 
                    fill="#ef4444" 
                    name="Withdrawal" 
                    barSize={2} 
                    radius={[2, 2, 0, 0]} 
                />
                <Line 
                    type="monotone" 
                    dataKey={showRealValue ? "realBalance" : "balance"} 
                    stroke="#ffffff" 
                    strokeWidth={1.5} 
                    dot={false} 
                    name="Total" 
                />
                <Line 
                    type="stepAfter" 
                    dataKey={(dataPoint) => (dataPoint.age > state.targetRetirementAge ? null : (showRealValue ? dataPoint.realTarget : dataPoint.target))} 
                    stroke="#ef4444" 
                    strokeWidth={1} 
                    dot={false} 
                    strokeDasharray="3 3" 
                    name="Target" 
                />
                <ReferenceLine x={state.targetRetirementAge} stroke="#fff" strokeOpacity={0.1} label={{position:'insideTopRight', value:'RETIRE', fill:'#fff', fontSize:8, opacity:0.5}} />
             </ComposedChart>
          </ResponsiveContainer>
       </Card>

       <LifeEventsList state={state} addEvent={addEvent} updateEvent={updateEvent} toggleEventType={toggleEventType} removeEvent={removeEvent} />
       <DetailedTable projection={results?.projection} targetRetirementAge={state.targetRetirementAge} />
    </div>
  );
};
