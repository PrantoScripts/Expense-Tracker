import React, { useState } from "react";
import { translations } from "../locales";
import { Plus, Trash2, Landmark, Smartphone, Wallet, CreditCard, PieChart, Info } from "lucide-react";

interface AccountsViewProps {
  accounts: any[];
  transactions: any[];
  lang: 'en' | 'bn';
  currency: string;
  onAddNewAccount: (name: string, type: 'cash' | 'bank' | 'mobile_banking' | 'credit_card', balance: number, color: string) => void;
  onDeleteAccount: (id: string) => void;
}

export function AccountsView({
  accounts,
  transactions,
  lang,
  currency,
  onAddNewAccount,
  onDeleteAccount
}: AccountsViewProps) {
  
  const t = translations[lang];

  // Forms states
  const [name, setName] = useState("");
  const [type, setType] = useState<'cash' | 'bank' | 'mobile_banking' | 'credit_card'>('cash');
  const [balance, setBalance] = useState("");
  const [color, setColor] = useState("#4F46E5");

  const currencySign = currency === "BDT" ? "৳" : "$";

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !balance) return;

    onAddNewAccount(name, type, Number(balance), color);

    // reset
    setName("");
    setBalance("");
    setType("cash");
    setColor("#4F46E5");
  };

  const getAccountIcon = (actType: string) => {
    switch (actType) {
      case "bank": return <Landmark className="h-5 w-5" />;
      case "mobile_banking": return <Smartphone className="h-5 w-5" />;
      case "credit_card": return <CreditCard className="h-5 w-5" />;
      default: return <Wallet className="h-5 w-5" />;
    }
  };

  const getAccountClassLabel = (actType: string) => {
    switch (actType) {
      case "bank": return t.typeBank;
      case "mobile_banking": return t.typeMobile;
      case "credit_card": return t.typeCredit;
      default: return t.typeCash;
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      
      {/* Title */}
      <div className="border-b border-slate-200/5 dark:border-slate-800/10 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-sans">{t.accountsTitle}</h1>
        <p className="text-xs text-slate-400">
          {lang === 'bn' ? "ক্যাশ, ব্যাংক এবং অন্যান্য মোবাইল ব্যাংকিং হিসাবের খাতা আলাদাভাবে পরিচালনা করুন।" : "Manage multi-accounts portfolios separately (Cash, SCB Cards, bKash, Prime Savings Accounts)."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Creator card */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 h-fit">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4 text-indigo-400" />
            <span>{t.addNewAccount}</span>
          </h3>

          <form onSubmit={handleAccountSubmit} className="space-y-4">
            
            <div>
              <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-1">
                {lang === 'bn' ? "অ্যাকাউন্টের নাম" : "Financial Portfolio Name"}
              </label>
              <input
                id="acc-name-input"
                type="text"
                required
                placeholder="SCB Credit Card, Cash..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white dark:bg-slate-950/45 border border-slate-300 dark:border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-1">
                {t.accountType}
              </label>
              <select
                id="acc-type-select"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-slate-950/45 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none cursor-pointer"
              >
                <option value="cash">{t.typeCash}</option>
                <option value="bank">{t.typeBank}</option>
                <option value="mobile_banking">{t.typeMobile}</option>
                <option value="credit_card">{t.typeCredit}</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-1">
                {lang === 'bn' ? "প্রারম্ভিক জমা / ব্যালেন্স" : "Initial Capital Asset Balance"}
              </label>
              <input
                id="acc-balance-input"
                type="number"
                required
                placeholder="25000"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full bg-white dark:bg-slate-950/45 border border-slate-300 dark:border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 font-mono outline-none"
              />
            </div>

            {/* Accent color box selector */}
            <div>
              <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-1">
                Accent Card Color
              </label>
              <div className="flex gap-2.5">
                {["#4F46E5", "#06B6D4", "#10B981", "#EC4899", "#F59E0B", "#64748B"].map((cHex) => (
                  <button
                    key={cHex}
                    type="button"
                    onClick={() => setColor(cHex)}
                    style={{ backgroundColor: cHex }}
                    className={`h-6 w-6 rounded-full border cursor-pointer outline-none transition ${
                      color === cHex ? "border-white ring-2 ring-indigo-500 scale-110" : "border-transparent"
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              id="acc-submit-btn"
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/10 cursor-pointer"
            >
              {t.add} Wallet
            </button>

          </form>
        </div>

        {/* Existing Accounts listing layout cards */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map((acc) => {
              // Calculate specific tx listings sum on this individual account
              const accTxs = transactions.filter(t => t.accountId === acc.id);
              const txCount = accTxs.length;

              return (
                <div
                  key={acc.id}
                  className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-950/15 relative overflow-hidden group hover:shadow-xl transition flex flex-col justify-between min-h-[160px]"
                >
                  {/* Card accent header bar line */}
                  <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: acc.color }} />

                  <div>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="h-9 w-9 rounded-xl flex items-center justify-center text-white"
                          style={{ backgroundColor: acc.color }}
                        >
                          {getAccountIcon(acc.type)}
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-normal">{acc.name}</h4>
                          <span className="text-[9px] text-slate-400 block font-semibold uppercase tracking-wider">
                            {getAccountClassLabel(acc.type)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteAccount(acc.id)}
                        className="p-1 px-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 hover:text-red-500 rounded text-slate-500 transition cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="mt-5 text-left">
                      <span className="text-[10px] text-slate-500 block uppercase tracking-wider">{t.balance}</span>
                      <span className="text-xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
                        {currencySign}{acc.balance.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/30 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      <span>{txCount} journals recorded</span>
                    </span>
                    <span className="font-bold underline cursor-pointer">Verify ledger</span>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}
