import React, { useState, useRef } from 'react';
import { 
  Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, ComposedChart, Bar 
} from "recharts";
import { 
  Eye, EyeOff, Skull, Banknote, Clock, Scissors, Calculator, HelpCircle, Loader2, GripVertical 
} from "lucide-react";
import { Card } from '../ui/Card';
import { formatCompact, formatINR } from '../../utils/formatters';
import { LifeEventsList } from './LifeEventsList';
import { DetailedTable } from './DetailedTable.jsx';

export const ResultsDashboard = ({ 
  results, state, updateState, hasData, showRealValue, setShowRealValue, 
  addEvent, updateEvent, toggleEventType, removeEvent 
}) => {
  
  const [isDragging, setIsDragging] = useState(false);

  // 1. DRAG HANDLERS
  const handleChartMouseDown = (e) => {
    if (e && e.activeLabel) {
      // Only start dragging if clicked near the current retirement age (±2 years tolerance)
      if (Math.abs(e.activeLabel - state.targetRetirementAge) <= 2) {
        setIsDragging(true);
      }
    }
  };

  const handleChartMouseMove = (e) => {
    if (isDragging && e && e.activeLabel) {
      // Prevent dragging past current age or illogical futures
      const newAge = Math.max(state.currentAge + 1, Math.min(90, e.activeLabel));
      if (newAge !== state.targetRetirementAge) {
        updateState('targetRetirementAge', newAge);
      }
    }
  };

  const handleChartMouseUp = () => {
    setIsDragging(false);
  };

  // Custom Label for the Draggable Line
  const DraggableLabel = (props) => {
    const { viewBox } = props;
    const x = viewBox.x;
    const y = viewBox.y;
    return (
      <g style={{ cursor: 'col-resize' }}>
         <rect x={x - 15} y={0} width={30} height={300} fill="transparent" /> {/* Invisible hit area */}
         <foreignObject x={x - 12} y={10} width={24} height={24}>
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg border border-slate-200 text-slate-600 hover:scale-110 transition-transform cursor-col-resize">
               <GripVertical size={14} />
            </div>
         </foreignObject>
         <text x={x} y={45} fill="#fff" textAnchor="middle" fontSize={10} fontWeight="bold" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
             {state.targetRetirementAge}
         </text>
      </g>
    );
  };

  // 2. EMPTY STATE
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
    <div className="space-y-6" onMouseUp={handleChartMouseUp}> 
       {/* Note: onMouseUp on container ensures drag stops even if mouse leaves chart area */}
       
       {/* 3. TOP METRIC CARDS */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
         
         {/* A. GAP CARD */}
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

         {/* B. FREEDOM DATE CARD */}
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

         {/* C. MONTE CARLO CARD */}
         {(results?.monteCarlo || results?.isMcLoading) ? (
            <Card className="p-5 relative overflow-hidden bg-gradient-to-br from-slate-900 to-black border-slate-800" glow={results?.monteCarlo?.successRate > 80 ? "green" : "gold"}>
                <div className="flex justify-between items-start mb-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                         Success Probability
                    </p>
                    {!results.isMcLoading && (
                        <div className="group relative">
                            <HelpCircle size={12} className="text-slate-600 cursor-help"/>
                            <div className="absolute right-0 top-6 w-48 p-2 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300 hidden group-hover:block z-50 shadow-xl pointer-events-none">
                                We ran 10,000 simulations with randomized market returns (Equity ±15%, Debt ±4%).
                            </div>
                        </div>
                    )}
                </div>
                
                {results.isMcLoading ? (
                    <div className="h-[76px] flex flex-col items-center justify-center gap-2 opacity-50">
                        <Loader2 size={24} className="text-emerald-500 animate-spin"/>
                        <span className="text-[10px] font-mono text-slate-400">Simulating 10k Futures...</span>
                    </div>
                ) : (
                    <>
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
                    </>
                )}
            </Card>
         ) : (
            <div className="hidden md:block"></div> 
         )}
       </div>

       {/* 4. SOLUTIONS (Only if Shortfall) */}
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

       {/* 5. MAIN CHART */}
       <Card className="h-[400px] p-4 flex flex-col bg-slate-900/40 cursor-crosshair">
          <div className="flex justify-between items-center mb-4 px-1">
              <div className="flex flex-col">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Wealth Trajectory</h3>
                  {isDragging && <span className="text-[10px] text-emerald-400 font-bold animate-pulse">Release to set Retirement Age to {state.targetRetirementAge}</span>}
              </div>
              <div className="flex gap-3 text-[9px] font-medium text-slate-400">
                  <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Equity</span>
                  <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> Stable</span>
                  <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-sm bg-cyan-400"></div> Safety Net</span>
              </div>
          </div>
          <ResponsiveContainer width="100%" height="100%">
             <ComposedChart 
                data={results ? results.projection : []} 
                margin={{top:5, right:5, left:-20, bottom:0}}
                onMouseDown={handleChartMouseDown}
                onMouseMove={handleChartMouseMove}
                onMouseUp={handleChartMouseUp}
             >
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
                    cursor={{ stroke: '#ffffff20', strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="custom" stackId="1" stroke="#fbbf24" fill="url(#gCustom)" name="Alternatives" strokeWidth={1} isAnimationActive={!isDragging} />
                <Area type="monotone" dataKey="stable" stackId="1" stroke="#f43f5e" fill="url(#gStable)" name="Stable" strokeWidth={1} isAnimationActive={!isDragging} />
                <Area type="monotone" dataKey="equity" stackId="1" stroke="#10b981" fill="url(#gEq)" name="Equity" strokeWidth={1} isAnimationActive={!isDragging} />
                
                <Area type="monotone" dataKey={showRealValue ? "realEmergency" : "emergency"} stackId="0" stroke="#06b6d4" fill="url(#gEmergency)" name="Safety Net" strokeWidth={1} strokeDasharray="4 4" isAnimationActive={!isDragging} />
                
                <Bar dataKey="event" fill="#a855f7" name="Event" barSize={2} radius={[2, 2, 0, 0]} isAnimationActive={!isDragging} />
                <Bar 
                    dataKey={showRealValue ? "realWithdrawal" : "withdrawal"} 
                    fill="#ef4444" 
                    name="Withdrawal" 
                    barSize={2} 
                    radius={[2, 2, 0, 0]} 
                    isAnimationActive={!isDragging}
                />
                <Line 
                    type="monotone" 
                    dataKey={showRealValue ? "realBalance" : "balance"} 
                    stroke="#ffffff" 
                    strokeWidth={1.5} 
                    dot={false} 
                    name="Total" 
                    isAnimationActive={!isDragging}
                />
                <Line 
                    type="stepAfter" 
                    dataKey={(dataPoint) => (dataPoint.age > state.targetRetirementAge ? null : (showRealValue ? dataPoint.realTarget : dataPoint.target))} 
                    stroke="#ef4444" 
                    strokeWidth={1} 
                    dot={false} 
                    strokeDasharray="3 3" 
                    name="Target" 
                    isAnimationActive={!isDragging}
                />
                
                {/* DRAGGABLE REFERENCE LINE */}
                <ReferenceLine 
                    x={state.targetRetirementAge} 
                    stroke="#fff" 
                    strokeOpacity={0.8} 
                    strokeWidth={2}
                    label={<DraggableLabel />} 
                />
             </ComposedChart>
          </ResponsiveContainer>
       </Card>

       <LifeEventsList state={state} addEvent={addEvent} updateEvent={updateEvent} toggleEventType={toggleEventType} removeEvent={removeEvent} />
       <DetailedTable projection={results?.projection} targetRetirementAge={state.targetRetirementAge} />
    </div>
  );
};
