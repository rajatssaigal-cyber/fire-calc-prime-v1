export const formatINR = (val, noSymbol = false) => {
  if (isNaN(val) || !isFinite(val)) return noSymbol ? "0" : "₹0";
  const sign = val < 0 ? "-" : "";
  const absVal = Math.abs(val);
  
  // Format standard INR (e.g., 1,20,000)
  const formatted = new Intl.NumberFormat("en-IN", { 
      style: noSymbol ? "decimal" : "currency", 
      currency: "INR", 
      maximumFractionDigits: 0 
  }).format(absVal);

  // If noSymbol is true, Intl returns just the number. If false, it adds ₹.
  // We handle the sign manually to ensure it's correct for custom formatting if needed.
  return sign + formatted;
};

export const formatCompact = (val, noSymbol = false) => {
   if (isNaN(val) || !isFinite(val)) return noSymbol ? "0" : "₹0";
   const absVal = Math.abs(val);
   const prefix = val < 0 ? "-" : "";
   const symbol = noSymbol ? "" : "₹";

   let formattedNumber;
   if (absVal >= 10000000) { // 1 Crore
       formattedNumber = `${(absVal / 10000000).toFixed(2)}Cr`; 
   } else if (absVal >= 100000) { // 1 Lakh
       formattedNumber = `${(absVal / 100000).toFixed(1)}L`;
   } else if (absVal >= 1000) { // 1 Thousand
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
