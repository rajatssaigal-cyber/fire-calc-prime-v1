import React from 'react';
import { BookOpen, TrendingUp, Shield, Activity, Sprout, AlertTriangle, Calculator } from "lucide-react";

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
          Calculation Methodology
        </h2>
        <p className="text-slate-400 text-sm">
          Transparency is key. Here is exactly how the FIRE Calc Prime engine projects your wealth, handles inflation, and simulates risks.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* 1. CORE PROJECTION */}
        <Section icon={Calculator} title="The Core Engine">
          <p>
            The calculator uses a <strong>monthly cashflow simulation</strong>, not a simple yearly compound interest formula. This allows for precise handling of monthly SIPs, inflation adjustments, and mid-year life events.
          </p>
          <ul className="list-disc pl-4 space-y-1 marker:text-indigo-500">
            <li><strong>Inflation:</strong> Applied monthly to all expenses and goals.</li>
            <li><strong>Growth:</strong> Investments compound monthly based on your annual return inputs.</li>
            <li><strong>Real Value:</strong> The "Trajectory Table" shows values in today's purchasing power (adjusted for inflation) so you can relate to the numbers.</li>
          </ul>
        </Section>

        {/* 2. TAXATION */}
        <Section icon={Activity} title="Taxation Logic">
          <p>
            We don't just deduct tax at the end. We apply a <strong>"Tax Drag"</strong> to your annual returns to simulate the real-world impact of taxes on compounding.
          </p>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 my-2">
            Effective Return = Nominal Return × (1 - Tax_Rate)
          </div>
          <p>
            For Equity, we assume a slightly optimized tax drag (since you don't sell everything every year), whereas for Debt/FDs, the tax is applied more strictly.
          </p>
        </Section>

        {/* 3. SMART TAX HARVESTING (NEW) */}
        <Section icon={Sprout} title="Smart Tax Harvesting (Advanced)">
          <p>
            When enabled, the engine simulates the strategy of <strong>"Tax Gain Harvesting"</strong>.
          </p>
          <ul className="list-disc pl-4 space-y-1 marker:text-emerald-500">
            <li>Every March, the simulation checks your accumulated Equity gains.</li>
            <li>It "books" profit up to <strong>₹1.25 Lakh</strong> (the tax-free limit for LTCG in India).</li>
            <li>It immediately reinvests this amount. This resets your "Buy Price" higher.</li>
            <li><strong>The Impact:</strong> This effectively removes the tax drag on the first ₹1.25L of gains every year, slightly boosting your effective compounding rate.</li>
          </ul>
        </Section>

        {/* 4. STRESS TESTING (NEW) */}
        <Section icon={AlertTriangle} title="Sequence of Returns Risk">
          <p>
            The "Stress Test" toggle simulates a worst-case scenario: <strong>A Market Crash immediately upon retirement.</strong>
          </p>
          <ul className="list-disc pl-4 space-y-1 marker:text-rose-500">
            <li><strong>Scenario:</strong> -20% Equity return for the first 2 years of retirement.</li>
            <li><strong>Why it matters:</strong> Negative returns when you start withdrawing can deplete your portfolio 2x faster than negative returns during the accumulation phase.</li>
            <li>If your plan survives this stress test, it is considered "Bulletproof."</li>
          </ul>
        </Section>

        {/* 5. EMERGENCY FUND LOGIC */}
        <Section icon={Shield} title="Safety Net Protocol">
          <p>
            Unlike simple calculators, this tool prioritizes survival over growth.
          </p>
          <p>
            If your <strong>Emergency Fund</strong> falls below the required threshold (due to inflation or withdrawals), the engine <strong>stops your SIPs</strong> and diverts that cashflow to rebuild the safety net first. Only once the safety net is full does investment resume.
          </p>
        </Section>

        {/* 6. ASSUMPTIONS */}
        <Section icon={TrendingUp} title="Key Assumptions">
          <ul className="space-y-2">
            <li className="flex justify-between border-b border-slate-800 pb-1">
              <span>Safe Withdrawal Rate</span>
              <span className="font-bold text-white">3% - 4% (Standard)</span>
            </li>
            <li className="flex justify-between border-b border-slate-800 pb-1">
              <span>LTCG Exemption Limit</span>
              <span className="font-bold text-white">₹1.25 Lakh / year</span>
            </li>
            <li className="flex justify-between border-b border-slate-800 pb-1">
              <span>Life Expectancy</span>
              <span className="font-bold text-white">User Defined (Default 85)</span>
            </li>
          </ul>
        </Section>

      </div>
    </div>
  );
};
