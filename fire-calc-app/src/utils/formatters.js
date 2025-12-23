export const formatINR = (val, noSymbol = false) => {
  if (isNaN(val) || !isFinite(val)) return noSymbol ? "0" : "₹0";
  const sign = val < 0 ? "-" : "";
  const absVal = Math.abs(val);
  
  const formatted = new Intl.NumberFormat("en-IN", { 
      style: noSymbol ? "decimal" : "currency", 
      currency: "INR", 
      maximumFractionDigits: 0 
  }).format(absVal);

  return sign + formatted;
};

export const formatCompact = (val, noSymbol = false) => {
   if (isNaN(val) || !isFinite(val)) return noSymbol ? "0" : "₹0";
   const absVal = Math.abs(val);
   const prefix = val < 0 ? "-" : "";
   const symbol = noSymbol ? "" : "₹";

   let formattedNumber;
   if (absVal >= 10000000) { 
       formattedNumber = `${(absVal / 10000000).toFixed(2)}Cr`; 
   } else if (absVal >= 100000) { 
       formattedNumber = `${(absVal / 100000).toFixed(1)}L`;
   } else if (absVal >= 1000) { 
       formattedNumber = `${(absVal / 1000).toFixed(0)}k`;
   } else {
       formattedNumber = absVal.toFixed(0);
   }
   
   return `${prefix}${symbol}${formattedNumber}`;
};

export const sanitizeCSV = (str) => {
    if (typeof str === 'string' && (str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@'))) {
        return `'${str}`;
    }
    return str;
};
