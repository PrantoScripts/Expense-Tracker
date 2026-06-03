import React, { useState } from "react";
import { translations, getTranslatedCategory } from "../locales";
import { PieChart, Plus, Trash2, AlertTriangle, ShieldCheck, HelpCircle, Sparkles, TrendingUp, CheckCircle, RefreshCw, Star } from "lucide-react";

interface BudgetsViewProps {
  budgets: any[];
  transactions: any[];
  lang: 'en' | 'bn';
  currency: string;
  onCreateBudget: (category: string, amount: number, type: 'monthly' | 'category', alertThreshold: number) => void;
  onDeleteBudget: (id: string) => void;
}

export function BudgetsView({
  budgets,
  transactions,
  lang,
  currency,
  onCreateBudget,
  onDeleteBudget
}: BudgetsViewProps) {
  
  const t = translations[lang];

  // Forms states
  const [category, setCategory] = useState("all");
  const [amount, setAmount] = useState("");
  const [alertThreshold, setAlertThreshold] = useState("80");
  const [budgetType, setBudgetType] = useState<'monthly' | 'category'>('monthly');

  const currencySign = currency === "BDT" ? "৳" : "$";

  // AI Insights Recommendation System
  const [applyingId, setApplyingId] = useState<string | null>(null);

  // 1. Group all expense transactions by Year-Month & Category
  const monthlyCategorySpend: { [month: string]: { [category: string]: number } } = {};
  const allMonthsSet = new Set<string>();
  const allCategoriesWithExpenses = new Set<string>();

  transactions.forEach((tx) => {
    if (tx.type !== "expense") return;
    const month = tx.date.substring(0, 7); // "YYYY-MM"
    allMonthsSet.add(month);
    
    // Normalize category
    const catName = tx.category.trim();
    allCategoriesWithExpenses.add(catName);
    
    if (!monthlyCategorySpend[month]) {
      monthlyCategorySpend[month] = {};
    }
    if (!monthlyCategorySpend[month][catName]) {
      monthlyCategorySpend[month][catName] = 0;
    }
    monthlyCategorySpend[month][catName] += Number(tx.amount) || 0;
  });

  const sortedMonths = Array.from(allMonthsSet).sort();

  interface AIRecommendation {
    category: string;
    hasBudget: boolean;
    currentLimit: number;
    budgetId?: string;
    averageSpend: number;
    maxSpend: number;
    violationMonthsCount: number;
    totalMonthsCount: number;
    suggestedCap: number;
    reasonEn: string;
    reasonBn: string;
  }

  const aiRecommendations: AIRecommendation[] = [];

  allCategoriesWithExpenses.forEach((cat) => {
    // Find matching budget (case-insensitive)
    const existingBudget = budgets.find(
      (b) => b.category !== "all" && b.category.toLowerCase() === cat.toLowerCase()
    );

    let totalSpend = 0;
    let monthsCount = 0;
    let maxSpend = 0;
    let violationMonthsCount = 0;

    sortedMonths.forEach((month) => {
      const spend = monthlyCategorySpend[month][cat] || 0;
      if (spend > 0) {
        monthsCount++;
        totalSpend += spend;
        if (spend > maxSpend) {
          maxSpend = spend;
        }
        if (existingBudget && spend > existingBudget.amount) {
          violationMonthsCount++;
        }
      }
    });

    const averageSpend = monthsCount > 0 ? totalSpend / monthsCount : 0;

    if (existingBudget) {
      // Exceeds if we have violations or if we are consistently spent close to limit (> 90% average)
      const isExceeding = violationMonthsCount > 0 || averageSpend > existingBudget.amount * 0.9;
      if (isExceeding) {
        const step = currency === "BDT" ? 500 : 10;
        const rawSuggestion = Math.max(existingBudget.amount * 1.15, averageSpend * 1.05);
        const suggestedCap = Math.round(rawSuggestion / step) * step;

        const reasonEn = `Consistent overspending: Exceeded your budget limit (${currencySign}${existingBudget.amount.toLocaleString()}) in ${violationMonthsCount} of ${monthsCount} month(s). Your actual average monthly spend here is ${currencySign}${Math.round(averageSpend).toLocaleString()}. We suggest a sustainable safety cap of ${currencySign}${suggestedCap.toLocaleString()} to match your actual consumption.`;
        
        const reasonBn = `ক্রমাগত অতিরিক্ত ব্যয়: আপনার বাজেটের সীমা (${currencySign}${existingBudget.amount.toLocaleString()}) বিগত ${monthsCount} মাসের মধ্যে ${violationMonthsCount} বার ভেঙেছে। আপনার প্রকৃত গড় খরচ হলো ${currencySign}${Math.round(averageSpend).toLocaleString()}। আমরা একটি বাস্তবসম্মত নিরাপত্তা সীমা ${currencySign}${suggestedCap.toLocaleString()} নির্ধারণের পরামর্শ দিচ্ছি।`;

        aiRecommendations.push({
          category: cat,
          hasBudget: true,
          currentLimit: existingBudget.amount,
          budgetId: existingBudget.id,
          averageSpend,
          maxSpend,
          violationMonthsCount,
          totalMonthsCount: monthsCount,
          suggestedCap,
          reasonEn,
          reasonBn
        });
      }
    } else {
      // No budget limit set, check for large unbudgeted transactions
      const notableSpendingThreshold = currency === "BDT" ? 1500 : 25;
      if (averageSpend > notableSpendingThreshold) {
        const step = currency === "BDT" ? 500 : 10;
        const rawSuggestion = averageSpend * 0.9; // Target a 10% saving cap
        const suggestedCap = Math.round(rawSuggestion / step) * step;

        const reasonEn = `Unmanaged leak: You spend an average of ${currencySign}${Math.round(averageSpend).toLocaleString()} per month under this category with no budget limit set. Setting a defensive budget limit at ${currencySign}${suggestedCap.toLocaleString()} can help you prevent impulsive leakages!`;
        
        const reasonBn = `অনিয়ন্ত্রিত খাতে ব্যয়: এই ক্যাটাগরিতে কোনো বাজেট সীমা সেট করা নেই, কিন্তু আপনার মাসে গড় ব্যয় প্রায় ${currencySign}${Math.round(averageSpend).toLocaleString()}। এই খাতে একটি প্রতিরোধক বাজেট ক্যাপ ${currencySign}${suggestedCap.toLocaleString()} সেট করা হলে আপনার অযাচিত ব্যয় অনেকাংশে কমে যাবে!`;

        aiRecommendations.push({
          category: cat,
          hasBudget: false,
          currentLimit: 0,
          averageSpend,
          maxSpend,
          violationMonthsCount: 0,
          totalMonthsCount: monthsCount,
          suggestedCap,
          reasonEn,
          reasonBn
        });
      }
    }
  });

  // Sort: show budgeted exceeding ones first, then unbudgeted by average spending
  aiRecommendations.sort((a, b) => {
    if (a.hasBudget && !b.hasBudget) return -1;
    if (!a.hasBudget && b.hasBudget) return 1;
    return b.averageSpend - a.averageSpend;
  });

  const handleApplyCap = async (rec: any) => {
    setApplyingId(rec.category);
    try {
      if (rec.hasBudget && rec.budgetId) {
        // Delete the old budget
        onDeleteBudget(rec.budgetId);
      }
      // Create/Apply new budget cap
      onCreateBudget(rec.category, rec.suggestedCap, "category", 85);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        setApplyingId(null);
      }, 700);
    }
  };

  // Active current month string YYYY-MM
  const currentMonthStr = new Date().toISOString().substring(0, 7);

  // Cumulative expenses in active month
  const currentMonthExpenses = transactions.filter(
    tx => tx.type === "expense" && tx.date.substring(0, 7) === currentMonthStr
  );

  const parsedBudgetsList = budgets.map(b => {
    let spent = 0;
    if (b.category === "all") {
      // Spent on all fields combined
      spent = currentMonthExpenses.reduce((sum, tx) => sum + tx.amount, 0);
    } else {
      // Spent specifically under this category
      spent = currentMonthExpenses
        .filter(tx => tx.category.toLowerCase() === b.category.toLowerCase())
        .reduce((sum, tx) => sum + tx.amount, 0);
    }

    const ratio = b.amount > 0 ? (spent / b.amount) * 100 : 0;
    const remaining = b.amount - spent;

    return {
      ...b,
      spent,
      ratio: Math.min(Math.round(ratio), 200),
      remaining
    };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    onCreateBudget(
      category,
      Number(amount),
      budgetType,
      Number(alertThreshold)
    );

    // reset fields
    setAmount("");
    setCategory("all");
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Title block */}
      <div className="border-b border-slate-200/5 dark:border-slate-800/10 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-sans">{t.budgetsTitle}</h1>
        <p className="text-xs text-slate-400">
          {lang === 'bn' ? "বাজেটের অতিরিক্ত ব্যয় প্রতিরোধ করতে ক্যাটাগরি অনুসারে সীমা বেঁধে দিন।" : "Establish financial constraints to lock leakages, evaluate alerts & track leftovers."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Budget creator panel */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 h-fit">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4 text-indigo-400" />
            <span>{t.createBudget}</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Scope type */}
            <div>
              <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-1">
                {lang === 'bn' ? "বাজেটের ধরন" : "Budget Target Class"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setBudgetType('monthly');
                    setCategory('all');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition ${
                    budgetType === 'monthly' ? "bg-indigo-600 text-white" : "bg-slate-950/40 text-slate-300 border border-slate-800"
                  }`}
                >
                  {lang === 'bn' ? "সামগ্রিক মাসিক" : "All (Global)"}
                </button>
                <button
                  type="button"
                  onClick={() => setBudgetType('category')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition ${
                    budgetType === 'category' ? "bg-indigo-600 text-white" : "bg-slate-950/40 text-slate-300 border border-slate-800"
                  }`}
                >
                  {lang === 'bn' ? "ক্যাটাগরি নির্দিষ্ট" : "Category Selective"}
                </button>
              </div>
            </div>

            {/* Category selection */}
            {budgetType === 'category' && (
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-1">
                  {t.budgetCategory}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950/40 border border-slate-350 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value="Food">{getTranslatedCategory("Food", lang)}</option>
                  <option value="Transport">{getTranslatedCategory("Transport", lang)}</option>
                  <option value="Shopping">{getTranslatedCategory("Shopping", lang)}</option>
                  <option value="Education">{getTranslatedCategory("Education", lang)}</option>
                  <option value="Healthcare">{getTranslatedCategory("Healthcare", lang)}</option>
                  <option value="Entertainment">{getTranslatedCategory("Entertainment", lang)}</option>
                  <option value="Bills">{getTranslatedCategory("Bills", lang)}</option>
                  <option value="Rent">{getTranslatedCategory("Rent", lang)}</option>
                  <option value="Travel">{getTranslatedCategory("Travel", lang)}</option>
                  <option value="Others">{getTranslatedCategory("Others", lang)}</option>
                </select>
              </div>
            )}

            {/* Limit Input */}
            <div>
              <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-1">
                {t.budgetAmount}
              </label>
              <input
                id="budget-amount-input"
                type="number"
                required
                placeholder="25000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white border border-slate-300 dark:bg-slate-950/40 dark:border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 font-mono outline-none"
              />
            </div>

            {/* Threshold toggle indicator scale */}
            <div>
              <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-1">
                {t.budgetAlertThreshold}
              </label>
              <select
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(e.target.value)}
                className="w-full bg-white border border-slate-300 dark:bg-slate-950/40 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value="50">50% {lang === 'bn' ? "(সবচেয়ে সতর্ক)" : "(Paranoia Watch)"}</option>
                <option value="85">85% {lang === 'bn' ? "(প্রস্তাবিত)" : "(Standard Standard)"}</option>
                <option value="100">100% {lang === 'bn' ? "(সীমা শেষ)" : "(Absolute Limit)"}</option>
              </select>
            </div>

            <button
              id="budget-submit-btn"
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/10 cursor-pointer"
            >
              {t.add} {t.dashboard}
            </button>

          </form>
        </div>

        {/* Existing budget progress pools columns */}
        <div className="lg:col-span-2 space-y-4">
          
          {parsedBudgetsList.length === 0 ? (
            <div className="glass-panel p-12 text-center text-slate-500 rounded-2xl text-xs bg-slate-900/10 border border-slate-800/50">
              <HelpCircle className="h-8 w-8 mx-auto mb-2 text-slate-600" />
              <p>No budget guidelines found for this month context.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parsedBudgetsList.map((bg) => {
                const overTrack = bg.ratio >= 100;
                const warnTrack = bg.ratio >= bg.alertThreshold && bg.ratio < 100;

                return (
                  <div
                    key={bg.id}
                    className={`glass-panel p-5 rounded-2xl border transition hover:shadow-lg flex flex-col justify-between ${
                      overTrack
                        ? "border-red-900/30 bg-red-950/5 shadow-md shadow-red-950/5"
                        : warnTrack
                        ? "border-amber-900/30 bg-amber-950/5"
                        : "border-slate-200 dark:border-slate-800 bg-slate-950/10"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                            bg.category === 'all' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-cyan-500/10 text-cyan-400'
                          }`}>
                            {bg.category === 'all' ? 'All categories' : 'Category target'}
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1 leading-normal">
                            {bg.category === 'all' ? (lang === 'bn' ? "সামগ্রিক মাসিক ব্যয় সীমা" : "Total Wallet Spending Limit") : getTranslatedCategory(bg.category, lang)}
                          </h4>
                        </div>

                        <button
                          id={`delete-budget-${bg.id}`}
                          onClick={() => onDeleteBudget(bg.id)}
                          className="p-1 rounded text-slate-500 hover:text-red-500 hover:bg-slate-800/10 transition cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="mt-4 flex justify-between items-end">
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase tracking-wider">{lang === 'bn' ? "ব্যয়" : "Spent"}</span>
                          <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-200">
                            {currencySign}{bg.spent.toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block uppercase tracking-wider">{t.budgetAmount}</span>
                          <span className="text-sm font-bold font-mono text-slate-400">
                            {currencySign}{bg.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Display progress bars */}
                      <div className="mt-3.5 w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            overTrack ? "bg-red-500 animate-pulse" : warnTrack ? "bg-amber-500" : "bg-indigo-600"
                          }`}
                          style={{ width: `${Math.min(bg.ratio, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/30 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400 font-mono">
                        {bg.remaining >= 0 ? `${t.budgetRemaining}: +${currencySign}${bg.remaining}` : `Deficit: -${currencySign}${Math.abs(bg.remaining)}`}
                      </span>
                      
                      <span className={`font-bold uppercase tracking-wider ${
                        overTrack ? "text-red-500" : warnTrack ? "text-amber-500" : "text-emerald-500"
                      }`}>
                        {bg.ratio}%
                      </span>
                    </div>

                    {overTrack && (
                      <div className="mt-3 p-2 bg-red-950/20 border border-red-900/50 rounded-lg text-[10px] text-red-400 flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>{t.budgetOverLimit}</span>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* AI Insights & Optimization Recommendations section */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/10 dark:border-indigo-500/10 bg-indigo-500/[0.015] shadow-sm relative overflow-hidden mt-6">
        
        {/* Sparkle background glow effect */}
        <div className="absolute -right-24 -top-24 w-48 h-48 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/50 dark:border-slate-800/40 pb-4 mb-5 relative z-10">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500 dark:text-indigo-400 animate-pulse" />
              <span>{lang === "bn" ? "এআই বাজেট বিশ্লেষণ ও সঞ্চয় সুপারিশ" : "AI Budget Insights & Cap Optimizations"}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {lang === "bn" ? "আপনার লেনদেনের ইতিহাস ও কাজের গতি বিশ্লেষণ করে সিস্টেম স্বয়ংক্রিয়ভাবে অনুকূল সীমাগুলির প্রস্তাব করে।" : "Our intelligence engine scans your ledger to detect categories that consistently breach allocations, recommending optimized limits."}
            </p>
          </div>
          <div className="mt-2 sm:mt-0">
            <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-indigo-500/10">
              <Star className="h-2.5 w-2.5 fill-current" />
              <span>{lang === 'bn' ? "স্মার্ট বিশ্লেষণ" : "Predictive Pulse"}</span>
            </span>
          </div>
        </div>

        {aiRecommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-xl">
            <CheckCircle className="h-8 w-8 text-emerald-500 mb-2.5" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {lang === 'bn' ? "আপনার বাজেট সীমা সম্পূর্ণরূপে অপ্টিমাইজড!" : "High Financial Discipline Confirmed!"}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              {lang === 'bn' 
                ? "সব বাজেট সীমা চমৎকারভাবে অপ্টিমাইজড! আপনার প্রকৃত মাসিক ব্যয় বাজেটের অধীনে রয়েছে ও কোনো সীমা ভাঙেনি।" 
                : "All existing expense targets are perfectly balanced. Actual spending is well within parameters with zero runaway leaks detected!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {aiRecommendations.map((rec) => {
              const isApplying = applyingId === rec.category;
              return (
                <div 
                  key={rec.category}
                  className="bg-white/40 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-300 group"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        {/* Status Pills */}
                        <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                          rec.hasBudget 
                            ? "bg-rose-500/10 text-rose-500 border border-rose-500/15" 
                            : "bg-amber-500/10 text-amber-500 border border-amber-500/15"
                        }`}>
                          {rec.hasBudget 
                            ? (lang === 'bn' ? "বাজেট সীমা ভঙ্গ" : "Exceeding Set Cap") 
                            : (lang === 'bn' ? "অসংরক্ষিত ব্যয় খাত" : "Unbudgeted Area")
                          }
                        </span>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-1.5 flex items-center gap-1.5 font-sans">
                          <span>{getTranslatedCategory(rec.category, lang)}</span>
                        </h4>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 uppercase block tracking-wider">{lang === 'bn' ? "প্রস্তাবিত বাজেট" : "Suggested Cap"}</span>
                        <span className="text-sm font-black text-indigo-500 font-mono">
                          {currencySign}{rec.suggestedCap.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal mb-4">
                      {lang === 'bn' ? rec.reasonBn : rec.reasonEn}
                    </p>

                    {/* Meta stats micro dashboard */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-100/55 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800/40 rounded-lg text-center text-[10px] font-mono text-slate-500 mb-4.5">
                      <div>
                        <span className="block text-[8px] text-slate-450 uppercase mb-0.5">{lang === 'bn' ? "পূর্ববর্তী সীমা" : "Set Limit"}</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {rec.hasBudget ? `${currencySign}${rec.currentLimit.toLocaleString()}` : "None"}
                        </span>
                      </div>
                      <div className="border-x border-slate-200/50 dark:border-slate-800/50">
                        <span className="block text-[8px] text-slate-450 uppercase mb-0.5">{lang === 'bn' ? "গড় মাসিক ব্যয়" : "Avg Month Spend"}</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {currencySign}{Math.round(rec.averageSpend).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-slate-450 uppercase mb-0.5">{lang === 'bn' ? "সর্বোচ্চ ব্যয়" : "Peak Month Spend"}</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {currencySign}{Math.round(rec.maxSpend).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleApplyCap(rec)}
                    disabled={isApplying}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                      isApplying
                        ? "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"
                        : rec.hasBudget
                        ? "bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white hover:border-indigo-600 dark:hover:border-indigo-600"
                        : "bg-indigo-600/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-450 hover:bg-indigo-600 hover:text-white dark:hover:text-white"
                    }`}
                  >
                    {isApplying ? (
                      <>
                        <RefreshCw className="h-3 w-3 animate-spin text-indigo-500" />
                        <span>{lang === "bn" ? "সেট করা হচ্ছে..." : "Applying Cap..."}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3.5 w-3.5 shrink-0 opacity-80" />
                        <span>
                          {rec.hasBudget 
                            ? (lang === 'bn' ? `লিমিট সমন্বয় করতে চাপুন` : `Adjust Limit to ${currencySign}${rec.suggestedCap.toLocaleString()}`) 
                            : (lang === 'bn' ? `নতুন বাজেট সেট করতে চাপুন` : `Establish Cap at ${currencySign}${rec.suggestedCap.toLocaleString()}`)
                          }
                        </span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
