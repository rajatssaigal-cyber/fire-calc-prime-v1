// src/components/features/InputSection.jsx
import React from 'react';
import { Gift, Banknote, CreditCard, TrendingUp, Coins, PiggyBank, AlertCircle, Trees, ShieldCheck, Umbrella, Landmark, Plus, Trash2, Star, Snowflake, Info, AlertTriangle } from "lucide-react";
import { SmartInput } from '../ui/SmartInput';
import { SliderInput } from '../ui/SliderInput';
import { CollapsibleSection } from '../ui/CollapsibleSection';
import { formatCompact, formatINR } from '../../utils/formatters';

export const InputSection = ({ state, updateState, updateNested, addCustomAsset, updateCustomAsset, removeCustomAsset, results, totalNetWorth, totalEquity, totalStable, totalCustom, emergencyCoverageMonths }) => {
  
  // Logic for the simple warning
  const totalSIP = state.monthlySIP.equity + state.monthlySIP.stable;
  const availableSurplus = results?.initialSurplus || 0;
  // Use a +50 buffer for rounding errors
  const isOverBudget = totalSIP > (availableSurplus + 50);

  return (
    <div className="space-y-4">
           {/* PRO TIP BANNER */}
           <div className="bg-slate-900 border border-indigo-500/30 p-4 rounded-xl flex items-start gap-4 shadow-lg shadow-indigo-500/5">
              <div className="bg-indigo-500/20 p-2 rounded-lg">
                  <Info className="text-indigo-400 w-5 h-5" />
              </div>
              <div>
                 <p className="text-xs font-bold text-indigo-300 uppercase mb-1">Pro Tip</p>
                 <p className="text-xs text-slate-300 leading-relaxed">
                   Enter all values in <strong className="text-white">Today's Value</strong>. The engine automatically handles inflation adjustments for you.
                 </p>
              </div>
           </div>
           
           {/* CASHFLOW ENGINE */}
           <CollapsibleSection title="Cashflow Engine" icon={Gift} color="text-rose-500" defaultOpen={true}>
              <div className="space-y-4">
                 <div className="p-3 bg-slate-900/50 rounded-xl border border-white/5">
                    <div className="grid grid-cols-2 gap-3 mb-2">
                        <SmartInput label="Monthly Income (Post Tax)" value={state.annualIncome / 12} onChange={v=>updateState('annualIncome', v * 12)} icon={Banknote} iconColor="text-emerald-500" prefix="₹" />
                        <SmartInput label="Monthly Expense" value={state.currentAnnualExpenses / 12} onChange={v=>updateState('currentAnnualExpenses', v * 12)} icon={CreditCard} iconColor="text-rose-500" prefix="₹" />
                    </div>
                    <SliderInput label="Salary Growth (Yearly)" value={state.salaryGrowth} onChange={v=>updateState('salaryGrowth',v)} max={20} step={1} icon={TrendingUp} />
                 </div>
                 
                 <div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <SmartInput 
                            label="Equity SIP" 
                            value={state.monthlySIP.equity} 
                            onChange={v=>updateNested('monthlySIP','equity',v)} 
                            icon={Coins} 
                            iconColor="text-emerald-400" 
                            prefix="₹" 
                        />
                        <SmartInput 
                            label="Stable SIP (NPS, PPF)" 
                            value={state.monthlySIP.stable} 
                            onChange={v=>updateNested('monthlySIP','stable',v)} 
                            icon={PiggyBank} 
                            iconColor="text-rose-400" 
                            prefix="₹" 
                        />
                    </div>

                    {/* SIMPLE WARNING ONLY - NO FUNCTIONAL IMPACT */}
                    {isOverBudget && (
                        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
                            <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-amber-300 mb-0.5">Budget Alert</p>
                                <p className="text-[11px] text-amber-200/70 leading-relaxed">
                                    Your Total SIP ({formatCompact(totalSIP)}) exceeds your calculated surplus ({formatCompact(availableSurplus)}). 
                                    <br/>The calculator will use your input values, but this may not be realistic.
                                </p>
                            </div>
                        </div>
                    )}

                    <SliderInput label="SIP Step-Up (Yearly)" value={state.sipStepUp} onChange={v=>updateState('sipStepUp',v)} max={30} step={1} icon={TrendingUp} tooltip="How much you increase investments every year" />
                    {results?.salaryVsStepUpWarning && (
                        <p className="text-[10px] text-amber-500 mt-2 flex items-center gap-1 bg-amber-500/10 p-1.5 rounded">
                            <AlertCircle size={10}/> Warning: Your SIP Step-up is higher than Salary Growth.
                        </p>
                    )}
                 </div>
              </div>
           </CollapsibleSection>

           {/* CURRENT ASSETS */}
           <CollapsibleSection title="Current Assets" icon={Trees} color="text-emerald-500" defaultOpen={false} rightContent={formatCompact(totalNetWorth)}>
              <div className="space-y-4">
                 <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldCheck size={12} className="text-white"/> Safety Net
                        </p>
                        <div className="flex gap-1.5">
                            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">Now: {emergencyCoverageMonths}m</span>
                            {results && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${parseFloat(results.emergencyCoverageFuture) < parseFloat(emergencyCoverageMonths) ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                                    @Retire: {results.emergencyCoverageFuture}m
                                </span>
                            )}
                        </div>
                    </div>
                    <SmartInput label="Emergency Fund (Liquid)" value={state.emergencyFund} onChange={v=>updateState('emergencyFund',v)} icon={Umbrella} iconColor="text-slate-200" prefix="₹" />
                 </div>

                 <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-3">
                       <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Equity</p>
                       <p className="text-xs font-mono font-bold text-white bg-emerald-500/20 px-1.5 py-0.5 rounded">{formatCompact(totalEquity)}</p>
                    </div>
                    <div className="space-y-3">
                        <SmartInput label="Mutual Funds" value={state.equityAssets.mutualFunds} onChange={v=>updateNested('equityAssets','mutualFunds',v)} icon={TrendingUp} iconColor="text-emerald-400" prefix="₹" />
                        <SmartInput label="Direct Stock" value={state.equityAssets.stocks} onChange={v=>updateNested('equityAssets','stocks',v)} icon={TrendingUp} iconColor="text-emerald-400" prefix="₹" />
                    </div>
                 </div>
