// src/utils/fireMath.js

// Helper: Binary Search for Exact SIP (No changes here)
const solveForRequiredSIP = (gap, months, ratePerMonth, stepUpAnnual) => {
    let low = 0;
    let high = gap; 
    let solution = 0;
    for(let i=0; i<20; i++) {
        const mid = (low + high) / 2;
        let fv = 0;
        let currentSip = mid;
        for(let m=1; m<=months; m++) {
            fv = (fv + currentSip) * (1 + ratePerMonth);
            if (m % 12 === 0) {
                currentSip *= (1 + stepUpAnnual/100);
            }
        }
        if (fv > gap) {
            solution = mid;
            high = mid;
        } else {
            low = mid;
        }
    }
    return solution;
};

export const calculateProjection = (state) => {
    // 1. Destructure & Safety Checks
    const s = state;
    const startEquity = Object.values(s.equityAssets).reduce((a, b) => a + (b||0), 0);
    const startStable = Object.values(s.stableAssets).reduce((a, b) => a + (b||0), 0);
    
    // Check if Stress Test is active
    const doStressTest = s.stressTest === true;

    // 2. Rate Conversions
    // Base Equity Return (Normal)
    const rEquityBase = ((Math.min(s.equityReturn, 100)) * (1 - (s.taxEquity/100) * 0.75)) / 100; 
    const rStable = (Math.min(s.stableReturn, 100) * (1 - (s.taxStable/100))) / 100; 
    const effectiveInflation = Math.min(s.inflationRate, 50);
    
    const mrStable = Math.pow(1 + rStable, 1/12) - 1;
    
    // Custom Asset Growth
    const customAssetsGrowth = s.customAssets.map(asset => {
        const r = (asset.returnRate * (1 - (asset.taxRate/100) * 0.75)) / 100; 
        return { ...asset, mr: Math.pow(1 + r, 1/12) - 1, currentVal: asset.value || 0 };
    });

    const effectiveRetireAge = Math.min(Math.max(s.currentAge + 1, s.targetRetirementAge), 100);
    const monthsToProject = Math.max(0, (s.lifeExpectancy - s.currentAge) * 12);
    const monthsToRetire = Math.max(0, (effectiveRetireAge - s.currentAge) * 12);
    
    let curEquity = startEquity, curStable = startStable, curSipEquity = s.monthlySIP.equity, curSipStable = s.monthlySIP.stable;
    let curEmergency = s.emergencyFund;
    let emergencyCoverageFuture = 0;
    let bankruptcyAge = null;

    const data = [];
    let fireMonthIndex = -1, reached = false;
    const safeMonthsToProject = Math.min(monthsToProject, 1200);

    let yearlyWithdrawal = 0;
    const oneTimeEvents = s.lifeEvents.filter(e => e.type !== 'recurring');
    const recurringEvents = s.lifeEvents.filter(e => e.type === 'recurring');

    // Monthly Income Growth Factor (Annual)
    const monthlyIncomeGrowth = Math.pow(1 + s.salaryGrowth/100, 1/12) - 1;
    let currentMonthlyIncome = s.annualIncome / 12;

    // 3. The Projection Loop
    for (let m = 1; m <= safeMonthsToProject; m++) {
        const isRetired = m > monthsToRetire;
        const currentAge = s.currentAge + (m/12);
        const isYearStart = (m-1) % 12 === 0;

        // --- DYNAMIC RETURN RATE (THE CRASH LOGIC) ---
        let currentEquityReturn = rEquityBase;
        
        // If Stress Test is ON, we are Retired, and it's within the first 24 months of retirement
        if (doStressTest && isRetired && m <= monthsToRetire + 24) {
             // CRASH: -20% annual return (approx -1.8% monthly)
             currentEquityReturn = -0.20; 
        }
        
        const mrEquity = Math.pow(1 + currentEquityReturn, 1/12) - 1;

        // Salary Growth
        if (!isRetired) {
            currentMonthlyIncome *= (1 + monthlyIncomeGrowth);
        }

        // Apply SIP Step-Up
        if (!isRetired && isYearStart && m > 1) {
            const stepMult = 1 + s.sipStepUp/100;
            curSipEquity *= stepMult;
            curSipStable *= stepMult;
        }

        const annualExpMultiplier = Math.pow(1 + effectiveInflation/100, m/12);
        const annualExp = s.retirementAnnualExpenses * annualExpMultiplier;
        const monthlyExp = annualExp / 12;
        
        const targetCorpus = (annualExp / (Math.max(0.1, s.safeWithdrawalRate)/100));

        // Recurring Events
        let monthlyRecurringOutflow = 0;
        recurringEvents.forEach(e => {
            const endAge = e.endAge > e.age ? e.endAge : s.lifeExpectancy; 
            if (currentAge >= e.age && currentAge <= endAge) {
                monthlyRecurringOutflow += (e.cost * annualExpMultiplier) / 12;
            }
        });

        // 1. Calculate Max Investable Surplus (Reality Check)
        // (Income - Expenses - Recurring Events)
        const currentSurplus = isRetired ? 0 : Math.max(0, currentMonthlyIncome - monthlyExp - monthlyRecurringOutflow);

        // 2. Cap the SIPs
        // If the user's "Target SIP" is higher than their "Actual Surplus", clamp it down.
        let effectiveSipEquity = curSipEquity;
        let effectiveSipStable = curSipStable;
        
        if (!isRetired) {
            const totalTargetSIP = curSipEquity + curSipStable;
            
            if (totalTargetSIP > currentSurplus) {
                // WARNING: User wants to invest more than they have!
                // We must reduce the SIPs proportionally to fit the budget.
                if (totalTargetSIP > 0) {
                     const ratio = currentSurplus / totalTargetSIP;
                     effectiveSipEquity *= ratio;
                     effectiveSipStable *= ratio;
                } else {
                     effectiveSipEquity = 0;
                     effectiveSipStable = 0;
                }
            }
        }

        // Emergency Fund Top-Up
        const currentLivingExpense = isRetired ? monthlyExp : (s.currentAnnualExpenses/12 * Math.pow(1 + effectiveInflation/100, m/12));
        const requiredEmergencyFund = (parseFloat(s.emergencyFund / (s.currentAnnualExpenses/12 || 1)) || 0) * currentLivingExpense;
        
        curEmergency *= (1 + mrStable);
        
        let monthlyTopUp = 0;
        if (curEmergency < requiredEmergencyFund) {
            const shortfall = requiredEmergencyFund - curEmergency;
            if (!isRetired) {
                const availableSIP = curSipEquity + curSipStable;
                monthlyTopUp = Math.min(shortfall, availableSIP);
                curEmergency += monthlyTopUp;
            }
        }

        if (!isRetired) {
            // ACCUMULATION
            let effectiveSipEquity = curSipEquity;
            let effectiveSipStable = curSipStable;

            if (monthlyTopUp > 0) {
                const totalSip = effectiveSipEquity + curSipStable;
                if (totalSip > 0) {
                    const eqRatio = effectiveSipEquity / totalSip;
                    effectiveSipEquity -= monthlyTopUp * eqRatio;
                    effectiveSipStable -= monthlyTopUp * (1 - eqRatio);
                }
            }

            curEquity += effectiveSipEquity;
            curStable += effectiveSipStable;
            
            const liquidTotal = curEquity + curStable;
            if (monthlyRecurringOutflow > 0 && liquidTotal > 0) {
                 const eqRatio = curEquity / liquidTotal;
                 curEquity -= monthlyRecurringOutflow * eqRatio;
                 curStable -= monthlyRecurringOutflow * (1 - eqRatio);
            }
        } else {
            // DECUMULATION
            const totalMonthlyOutflow = monthlyExp + monthlyRecurringOutflow;
            const liquidTotal = curEquity + curStable;
            
            if (liquidTotal > 0) {
                const eqRatio = curEquity / liquidTotal;
                const withdrawal = Math.min(totalMonthlyOutflow, liquidTotal + 1000); 
                curEquity -= withdrawal * eqRatio;
                curStable -= withdrawal * (1 - eqRatio);
            } else {
                curEquity -= totalMonthlyOutflow; 
                if (bankruptcyAge === null) bankruptcyAge = currentAge; 
            }
            yearlyWithdrawal += totalMonthlyOutflow;
        }

        // Growth (Uses the dynamic mrEquity calculated above)
        if (curEquity > 0) curEquity *= (1 + mrEquity);
        if (curStable > 0) curStable *= (1 + mrStable);

        let totalCustomVal = 0;
        customAssetsGrowth.forEach(asset => {
            asset.currentVal *= (1 + asset.mr);
            totalCustomVal += asset.currentVal;
        });

        // One-Time Events
        const eventHit = oneTimeEvents.find(e => Math.abs(e.age - currentAge) < 0.05 && !e.processed);
        let eventCost = 0;
        if (eventHit) {
             eventCost = eventHit.cost * annualExpMultiplier;
             const liquidTotal = curEquity + curStable;
             if (liquidTotal > 0) {
                 const eqRatio = curEquity / liquidTotal;
                 curEquity -= eventCost * eqRatio;
                 curStable -= eventCost * (1 - eqRatio);
             } else {
                 curEquity -= eventCost; 
             }
        }

        const total = curEquity + curStable + totalCustomVal;
        const deflator = Math.pow(1 + effectiveInflation/100, m/12);
        
        if (!reached && total >= targetCorpus && !isRetired) {
            reached = true;
            fireMonthIndex = m;
        }

        if (m === Math.round(monthsToRetire)) {
             const retirementMonthlyExp = Math.max(annualExp / 12, 1);
             emergencyCoverageFuture = (curEmergency / retirementMonthlyExp).toFixed(1);
        }
        
        if (m % 12 === 0 || m === 1) {
            data.push({
                age: Math.floor(currentAge),
                balance: Math.round(total), 
                realBalance: Math.round(total / deflator),
                equity: Math.round(curEquity),
                stable: Math.round(curStable),
                custom: Math.round(totalCustomVal),
                emergency: Math.round(curEmergency), 
                realEmergency: Math.round(curEmergency / deflator),
                target: isRetired ? null : Math.round(targetCorpus),
                realTarget: isRetired ? null : Math.round(targetCorpus / deflator),
                event: Math.round(eventCost + (monthlyRecurringOutflow * 12)), 
                withdrawal: Math.round(yearlyWithdrawal),
                realWithdrawal: Math.round(yearlyWithdrawal / deflator)
            });
            yearlyWithdrawal = 0; 
        }
    }

    // 4. Summarize Results
    const corpusAtRetirement = data.find(d => d.age === effectiveRetireAge)?.balance || 0;
    const targetAtRetirement = data.find(d => d.age === effectiveRetireAge)?.target || 0;
    const gap = targetAtRetirement - corpusAtRetirement;
    const realGap = (data.find(d => d.age === effectiveRetireAge)?.realTarget || 0) - (data.find(d => d.age === effectiveRetireAge)?.realBalance || 0);

    let solutionSaveMore = 0, solutionWorkLonger = 0, solutionSpendLess = 0;

    if (gap > 0) {
        const totalSip = s.monthlySIP.equity + s.monthlySIP.stable;
        const eqWeight = totalSip > 0 ? s.monthlySIP.equity / totalSip : 0.6; 
        const blendR = (rEquityBase * eqWeight) + (rStable * (1-eqWeight));
        const ratePerMonth = blendR / 12;
        
        if (monthsToRetire > 0) {
             solutionSaveMore = solveForRequiredSIP(gap, monthsToRetire, ratePerMonth, s.sipStepUp);
        }
        
        const solveYear = data.find(d => d.balance >= d.target && d.age > effectiveRetireAge);
        solutionWorkLonger = solveYear ? solveYear.age - effectiveRetireAge : "> 30";
        const allowedAnnual = corpusAtRetirement * (s.safeWithdrawalRate/100);
        solutionSpendLess = Math.max(0, s.retirementAnnualExpenses - allowedAnnual);
    }

    return {
        projection: data, gap, realGap, fireAge: reached ? (s.currentAge + fireMonthIndex/12).toFixed(1) : null,
        solutions: { saveMore: Math.round(solutionSaveMore), workLonger: solutionWorkLonger, spendLess: Math.round(solutionSpendLess) },
        salaryVsStepUpWarning: s.sipStepUp > s.salaryGrowth,
        emergencyCoverageFuture,
        targetAtRetirement, 
        corpusAtRetirement,
        bankruptcyAge: bankruptcyAge ? bankruptcyAge.toFixed(1) : null
    };
};
