import React, { useMemo, useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import { Trophy, AlertTriangle, CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react";
import { calculateProjection } from '../../utils/fireMath';
import { formatCompact } from '../../utils/formatters';
import { Card } from '../ui/Card';

export const CompareTab = ({ scenarios }) => {
  const [showRealValue, setShowRealValue] = useState(false);
  
  // 1. Run Math Engine for ALL Scenarios
  const comparisonData = useMemo(() => {
    return Object.entries(scenarios).map(([id, scenario]) => {
      const results = calculateProjection(scenario);
      
      // Helper to find specific values at retirement age from projection array
      const retData = results.projection.find(p => p.age === Math.floor(scenario.targetRetirementAge));
      
      return { 
          id, 
          name: scenario.scenarioName, 
          scenario, 
          results,
          // Extract Real Values for the table
          realCorpus: retData?.realBalance || 0,
          realTarget: retData?.realTarget || 0
      };
    });
  }, [scenarios]);

  // 2. Merge Data for the Multi-Line Chart
  const chartData = useMemo(() => {
    const dataMap = new Map();
    
    // Find min/max ages to define X-Axis range
    let minAge = 100, maxAge = 0;

    comparisonData.forEach(({ id, name, results }) => {
        if(!results?.projection) return;
        results.projection.forEach(p => {
            const age = p.age;
            if (age < minAge) minAge = age;
            if (age > maxAge) maxAge = age;
            
            if (!dataMap.has(age)) {
                dataMap.set(age, { age });
            }
            // Dynamic Value Selection (Real vs Nominal)
            const val = showRealValue ? p.realBalance : p.balance;
            dataMap.get(age)[name] = val; 
        });
    });

    return Array.from(dataMap.values()).sort((a, b) => a.age - b.age);
  }, [comparisonData, showRealValue]);

  // Colors for different scenario lines
  const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6"];

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
            <div>
                <h2 className="text-3xl font-bold text-white">Scenario Showdown</h2>
                <p className="text-slate-400 mt-1">Comparing {comparisonData.length} distinct financial futures.</p>
            </div>

            {/* TOGGLE BUTTON */}
            <button 
                onClick={() => setShowRealValue(!showRealValue)} 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                    showRealValue 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                        : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
                }`}
            >
                <span className="text-[10px] font-bold uppercase tracking-wider">
                    {showRealValue ? "Real Value (Inflation Adj)" : "Nominal Value"}
                </span>
                {showRealValue ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
        </div>

        {/* 1. COMPARISON TABLE */}
        <Card className="overflow-x-auto bg-slate-900/40 border-slate-800">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-white/10 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <th className="p-4">Scenario Name</th>
                        <th className="p-4">Retire Age</th>
                        <th className="p-4">Monthly Spend</th>
                        <th className="p-4">Target Corpus</th>
                        <th className="p-4">Projected Corpus</th>
                        <th className="p-4">Gap</th>
                        <th className="p-4">Freedom Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm font-medium text-slate-200">
                    {comparisonData.map(({ id, name, scenario, results, realCorpus, realTarget }, index) => {
                        // Dynamic Values based on Toggle
                        const gapVal = showRealValue ? results.realGap : results.gap;
                        const corpusVal = showRealValue ? realCorpus : results.corpusAtRetirement;
                        const targetVal = showRealValue ? realTarget : results.targetAtRetirement;

                        const isSurplus = gapVal <= 0; // Negative gap means surplus logic in fireMath
                        // Note: Depending on your math engine, gap might be Target - Corpus (Positive = Bad) or Corpus - Target (Positive = Good).
                        // Looking at your previous code: gap = target - corpus. So Gap > 0 is BAD.
                        const isBad = gapVal > 0;

                        return (
                            <tr key={id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ background: colors[index % colors.length] }}></div>
                                    <span className="font-bold text-white">{name}</span>
                                    {index === 0 && <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">BASE</span>}
                                </td>
                                <td className="p-4">{scenario.targetRetirementAge}</td>
                                <td className="p-4 text-slate-400">
                                    {formatCompact(scenario.retirementAnnualExpenses/12)}
                                </td>
                                <td className="p-4 text-slate-500">{formatCompact(targetVal)}</td>
                                <td className="p-4 text-white font-bold">{formatCompact(corpusVal)}</td>
                                <td className={`p-4 font-bold ${!isBad ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {isBad ? '-' : '+'}{formatCompact(Math.abs(gapVal))}
                                </td>
                                <td className="p-4 flex items-center gap-2">
                                    {results.fireAge ? (
                                        <>
                                            <span className="text-emerald-400 font-bold">{results.fireAge}</span>
                                            {parseFloat(results.fireAge) <= scenario.targetRetirementAge ? <CheckCircle2 size={14} className="text-emerald-500"/> : <AlertTriangle size={14} className="text-amber-500"/>}
                                        </>
                                    ) : (
                                        <span className="text-slate-600 flex items-center gap-1"><XCircle size={14}/> Never</span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </Card>

        {/* 2. COMPARISON CHART */}
        <Card className="p-6 h-[500px] flex flex-col bg-slate-900/40 border-slate-800">
             <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Wealth Trajectory Comparison</h3>
                  {showRealValue && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20 font-bold">
                          REAL VALUE MODE
                      </span>
                  )}
             </div>
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{top:10, right:30, left:0, bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="age" stroke="#52525b" tick={{fontSize:10, fill:'#71717a'}} axisLine={false} tickLine={false} label={{ value: 'Age', position: 'insideBottomRight', offset: -5, fill: '#52525b', fontSize: 10 }} />
                    <YAxis stroke="#52525b" tickFormatter={(val) => formatCompact(val)} tick={{fontSize:10, fill:'#71717a'}} axisLine={false} tickLine={false} domain={[0, 'auto']} />
                    <Tooltip 
                        contentStyle={{backgroundColor:'#020617', borderColor:'#334155', borderRadius:'12px', boxShadow:'0 10px 30px -10px rgba(0,0,0,0.8)'}}
                        itemStyle={{fontSize:'12px', fontWeight:700, fontFamily: 'monospace'}}
                        formatter={(val) => formatCompact(val)}
                        labelFormatter={(label) => `Age ${label}`}
                    />
                    <Legend wrapperStyle={{paddingTop: '20px'}}/>
                    {comparisonData.map(({ name }, index) => (
                        <Line 
                            key={name}
                            type="monotone" 
                            dataKey={name} 
                            stroke={colors[index % colors.length]} 
                            strokeWidth={3} 
                            dot={false} 
                            activeDot={{ r: 6 }}
                        />
                    ))}
                </LineChart>
             </ResponsiveContainer>
        </Card>

    </div>
  );
};
