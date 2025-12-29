import React from 'react';
import { BookOpen, TrendingUp, AlertTriangle, ShieldCheck, Calculator } from 'lucide-react';

export const MethodologyTab = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 pb-40 space-y-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="text-center space-y-4 mb-16">
        <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
          The Logic Engine
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
          Most calculators are simple spreadsheets. This is a robust financial simulation engine. 
          Here is exactly how the numbers are crunched.
        </p>
      </div>

      <Section 
        icon={TrendingUp} 
        title="1. Inflation & Real Value" 
        color="text-emerald-400"
        content={
          <>
            <p>
              We don't just project nominal numbers (which look big but mean little). We calculate the <strong>Real Value</strong> of your corpus by adjusting for inflation every single month.
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-400">
              <li><strong>Formula:</strong> <code>RealValue = NominalValue / (1 + Inflation)^Years</code></li>
              <li><strong>Why it matters:</strong> ₹10 Crores in 30 years might only buy what ₹2 Crores buys today. We show you the "today's purchasing power" of your future wealth.</li>
            </ul>
          </>
        }
      />

      <Section 
        icon={AlertTriangle} 
        title="2. Sequence of Returns Risk (Stress Test)" 
        color="text-rose-400"
        content={
          <>
            <p>
              Average returns are misleading. If the market crashes 20% the year you retire, your portfolio might never recover because you are withdrawing from a shrinking pot.
            </p>
            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-lg mt-4">
              <h4 className="font-bold text-rose-300 text-sm uppercase mb-2">The Stress Test Logic</h4>
              <p className="text-xs font-mono text-slate-300">
                IF (StressTest == ON) AND (Age == RetirementAge):<br/>
                &nbsp;&nbsp;EquityReturn = -20% (For first 24 months)<br/>
                ELSE:<br/>
                &nbsp;&nbsp;EquityReturn = UserAssumedReturn
              </p>
            </div>
          </>
        }
      />

      <Section 
        icon={ShieldCheck} 
        title="3. Tax Drag & Harvesting" 
        color="text-amber-400"
        content={
          <>
            <p>
              Taxes act like friction on your compounding. We model this explicitly.
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-400">
              <li><strong>Tax Drag:</strong> We reduce your monthly return rate by your tax bracket assumptions. This prevents over-optimism.</li>
              <li><strong>Tax Harvesting (₹1.25L Rule):</strong> Every March, the engine simulates "booking" ₹1.25 Lakh of profit (which is tax-free in India) and reinvesting it. This raises your "Buy Price" and lowers your future tax bill.</li>
            </ul>
          </>
        }
      />

      <Section 
        icon={Calculator} 
        title="4. Monte Carlo Simulation" 
        color="text-indigo-400"
        content={
          <>
            <p>
              The future is not a straight line. The "Monte Carlo" module runs your life scenario <strong>10,000 times</strong> with randomized market volatility to calculate your probability of success.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                    <h4 className="font-bold text-indigo-300 mb-2 text-sm">The Math (Box-Muller Transform)</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        We don't use a fixed return (e.g., 12%). For every simulation year, we generate a random return based on a Normal Distribution (Bell Curve).
                        <br/><br/>
                        <code>Return = Mean + (Volatility * RandomFactor)</code>
                        <br/><br/>
                        <strong>Volatility Assumptions:</strong>
                        <br/>• Equity: ±15% Std Dev
                        <br/>• Debt: ±4% Std Dev
                    </p>
                </div>
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                    <h4 className="font-bold text-emerald-300 mb-2 text-sm">How to Read Results</h4>
                    <ul className="space-y-2 text-xs text-slate-400">
                        <li><strong>Success Rate:</strong> The % of simulations where you NEVER ran out of money.</li>
                        <li><strong>&gt; 90%:</strong> Extremely Safe. Plan is bulletproof.</li>
                        <li><strong>75% - 90%:</strong> Safe, but flexible spending might be needed.</li>
                        <li><strong>&lt; 50%:</strong> High Risk. You are relying on luck.</li>
                    </ul>
                </div>
            </div>
          </>
        }
      />

    </div>
  );
};

const Section = ({ icon: Icon, title, content, color }) => (
  <div className="flex gap-6 items-start">
    <div className={`p-3 rounded-xl bg-slate-900 border border-slate-800 shrink-0 ${color}`}>
      <Icon size={32} />
    </div>
    <div className="space-y-3">
      <h3 className={`text-xl font-bold ${color}`}>{title}</h3>
      <div className="text-slate-400 leading-relaxed text-sm md:text-base">
        {content}
      </div>
    </div>
  </div>
);
