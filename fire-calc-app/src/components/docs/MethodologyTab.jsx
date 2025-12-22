import React from 'react';
import { BookOpen, PieChart, Info } from "lucide-react";
import { Card } from '../ui/Card';

const MathBlock = ({ title, formula, desc }) => (
    <div className="p-4 bg-black/40 border border-white/5 rounded-lg font-mono text-xs">
        <p className="text-slate-500 mb-2 font-bold uppercase tracking-wider">{title}</p>
        <div className="text-emerald-300 mb-2">{formula}</div>
        <p className="text-slate-400 italic">{desc}</p>
    </div>
);

const GlossaryItem = ({ term, def, examples }) => (
    <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-emerald-500/30 transition-all">
        <h4 className="text-sm font-bold text-emerald-400 mb-1 flex items-center gap-2">
            <Info size={14} className="text-slate-500"/> {term}
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed mb-2">{def}</p>
        {examples && (
            <p className="text-[10px] text-slate-500 italic bg-black/20 p-2 rounded">
                <strong className="text-slate-400">Includes:</strong> {examples}
            </p>
        )}
    </div>
);

export const MethodologyTab = () => (
  <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300 relative z-10 pb-40">
    <div className="text-center space-y-2 mb-12">
        <h2 className="text-3xl font-bold text-white">The Engineering Blueprint</h2>
        <p className="text-slate-400">Master the vocabulary of wealth.</p>
    </div>

    <section className="space-y-4">
        <div className="flex items-center gap-3 text-white">
            <BookOpen size={24} className="text-emerald-400"/>
            <h3 className="text-xl font-bold">Financial Glossary</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GlossaryItem 
                term="Stable Assets (Debt)" 
                def="Investments that prioritize capital protection over high growth. They reduce portfolio volatility."
                examples="EPF (Provident Fund), PPF, NPS (Govt Bond tiers), Sovereign Gold Bonds (SGB), Debt Mutual Funds, Fixed Deposits, Cash."
            />
            <GlossaryItem 
                term="Equity Assets" 
                def="Ownership in businesses (Stocks). High growth potential but higher risk/volatility."
                examples="Nifty 50 Index Funds, Flexicap Funds, Direct Stocks, ELSS Mutual Funds."
            />
            <GlossaryItem 
                term="SWR (Safe Withdrawal Rate)" 
                def="The % of your total corpus you can withdraw annually in retirement without running out of money. While the US standard is 4%, Indian planners often suggest 3% due to higher inflation."
                examples="If you have ₹1 Cr, a 3% SWR means you can spend ₹3 Lakhs/year (adjusted for inflation) comfortably."
            />
            <GlossaryItem 
                term="Real Value (Purchasing Power)" 
                def="The value of future money stripped of inflation. It tells you what that money buys in 'Today's Terms'."
                examples="₹5 Crores in 20 years might only buy what ₹1.5 Crores buys today."
            />
            <GlossaryItem 
                term="Corpus" 
                def="The total pot of money you have accumulated across all investments."
            />
            <GlossaryItem 
                term="SIP Step-Up" 
                def="The percentage by which you increase your monthly investment every year (usually in line with salary hikes)."
            />
            <GlossaryItem 
                term="Tax Drag" 
                def="The hidden reduction in returns due to taxes. We simulate this by lowering your effective return rate."
                examples="12.5% LTCG on Equity, Slab Rates on Debt."
            />
            <GlossaryItem 
                term="Gap (Shortfall/Surplus)" 
                def="The difference between the money you WILL have vs. the money you NEED at retirement."
            />
            <GlossaryItem 
                term="Liquidity" 
                def="How easily an asset can be converted to cash. Real Estate is illiquid."
            />
        </div>
    </section>

    <section className="space-y-4 pt-6 border-t border-white/5">
        <div className="flex items-center gap-3 text-emerald-400"><PieChart size={24}/><h3 className="text-xl font-bold">The Math Engine</h3></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6 bg-slate-900/50 border-slate-800 space-y-4">
                <MathBlock 
                    title="1. Monthly Compound Growth"
                    formula="Rate_Monthly = (1 + Rate_Annual)^(1/12) - 1"
                    desc="We convert annual returns to monthly to capture the exact impact of monthly SIPs."
                />
            </Card>
            <Card className="p-6 bg-slate-900/50 border-slate-800 space-y-4">
                <MathBlock 
                    title="2. Tax Drag Coefficient"
                    formula="Eff_Return = Gross_Return * (1 - (Tax% * 0.75))"
                    desc="We assume 75% of your final corpus is capital gains, applying tax only to that portion for a realistic post-tax projection."
                />
            </Card>
             <Card className="p-6 bg-slate-900/50 border-slate-800 space-y-4">
                <MathBlock 
                    title="3. Liquidity Guard"
                    formula="Withdrawals = min(Expense, Liquid_Corpus)"
                    desc="We ensure you only spend from Equity/Debt. Real Estate (Alternative Assets) is not automatically sold for groceries, preventing 'House Rich, Cash Poor' scenarios."
                />
            </Card>
            <Card className="p-6 bg-slate-900/50 border-slate-800 space-y-4">
                <MathBlock 
                    title="4. SIP Solver (Binary Search)"
                    formula="while(low <= high) { mid = (low+high)/2 ... }"
                    desc="To calculate 'Save More', we use a binary search algorithm (not simple division) to find the exact SIP needed to close the gap within ₹10 precision."
                />
            </Card>
             <Card className="p-6 bg-slate-900/50 border-slate-800 space-y-4">
                <MathBlock 
                    title="5. Inflation Deflator"
                    formula="Real_Val = Nominal / (1 + Inflation)^Years"
                    desc="All future numbers are divided by this factor to show you what that money is worth in today's grocery prices."
                />
            </Card>
             <Card className="p-6 bg-slate-900/50 border-slate-800 space-y-4">
                <MathBlock 
                    title="6. Dynamic Safety Net"
                    formula="Required = Months * Current_Monthly_Expense"
                    desc="As inflation raises your lifestyle cost, we automatically 'top-up' your emergency fund from your SIPs to maintain your safety margin."
                />
            </Card>
        </div>
    </section>
  </div>
);