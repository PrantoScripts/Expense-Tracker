import { jsPDF } from "jspdf";

// Helper function to escape and download CSV
function downloadCSV(headers: string[], rows: string[][], filename: string) {
  const content = [
    headers.join(","),
    ...rows.map(row => 
      row.map(val => {
        const text = String(val ?? "").replace(/"/g, '""');
        return text.includes(",") || text.includes("\n") || text.includes('"') 
          ? `"${text}"` 
          : text;
      }).join(",")
    )
  ].join("\n");
  
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 1. Export Transactions to CSV
export function exportTransactionsCSV(transactions: any[], lang: 'en' | 'bn') {
  const isBn = lang === 'bn';
  const headers = isBn 
    ? ["তারিখ", "প্রকার", "ক্যাটাগরি", "পরিমাণ", "বিবরণ", "লেনদেন আইডি"]
    : ["Date", "Type", "Category", "Amount", "Note", "Transaction ID"];

  const rows = transactions.map(tx => [
    tx.date || "",
    tx.type === "income" ? (isBn ? "আয়" : "Income") : (isBn ? "ব্যয়" : "Expense"),
    tx.category || "",
    String(tx.amount || 0),
    tx.note || "",
    tx.id || ""
  ]);

  downloadCSV(headers, rows, `spendwise_transactions_${new Date().toISOString().substring(0, 10)}.csv`);
}

// 2. Export Budgets to CSV
export function exportBudgetsCSV(budgets: any[], lang: 'en' | 'bn') {
  const isBn = lang === 'bn';
  const headers = isBn 
    ? ["বাজেট টাইপ", "ক্যাটাগরি", "পরিমাণ", "মাস", "সতর্কতা থ্রেশহোল্ড (%)", "বাজেট আইডি"]
    : ["Budget Type", "Category", "Amount", "Month", "Alert Threshold (%)", "Budget ID"];

  const rows = budgets.map(bg => [
    bg.type === "monthly" ? (isBn ? "মাসিক সামগ্রিক" : "Monthly Overall") : (isBn ? "ক্যাটাগরিভিত্তিক" : "Categorywise"),
    bg.category === "all" ? (isBn ? "সকল ক্যাটাগরি" : "All Categories") : (bg.category || ""),
    String(bg.amount || 0),
    bg.month || "",
    String(bg.alertThreshold || 80) + "%",
    bg.id || ""
  ]);

  downloadCSV(headers, rows, `spendwise_budgets_${new Date().toISOString().substring(0, 10)}.csv`);
}

// 3. Export Savings Goals to CSV
export function exportGoalsCSV(goals: any[], lang: 'en' | 'bn') {
  const isBn = lang === 'bn';
  const headers = isBn 
    ? ["লক্ষ্য নাম", "টার্গেট পরিমাণ", "বর্তমান জমানো পরিমাণ", "পূর্ণতার শতকরা হার", "টার্গেট মেয়াদ", "নোট", "লক্ষ্য আইডি"]
    : ["Goal Name", "Target Amount", "Current Saved Amount", "Progress (%)", "Target Deadline", "Notes", "Goal ID"];

  const rows = goals.map(g => {
    const target = Number(g.targetAmount) || 1;
    const current = Number(g.currentAmount) || 0;
    const progress = Math.min(Math.round((current / target) * 100), 100);
    return [
      g.name || "",
      String(g.targetAmount || 0),
      String(g.currentAmount || 0),
      progress + "%",
      g.deadline || "",
      g.notes || "",
      g.id || ""
    ];
  });

  downloadCSV(headers, rows, `spendwise_goals_${new Date().toISOString().substring(0, 10)}.csv`);
}

// 4. Export Beautiful Structured PDF Report
export function exportFinancialReportPDF(
  user: any,
  transactions: any[],
  budgets: any[],
  goals: any[],
  currency: string,
  lang: 'en' | 'bn'
) {
  const isBn = lang === 'bn';
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  // Since built-in standard PDF fonts only support WinAnsiEncoding (which lacks Bengali characters),
  // we will generate an elegant English layout as fallback for characters, but use standard clean transliterations/indicators
  // so the PDF generates safely. Let's make sure it's polished and clean.
  doc.setFont("Helvetica", "normal");

  // Visual Palette
  const primaryColor = [16, 24, 48]; // Dark Slate
  const accentColor = [79, 70, 229]; // Indigo
  const lightGray = [241, 245, 249]; // Soft BG
  const textColor = [51, 65, 85]; // Slate Text

  // Document boundaries
  const marginX = 15;
  let currentY = 15;

  // Header Banner Background
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 40, "F");

  // Title text on top banner
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("Helvetica", "bold");
  doc.text("SPENDWISE FINANCIAL REPORT", marginX, 16);

  doc.setFontSize(10);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(199, 210, 254);
  doc.text(`Generated on: ${new Date().toLocaleString()} | User Session Client Secure`, marginX, 23);

  // User Profile metadata
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(`Account Holder: ${user.name || "Abu Sayeed Pranto"} | Location Timezone: ${user.timezone || "Asia/Dhaka"}`, marginX, 32);

  currentY = 48;

  // Overview metrics section
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setFontSize(13);
  doc.setFont("Helvetica", "bold");
  doc.text("I. OVERVIEW METRICS ANALYSIS", marginX, currentY);
  
  // horizontal line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(marginX, currentY + 2, 195, currentY + 2);
  currentY += 8;

  // Calculate totals
  let totalIncome = 0;
  let totalExpense = 0;
  transactions.forEach(t => {
    const val = Number(t.amount) || 0;
    if (t.type === "income") totalIncome += val;
    else if (t.type === "expense") totalExpense += val;
  });
  const netSavings = totalIncome - totalExpense;
  const currencySymbol = currency === "BDT" ? "BDT" : "$";

  // Render three summary blocks
  const blockW = 57;
  const blockH = 18;

  // Block 1: Income
  doc.setFillColor(240, 253, 244); // light green
  doc.rect(marginX, currentY, blockW, blockH, "F");
  doc.setDrawColor(187, 247, 208); // green border
  doc.rect(marginX, currentY, blockW, blockH, "D");
  doc.setFontSize(8);
  doc.setTextColor(22, 101, 52); // dark green text
  doc.setFont("Helvetica", "bold");
  doc.text("TOTAL INFLOW INCOME", marginX + 4, currentY + 5);
  doc.setFontSize(11);
  doc.text(`${totalIncome.toLocaleString()} ${currencySymbol}`, marginX + 4, currentY + 12);

  // Block 2: Expense
  doc.setFillColor(254, 242, 242); // light red
  doc.rect(marginX + blockW + 5, currentY, blockW, blockH, "F");
  doc.setDrawColor(254, 226, 226); // red border
  doc.rect(marginX + blockW + 5, currentY, blockW, blockH, "D");
  doc.setFontSize(8);
  doc.setTextColor(153, 27, 27); // dark red text
  doc.setFont("Helvetica", "bold");
  doc.text("TOTAL OUTFLOW EXPENSES", marginX + blockW + 9, currentY + 5);
  doc.setFontSize(11);
  doc.text(`${totalExpense.toLocaleString()} ${currencySymbol}`, marginX + blockW + 9, currentY + 12);

  // Block 3: Net Savings
  doc.setFillColor(239, 246, 255); // light blue
  doc.rect(marginX + (blockW * 2) + 10, currentY, blockW, blockH, "F");
  doc.setDrawColor(219, 234, 254); // blue border
  doc.rect(marginX + (blockW * 2) + 10, currentY, blockW, blockH, "D");
  doc.setFontSize(8);
  doc.setTextColor(30, 64, 175); // dark blue text
  doc.setFont("Helvetica", "bold");
  doc.text("NET ACCUMULATED SAVINGS", marginX + (blockW * 2) + 14, currentY + 5);
  doc.setFontSize(11);
  doc.text(`${netSavings.toLocaleString()} ${currencySymbol}`, marginX + (blockW * 2) + 14, currentY + 12);

  currentY += blockH + 8;

  // II. BUDGET COMPLIANCE & LIMIT SUMMARY
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setFontSize(13);
  doc.setFont("Helvetica", "bold");
  doc.text("II. BUDGET COMPLIANCE LIMITS", marginX, currentY);
  doc.line(marginX, currentY + 2, 195, currentY + 2);
  currentY += 8;

  // Let's create budgets table headers
  doc.setFillColor(248, 250, 252);
  doc.rect(marginX, currentY, 180, 6, "F");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.setFont("Helvetica", "bold");
  doc.text("Category / Target Scope", marginX + 3, currentY + 4.5);
  doc.text("Budget Class", marginX + 50, currentY + 4.5);
  doc.text("Allocated Limit", marginX + 90, currentY + 4.5);
  doc.text("Active Duration", marginX + 130, currentY + 4.5);
  doc.text("Alert Trigger (%)", marginX + 160, currentY + 4.5);
  currentY += 6;

  doc.setFont("Helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  
  if (budgets.length === 0) {
    doc.text("No active budgets mapped to the ledger.", marginX + 3, currentY + 5);
    currentY += 8;
  } else {
    budgets.slice(0, 5).forEach((bg) => {
      doc.text(bg.category === "all" ? "Overall Limit" : bg.category, marginX + 3, currentY + 4.5);
      doc.text(bg.type === "monthly" ? "Monthly" : "Categorywise", marginX + 50, currentY + 4.5);
      doc.text(`${Number(bg.amount).toLocaleString()} ${currencySymbol}`, marginX + 90, currentY + 4.5);
      doc.text(bg.month || "-", marginX + 130, currentY + 4.5);
      doc.text(`${bg.alertThreshold || 80}%`, marginX + 160, currentY + 4.5);
      
      doc.setDrawColor(241, 245, 249);
      doc.line(marginX, currentY + 6, 195, currentY + 6);
      currentY += 6;
    });
  }

  currentY += 4;

  // III. ACTIVE MILESTONES & SAVINGS GOALS
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setFontSize(13);
  doc.setFont("Helvetica", "bold");
  doc.text("III. MILESTONES & SAVINGS GOALS", marginX, currentY);
  doc.line(marginX, currentY + 2, 195, currentY + 2);
  currentY += 8;

  // MileStone header row
  doc.setFillColor(248, 250, 252);
  doc.rect(marginX, currentY, 180, 6, "F");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.setFont("Helvetica", "bold");
  doc.text("Goal Milestone Title", marginX + 3, currentY + 4.5);
  doc.text("Target Amount", marginX + 70, currentY + 4.5);
  doc.text("Saved So Far", marginX + 110, currentY + 4.5);
  doc.text("Progress %", marginX + 150, currentY + 4.5);
  doc.text("Deadline", marginX + 170, currentY + 4.5);
  currentY += 6;

  doc.setFont("Helvetica", "normal");
  doc.setTextColor(51, 65, 85);

  if (goals.length === 0) {
    doc.text("No active target investments compiled.", marginX + 3, currentY + 5);
    currentY += 8;
  } else {
    goals.slice(0, 5).forEach((g) => {
      // Shorten milestone name if too long
      const nameShort = String(g.name).length > 35 ? String(g.name).substring(0, 32) + "..." : g.name;
      doc.text(nameShort, marginX + 3, currentY + 4.5);
      doc.text(`${Number(g.targetAmount).toLocaleString()} ${currencySymbol}`, marginX + 70, currentY + 4.5);
      doc.text(`${Number(g.currentAmount).toLocaleString()} ${currencySymbol}`, marginX + 110, currentY + 4.5);
      
      const prg = Math.min(Math.round(((Number(g.currentAmount) || 0) / (Number(g.targetAmount) || 1)) * 100), 100);
      doc.text(`${prg}%`, marginX + 150, currentY + 4.5);
      doc.text(g.deadline || "-", marginX + 170, currentY + 4.5);
      
      doc.setDrawColor(241, 245, 249);
      doc.line(marginX, currentY + 6, 195, currentY + 6);
      currentY += 6;
    });
  }

  // Draw Page Number Footnote on Page 1
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text("SpendWise Safe-Ledger Secure Service System | Page 1 of 2", marginX, 285);

  // Transition to Page 2 for Transactions list
  doc.addPage();
  currentY = 15;

  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 12, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("Helvetica", "bold");
  doc.text("SPENDWISE FINANCIAL REPORT | COMPLETE RECORD RECONCILIATION", marginX, 7.5);

  currentY = 22;

  // IV. DETAILED RECENT TRANSACTIONS LEDGER LIST
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setFontSize(13);
  doc.setFont("Helvetica", "bold");
  doc.text("IV. RECENT ACCOUNT TRANSACTIONS LIST", marginX, currentY);
  doc.setDrawColor(226, 232, 240);
  doc.line(marginX, currentY + 2, 195, currentY + 2);
  currentY += 8;

  // Table header
  doc.setFillColor(248, 250, 252);
  doc.rect(marginX, currentY, 180, 6, "F");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.setFont("Helvetica", "bold");
  doc.text("Date", marginX + 3, currentY + 4.5);
  doc.text("Flow Type", marginX + 25, currentY + 4.5);
  doc.text("Category", marginX + 48, currentY + 4.5);
  doc.text("Note/Voucher Memo", marginX + 75, currentY + 4.5);
  doc.text("Amount (Value)", marginX + 160, currentY + 4.5);
  currentY += 6;

  doc.setFont("Helvetica", "normal");
  doc.setTextColor(51, 65, 85);

  const txLogs = transactions.slice(0, 35); // top 35 ledger records for standard layout

  if (txLogs.length === 0) {
    doc.text("No transactions logged in this cycle yet.", marginX + 3, currentY + 5);
    currentY += 8;
  } else {
    txLogs.forEach((tx) => {
      // Check of page boundary
      if (currentY > 270) {
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text("SpendWise Safe-Ledger Secure Service System", marginX, 285);
        
        doc.addPage();
        currentY = 15;
        // header
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 210, 12, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont("Helvetica", "bold");
        doc.text("SPENDWISE FINANCIAL REPORT | COMPLETE RECORD RECONCILIATION", marginX, 7.5);
        currentY = 25;
      }

      doc.setFontSize(8);
      // Date
      doc.text(tx.date || "-", marginX + 3, currentY + 4.5);
      
      // Type
      if (tx.type === "income") {
        doc.setTextColor(22, 101, 52);
        doc.setFont("Helvetica", "bold");
        doc.text("INFLOW", marginX + 25, currentY + 4.5);
      } else {
        doc.setTextColor(153, 27, 27);
        doc.setFont("Helvetica", "bold");
        doc.text("OUTFLOW", marginX + 25, currentY + 4.5);
      }
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(51, 65, 85);

      // Category
      doc.text(tx.category || "Others", marginX + 48, currentY + 4.5);

      // Note (shortened securely)
      const noteStr = tx.note || "";
      const noteShort = noteStr.length > 45 ? noteStr.substring(0, 42) + "..." : noteStr;
      doc.text(noteShort, marginX + 75, currentY + 4.5);

      // Amount
      doc.setFont("Helvetica", "bold");
      const isInc = tx.type === "income";
      doc.text(`${isInc ? "+" : "-"}${Number(tx.amount).toLocaleString()} ${currencySymbol}`, marginX + 160, currentY + 4.5);
      doc.setFont("Helvetica", "normal");

      doc.setDrawColor(241, 245, 249);
      doc.line(marginX, currentY + 6, 195, currentY + 6);
      currentY += 6;
    });
  }

  // Draw Page Number Footnote on Page 2/Final Page
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text("SpendWise Safe-Ledger Secure Service System | End of Certified Ledger Document Report", marginX, 285);

  // Trigger Save File Downloader
  doc.save(`spendwise_statement_${new Date().toISOString().substring(0, 10)}.pdf`);
}
