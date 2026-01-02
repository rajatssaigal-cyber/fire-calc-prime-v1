// src/utils/mcWorker.js
import { calculateProjection } from './fireMath';

// 1. Define Volatility Logic (Copied here for isolation)
const VOLATILITY = {
    equity: 0.15,
    stable: 0.04,
    custom: 0.10
};

const plotRandomNormal = (mean, stdDev) => {
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    const standardNormal = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + (stdDev * standardNormal);
};

// 2. Listen for messages from the Main Thread
self.onmessage = (e) => {
    const { state, iterations } = e.data;

    // Run the heavy loop
    let successCount = 0;
    const finalCorpusValues = new Float64Array(iterations);

    for (let i = 0; i < iterations; i++) {
        const randomizedState = {
            ...state,
            equityReturn: plotRandomNormal(state.equityReturn, VOLATILITY.equity * 100),
            stableReturn: plotRandomNormal(state.stableReturn, VOLATILITY.stable * 100),
            customAssets: state.customAssets.map(asset => ({
                ...asset,
                returnRate: plotRandomNormal(asset.returnRate, VOLATILITY.custom * 100)
            }))
        };

        const result = calculateProjection(randomizedState);

        if (result.bankruptcyAge === null) {
            successCount++;
        }
        
        // Optimize: grab only the final balance
        const finalBal = result.projection.length > 0 
            ? result.projection[result.projection.length - 1].balance 
            : 0;
            
        finalCorpusValues[i] = finalBal;
    }

    // Sort for percentiles
    finalCorpusValues.sort();

    const getPercentile = (p) => {
        if (finalCorpusValues.length === 0) return 0;
        const index = Math.floor((p / 100) * finalCorpusValues.length);
        return finalCorpusValues[Math.min(index, finalCorpusValues.length - 1)];
    };

    // Send results back
    self.postMessage({
        successRate: (successCount / iterations) * 100,
        iterations,
        medianFinalCorpus: getPercentile(50),
        worstCaseFinalCorpus: getPercentile(10)
    });
};
