// src/utils/fireMath.js

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
    const s = state;
    const liabilities = s.liabilities || [];
    const startEquity = Object.values(s.equityAssets).reduce((a, b) => a + (b||0), 0);
    const startStable = Object.values(s.stableAssets).reduce((a, b) => a + (b||0), 0);
    
    // Stress Test Logic
    const doStressTest = s.stressTest === true;

    // Rates
    const rEquityBase = ((Math.min(s.equityReturn, 100)) * (1 - (s.taxEquity/100) * 0.75)) / 100; 
    const rStable = (Math.min(s.stableReturn, 100) * (1 - (s.taxStable/100))) / 100; 
    const effectiveInflation = Math.min(s.inflationRate, 50);
    
    const mrStable = Math.pow(1 + rStable, 1/12) - 1;
    
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

    const monthlyIncomeGrowth = Math.pow(1 + s.salaryGrowth/100, 1/12) - 1;
    
    // Variables for UI Feedback
    let sipWasCapped = false;
    let initialSurplus = 0;

    // --- PROJECTION LOOP ---
    for (let m = 1; m <= safeMonthsToProject; m++) {
        const isRetired = m > monthsToRetire;
        const currentAge = s.currentAge + (m/12);
        const isYearStart = (m-1) % 12 === 0;

        // 1. Dynamic Return (Crash Logic)
        let currentEquityReturn = rEquityBase;
        if (doStressTest && isRetired && m <= monthsToRetire + 24) {
             currentEquityReturn = -0.20; // Crash
        }
        const mrEquity = Math.pow(1 + currentEquityReturn, 1/12) - 1;

        // 2. Income & Expense (Delay Inflation by 1 month so M1 matches inputs)
        const monthIndex = m - 1; 
        
        // Income
        let currentMonthIncomeVal = 0;
        if (!isRetired) {
            currentMonthIncomeVal = (s.annualIncome / 12) * Math.pow(1 + monthlyIncomeGrowth, monthIndex);
        }

        // Inflation Multiplier (0 for Month 1)
        const annualExpMultiplier = Math.pow(1 + effectiveInflation/100, monthIndex/12);

        // Expenses
        const annualExp = s.retirementAnnualExpenses * annualExpMultiplier; // Nominal annual spend
        const monthlyExp = annualExp / 12;
        
        // Current Expense (for Surplus Check)
        const currentMonthExpenseVal = (s.currentAnnualExpenses / 12) * annualExpMultiplier;

        // Target Corpus (Based on Retirement Spend)
        const targetCorpus = (annualExp / (Math.max(0.1, s.safeWithdrawalRate)/100));

        // Recurring Outflows
        let monthlyRecurringOutflow = 0;
        recurringEvents.forEach(e => {
            const endAge = e.endAge > e.age ? e.endAge : s.lifeExpectancy; 
            if (currentAge >= e.age && currentAge <= endAge) {
                monthlyRecurringOutflow += (e.cost * annualExpMultiplier) / 12;
            }
        });

        // Liability Outflows (Home Loans etc)
        let monthlyLiabilityOutflow = 0;
        if (!isRetired) {
            liabilities.forEach(loan => {
                if (currentAge < loan.endAge) {
                    monthlyLiabilityOutflow += loan.monthlyEMI;
                }
            });
        }

        // 3. Surplus Calculation & SIP Capping
        const currentSurplus = isRetired ? 0 : Math.max(0, currentMonthIncomeVal - currentMonthExpenseVal - monthlyRecurringOutflow - monthlyLiabilityOutflow);

        // Capture Initial Surplus (Month 1) for UI
        if (m === 1) initialSurplus = currentSurplus;

        // SIP Step-Up
        if (!isRetired && isYearStart && m > 1) {
            const stepMult = 1 + s.sipStepUp/100;
            curSipEquity *= stepMult;
            curSipStable *= stepMult;
        }

        // Apply Cap
        let effectiveSipEquity = curSipEquity;
        let effectiveSipStable = curSipStable;
        
        if (!isRetired) {
            const totalTargetSIP = curSipEquity + curSipStable;
            
            // Buffer of +50 to prevent rounding errors
            if (totalTargetSIP > currentSurplus + 50) {
                sipWasCapped = true;
                
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

        // 4. Emergency Fund Top-Up
        const currentLivingExpense = isRetired ? monthlyExp : (s.currentAnnualExpenses/12 * annualExpMultiplier);
        const requiredEmergencyFund = (parseFloat(s.emergencyFund / (s.currentAnnualExpenses/12 || 1)) || 0) * currentLivingExpense;
        
        curEmergency *= (1 + mrStable);
        
        let monthlyTopUp = 0;
        if (curEmergency < requiredEmergencyFund) {
            const shortfall = requiredEmergencyFund - curEmergency;
            if (!isRetired) {
                const totalAvailable = effectiveSipEquity + effectiveSipStable;
                monthlyTopUp = Math.min(shortfall, totalAvailable);
                curEmergency += monthlyTopUp;
            }
        }

        // 5. Accumulation / Decumulation
        if (!isRetired) {
            // ACCUMULATION
            // Reduce SIPs if money was diverted to Emergency Fund
            let sipToAddEquity = effectiveSipEquity; 
            let sipToAddStable = effectiveSipStable;

            if (monthlyTopUp > 0) {
                const totalAvailable = effectiveSipEquity + effectiveSipStable;
                if (totalAvailable > 0) {
                    const eqRatio = effectiveSipEquity / totalAvailable;
                    sipToAddEquity -= monthlyTopUp * eqRatio;
                    sipToAddStable -= monthlyTopUp * (1 - eqRatio);
                }
            }

            curEquity += sipToAddEquity;
            curStable += sipToAddStable;
            
            // Handle Recurring Outflows from Assets if Income wasn't enough (rare case)
            const liquidTotal = curEquity + curStable;
            if (monthlyRecurringOutflow > 0 && liquidTotal > 0 && isRetired) {
                 // Logic handled in surplus, this is fallback
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

        // 6. Growth
        if (curEquity > 0) curEquity *= (1 + mrEquity);
        if (curStable > 0) curStable *= (1 + mrStable);

        let totalCustomVal = 0;
        customAssetsGrowth.forEach(asset => {
            asset.currentVal *= (1 + asset.mr);
            totalCustomVal += asset.currentVal;
        });

        // 7. One-Time Events
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

    // Summarize
    const lastData = data[data.length - 1];
    const corpusAtRetirement = data.find(d => d.age === effectiveRetireAge)?.balance || (lastData ? lastData.balance : 0);
    
    let targetAtRetirement = data.find(d => d.age === effectiveRetireAge)?.target;
    if (!targetAtRetirement && lastData) {
         const inflationFactor = Math.pow(1 + effectiveInflation/100, effectiveRetireAge/12); 
         targetAtRetirement = (s.retirementAnnualExpenses * inflationFactor) / (s.safeWithdrawalRate/100);
    }
    
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
        bankruptcyAge: bankruptcyAge ? bankruptcyAge.toFixed(1) : null,
        sipWasCapped: sipWasCapped, // Return flag
        initialSurplus: initialSurplus // Return exact surplus
    };
};
