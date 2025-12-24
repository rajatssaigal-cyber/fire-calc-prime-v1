import React from 'react';
import { BookOpen, TrendingUp, Shield, Activity, Sprout, AlertTriangle, Calculator, Divide, X } from "lucide-react";

// Helper for styling math formulas
const Formula = ({ title, equation, description }) => (
  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 my-3">
    <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">{title}</p>
    <p className="font-mono text-sm text-indigo-300 mb-2 tracking-wide">{equation}</p>
    <p className="text-xs text-slate-400 italic border-t border-slate-800 pt-2 mt-2">
      {description}
    </p>
  </div>
);

const Section = ({ icon: Icon, title, children }) => (
  <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800">
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
        <Icon size={20} />
      </div>
      <h3 className="font-bold text-slate-200">{title}</h3>
    </div>
    <div className="space-y-3 text-sm text-slate-400 leading-relaxed">
      {children}
    </div>
  </div>
);

export const MethodologyTab = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-slate-900/50 p-6 rounded-2xl border border-indigo-500/20">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <BookOpen className="text-indigo-400" />
          The Mathematics of FIRE
        </h2>
        <p className="text-slate-400 text-sm">
          No black boxes. Here are the exact formulas and logic used to project your financial freedom.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* 1. COMPOUNDING LOGIC */}
        <Section icon={Calculator} title="Core Compounding">
          <p>
            We use <strong>Monthly Compounding</strong> rather than Annual. This is more accurate for SIPs which hit your account every month.
          </p>
          <Formula 
            title="Future Value (Lumpsum)"
            equation="A = P × (1 + r/12)^(12t)"
            description="Where P is Principal, r is annual return rate, and t is years."
          />
          <Formula 
            title="Future Value (SIP)"
            equation="FV = P × [((1+i)^n - 1) / i] × (1+i)"
            description="Standard annuity due formula, where 'i' is the monthly interest rate."
          />
        </Section>

        {/* 2. INFLATION & REAL VALUE */}
        <Section icon={TrendingUp} title="Inflation & Real Value">
          <p>
            The most important number in FIRE is the <strong>Real Rate of Return</strong>. This is your growth <em>after</em> inflation eats away purchasing power.
          </p>
          <Formula 
            title="Real Rate of Return"
            equation="R_real = [(1 + R_nominal) / (1 + Inflation)] - 1"
            description="If you earn 12% and inflation is 7%, your Real Return is 4.67%, not 5%."
          />
          <p>
            <strong>Note:</strong> In the "Wealth Trajectory" table, the column <em>"Real Value"</em> divides your projected nominal corpus by the inflation index for that year.
          </p>
        </Section>

        {/* 3. TAXATION */}
        <Section icon={Activity} title="Taxation (The 'Tax Drag')">
          <p>
            We don't deduct tax at the end. We apply a <strong>"Tax Drag"</strong> to your monthly returns. This simulates the loss of compounding efficiency.
          </p>
          <Formula 
             title="Effective Return Rate"
             equation="r_eff = r_nominal × (1 - Tax_Rate)"
             description="For Equity, we apply a 75% factor to Tax_Rate to account for long-term holding benefits."
          />
        </Section>

        {/* 4. SMART TAX HARVESTING */}
        <Section icon={Sprout} title="Smart Tax Harvesting (Advanced)">
          <p>
            When enabled, the engine simulates <strong>Tax Gain Harvesting</strong> every March.
          </p>
          <div className="bg-emerald-900/20 border border-emerald-500/30 p-3 rounded-lg text-xs space-y-2">
            <div className="flex justify-between">
                <span className="text-slate-400">Annual Gain:</span>
                <span className="text-white font-mono">₹ 2,00,000</span>
            </div>
            <div className="flex justify-between">
                <span className="text-slate-400">Exempt Limit (LTCG):</span>
                <span className="text-emerald-400 font-mono">- ₹ 1,25,000</span>
            </div>
            <div className="flex justify-between border-t border-emerald-500/20 pt-1">
                <span className="text-slate-400">Taxable Amount:</span>
                <span className="text-white font-mono">₹ 75,000</span>
            </div>
          </div>
          <p className="mt-2">
             By "booking" the ₹1.25L gain and reinvesting it, you save the 12.5% tax on that chunk forever. The calculator adds this saved tax back into your corpus.
          </p>
        </Section>

        {/* 5. STRESS TESTING */}
        <Section icon={AlertTriangle} title="Sequence of Returns Risk">
          <p>
            The "Stress Test" simulates a <strong>Sequence of Returns Risk</strong> scenario.
          </p>
          <Formula 
            title="Crash Simulation"
            equation="Return (Year 60-62) = -20%"
            description="We force a negative return immediately upon retirement to see if your corpus survives the shock."
          />
        </Section>

        {/* 6. WITHDRAWAL STRATEGY */}
        <Section icon={Divide} title="Withdrawal Mathematics">
          <p>
            How do we calculate your Target Corpus? We use the <strong>Safe Withdrawal Rate (SWR)</strong> method.
          </p>
          <Formula 
            title="FIRE Number (Target)"
            equation="Target = Annual_Expense / (SWR / 100)"
            description="If SWR is 4%, Target = Expense / 0.04 (which is 25x Expenses)."
          />
        </Section>

      </div>
    </div>
  );
};
