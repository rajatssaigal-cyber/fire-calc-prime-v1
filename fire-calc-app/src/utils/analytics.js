import { logEvent } from "firebase/analytics";
import { analytics } from "../config/firebase";

const getAgeGroup = (age) => {
    if (!age) return "Unknown";
    if (age < 25) return "Under 25";
    if (age < 30) return "25 - 29";
    if (age < 35) return "30 - 34";
    if (age < 40) return "35 - 39";
    if (age < 50) return "40 - 49";
    return "50+";
};

const getIncomeTier = (annualIncome) => {
    if (!annualIncome) return "Unknown";
    const lakhs = annualIncome / 100000;
    if (lakhs < 10) return "< 10L";
    if (lakhs < 20) return "10L - 20L";
    if (lakhs < 30) return "20L - 30L";
    if (lakhs < 50) return "30L - 50L";
    if (lakhs < 100) return "50L - 1Cr";
    return "1Cr+";
};

const getRiskProfile = (successRate) => {
    if (successRate >= 90) return "Safe";
    if (successRate >= 75) return "Moderate";
    return "Risky";
};

export const trackCalculation = (state, results) => {
    if (!analytics || !state || !results) return;
    
    // Privacy-Safe Event Logging
    logEvent(analytics, "plan_calculated", {
        age_group: getAgeGroup(state.currentAge),
        income_tier: getIncomeTier(state.annualIncome),
        target_retire_age: state.targetRetirementAge,
        risk_profile: getRiskProfile(results.monteCarlo?.successRate || 0),
        has_gap: results.gap > 0,
        using_stress_test: state.stressTest ? "yes" : "no",
        using_flex_mode: state.flexibilityMode ? "yes" : "no"
    });
};

export const trackLogin = (method) => {
    if (!analytics) return;
    logEvent(analytics, "login", { method });
};
