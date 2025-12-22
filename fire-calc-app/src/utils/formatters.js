export const formatINR = (val) => {
  if (isNaN(val) || !isFinite(val)) return "₹0";
  const sign = val < 0 ? "-" : "";
  const absVal = Math.abs(val);
  if (absVal >= 10000000) return `${sign}₹${(absVal / 10000000).toFixed(2)} Cr`;
  if (absVal >= 100000) return `${sign}₹${(absVal / 100000).toFixed(2)} L`;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
};

export const formatCompact = (val) => {
   if (isNaN(val) || !isFinite(val)) return "₹0";
   const absVal = Math.abs(val);
   let formattedNumber;
   if (absVal >= 10000000) formattedNumber = `${(absVal / 10000000).toFixed(2)}Cr`; 
   else if (absVal >= 100000) formattedNumber = `${(absVal / 100000).toFixed(1)}L`;
   else formattedNumber = `${(absVal / 1000).toFixed(0)}k`;
   return `₹${formattedNumber}`;
};

export const sanitizeCSV = (str) => {
    if (typeof str === 'string' && (str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@'))) {
        return `'${str}`;
    }
    return str;
};