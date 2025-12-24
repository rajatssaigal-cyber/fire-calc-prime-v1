import React from 'react';
import { 
    Gift, Banknote, CreditCard, TrendingUp, Coins, PiggyBank, AlertCircle, 
    Trees, ShieldCheck, Umbrella, Landmark, Plus, Trash2, Star, Snowflake, 
    Info, AlertTriangle, Sprout, TrendingDown 
} from "lucide-react";
import { SmartInput } from '../ui/SmartInput';
import { SliderInput } from '../ui/SliderInput';
import { CollapsibleSection } from '../ui/CollapsibleSection';
import { formatCompact } from '../../utils/formatters';

export const InputSection = ({ 
    state, 
    updateState, 
    updateNested, 
    addCustomAsset, 
    updateCustomAsset, 
    removeCustomAsset, 
    addLiability,     
    updateLiability,  
    removeLiability,  
    results, 
    totalNetWorth, 
    totalEquity, 
    totalStable, 
    totalCustom, 
    emergencyCoverageMonths 
}) => {
  
  // Safety checks for arrays (prevents crashes with old saves)
  const liabilities = state.liabilities || [];
  const customAssets = state.customAssets || [];

  // Calculate Real Cashflow for Budget Warning
  const monthlyIncome = state.annualIncome / 12;
  const monthlyBaseSpend = state.currentAnnualExpenses / 12;
  const totalEMI = liabilities.reduce((sum, l) => sum + (parseFloat(l.monthlyEMI) || 0), 0);
  const totalSpend = monthlyBaseSpend + totalEMI;
  const totalSIP = state.monthlySIP.equity + state.monthlySIP.stable;
  
  // Net Surplus available
  const netSurplus = monthlyIncome - totalSpend - totalSIP;
  
  // Budget Warning Logic (+50 buffer)
  const isOverBudget = netSurplus < -50; 

  return (
    <div className="space-y-6">
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
           
           {/* 1. CASHFLOW ENGINE */}
           <CollapsibleSection title="Cashflow Engine" icon={Gift} color="text-rose-500" defaultOpen={true}>
              <div className="space-y-4">
                 <div className="p-3 bg-slate-900/50 rounded-xl border border-white/5">
                    <div className="grid grid-cols-2 gap-3 mb-2">
                        <SmartInput label="Monthly Income (Post Tax)" value={state.annualIncome / 12} onChange={v=>updateState('annualIncome', v * 12)} icon={Banknote} iconColor="text-emerald-500" prefix="₹" />
                        <SmartInput label="Base Monthly Expense" value={state.currentAnnualExpenses / 12} onChange={v=>updateState('currentAnnualExpenses', v * 12)} icon={CreditCard} iconColor="text-rose-500" prefix="₹" tooltip="Excluding Loan EMIs" />
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

                    {/* SIMPLE BUDGET WARNING (Fits nicely inside sidebar) */}
                    {isOverBudget && (
                        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
                            <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-amber-300 mb-0.5">Budget Deficit</p>
                                <p className="text-[11px] text-amber-200/70 leading-relaxed">
                                    Your expenses & SIPs exceed your income by <strong>{formatCompact(Math.abs(netSurplus))}</strong>. 
                                    <br/>The calculator will use these values, but your plan may be unrealistic.
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

           {/* 2. CURRENT ASSETS */}
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
                 
                 <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-3">
                       <p className="text-xs font-bold text-rose-400 uppercase tracking-wider">Stable Assets</p>
                       <p className="text-xs font-mono font-bold text-white bg-rose-500/20 px-1.5 py-0.5 rounded">{formatCompact(totalStable)}</p>
                    </div>
                    <div className="space-y-3">
                        <SmartInput label="EPF/PPF/NPS" value={state.stableAssets.epf} onChange={v=>updateNested('stableAssets','epf',v)} icon={Landmark} iconColor="text-rose-400" prefix="₹" />
                        <SmartInput label="Gold/SGB/Cash" value={state.stableAssets.gold} onChange={v=>updateNested('stableAssets','gold',v)} icon={Coins} iconColor="text-amber-500" prefix="₹" />
                    </div>
                 </div>

                 {/* CUSTOM ASSETS (Safe Map) */}
                 <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-3">
                       <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Alternatives</p>
                       <p className="text-xs font-mono font-bold text-white bg-amber-500/20 px-1.5 py-0.5 rounded">{formatCompact(totalCustom)}</p>
                    </div>
                    <div className="space-y-3">
                        {customAssets.map(asset => (
                            <div key={asset.id} className="flex gap-2 items-start">
                                <div className="flex-1 space-y-2">
                                    <input 
                                        className="w-full bg-slate-950 text-slate-100 rounded-lg py-2 px-3 text-xs font-medium outline-none border border-slate-800 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all placeholder:text-slate-600"
                                        value={asset.name}
                                        onChange={(e) => updateCustomAsset(asset.id, 'name', e.target.value)}
                                        placeholder="Asset Name (e.g. Plot)"
                                    />
                                    <SmartInput value={asset.value} onChange={v=>updateCustomAsset(asset.id, 'value', v)} prefix="₹" className="h-9 text-xs" />
                                </div>
                                <button onClick={()=>removeCustomAsset(asset.id)} className="p-2 text-slate-600 hover:text-red-400 mt-1"><Trash2 size={14}/></button>
                            </div>
                        ))}
                        <button onClick={addCustomAsset} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-slate-700 text-xs text-slate-500 hover:text-amber-400 hover:border-amber-500/50 transition-all font-bold uppercase tracking-wide">
                            <Plus size={14}/> Add Real Estate / Crypto
                        </button>
                    </div>
                 </div>
              </div>
           </CollapsibleSection>

           {/* 3. LOANS & LIABILITIES (Polished UI) */}
           <CollapsibleSection title="Loans & Liabilities" icon={Landmark} color="text-rose-500" defaultOpen={false}>
              <div className="space-y-4">
                 <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                        Add loans here instead of in "Monthly Expense". The engine will automatically stop deducting the EMI once the loan is paid off.
                    </p>
                    
                    <div className="space-y-4">
                        {liabilities.map(loan => (
                            <div key={loan.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-sm space-y-4 relative group transition-all hover:border-slate-700">
                                {/* Header: Name & Delete */}
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Loan Name</label>
                                        <input 
                                            className="w-full bg-transparent text-slate-200 text-sm font-bold outline-none placeholder:text-slate-600 border-b border-transparent focus:border-rose-500/50 pb-1 transition-all"
                                            value={loan.name}
                                            onChange={(e) => updateLiability(loan.id, 'name', e.target.value)}
                                            placeholder="e.g. Home Loan"
                                        />
                                    </div>
                                    <button 
                                        onClick={()=>removeLiability(loan.id)} 
                                        className="p-2 rounded-lg bg-slate-900 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        title="Delete Loan"
                                    >
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                                
                                {/* Row 1: EMI & Tenure */}
                                <div className="grid grid-cols-2 gap-4">
                                    <SmartInput 
                                        label="Monthly EMI" 
                                        value={loan.monthlyEMI} 
                                        onChange={v=>updateLiability(loan.id, 'monthlyEMI', v)} 
                                        prefix="₹" 
                                    />
                                    <SmartInput 
                                        label="Ends at Age" 
                                        value={loan.endAge} 
                                        onChange={v=>updateLiability(loan.id, 'endAge', v)} 
                                        tooltip={`Loan ends in ${(loan.endAge - state.currentAge).toFixed(1)} years`}
                                    />
                                </div>
                                
                                {/* Row 2: Balance (Separated) */}
                                <div className="pt-4 mt-2 border-t border-slate-800/50">
                                     <SmartInput 
                                        label="Outstanding Balance (Optional)" 
                                        value={loan.outstandingAmount} 
                                        onChange={v=>updateLiability(loan.id, 'outstandingAmount', v)} 
                                        prefix="₹" 
                                        className="text-slate-400"
                                    />
                                </div>
                            </div>
                        ))}
                        
                        <button onClick={addLiability} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-slate-700 text-xs text-slate-400 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all font-bold uppercase tracking-wide">
                            <Plus size={16}/> Add Home / Car Loan
                        </button>
                    </div>
                 </div>
              </div>
           </CollapsibleSection>

           {/* 4. RETIREMENT TARGET */}
           <CollapsibleSection title="Retirement Target" icon={Star} color="text-amber-400" defaultOpen={false}>
              <div className="grid grid-cols-3 gap-2 mb-4">
                 <SmartInput label="Age Now" value={state.currentAge} onChange={v=>updateState('currentAge',v)} />
                 <SmartInput label="Retire At" value={state.targetRetirementAge} onChange={v=>updateState('targetRetirementAge',v)} />
                 <SmartInput label="Live To" value={state.lifeExpectancy} onChange={v=>updateState('lifeExpectancy',v)} />
              </div>
              <SmartInput label="Target Retirement Spend (Annual)" value={state.retirementAnnualExpenses} onChange={v=>updateState('retirementAnnualExpenses',v)} icon={CreditCard} iconColor="text-rose-400" prefix="₹" tooltip="How much will you spend annually in retirement (in today's value)?" />
              
              <div className="mt-4 pt-4 border-t border-white/5">
                  {/* STRESS TEST TOGGLE */}
                  <div className="flex justify-between items-start">
                     <div className="flex items-start gap-3">
                        <div className="bg-rose-500/20 p-2 rounded-lg text-rose-400 mt-1">
                            <TrendingDown size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-rose-300">Simulate Market Crash</p>
                            <p className="text-[10px] text-rose-200/60 leading-tight mt-1 max-w-[200px]">
                                Stress test your plan against a severe market downturn right at retirement.
                            </p>
                        </div>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={state.stressTest || false} 
                            onChange={(e) => updateState('stressTest', e.target.checked)} 
                        />
                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
                     </label>
                  </div>
                  
                  {/* STRESS TEST BLUEPRINT */}
                  {state.stressTest && (
                     <div className="mt-4 bg-slate-950/50 border border-rose-500/20 p-3 rounded-lg space-y-2 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 mb-1">
                            <AlertCircle size={12} className="text-rose-500"/>
                            <p className="text-[10px] font-bold text-rose-400 uppercase">Scenario: Sequence Risk</p>
                        </div>
                        <div className="grid grid-cols-[auto_1fr] gap-2 items-center">
                            <div className="w-1 h-8 bg-gradient-to-b from-rose-500 to-transparent rounded-full"></div>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                                The engine is simulating a <strong className="text-white">-20% crash</strong> for the first 24 months of your retirement, followed by normal returns.
                            </p>
                        </div>
                     </div>
                  )}
              </div>
           </CollapsibleSection>

           {/* 5. ASSUMPTIONS */}
           <CollapsibleSection title="Assumptions & Returns" icon={Snowflake} color="text-white" defaultOpen={false}>
              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                    <SliderInput label="Equity Return" value={state.equityReturn} onChange={v=>updateState('equityReturn',v)} min={8} max={18} />
                    <SliderInput label="Stable Return" value={state.stableReturn} onChange={v=>updateState('stableReturn',v)} min={4} max={10} />
                 </div>
                 
                 {/* TAX HARVESTING TOGGLE */}
                 <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                            <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400 mt-1">
                                <Sprout size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-emerald-300">Smart Tax Harvesting</p>
                                <p className="text-[10px] text-emerald-200/60 leading-tight mt-1 max-w-[200px]">
                                    Simulate booking ₹1.25L profit every year to pay ₹0 tax and reinvesting the savings.
                                </p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={state.taxHarvesting || false}
                                onChange={(e) => updateState('taxHarvesting', e.target.checked)}
                            />
                            <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                    </div>
                    
                    {/* HARVESTING BLUEPRINT */}
                    {state.taxHarvesting && results?.harvestingBonusWealth > 0 && (
                        <div className="mt-4 pt-3 border-t border-emerald-500/20 animate-in fade-in slide-in-from-top-2">
                            <div className="flex justify-between items-end mb-2">
                                <p className="text-[10px] uppercase font-bold text-emerald-400/70 tracking-widest">Projected Impact</p>
                                <p className="text-lg font-bold text-emerald-300">+{formatCompact(results.harvestingBonusWealth)}</p>
                            </div>
                            
                            <div className="bg-slate-950/50 p-3 rounded-lg space-y-2 border border-emerald-500/10">
                                <p className="text-[10px] font-bold text-white uppercase mb-1">Execution Blueprint</p>
                                <div className="flex gap-2 items-center">
                                    <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">1</div>
                                    <p className="text-[11px] text-slate-300">Every <strong className="text-white">March</strong>, check your portfolio gains.</p>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">2</div>
                                    <p className="text-[11px] text-slate-300">Sell units with <strong className="text-white">₹1.25 Lakh</strong> profit (LTCG).</p>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">3</div>
                                    <p className="text-[11px] text-slate-300">Buy them back <strong className="text-white">immediately</strong> (next day).</p>
                                </div>
                                <p className="text-[10px] text-emerald-400/60 italic mt-1 pl-7">
                                    * This resets your "Buy Price" higher, saving tax on future withdrawals.
                                </p>
                            </div>
                        </div>
                    )}
                 </div>

                 {customAssets.length > 0 && (
                     <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 space-y-4">
                        <p className="text-[10px] font-bold uppercase text-amber-400">Alternative Asset Growth</p>
                        {customAssets.map(asset => (
                            <div key={asset.id} className="space-y-2">
                                <p className="text-xs text-slate-300 font-bold">{asset.name || "Unnamed Asset"}</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <SliderInput label="Return" value={asset.returnRate} onChange={v=>updateCustomAsset(asset.id, 'returnRate', v)} min={0} max={25} />
                                    <SmartInput label="Tax %" value={asset.taxRate} onChange={v=>updateCustomAsset(asset.id, 'taxRate', v)} suffix="%" className="h-8 text-xs"/>
                                </div>
                            </div>
                        ))}
                     </div>
                 )}

                 <div className="p-3 bg-white/5 rounded-xl">
                    <div className="grid grid-cols-2 gap-4">
                        <SmartInput label="Eq Tax (LTCG)" value={state.taxEquity} onChange={v=>updateState('taxEquity',v)} suffix="%" tooltip="Long Term Capital Gains Tax" />
                        <SmartInput label="Stable Assets Tax" value={state.taxStable} onChange={v=>updateState('taxStable',v)} suffix="%" tooltip="Usually taxed as per slab rates" />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-x-4">
                    <SliderInput label="Inflation" value={state.inflationRate} onChange={v=>updateState('inflationRate',v)} min={3} max={10} />
                    <SliderInput label="SWR" value={state.safeWithdrawalRate} onChange={v=>updateState('safeWithdrawalRate',v)} min={1} max={6} tooltip="Safe Withdrawal Rate: 3-4% is standard" />
                 </div>
              </div>
           </CollapsibleSection>
    </div>
  );
};
