import React, { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import { Trophy, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { calculateProjection } from '../../utils/fireMath';
import { formatCompact } from '../../utils/formatters';
import { Card } from '../ui/Card';

export const CompareTab = ({ scenarios }) => {
  
  // 1. Run Math Engine for ALL Scenarios
  const comparisonData = useMemo(() => {
    return Object.entries(scenarios).map(([id, scenario]) => {
      const results = calculateProjection(scenario);
      return { id, name: scenario.scenarioName, scenario, results };
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
            // Add this scenario's balance to the age bucket
            dataMap.get(age)[name] = p.balance; // Using Name as key for Recharts
        });
    });

    return Array.from(dataMap.values()).sort((a, b) => a.age - b.age);
  }, [comparisonData]);

  // Colors for different scenario lines
  const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6"];

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
        
        {/* HEADER */}
        <div className="text-center space-y-2 mb-8">
            <h2 className="text-3xl font-bold text-white">Scenario Showdown</h2>
            <p className="text-slate-400">Comparing {comparisonData.length} distinct financial futures.</p>
        </div>

        {/* 1. COMPARISON TABLE */}
        <Card className="overflow-x-auto">
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
                    {comparisonData.map(({ id, name, scenario, results }, index) => {
                        const isSurplus = results.gap <= 0;
                        return (
                            <tr key={id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ background: colors[index % colors.length] }}></div>
                                    <span className="font-bold text-white">{name}</span>
                                    {index === 0 && <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">BASE</span>}
                                </td>
                                <td className="p-4">{scenario.targetRetirementAge}</td>
                                <td className="p-4">{formatCompact(scenario.retirementAnnualExpenses/12)}</td>
                                <td className="p-4 text-slate-400">{formatCompact(results.targetAtRetirement)}</td>
                                <td className="p-4">{formatCompact(results.corpusAtRetirement)}</td>
                                <td className={`p-4 font-bold ${isSurplus ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {isSurplus ? '+' : ''}{formatCompact(Math.abs(results.gap))}
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
        <Card className="p-6 h-[500px] flex flex-col bg-slate-900/40">
             <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Wealth Trajectory Comparison</h3>
             </div>
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{top:10, right:30, left:0, bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="age" stroke="#52525b" tick={{fontSize:10, fill:'#71717a'}} axisLine={false} tickLine={false} label={{ value: 'Age', position: 'insideBottomRight', offset: -5, fill: '#52525b', fontSize: 10 }} />
                    <YAxis stroke="#52525b" tickFormatter={formatCompact} tick={{fontSize:10, fill:'#71717a'}} axisLine={false} tickLine={false} domain={[0, 'auto']} />
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
