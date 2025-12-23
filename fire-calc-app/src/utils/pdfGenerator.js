import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCompact } from './formatters';

// Helper for PDF-safe currency (The Fix)
const formatPdfVal = (val) => {
    if (isNaN(val)) return "Rs. 0";
    const absVal = Math.abs(val);
    const prefix = val < 0 ? "-" : "";
    
    // Use same logic as formatCompact but force "Rs."
    let formatted;
    if (absVal >= 10000000) formatted = `${(absVal / 10000000).toFixed(2)} Cr`; 
    else if (absVal >= 100000) formatted = `${(absVal / 100000).toFixed(1)} L`;
    else if (absVal >= 1000) formatted = `${(absVal / 1000).toFixed(0)} k`;
    else formatted = absVal.toFixed(0);
    
    return `${prefix}Rs. ${formatted}`;
};

export const generatePDFReport = (state, results) => {
  const doc = new jsPDF();
  const themeColor = [16, 185, 129]; 

  // --- 1. HEADER ---
  doc.setFillColor(...themeColor);
  doc.rect(0, 0, 210, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text("FIRE Calc Prime", 14, 13);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 195, 13, { align: 'right' });

  // --- 2. SUMMARY ---
  let y = 35;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Financial Readiness Report: ${state.scenarioName}`, 14, y);
  
  y += 10;
  
  const drawCard = (title, value, x, color) => {
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(x, y, 40, 25, 2, 2, 'FD');
      
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(title, x + 20, y + 8, { align: 'center' });
      
      doc.setFontSize(11);
      doc.setTextColor(...color);
      doc.setFont('helvetica', 'bold');
      doc.text(value, x + 20, y + 18, { align: 'center' });
  };

  drawCard("Target Corpus", formatPdfVal(results.targetAtRetirement), 14, [0, 0, 0]);
  drawCard("Projected Corpus", formatPdfVal(results.corpusAtRetirement), 60, [16, 185, 129]);
  
  const gapColor = results.gap > 0 ? [244, 63, 94] : [16, 185, 129]; 
  drawCard("Gap / Surplus", (results.gap > 0 ? '-' : '+') + formatPdfVal(Math.abs(results.gap)).replace('Rs. ', ''), 106, gapColor);
  
  drawCard("Freedom Age", results.fireAge || "Never", 152, [245, 158, 11]); 

  // --- 3. INPUTS ---
  y += 40;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("Key Assumptions", 14, y);
  
  autoTable(doc, {
      startY: y + 5,
      head: [['Current Age', 'Retire Age', 'Monthly Spend', 'Inflation', 'Equity Return']],
      body: [[
          state.currentAge, 
          state.targetRetirementAge, 
          formatPdfVal(state.retirementAnnualExpenses / 12),
          state.inflationRate + '%',
          state.equityReturn + '%'
      ]],
      theme: 'grid',
      headStyles: { fillColor: [50, 50, 50], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
  });

  // --- 4. TRAJECTORY ---
  const keyRows = results.projection.filter(p => 
      p.age === Math.floor(state.currentAge) ||
      p.age === state.targetRetirementAge ||
      p.age === state.lifeExpectancy ||
      p.age % 5 === 0
  );

  doc.text("Wealth Trajectory (Milestones)", 14, doc.lastAutoTable.finalY + 15);

  autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Age', 'Total Corpus', 'Equity', 'Debt', 'Withdrawal']],
      body: keyRows.map(row => [
          row.age + (row.age === state.targetRetirementAge ? ' (Retire)' : ''),
          formatPdfVal(row.balance),
          formatPdfVal(row.equity), 
          formatPdfVal(row.stable),
          row.withdrawal > 0 ? formatPdfVal(row.withdrawal) : '-' 
      ]),
      theme: 'striped',
      headStyles: { fillColor: themeColor },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
          0: { fontStyle: 'bold' }, 
          1: { fontStyle: 'bold', textColor: [20, 20, 20] }, 
          4: { textColor: [220, 38, 38] } 
      }
  });

  doc.save(`FIRE_Report_${state.scenarioName.replace(/\s+/g, '_')}.pdf`);
};
