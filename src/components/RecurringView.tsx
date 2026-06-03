import React, { useState } from "react";
import { translations, getTranslatedCategory } from "../locales";
import { Plus, Trash2, Clock, CalendarRange, Landmark, ShieldCheck, HelpCircle } from "lucide-react";

interface RecurringViewProps {
  recurringRules: any[];
  accounts: any[];
  lang: 'en' | 'bn';
  currency: string;
  onAddRecurringRule: (name: string, type: 'income' | 'expense', amount: number, category: string, interval: 'daily' | 'weekly' | 'monthly' | 'yearly', accountId: string, nextRunDate: string) => void;
  onDeleteRecurringRule: (id: string) => void;
}

export function RecurringView({
  recurringRules,
  accounts,
  lang,
  currency,
  onAddRecurringRule,
  onDeleteRecurringRule
}: RecurringViewProps) {
  
  const t = translations[lang];

  // Forms states
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState("Bills");
  const [interval, setInterval] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [accountId, setAccountId] = useState("");
  const [nextRunDate, setNextRunDate] = useState("");

  const currencySign = currency === "BDT" ? "৳" : "$";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !accountId || !nextRunDate) return;

    onAddRecurringRule(
      name,
      txType,
      Number(amount),
      category,
      interval,
      accountId,
      nextRunDate
    );

    // reset fields
    setName("");
    setAmount("");
    setAccountId("");
    setNextRunDate("");
  };

  return (
    <div className="space-y-6 text-left animate-fade-in font-sans">
      
      {/* Title */}
      <div className="border-b border-slate-200/5 dark:border-slate-800/10 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-sans flex items-center gap-2">
          <Clock className="h-6 w-6 text-indigo-400" />
          <span>{lang === 'bn' ? "পুনরাবৃত্তিমূলক লেনদেন" : "Recurring Ledger Automation"}</span>
        </h1>
        <p className="text-xs text-slate-400">
          Setup automated rules for monthly salaries, subscriptions, electric bills, credit cards contributions, or weekly payouts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Creator panel */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 h-fit">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4 text-indigo-400" />
            <span>Create Automation Rule</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-1">
                Rule Name
              </label>
              <input
                id="rec-name-input"
                type="text"
                required
                placeholder="Spotify Premium, Netlink Wifi..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white dark:bg-slate-950/45 border border-slate-300 dark:border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-1">
                  Type
                </label>
                <select
                  value={txType}
                  onChange={(e) => setTxType(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-950/45 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
                >
                  <option value="expense">{t.outgoing}</option>
                  <option value="income">{t.incoming}</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-1">
                  {t.amount}
                </label>
                <input
                  id="rec-amount-input"
                  type="number"
                  required
                  placeholder="300"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950/45 border border-slate-300 dark:border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 font-mono outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-1">
                  Periodicity
                </label>
                <select
                  value={interval}
                  onChange={(e) => setInterval(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-950/45 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950/45 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
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
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-1">
                Charge Account
              </label>
              <select
                required
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full bg-white dark:bg-slate-950/45 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
              >
                <option value="">Select Account</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name} ({currencySign}{acc.balance.toLocaleString()})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-1">
                Start Next Date
              </label>
              <input
                id="rec-nextdate-input"
                type="date"
                required
                value={nextRunDate}
                onChange={(e) => setNextRunDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-950/45 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none"
              />
            </div>

            <button
              id="rec-submit-btn"
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/10 cursor-pointer"
            >
              Add Subscription Automation
            </button>

          </form>
        </div>

        {/* Rules tables lists widgets */}
        <div className="lg:col-span-2 space-y-4">
          
          {recurringRules.length === 0 ? (
            <div className="glass-panel p-12 text-center text-slate-500 rounded-2xl text-xs">
              <CalendarRange className="h-8 w-8 text-slate-700 mx-auto mb-2" />
              <p>No active automated recurring billing policies pre-configured.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recurringRules.map((rule) => {
                const accountObj = accounts.find(a => a.id === rule.accountId);

                return (
                  <div
                    key={rule.id}
                    className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950/20 hover:shadow-lg transition flex flex-col justify-between min-h-[145px]"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                            {rule.interval} Cycle
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1 leading-normal line-clamp-1">{rule.name}</h4>
                        </div>

                        <button
                          onClick={() => onDeleteRecurringRule(rule.id)}
                          className="p-1 rounded text-slate-500 hover:text-red-500 hover:bg-slate-800/10 transition cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="mt-3.5 flex justify-between items-end">
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-bold">Charge</span>
                          <span className={`text-base font-extrabold font-mono ${rule.type === 'income' ? 'text-emerald-500' : 'text-slate-900 dark:text-slate-200'}`}>
                            {rule.type === "income" ? "+" : "-"}{currencySign}{rule.amount.toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="text-right">
                          <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-bold">Charge Account</span>
                          <span className="text-xs font-bold text-slate-400">
                            {accountObj ? accountObj.name : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/30 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Next charge: <span className="font-mono font-bold text-slate-400">{rule.nextRunDate}</span></span>
                      <span className="font-extrabold uppercase text-[10px] text-indigo-500 tracking-wider">Active Policy</span>
                    </div>

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
