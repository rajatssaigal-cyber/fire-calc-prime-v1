import React, { useState } from 'react';
import { HelpCircle, X, AlertTriangle, CheckCircle2, XCircle, BookOpen, ShieldAlert } from "lucide-react";

export const UserGuideModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 border border-emerald-500/30 rounded-full shadow-2xl hover:bg-slate-800 hover:scale-105 transition-all group"
      >
        <div className="bg-emerald-500/20 p-1 rounded-full">
            <HelpCircle size={18} className="text-emerald-400 group-hover:rotate-12 transition-transform"/>
        </div>
        <span className="text-sm font-bold text-slate-200 pr-1">Guide & Disclaimer</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-950 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 shadow-2xl relative flex flex-col">
        
        {/* Header */}
        <div className="sticky top-0 bg-slate-950/95 backdrop-blur border-b border-slate-800 p-5 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <BookOpen className="text-emerald-500" size={24} />
            <h2 className="text-xl font-bold text-white">How to use FIRE Calc Pro</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 bg-slate-900 rounded-full text-slate-400 hover:text-white hover:bg-rose-500/20 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8 text-slate-300 leading-relaxed">

          {/* CRITICAL DISCLAIMER */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex gap-4">
             <ShieldAlert className="text-amber-500 shrink-0" size={24} />
             <div className="space-y-2">
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wide">Important Disclaimer</h3>
                <p className="text-xs text-amber-200/80">
                  <strong>I am not a SEBI Registered Investment Advisor (RIA).</strong> 
                  <br className="mb-2"/>
                  This tool is a mathematical simulation engine designed for educational and informational purposes only. It projects future wealth based on the rigid assumptions you provide (e.g., constant returns, constant inflation).
                </p>
                <p className="text-xs text-amber-200/80">
                  Real markets are volatile. Past performance (or spreadsheet logic) is not indicative of future results. Please consult a qualified financial planner before making actual investment decisions based on these numbers.
                </p>
             </div>
          </div>

          {/* What it DOES vs DOES NOT */}
          <div className="grid md:grid-cols-2 gap-6">
             <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-400 uppercase">
                   <CheckCircle2 size={16}/> What this tool DOES
                </h3>
                <ul className="space-y-2 text-xs text-slate-400 list-disc pl-5">
                   <li>Calculates compound interest with <strong>monthly granularity</strong>.</li>
                   <li>Adjusts for <strong>Indian Inflation</strong> to show "Real Value".</li>
                   <li>Simulates <strong>Tax Drag</strong> (impact of LTCG tax on growth).</li>
                   <li>Models <strong>Sequence of Returns Risk</strong> (market crash at retirement).</li>
                   <li>Helps visualize the impact of <strong>Tax Harvesting</strong> (₹1.25L rule).</li>
                </ul>
             </div>
             <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-bold text-rose-400 uppercase">
                   <XCircle size={16}/> What this tool does NOT
                </h3>
                <ul className="space-y-2 text-xs text-slate-400 list-disc pl-5">
                   <li>It does NOT predict stock market movements.</li>
                   <li>It does NOT recommend specific Mutual Funds or Stocks.</li>
                   <li>It does NOT account for black swan events (pandemics, wars).</li>
                   <li>It does NOT link to your bank account or track real-time spending.</li>
                </ul>
             </div>
          </div>

          <hr className="border-slate-800" />

          {/* Usage Steps */}
          <div className="space-y-4">
             <h3 className="text-base font-bold text-white">Step-by-Step Guide</h3>
             
             <div className="space-y-4">
                <Step number="1" title="Feed the Cashflow Engine">
                   Enter your <strong>Post-Tax Monthly Income</strong> and your <strong>Base Expenses</strong>. Do not include EMI in expenses; add them separately in the "Loans" section for accuracy.
                </Step>
                
                <Step number="2" title="Set Your Assets">
                   Input your current savings. Split them correctly between <strong>Equity</strong> (Stocks/MFs) and <strong>Stable</strong> (EPF/PPF/FD/Gold). This split determines your blended return rate.
                </Step>

                <Step number="3" title="Define the Goal">
                   Adjust the <strong>Retirement Age</strong> slider. Watch how the graph shifts. The "Gap" card will turn <span className="text-emerald-400 font-bold">Green</span> when your corpus survives until your Life Expectancy age.
                </Step>

                <Step number="4" title="Advanced Simulations">
                   <ul>
                       <li><strong>Stress Test:</strong> Toggle this to see if your plan survives a 20% market crash the year you retire.</li>
                       <li><strong>Tax Harvesting:</strong> Toggle this to see how much extra wealth you generate by resetting your tax liability every March.</li>
                   </ul>
                </Step>
             </div>
          </div>

        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-950 border-t border-slate-800 p-4 text-center">
            <button 
                onClick={() => setIsOpen(false)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all"
            >
                I Understand & Agree
            </button>
        </div>

      </div>
    </div>
  );
};

const Step = ({ number, title, children }) => (
    <div className="flex gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-emerald-400">
            {number}
        </div>
        <div>
            <h4 className="text-sm font-bold text-slate-200 mb-1">{title}</h4>
            <div className="text-xs text-slate-400 leading-relaxed space-y-1">
                {children}
            </div>
        </div>
    </div>
);
