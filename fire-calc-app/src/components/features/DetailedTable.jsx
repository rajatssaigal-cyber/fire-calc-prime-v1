// fire-calc-app/src/components/features/DetailedTable.jsx

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Table, Info } from "lucide-react";
import { formatCompact } from '../../utils/formatters';
import { Card } from '../ui/Card';

export const DetailedTable = ({ projection, targetRetirementAge, showRealValue }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!projection || projection.length === 0) return null;

  return (
    <Card className="mt-6 border border-slate-800 bg-slate-900/50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
            <Table size={16} className="text-slate-400"/>
            <span className="text-sm font-bold text-slate-200">
                Year-on-Year Breakdown 
                {showRealValue && <span className="ml-2 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">REAL VALUE</span>}
            </span>
        </div>
        {isOpen ? <ChevronUp size={16} className="text-slate-500"/> : <ChevronDown size={16} className="text-slate-500"/>}
      </button>

      {isOpen && (
        <>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead className="sticky top-0 bg-slate-950 z-10 shadow-md">
                        <tr className="text-slate-500 uppercase tracking-wider border-b border-slate-800">
                            <th className="p-3">Age</th>
                            <th className="p-3 text-right">Corpus</th>
                            <th className="p-3 text-right text-emerald-500">Equity</th>
                            <th className="p-3 text-right text-rose-500">Stable</th>
                            <th className="p-3 text-right text-amber-500">Alt</th>
                            <th className="p-3 text-right text-red-400">Withdrawal</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-slate-300">
                        {projection.map((row) => {
                            const isRetired = row.age > targetRetirementAge;
                            
                            // 1. DYNAMIC KEYS: Select Real vs Nominal based on prop
                            const balance = showRealValue ? row.realBalance : row.balance;
                            const equity = showRealValue ? row.realEquity : row.equity;
                            const stable = showRealValue ? row.realStable : row.stable;
                            const custom = showRealValue ? row.realCustom : row.custom;
                            
                            // 2. DYNAMIC OUTFLOW CALCULATION
                            // Note: 'event' is usually nominal in the engine, but for simplicity here 
                            // we approximate Real Event Value if needed, or stick to nominal if the engine doesn't export 'realEvent'.
                            // Assuming 'realWithdrawal' exists from previous steps.
                            const withdrawalVal = showRealValue ? (row.realWithdrawal || 0) : (row.withdrawal || 0);
                            
                            // NOTE: If your engine doesn't output 'realEvent', we approximate it using the ratio
                            // ratio = realBalance / balance.
                            const ratio = row.balance > 0 ? (row.realBalance / row.balance) : 1;
                            const eventVal = showRealValue ? (row.event || 0) * ratio : (row.event || 0);
                            
                            const totalOutflow = withdrawalVal + eventVal;

                            return (
                                <tr key={row.age} className={`hover:bg-white/5 transition-colors ${isRetired ? 'bg-slate-900/30' : ''}`}>
                                    <td className="p-3 font-bold border-r border-slate-800/50 sticky left-0 bg-slate-900/90">
                                        {row.age} 
                                        {row.age === Math.round(targetRetirementAge) && <span className="ml-2 text-[9px] bg-indigo-500 text-white px-1 rounded">RET</span>}
                                        {row.age === Math.round(targetRetirementAge)+1 && <span className="ml-2 text-[9px] bg-red-500/20 text-red-400 px-1 rounded">STRESS?</span>}
                                    </td>
                                    <td className="p-3 text-right font-bold text-white">{formatCompact(balance)}</td>
                                    <td className="p-3 text-right">{formatCompact(equity)}</td>
                                    <td className="p-3 text-right">{formatCompact(stable)}</td>
                                    <td className="p-3 text-right">{formatCompact(custom)}</td>
                                    <td className="p-3 text-right text-red-400">
                                        {totalOutflow > 0 ? formatCompact(totalOutflow) : '-'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* 3. DYNAMIC FOOTER NOTE */}
            <div className="p-3 bg-slate-950/50 border-t border-slate-800 flex justify-end">
                 <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <Info size={12} />
                    {showRealValue ? (
                        <span>Values are <strong>Inflation Adjusted</strong> (Real Value). This is what the money is worth in today's terms.</span>
                    ) : (
                        <span>Values are projected <strong>Future Values</strong> (Nominal). They are NOT adjusted for inflation.</span>
                    )}
                 </div>
            </div>
        </>
      )}
    </Card>
  );
};
