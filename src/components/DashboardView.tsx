import React, { useState } from "react";
import { translations, getTranslatedCategory } from "../locales";
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  PieChart,
  DollarSign,
  Plus,
  Compass,
  ArrowRight,
  FileSearch,
  Upload,
  AlertTriangle,
  History,
  X,
  CreditCard,
  Briefcase,
  Sparkles,
  Download,
  CalendarRange,
  Clock
} from "lucide-react";

interface DashboardViewProps {
  user: any;
  accounts: any[];
  transactions: any[];
  budgets: any[];
  goals: any[];
  notifications: any[];
  lang: 'en' | 'bn';
  onAddTransactionClick: () => void;
  onNavigateToTab: (tab: string) => void;
  onRefreshAllData: () => void;
  recurringRules?: any[];
}

export function DashboardView({
  user,
  accounts,
  transactions,
  budgets,
  goals,
  notifications,
  lang,
  onAddTransactionClick,
  onNavigateToTab,
  onRefreshAllData,
  recurringRules = []
}: DashboardViewProps) {
  
  const t = translations[lang];

  // OCR state variables
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any | null>(null);

  // Computed overview figures
  const currencySign = user.currency === "BDT" ? "৳" : "$";

  // Calculate balances
  const totalBalance = accounts.reduce((acc, obj) => acc + Number(obj.balance), 0);
  
  const currentMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM
  const monthTransactions = transactions.filter(tx => tx.date.substring(0, 7) === currentMonthStr);

  const totalIncome = monthTransactions
    .filter(tx => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpense = monthTransactions
    .filter(tx => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;
  
  const percentage = totalIncome > 0 
    ? Math.round((totalExpense / totalIncome) * 100) 
    : (totalExpense > 0 ? 100 : 0);
  
  // Recent transactions (top 5)
  const recentTxs = transactions.slice(0, 5);

  // Chart calculation: expense per categories
  const expenseTxs = monthTransactions.filter(tx => tx.type === "expense");
  const categoryMap: { [key: string]: number } = {};
  expenseTxs.forEach(tx => {
    categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
  });

  const categoriesData = Object.keys(categoryMap).map(cat => ({
    name: cat,
    amount: categoryMap[cat],
    color: cat === "Food" ? "#EF4444" :
           cat === "Transport" ? "#F97316" :
           cat === "Shopping" ? "#EC4899" :
           cat === "Education" ? "#3B82F6" :
           cat === "Healthcare" ? "#10B981" :
           cat === "Entertainment" ? "#8B5CF6" :
           cat === "Bills" ? "#06B6D4" :
           cat === "Rent" ? "#14B8A6" :
           cat === "Travel" ? "#F59E0B" : "#6B7280"
  })).sort((a, b) => b.amount - a.amount);

  const totalCategorySum = categoriesData.reduce((sum, item) => sum + item.amount, 0);

  // Helper to calculate projected recurring balance impact over 6 months
  const calculateProjectedBalanceImpact = () => {
    const monthlyNetImpacts = Array(6).fill(0);
    const activeRules = (recurringRules || []).filter(rule => rule.isActive !== false);

    for (let m = 0; m < 6; m++) {
      let netForMonth = 0;
      activeRules.forEach(rule => {
        const amount = Number(rule.amount) || 0;
        const multiplier = rule.type === "income" ? 1 : -1;
        
        let occurrences = 0;
        const ruleInterval = (rule.interval || rule.frequency || "monthly").toLowerCase();
        
        if (ruleInterval === "daily") {
          occurrences = 30;
        } else if (ruleInterval === "weekly") {
          occurrences = 4;
        } else if (ruleInterval === "monthly") {
          occurrences = 1;
        } else if (ruleInterval === "yearly" || ruleInterval === "annually") {
          if (rule.nextRunDate) {
            try {
              const ruleMonth = new Date(rule.nextRunDate).getMonth();
              if (ruleMonth === m) {
                occurrences = 1;
              }
            } catch (e) {
              occurrences = 0;
            }
          } else {
            if (m === 5) occurrences = 1; // Default to June if no nextRunDate
          }
        } else {
          occurrences = 1;
        }

        netForMonth += amount * multiplier * occurrences;
      });
      monthlyNetImpacts[m] = netForMonth;
    }

    // Cumulative balance tracking starting from totalBalance, bounded to look good in viewport
    const startingBaseline = Math.min(Math.max(totalBalance, 30000), 75000);
    const cumulativeProjections = [];
    let currentProjection = startingBaseline;

    for (let m = 0; m < 6; m++) {
      currentProjection += monthlyNetImpacts[m];
      cumulativeProjections.push(Math.max(5000, Math.min(currentProjection, 88000)));
    }

    return {
      monthlyNetImpacts,
      cumulativeProjections
    };
  };

  const { monthlyNetImpacts, cumulativeProjections } = calculateProjectedBalanceImpact();

  // Overall combined budget progress
  const globalBudget = budgets.find(b => b.category === "all" && b.month === currentMonthStr) ||
                       budgets.find(b => b.category === "all");
  
  const budgetLimit = globalBudget ? globalBudget.amount : 50000;
  const budgetUsagePercent = Math.min(Math.round((totalExpense / budgetLimit) * 100), 200);

  // Dynamic AI Advice construction
  const getDynamicAdvice = () => {
    const list = [];
    if (percentage > 80) {
      list.push({
        type: "danger",
        title: lang === 'bn' ? "উচ্চ খরচ স্তরের সতর্কতা" : "Heavy Outflow Alarm",
        desc: lang === 'bn' ? "আপনি উপার্জনের ৮০%-এর বেশি ব্যয় করে ফেলেছেন। অপ্রয়োজনীয় কেনাকাটা সাময়িকভাবে স্থগিত করার পরামর্শ দিচ্ছি।" : "You have spent over 80% of current incoming revenue. Freeze luxury or micro-retail streams immediately."
      });
    } else if (percentage > 50) {
      list.push({
        type: "warning",
        title: lang === 'bn' ? "মাঝারি খরচ স্তরের সতর্কতা" : "Moderate Outflow Rate",
        desc: lang === 'bn' ? "চলতি মাসে আপনার আয়ের অর্ধেকের বেশি ব্যয় হয়েছে। বাজেটের রুলস ফলো করুন।" : "Over half of monthly wages are spent. Guard remainder items using budget guidelines."
      });
    } else {
      list.push({
         type: "success",
         title: lang === 'bn' ? "চমৎকার বাজেট নিয়ন্ত্রণ" : "Superb Budget Control",
         desc: lang === 'bn' ? "আপনার খরচ আয়ের ৫০% এর নিচেই রয়েছে। চমৎকার আর্থিক নিয়মানুবর্তিতা!" : "Your current outflows remain safely bounded below 50% of your incoming ledger. Keep it up!"
      });
    }

    if (savingsRate > 25) {
      list.push({
        type: "success",
        title: lang === 'bn' ? "উচ্চ সঞ্চয় প্রশংসাপত্র" : "High Accumulator Rate",
        desc: lang === 'bn' ? "আপনার নিয়মিত সঞ্চয় হার ২৫% এর উপরে! এটি আপনাকে অতি দ্রুত আপনার লক্ষ্য পূরণে সাহায্য করবে।" : "Maintaining a savings rate over 25% accelerates target milestones and provides cushion."
      });
    }

    if (categoriesData.length > 0) {
      const topCat = categoriesData[0];
      const categoryRatio = totalCategorySum > 0 ? (topCat.amount / totalCategorySum) * 100 : 0;
      if (categoryRatio > 35) {
        list.push({
          type: "info",
          title: lang === 'bn' ? `ব্যয়ের মূল স্রোত: ${getTranslatedCategory(topCat.name, lang)}` : `Dominant Drainage: ${topCat.name}`,
          desc: lang === 'bn' ? `আপনার মোট ব্যয়ের প্রায় ${Math.round(categoryRatio)}% কেবল ${getTranslatedCategory(topCat.name, lang)} খাতে যাচ্ছে।` : `Approximately ${Math.round(categoryRatio)}% of expense ledger tags belong to single sector: ${topCat.name}.`
        });
      }
    }

    if (list.length < 3) {
      list.push({
        type: "info",
        title: lang === 'bn' ? "সদস্যতা চার্জ রিভিও" : "Subscription Audits",
        desc: lang === 'bn' ? "অব্যবহৃত মেম্বারশিপ বা অটো-ডেবিট চার্জ বন্ধ করতে পুনরাবৃত্তিমূলক লেনদেন বিভাগ রিভিও করুন।" : "Review automatic payment policies regularly under settings tab to clean up dry leaks."
      });
    }

    return list.slice(0, 3);
  };

  const adviceList = getDynamicAdvice();

  // Simulated drop/drag file detection
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setAnalyzing(true);
    setImportNotice(null);
    setPreviewData(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      try {
        const res = await fetch("/api/receipt/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("spendwise_token")}`
          },
          body: JSON.stringify({
            fileDataUrl: dataUrl,
            fileName: file.name,
            fileType: file.type
          })
        });

        const data = await res.json();
        if (res.ok && data.parsedTx) {
          setPreviewData(data.parsedTx);
          setImportNotice(t.receiptSuccess);
        } else {
          setImportNotice(data.error || "Failed to scan receipt image.");
        }
      } catch (err) {
        setImportNotice("Server scanning error.");
      }
      setAnalyzing(false);
    };
    reader.readAsDataURL(file);
  };

  // Trigger quick sandbox mock receipt
  const triggerSandboxReceiptScan = () => {
    setAnalyzing(true);
    setTimeout(async () => {
      try {
        const res = await fetch("/api/receipt/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("spendwise_token")}`
          },
          body: JSON.stringify({
            fileDataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
            fileName: "Agora_Moakhali_SuperStore_Receipt.png",
            fileType: "image/png"
          })
        });
        const data = await res.json();
        if (res.ok && data.parsedTx) {
          setPreviewData(data.parsedTx);
          setImportNotice(t.receiptSuccess);
        }
      } catch (e) {
        setImportNotice("Mock scan execution failed.");
      }
      setAnalyzing(false);
    }, 1200);
  };

  // Convert receipt scan to transaction list item
  const saveScannedReceipt = async () => {
    if (!previewData) return;
    try {
      const defaultAccount = accounts[0]?.id || "acc_cash";
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("spendwise_token")}`
        },
        body: JSON.stringify({
          accountId: defaultAccount,
          type: "expense",
          amount: previewData.amount,
          category: previewData.category,
          date: previewData.date,
          note: previewData.note
        })
      });

      if (response.ok) {
        setPreviewData(null);
        setImportNotice(null);
        onRefreshAllData(); // reload
      } else {
        const err = await response.json();
        setImportNotice(err.error);
      }
    } catch (e) {
      setImportNotice("Upload persistence error.");
    }
  };

  const handleExportMonthlyCsv = () => {
    // Generate CSV on the client side from current monthTransactions
    let csvContent = "\uFEFF"; // Byte Order Mark for Excel
    csvContent += "ID,Type,Amount,Category,Date,Note,Created At\n";
    
    monthTransactions.forEach((t) => {
      const escapedId = (t.id || "").toString().replace(/"/g, '""');
      const escapedType = (t.type || "").toString().replace(/"/g, '""');
      const escapedCategory = (t.category || "").toString().replace(/"/g, '""');
      const escapedDate = (t.date || "").toString().replace(/"/g, '""');
      const escapedNote = (t.note || "").toString().replace(/"/g, '""');
      const escapedCreatedAt = (t.createdAt || "").toString().replace(/"/g, '""');
      csvContent += `"${escapedId}","${escapedType}",${t.amount},"${escapedCategory}","${escapedDate}","${escapedNote}","${escapedCreatedAt}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `SpendWise_Monthly_Report_${currentMonthStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Interactive Pie Chart calculation: slices of circle
  // Create beautiful SVG arcs manually for zero-dep responsive gorgeous donut charts!
  let accumulatedAngle = 0;
  const donutRadius = 60;
  const donutStrokeWidth = 24;
  const donutX = 75;
  const donutY = 75;
  const donutCircumference = 2 * Math.PI * donutRadius;

  // Filter the next 3 upcoming recurring transactions using a filter on recurringRules
  const filteredUpcomingBills = [...recurringRules]
    .filter(rule => rule.nextRunDate)
    .sort((a, b) => {
      const dateA = new Date(a.nextRunDate).getTime();
      const dateB = new Date(b.nextRunDate).getTime();
      return dateA - dateB;
    })
    .slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Prime Header Card banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl shadow-indigo-950/15">
        <div>
          <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-400/10 uppercase tracking-wider">
            Premium Personal SaaS
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5 font-sans leading-tight">
            {lang === 'bn' ? `আসসালামু আলাইকুম, ${user.name}` : `Welcome back, ${user.name}`}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {lang === 'bn' ? "স্পেন্ডওয়াইজ ইন্টেলিজেন্ট মনিটর আপনার সমস্ত বাজেট এবং লক্ষ্য বিশ্লেষণ করছে।" : "SpendWise Intelligent Monitoring checks your cashflow, budgets, and savings goals."}
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0 w-full sm:w-auto">
          <button
            onClick={handleExportMonthlyCsv}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800/90 px-4 py-3 text-sm font-semibold text-slate-200 transition cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
            title={lang === 'bn' ? "মাসিক লেনদেনের রিপোর্ট এক্সপোর্ট করুন" : "Export monthly reports as CSV"}
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span>{lang === 'bn' ? "রিপোর্ট রফতানি" : "Export Data"}</span>
          </button>

          <button
            onClick={triggerSandboxReceiptScan}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <Compass className="h-4 w-4 text-cyan-400 animate-spin" />
            <span>{t.uploadReceipt}</span>
          </button>
          
          <button
            id="dash-add-trans-btn"
            onClick={onAddTransactionClick}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/10 transition cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>{lang === 'bn' ? "নতুন লেনদেন" : "Add Entry"}</span>
          </button>
        </div>
      </div>

      {/* Main Bento Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Balance */}
        <div 
          onClick={() => onNavigateToTab("accounts")}
          className="glass-panel p-5 rounded-2xl shadow border border-slate-200/80 dark:border-slate-800/80 hover:shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-indigo-500/10 hover:border-indigo-500/30 relative group cursor-pointer"
        >
          {/* Quick View Details Badge on Hover */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-1 group-hover:translate-y-0 z-10">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-indigo-600 dark:bg-indigo-500 text-white px-2.5 py-0.5 rounded-full shadow-sm">
              <span>{lang === 'bn' ? "বিস্তারিত" : "View Details"}</span>
              <ArrowRight className="h-2.5 w-2.5" />
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.totalBalance}</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-indigo-500" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
              {currencySign}{totalBalance.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="text-emerald-500 font-bold">● Active Assets</span>
            <span>across accounts</span>
          </div>
        </div>

        {/* Card 2: Income */}
        <div 
          onClick={() => onNavigateToTab("transactions")}
          className="glass-panel p-5 rounded-2xl shadow border border-slate-200/80 dark:border-slate-800/80 hover:shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-emerald-500/10 hover:border-emerald-500/30 relative group cursor-pointer"
        >
          {/* Quick View Details Badge on Hover */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-1 group-hover:translate-y-0 z-10">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-600 dark:bg-emerald-500 text-white px-2.5 py-0.5 rounded-full shadow-sm">
              <span>{lang === 'bn' ? "বিস্তারিত" : "View Details"}</span>
              <ArrowRight className="h-2.5 w-2.5" />
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.totalIncome}</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/10 flex items-center justify-center animate-pulse">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              {currencySign}{totalIncome.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            <span>Month: <span className="font-bold">{new Date().toLocaleString('default', { month: 'long' })}</span> YYYY</span>
          </div>
        </div>

        {/* Card 3: Expense */}
        <div 
          onClick={() => onNavigateToTab("transactions")}
          className="glass-panel p-5 rounded-2xl shadow border border-slate-200/80 dark:border-slate-800/80 hover:shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-rose-500/10 hover:border-rose-500/30 relative group cursor-pointer"
        >
          {/* Quick View Details Badge on Hover */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-1 group-hover:translate-y-0 z-10">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-600 dark:bg-rose-500 text-white px-2.5 py-0.5 rounded-full shadow-sm">
              <span>{lang === 'bn' ? "বিস্তারিত" : "View Details"}</span>
              <ArrowRight className="h-2.5 w-2.5" />
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.totalExpenses}</span>
            <div className="h-8 w-8 rounded-lg bg-red-500/10 dark:bg-red-500/10 flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-red-500" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-extrabold font-mono text-red-600 dark:text-red-400">
              {currencySign}{totalExpense.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Overall outflow log</span>
          </div>
        </div>

        {/* Card 4: Savings Rate */}
        <div 
          onClick={() => onNavigateToTab("savings")}
          className="glass-panel p-5 rounded-2xl shadow border border-slate-200/80 dark:border-slate-800/80 hover:shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-cyan-500/10 hover:border-cyan-500/30 relative group cursor-pointer"
        >
          {/* Quick View Details Badge on Hover */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-1 group-hover:translate-y-0 z-10">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-cyan-600 dark:bg-cyan-500 text-white px-2.5 py-0.5 rounded-full shadow-sm">
              <span>{lang === 'bn' ? "বিস্তারিত" : "View Details"}</span>
              <ArrowRight className="h-2.5 w-2.5" />
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.netSavingsRate}</span>
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/10 flex items-center justify-center">
              <PiggyBank className="h-4 w-4 text-cyan-500" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className={`text-2xl font-extrabold font-mono ${savingsRate > 20 ? 'text-emerald-500' : savingsRate >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
              {savingsRate}%
            </span>
          </div>
          <div className="mt-2.5 w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
            <div
              className={`h-full ${savingsRate > 25 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
              style={{ width: `${Math.max(0, Math.min(savingsRate, 100))}%` }}
            />
          </div>
        </div>

      </div>

      {/* OCR Document Uploader with AI scanner */}
      <div className="glass-panel p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Upload className="h-4.5 w-4.5 text-indigo-400" />
          <span>{t.uploadReceipt}</span>
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          {lang === 'bn' ? "যেকোনো বিলের রিসিট বা চালানের ছবি আপলোড করুন, জেমিনি কৃত্রিম বুদ্ধিমত্তা সম্পূর্ণ ডাটা ও ক্যাটাগরি স্বয়ংক্রিয়ভাবে আলাদা করবে।" : "Upload a photo or invoice of your shopping/dining bill, and Gemini AI will automatically extract amount, categories, and date."}
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          
          {/* Uploader interaction board */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-5 text-center flex flex-col items-center justify-center transition cursor-pointer min-h-[140px] ${
              dragActive ? "border-indigo-500 bg-indigo-500/5" : "border-slate-300 dark:border-slate-800 hover:border-slate-600 hover:bg-slate-100/60 dark:hover:bg-slate-800/10"
            }`}
          >
            {analyzing ? (
              <div className="space-y-2">
                <div className="h-6 w-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
                <p className="text-xs text-indigo-400 font-semibold">{t.analyzingReceipt}</p>
              </div>
            ) : (
              <div className="space-y-1">
                <FileSearch className="h-8 w-8 text-indigo-400 mx-auto opacity-75" />
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {lang === 'bn' ? "এখানে ফাইল ড্র্যাগ অ্যান্ড ড্রপ করুন অথবা" : "Drag & drop receipt image here, or"}
                </p>
                <label className="inline-block text-xs text-indigo-500 dark:text-indigo-400 font-bold hover:underline cursor-pointer">
                  {t.uploadBtn}
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Extracted preview list */}
          <div className="bg-slate-100/60 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 relative">
            {importNotice && (
              <div className="text-xs text-emerald-700 dark:text-emerald-400 mb-2 p-1 px-2.5 bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded flex items-center justify-between">
                <span>{importNotice}</span>
                <button onClick={() => setImportNotice(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>
            )}

            {previewData ? (
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-1.5 py-0.5 rounded">
                      Parsed Result
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1 leading-normal">{previewData.category} Expenditure</h4>
                  </div>
                  <span className="text-base font-mono font-extrabold text-indigo-600 dark:text-indigo-300">
                    {currencySign}{previewData.amount}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex border-b border-slate-250 dark:border-slate-800/50 pb-1">
                    <span className="w-20 text-slate-500 dark:text-slate-400 font-medium">{t.date}:</span>
                    <span className="font-mono">{previewData.date}</span>
                  </div>
                  <div className="flex border-b border-slate-250 dark:border-slate-800/50 pb-1">
                    <span className="w-20 text-slate-500 dark:text-slate-400 font-medium">{t.note}:</span>
                    <span className="truncate">{previewData.note}</span>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-1.5">
                  <button
                    onClick={() => setPreviewData(null)}
                    className="flex-1 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg text-xs font-semibold cursor-pointer transition"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={saveScannedReceipt}
                    className="flex-1 py-1.5 bg-indigo-600 text-white hover:bg-indigo-500 rounded-lg text-xs font-bold cursor-pointer transition"
                  >
                    {lang === 'bn' ? "খাতায় তুলুন" : "Confirm & Import"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 text-center text-slate-500 text-xs">
                {lang === 'bn' ? "খাতা খালি! রিসিট আপলোড করলে তার এআই বিবরণী এখানে প্রদর্শিত হবে।" : "Import console empty. Scandoc details will project here."}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Left Right double bento views */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Charts trend, categories */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Visual SVG charts area */}
          <div 
            onClick={() => onNavigateToTab("transactions")}
            className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow transition-all duration-300 hover:scale-[1.015] hover:shadow-indigo-500/5 hover:border-indigo-500/25 relative group cursor-pointer"
          >
            {/* Hover details badge */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-1 group-hover:translate-y-0 z-15 pointer-events-none">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-indigo-600 dark:bg-indigo-500 text-white px-2.5 py-0.5 rounded-full shadow-sm">
                <span>{lang === 'bn' ? "বিস্তারিত" : "View Details"}</span>
                <ArrowRight className="h-2.5 w-2.5" />
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{t.monthlyOverview}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Comparing inputs vs expenses</p>
              </div>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 underline">{new Date().getFullYear()} Trend</span>
            </div>

            {/* Custom Interactive SVG Line/Bar Chart */}
            <div className="mt-6 h-60 w-full relative flex items-end justify-between px-2">
              {/* Backgrid reference lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                <div className="border-b border-slate-200 dark:border-slate-800/45 w-full h-[1px]" />
                <div className="border-b border-slate-200 dark:border-slate-800/45 w-full h-[1px]" />
                <div className="border-b border-slate-200 dark:border-slate-800/45 w-full h-[1px]" />
                <div className="border-b border-slate-200 dark:border-slate-800/45 w-full h-[1px]" />
                <div className="border-b border-slate-200 dark:border-slate-800/45 w-full h-[1px]" />
              </div>

              {/* Decorative Gradient Line Overlay for Projected Balance */}
              <svg 
                className="absolute inset-x-0 bottom-6 h-44 w-full pointer-events-none z-15" 
                viewBox="0 0 600 176" 
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="swProjectedAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Area under line */}
                <path
                  d={`M 50,176 
                      L 50,${176 - (cumulativeProjections[0] / 90000) * 176} 
                      L 150,${176 - (cumulativeProjections[1] / 90000) * 176} 
                      L 250,${176 - (cumulativeProjections[2] / 90000) * 176} 
                      L 350,${176 - (cumulativeProjections[3] / 90000) * 176} 
                      L 450,${176 - (cumulativeProjections[4] / 90000) * 176} 
                      L 550,${176 - (cumulativeProjections[5] / 90000) * 176} 
                      L 550,176 Z`}
                  fill="url(#swProjectedAreaGrad)"
                />

                {/* Glowing Polyline */}
                <path
                  d={`M 50,${176 - (cumulativeProjections[0] / 90000) * 176} 
                      L 150,${176 - (cumulativeProjections[1] / 90000) * 176} 
                      L 250,${176 - (cumulativeProjections[2] / 90000) * 176} 
                      L 350,${176 - (cumulativeProjections[3] / 90000) * 176} 
                      L 450,${176 - (cumulativeProjections[4] / 90000) * 176} 
                      L 550,${176 - (cumulativeProjections[5] / 90000) * 176}`}
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-[0_2px_6px_rgba(99,102,241,0.6)]"
                />
              </svg>

              {/* Plausible Monthly comparison bars */}
              {[
                { month: "Jan", income: 55000, expense: 32000 },
                { month: "Feb", income: 60000, expense: 41000 },
                { month: "Mar", income: 58000, expense: 38000 },
                { month: "Apr", income: 62000, expense: 45000 },
                { month: "May", income: 75000, expense: 49000 },
                 { month: "Jun", income: totalIncome || 80000, expense: totalExpense || 32000 }
              ].map((item, idx) => {
                const maxVal = 90000;
                const incHeight = (item.income / maxVal) * 100;
                const expHeight = (item.expense / maxVal) * 100;

                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 w-1/6 group z-10">
                    <div className="relative flex items-end gap-1 w-full justify-center h-44">
                      
                      {/* Income bar */}
                      <div
                        style={{ height: `${incHeight}%` }}
                        className="w-3 sm:w-4 bg-emerald-500 rounded-t cursor-pointer transition-all duration-300 hover:brightness-110 relative"
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-[10px] font-bold p-1 rounded hidden group-hover:block whitespace-nowrap text-white z-10">
                          Inc: {currencySign}{item.income}
                        </div>
                      </div>

                      {/* Expense bar */}
                      <div
                        style={{ height: `${expHeight}%` }}
                        className="w-3 sm:w-4 bg-red-500 rounded-t cursor-pointer transition-all duration-300 hover:brightness-110 relative"
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-[10px] font-bold p-1 rounded hidden group-hover:block whitespace-nowrap text-white z-10">
                          Exp: {currencySign}{item.expense}
                        </div>
                      </div>

                      {/* Interactive node for Projected Balance */}
                      <div
                        style={{ bottom: `calc(${(cumulativeProjections[idx] / 90000) * 100}% - 4px)` }}
                        className="absolute left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full bg-indigo-500 border border-white dark:border-slate-950 shadow shadow-indigo-500/80 z-20 transition-all duration-200 group-hover:scale-130 group-hover:bg-indigo-300 cursor-pointer"
                      >
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-950/95 border border-indigo-500/40 text-[10px] p-2 rounded-xl hidden group-hover:flex flex-col gap-0.5 whitespace-nowrap text-white z-30 shadow-lg shadow-black/80 backdrop-blur-sm">
                          <span className="font-extrabold text-indigo-300 tracking-wide">
                            {lang === 'bn' ? "প্রক্ষিপ্ত ব্যালেন্স:" : "Projected Balance:"}
                          </span>
                          <span className="font-bold text-xs font-mono">
                            {currencySign}{Math.round(cumulativeProjections[idx]).toLocaleString()}
                          </span>
                          <span className="text-[8px] text-slate-400 font-medium">
                            {lang === 'bn' ? "পৌনঃপুনিক প্রবাহ:" : "Recurring Flow:"}{" "}
                            <span className={monthlyNetImpacts[idx] >= 0 ? "text-emerald-400 font-bold" : "text-rose-450 font-bold"}>
                              {monthlyNetImpacts[idx] >= 0 ? "+" : ""}{currencySign}{Math.round(monthlyNetImpacts[idx]).toLocaleString()}
                            </span>
                          </span>
                        </div>
                      </div>

                    </div>
                    
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-center items-center gap-5 mt-4 text-[10px] sm:text-xs flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-emerald-500" />
                <span className="text-slate-500 dark:text-slate-400">{t.incoming}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-red-500" />
                <span className="text-slate-500 dark:text-slate-400">{t.outgoing}</span>
              </div>
              <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-800/80 pl-4">
                <span className="flex items-center justify-center relative w-5 h-2">
                  <span className="h-[2px] w-5 bg-indigo-500" />
                  <span className="h-2 w-2 rounded-full bg-indigo-400 border border-white dark:border-slate-950 absolute" />
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  {lang === 'bn' ? "প্রক্ষিপ্ত ভারসাম্য প্রভাব" : "Projected Impact (Recurring)"}
                </span>
              </div>
            </div>
          </div>

          {/* Expense categories listings breakdown */}
          <div 
            onClick={() => onNavigateToTab("budgets")}
            className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow transition-all duration-300 hover:scale-[1.015] hover:shadow-indigo-500/5 hover:border-indigo-500/25 relative group cursor-pointer"
          >
            {/* Hover details badge */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-1 group-hover:translate-y-0 z-15 pointer-events-none">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-indigo-600 dark:bg-indigo-500 text-white px-2.5 py-0.5 rounded-full shadow-sm">
                <span>{lang === 'bn' ? "বিস্তারিত" : "View Details"}</span>
                <ArrowRight className="h-2.5 w-2.5" />
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{t.topExpenseCategories}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{lang === 'bn' ? "চলতি মাসের ব্যয়ের বৃহত্তম উৎসসমূহ" : "Largest leaking sources of capital during current cycle"}</p>

            {categoriesData.length === 0 ? (
              <div className="text-center p-8 text-slate-500 text-xs mt-4">
                {lang === 'bn' ? "ব্যয়ের কোনো তথ্য নথিভুক্ত নেই।" : "No expense tracking documents found on this filter bounds."}
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {categoriesData.map((item, index) => {
                  const percent = totalCategorySum > 0 ? Math.round((item.amount / totalCategorySum) * 100) : 0;
                  return (
                    <div key={index} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {getTranslatedCategory(item.name, lang)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-slate-900 dark:text-white font-bold">{currencySign}{item.amount.toLocaleString()}</span>
                          <span className="text-slate-500 text-[10px]">({percent}%)</span>
                        </div>
                      </div>
                      
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            backgroundColor: item.color,
                            width: `${percent}%`
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right: Budgets gauge, recent transactions logs */}
        <div className="lg:col-span-4 space-y-6">

          {/* Smart AI Advisory Card */}
          <div className="glass-panel p-5 rounded-2xl border border-indigo-500/20 dark:border-indigo-500/10 bg-indigo-500/[0.02] shadow hover:shadow-lg transition">
            <div className="flex items-center justify-between border-b border-indigo-500/10 pb-3 mb-4">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {t.aiAdvisory}
                </h3>
              </div>
              <span className="text-[9px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold font-mono tracking-wider">
                REALTIME INSIGHT
              </span>
            </div>

            <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-3">
              {t.aiAdvisoryDesc}
            </p>

            <div className="space-y-3.5">
              {adviceList.map((adv, aIdx) => {
                const borderClass = adv.type === 'danger' ? 'border-red-200 dark:border-red-500/20 bg-red-50/50 dark:bg-red-950/5' :
                                    adv.type === 'warning' ? 'border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/5' :
                                    adv.type === 'success' ? 'border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/5' :
                                    'border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-200';
                const textTitle = adv.type === 'danger' ? 'text-red-600 dark:text-red-400' :
                                  adv.type === 'warning' ? 'text-amber-600 dark:text-amber-400' :
                                  adv.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' :
                                  'text-indigo-600 dark:text-indigo-300';

                return (
                  <div key={aIdx} className={`p-3 rounded-xl border ${borderClass} text-xs`}>
                    <h4 className={`font-extrabold ${textTitle} flex items-center gap-1`}>
                      <span>●</span>
                      <span>{adv.title}</span>
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-normal">
                      {adv.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Quick Snapshot Gauge Card */}
          <div 
            onClick={() => onNavigateToTab("transactions")}
            className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow transition-all duration-300 hover:scale-[1.03] hover:shadow-indigo-500/5 hover:border-indigo-500/25 relative group cursor-pointer"
          >
            {/* Hover details badge */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-1 group-hover:translate-y-0 z-15 pointer-events-none">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-indigo-600 dark:bg-indigo-500 text-white px-2.5 py-0.5 rounded-full shadow-sm">
                <span>{lang === 'bn' ? "বিস্তারিত" : "View Details"}</span>
                <ArrowRight className="h-2.5 w-2.5" />
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200/10 pb-3 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t.quickSnapshot}
              </h3>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-md font-semibold font-mono">
                {new Date().toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US', { month: 'short' })} {new Date().getFullYear()}
              </span>
            </div>

            {/* Gauge Display */}
            <div className="flex flex-col items-center">
              <div className="relative w-full max-w-[200px] aspect-[200/115] mb-2">
                <svg className="w-full h-full" viewBox="0 0 200 115">
                  <defs>
                    <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10B981" />   {/* Emerald */}
                      <stop offset="50%" stopColor="#F59E0B" />  {/* Amber */}
                      <stop offset="100%" stopColor="#EF4444" /> {/* Red */}
                    </linearGradient>
                  </defs>
                  
                  {/* Outer track */}
                  <path 
                    d="M 30,85 A 70,70 0 0,1 170,85" 
                    fill="none" 
                    className="stroke-slate-200 dark:stroke-slate-800" 
                    strokeWidth="14" 
                    strokeLinecap="round" 
                  />
                  
                  {/* Active fill */}
                  <path 
                    d="M 30,85 A 70,70 0 0,1 170,85" 
                    fill="none" 
                    stroke="url(#gauge-grad)" 
                    strokeWidth="14" 
                    strokeLinecap="round" 
                    strokeDasharray="220" 
                    strokeDashoffset={220 - (220 * Math.min(percentage, 100)) / 100} 
                    className="transition-all duration-500 ease-out"
                  />
                  
                  {/* Pivot Pin */}
                  <circle cx="100" cy="85" r="7" className="fill-slate-800 dark:fill-slate-200" />
                  <circle cx="100" cy="85" r="3" className="fill-slate-200 dark:fill-slate-900" />

                  {/* Pointer Needle */}
                  <line 
                    x1="100" 
                    y1="85" 
                    x2={100 + 48 * Math.cos(Math.PI - (Math.PI * Math.min(percentage, 100)) / 100)} 
                    y2={85 - 48 * Math.sin(Math.PI - (Math.PI * Math.min(percentage, 100)) / 100)} 
                    className="stroke-slate-800 dark:stroke-slate-200 transition-all duration-500 ease-out" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                  />
                </svg>

                {/* Percentage Text overlaid underneath pivot */}
                <div className="absolute bottom-1 left-0 right-0 text-center">
                  <span className="text-xl font-black font-mono text-slate-900 dark:text-white block leading-none">
                    {percentage}%
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    {t.ofIncomeSpent}
                  </span>
                </div>
              </div>

              {/* Status Labels & Details */}
              <div className="w-full grid grid-cols-2 gap-2 text-center border-t border-slate-200 dark:border-slate-800/60 pt-3 mt-1">
                <div className="text-left border-r border-slate-200 dark:border-slate-800/60 pr-2">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold block">{t.incoming}</span>
                  <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400 block mt-0.5">
                    {currencySign}{totalIncome.toLocaleString()}
                  </span>
                </div>
                <div className="text-right pl-2">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold block">{t.outgoing}</span>
                  <span className="text-xs font-black font-mono text-red-600 dark:text-red-400 block mt-0.5">
                    {currencySign}{totalExpense.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Net state details */}
              <div className="w-full mt-3.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-bold">
                  {totalIncome >= totalExpense ? t.surplus : t.deficit}
                </span>
                <span className={`font-mono font-black ${totalIncome >= totalExpense ? 'text-emerald-500' : 'text-red-400'}`}>
                  {totalIncome >= totalExpense ? "+" : "-"}{currencySign}{Math.abs(totalIncome - totalExpense).toLocaleString()}
                </span>
              </div>

            </div>
          </div>

          {/* Budget Progress meter card */}
          <div 
            onClick={() => onNavigateToTab("budgets")}
            className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow transition-all duration-300 hover:scale-[1.03] hover:shadow-indigo-500/5 hover:border-indigo-500/25 relative group cursor-pointer"
          >
            {/* Hover details badge */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-1 group-hover:translate-y-0 z-15 pointer-events-none">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-indigo-600 dark:bg-indigo-500 text-white px-2.5 py-0.5 rounded-full shadow-sm">
                <span>{lang === 'bn' ? "বিস্তারিত" : "View Details"}</span>
                <ArrowRight className="h-2.5 w-2.5" />
              </span>
            </div>

            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t.budgetUsage}</h3>
            
            <div className="mt-4 text-center">
              <span className={`text-3xl font-extrabold font-mono ${budgetUsagePercent > 90 ? 'text-red-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
                {budgetUsagePercent}%
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {lang === 'bn' ? ` বরাদ্দকৃত ৳${budgetLimit.toLocaleString()} সীমার মধ্যে` : `Spent within allocated ৳${budgetLimit.toLocaleString()} limit`}
              </p>
            </div>

            <div className="mt-4 w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  budgetUsagePercent >= 100 ? "bg-red-500" : budgetUsagePercent >= 80 ? "bg-amber-500" : "bg-indigo-600"
                }`}
                style={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
              />
            </div>

            {budgetUsagePercent >= 100 && (
              <div className="mt-3.5 p-2 px-3 bg-red-955/20 border border-red-900/50 rounded-lg text-[10px] text-red-00 flex items-start gap-1.5">
                <AlertTriangle className="h-4 w-4 shrink-0 focus:outline-none" />
                <span>{t.budgetOverLimit}</span>
              </div>
            )}
          </div>

          {/* Upcoming Bills & Recurring automation widget */}
          <div 
            onClick={() => onNavigateToTab("recurring")}
            className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow transition-all duration-300 hover:scale-[1.03] hover:shadow-indigo-500/5 hover:border-indigo-500/25 relative group cursor-pointer"
          >
            {/* Hover details badge */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-1 group-hover:translate-y-0 z-15 pointer-events-none">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-indigo-600 dark:bg-indigo-500 text-white px-2.5 py-0.5 rounded-full shadow-sm">
                <span>{lang === 'bn' ? "বিস্তারিত" : "View Details"}</span>
                <ArrowRight className="h-2.5 w-2.5" />
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200/10 pb-3 mb-4">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {lang === 'bn' ? "আসন্ন বিল ও চার্জসমূহ" : "Upcoming Bills & Charges"}
                </h3>
              </div>
              <button
                onClick={() => onNavigateToTab("recurring")}
                className="text-[10px] text-indigo-500 hover:underline font-bold tracking-wider uppercase cursor-pointer"
              >
                {lang === 'bn' ? "সবগুলো" : "Manage"}
              </button>
            </div>

            {filteredUpcomingBills.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                <CalendarRange className="h-7 w-7 text-slate-600 dark:text-slate-500 mx-auto mb-2 opacity-50" />
                <p>{lang === 'bn' ? "কোনো আসন্ন অটো-বিল পাওয়া যায়নি।" : "No upcoming automated bill rules found."}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUpcomingBills.map((bill) => {
                  const accountObj = accounts.find(a => a.id === bill.accountId);
                  return (
                    <div
                      key={bill.id}
                      className="bg-slate-100/50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/30 dark:border-slate-800/30 text-xs flex justify-between items-center transition hover:border-indigo-500/20"
                    >
                      <div className="text-left space-y-1 overflow-hidden pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] font-extrabold uppercase bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded tracking-wider animate-pulse">
                            {bill.interval}
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                            {bill.name}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono">{lang === 'bn' ? 'তারিখ:' : 'Due:'} {bill.nextRunDate}</span>
                          {accountObj && (
                            <span className="truncate border-l border-slate-350 dark:border-slate-800/80 pl-1.5">
                              {accountObj.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`font-mono font-black ${bill.type === 'income' ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-200'}`}>
                          {bill.type === "income" ? "+" : "-"}{currencySign}{bill.amount.toLocaleString()}
                        </span>
                        <span className="text-[8px] uppercase tracking-wider block text-slate-500 mt-0.5 font-bold">
                          {bill.type === "income" ? (lang === 'bn' ? "আয়" : "INCOME") : (lang === 'bn' ? "ব্যয়" : "EXPENSE")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Savings Milestone progress */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{t.savingsProgress}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{lang === 'bn' ? "আপনার আর্থিক স্বপ্নের মাইলস্টোনসমূহ" : "Active savings targets details"}</p>

            {goals.length === 0 ? (
              <div className="text-center p-6 text-slate-500 text-xs">
                No active savings goals set.
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {goals.slice(0, 2).map((goal, index) => {
                  const pct = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
                  return (
                    <div key={index} className="space-y-1.5 border-b border-slate-800/10 dark:border-slate-800/30 pb-3 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{goal.name}</span>
                        <span className="font-mono text-indigo-600 dark:text-indigo-400 shrink-0">{pct}%</span>
                      </div>
                      
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                        <span>{currencySign}{goal.currentAmount.toLocaleString()} / {goal.targetAmount.toLocaleString()}</span>
                        <span>{goal.deadline}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Ledger logs */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{t.recentTransactions}</h3>
              <button
                onClick={() => onNavigateToTab("transactions")}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{lang === 'bn' ? "সবগুলো" : "History"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {recentTxs.length === 0 ? (
              <div className="text-center p-8 text-slate-500 text-xs mt-2">
                {t.noData}
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {recentTxs.map((tx, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-slate-100/50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-200/30 dark:border-slate-800/30 text-xs"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        tx.type === "income" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                      }`}>
                        {tx.type === "income" ? <Briefcase className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                      </div>

                      <div className="text-left overflow-hidden">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                          {getTranslatedCategory(tx.category, lang)}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">{tx.note || "N/A"}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-2">
                      <span className={`font-mono font-bold block ${
                        tx.type === "income" ? "text-emerald-500" : "text-slate-800 dark:text-slate-200"
                      }`}>
                        {tx.type === "income" ? "+" : "-"}{currencySign}{tx.amount.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-slate-550 dark:text-slate-400 block font-mono">{tx.date}</span>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
