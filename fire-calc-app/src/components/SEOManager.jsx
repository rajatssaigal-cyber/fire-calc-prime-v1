import { useEffect } from 'react';

export const SEOManager = () => {
  useEffect(() => {
    document.title = "FIRE Calc: Holiday Edition 🎄 | Financial Independence Planner";
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = "Calculate your Financial Independence & Retire Early (FIRE) number in India. Accounts for inflation, tax drag (LTCG), and step-up SIPs.";

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "FinancialProduct",
      "name": "Indian FIRE Calculator Pro",
      "description": "Advanced financial independence calculator for Indian investors.",
      "brand": { "@type": "Brand", "name": "FireCalc" },
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
      "featureList": "Inflation Adjustment, Tax Drag Simulation, SIP Step-Up, Emergency Fund isolation"
    };
    
    let scriptTag = document.querySelector('#fire-calc-schema');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'fire-calc-schema';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify(schemaData);
  }, []);

  return null;
};