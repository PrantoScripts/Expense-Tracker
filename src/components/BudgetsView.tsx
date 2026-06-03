import React, { useState } from "react";
import { translations, getTranslatedCategory } from "../locales";
import { PieChart, Plus, Trash2, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";

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

    </div>
  );
}
