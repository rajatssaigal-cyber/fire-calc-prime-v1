import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Table } from "lucide-react";
import { formatCompact, formatINR } from '../../utils/formatters';
import { Card } from '../ui/Card';

export const DetailedTable = ({ projection, targetRetirementAge }) => {
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
            <span className="text-sm font-bold text-slate-200">Year-on-Year Breakdown</span>
        </div>
        {isOpen ? <ChevronUp size={16} className="text-slate-500"/> : <ChevronDown size={16} className="text-slate-500"/>}
      </button>

      {isOpen && (
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
                <thead className="sticky top-0 bg-slate-950 z-10 shadow-md">
                    <tr className="text-slate-500 uppercase tracking-wider border-b border-slate-800">
                        <th className="p-3">Age</th>
                        <th className="p-3 text-right">Corpus</th>
                        <th className="p-3 text-right text-emerald-500">Equity</th>
                        <th className="p-3 text-right text-rose-500">Debt</th>
                        <th className="p-3 text-right text-amber-500">Alt</th>
                        <th className="p-3 text-right text-red-400">Withdrawal</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                    {projection.map((row) => {
                        const isRetired = row.age > targetRetirementAge;
                        return (
                            <tr key={row.age} className={`hover:bg-white/5 transition-colors ${isRetired ? 'bg-slate-900/30' : ''}`}>
                                <td className="p-3 font-bold border-r border-slate-800/50 sticky left-0 bg-slate-900/90">
                                    {row.age} 
                                    {row.age === Math.round(targetRetirementAge) && <span className="ml-2 text-[9px] bg-indigo-500 text-white px-1 rounded">RET</span>}
                                    {row.age === Math.round(targetRetirementAge)+1 && <span className="ml-2 text-[9px] bg-red-500/20 text-red-400 px-1 rounded">STRESS?</span>}
                                </td>
                                <td className="p-3 text-right font-bold text-white">{formatCompact(row.balance)}</td>
                                <td className="p-3 text-right">{formatCompact(row.equity)}</td>
                                <td className="p-3 text-right">{formatCompact(row.stable)}</td>
                                <td className="p-3 text-right">{formatCompact(row.custom)}</td>
                                <td className="p-3 text-right text-red-400">{row.withdrawal > 0 ? formatCompact(row.withdrawal) : '-'}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      )}
    </Card>
  );
};
