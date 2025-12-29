// src/utils/monteCarlo.js
import { calculateProjection } from './fireMath';

// Standard Deviation assumptions for different asset classes
const VOLATILITY = {
    equity: 0.15, // 15% std dev for equity
    stable: 0.04, // 4% std dev for debt/stable
    custom: 0.10  // 10% for alternatives as a base
};

// Helper to generate a normally distributed random number (Box-Muller transform)
const plotRandomNormal = (mean, stdDev) => {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    const standardNormal = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + (stdDev * standardNormal);
};

export const runMonteCarloSimulation = (baseState, iterations = 10000) => {
    let successCount = 0;
    const finalCorpusValues = new Float64Array(iterations);
    const retirementCorpusValues = [];

    for (let i = 0; i < iterations; i++) {
        // Create a randomized state for this iteration
        const randomizedState = {
            ...baseState,
            // We apply randomization to the *rates*, not the assets themselves
            equityReturn: plotRandomNormal(baseState.equityReturn, VOLATILITY.equity * 100),
            stableReturn: plotRandomNormal(baseState.stableReturn, VOLATILITY.stable * 100),
            customAssets: baseState.customAssets.map(asset => ({
                ...asset,
                returnRate: plotRandomNormal(asset.returnRate, VOLATILITY.custom * 100)
            }))
        };

        // Run the projection engine with randomized returns
        const result = calculateProjection(randomizedState);

        // A run is successful if bankruptcyAge is null (money lasted forever)
        if (result.bankruptcyAge === null) {
            successCount++;
        }

    
        const finalBalance = result.projection[result.projection.length - 1]?.balance || 0;
        finalCorpusValues[i] = finalBalance;
    }

    // Helper to find percentiles (e.g., median is 50th percentile)
    const getPercentile = (arr, p) => {
        if (arr.length === 0) return 0;
        // Sorting TypedArray is fast
        arr.sort(); 
        const index = Math.floor((p / 100) * arr.length);
        return arr[Math.min(index, arr.length - 1)];
    };

    const successRate = (successCount / iterations) * 100;

    return {
        successRate: (successCount / iterations) * 100,
        iterations,
        medianFinalCorpus: getPercentile(finalCorpusValues, 50),
        worstCaseFinalCorpus: getPercentile(finalCorpusValues, 10)
    };
};
