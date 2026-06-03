import React, { useState } from "react";
import { translations } from "../locales";
import { Settings, ShieldAlert, Cpu, Heart, Save, FileSpreadsheet, FileDown, Download } from "lucide-react";
import { exportTransactionsCSV, exportBudgetsCSV, exportGoalsCSV, exportFinancialReportPDF } from "../utils/exportUtils";

interface SettingsViewProps {
  user: any;
  lang: 'en' | 'bn';
  setLang: (lang: 'en' | 'bn') => void;
  currency: string;
  setCurrency: (currency: string) => void;
  theme: string;
  setTheme: (theme: string) => void;
  onUpdateUser: (updatedFields: any) => void;
  transactions?: any[];
  budgets?: any[];
  goals?: any[];
}

export function SettingsView({
  user,
  lang,
  setLang,
  currency,
  setCurrency,
  theme,
  setTheme,
  onUpdateUser,
  transactions = [],
  budgets = [],
  goals = []
}: SettingsViewProps) {
  
  const t = translations[lang];

  // Forms states
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [profilePhoto, setProfilePhoto] = useState(user.profilePhoto || "");
  const [timezone, setTimezone] = useState(user.timezone || "Asia/Dhaka");

  const [savingNotice, setSavingNotice] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNotice(null);

    onUpdateUser({
      name,
      phone,
      profilePhoto,
      timezone
    });

    setSavingNotice(lang === 'bn' ? "প্রোফাইল সফলভাবে আপডেট করা হয়েছে!" : "Profile successfully updated!");
    setTimeout(() => setSavingNotice(null), 3000);
  };

  return (
    <div className="space-y-6 text-left animate-fade-in font-sans max-w-4xl">
      
      {/* Title */}
      <div className="border-b border-slate-200/5 dark:border-slate-800/10 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-sans flex items-center gap-2">
          <Settings className="h-6 w-6 text-indigo-400" />
          <span>{t.settings}</span>
        </h1>
        <p className="text-xs text-slate-400">
          Adjust localization preferences, currencies metrics, timezone schedules, update avatars & reset password keys.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Localization & Themes panel */}
        <div className="md:col-span-1 space-y-4">
          
          {/* Box 1: Core Localization */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">System Preference</span>

            {/* Language toggle */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-350">{t.language}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="settings-lang-en-btn"
                  onClick={() => setLang('en')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    lang === 'en' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  English
                </button>
                <button
                  id="settings-lang-bn-btn"
                  type="button"
                  onClick={() => setLang('bn')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    lang === 'bn' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  বাংলা
                </button>
              </div>
            </div>

            {/* Currency switcher selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-350">{t.currency}</label>
              <select
                id="settings-currency-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-950/40 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none cursor-pointer"
              >
                <option value="BDT">BDT (৳) - BDT Currency</option>
                <option value="USD">USD ($) - US Dollars</option>
              </select>
            </div>

            {/* Theme picker */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-350">{t.theme}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTheme('light')}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    theme === 'light' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  ☀️ Light Mode
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    theme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  🌙 Dark Mode
                </button>
              </div>
            </div>

          </div>

          <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-[10px] text-slate-500 dark:text-slate-400 space-y-2">
            <span className="flex items-center gap-1 font-bold text-indigo-400">
              <Cpu className="h-4.5 w-4.5" />
              <span>Host Node System</span>
            </span>
            <p>SpendWise engine persists settings preferences dynamically in encrypted sandbox session vectors, protecting clients profiles.</p>
          </div>

        </div>

        {/* User profile details editor */}
        <div className="md:col-span-2 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">{t.profile} Details</span>

          {savingNotice && (
            <div className="p-2.5 px-3.5 bg-emerald-950/25 border border-emerald-900/60 text-xs text-emerald-400 rounded-xl mb-4">
              ✓ {savingNotice}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-350 mb-1">{t.fullName}</label>
                <input
                  id="settings-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950/45 border border-slate-300 dark:border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 font-sans">Email (System Fixed)</label>
                <input
                  id="settings-email-input"
                  type="email"
                  disabled
                  value={email}
                  className="w-full bg-slate-900/50 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-500 outline-none opacity-60"
                />
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-350 mb-1">Phone Number</label>
                <input
                  id="settings-phone-input"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+8801700000000"
                  className="w-full bg-white dark:bg-slate-950/45 border border-slate-300 dark:border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-350 mb-1">Timezone Location</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950/45 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                >
                  <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
                  <option value="Europe/London">Europe/London (GMT+0)</option>
                  <option value="America/New_York">America/New_York (GMT-5)</option>
                </select>
              </div>

            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-350 mb-1">Profile Avatar Photo URL</label>
              <input
                id="settings-photo-input"
                type="text"
                value={profilePhoto}
                onChange={(e) => setProfilePhoto(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-white dark:bg-slate-950/45 border border-slate-300 dark:border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white outline-none font-mono"
              />
              
              {profilePhoto && (
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={profilePhoto}
                    alt="Preview"
                    className="h-10 w-10 rounded-xl object-cover ring-2 ring-indigo-500/10"
                    onError={(e) => {
                      (e.target as any).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50";
                    }}
                  />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Live Avatar image Preview</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800/10 dark:border-slate-800/70 text-right">
              <button
                id="settings-save-btn"
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ml-auto cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>{lang === 'bn' ? "পরিবর্তনগুলো সংরক্ষণ করুন" : "Save Changes"}</span>
              </button>
            </div>

          </form>

        </div>

      </div>

      {/* Financial Export & Backups Center */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
        <div>
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Data backup & ledger portability</span>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <Download className="h-5 w-5 text-indigo-400 animate-bounce" />
            <span>{lang === 'bn' ? "ব্যক্তিগত ডাটা এক্সপোর্ট এবং ব্যাকআপ সার্ভিস" : "Personal Data Export & Backups Service"}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Download your total account history, budgets targets, and active savings progress in structured formats for tax audits, spreadsheets, offline backup, or safe ledger records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Transactions */}
          <div className="bg-slate-50 dark:bg-slate-950/25 border border-slate-205 dark:border-slate-800/85 p-4 rounded-xl flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Ledger History</span>
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 mt-1">{lang === 'bn' ? "লেনদেনের তালিকা (CSV)" : "Transactions (CSV)"}</h3>
              <p className="text-[10px] text-slate-400 mt-1">
                {lang === 'bn' ? `মোট ${transactions.length}টি লেনদেন রয়েছে` : `Archive of ${transactions.length} ledger logs`}
              </p>
            </div>
            <div>
              <button
                id="export-tx-csv-btn"
                onClick={() => exportTransactionsCSV(transactions, lang)}
                className="w-full py-2 px-2.5 bg-slate-900 hover:bg-slate-850 dark:bg-slate-950/55 dark:hover:bg-slate-900 text-[10px] font-bold rounded-lg text-slate-350 dark:text-slate-300 border border-slate-250 dark:border-slate-850 flex items-center justify-center gap-1.5 cursor-pointer transition"
                title="Download CSV"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
                <span>EXPORT CSV</span>
              </button>
            </div>
          </div>

          {/* Card 2: Budgets */}
          <div className="bg-slate-50 dark:bg-slate-950/25 border border-slate-205 dark:border-slate-800/85 p-4 rounded-xl flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Limits & Targets</span>
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 mt-1">{lang === 'bn' ? "বাজেট প্ল্যান তালিকা (CSV)" : "Expense Budgets (CSV)"}</h3>
              <p className="text-[10px] text-slate-400 mt-1">
                {lang === 'bn' ? `মোট ${budgets.length}টি বাজেট রয়েছে` : `Contains ${budgets.length} active allocation structures`}
              </p>
            </div>
            <div>
              <button
                id="export-bg-csv-btn"
                onClick={() => exportBudgetsCSV(budgets, lang)}
                className="w-full py-2 px-2.5 bg-slate-900 hover:bg-slate-850 dark:bg-slate-950/55 dark:hover:bg-slate-900 text-[10px] font-bold rounded-lg text-slate-350 dark:text-slate-300 border border-slate-250 dark:border-slate-850 flex items-center justify-center gap-1.5 cursor-pointer transition"
                title="Download CSV"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
                <span>EXPORT CSV</span>
              </button>
            </div>
          </div>

          {/* Card 3: Goals */}
          <div className="bg-slate-50 dark:bg-slate-950/25 border border-slate-205 dark:border-slate-800/85 p-4 rounded-xl flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono font-bold">Investments</span>
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 mt-1">{lang === 'bn' ? "সঞ্চয় লক্ষ্যসমূহ (CSV)" : "Savings Goals (CSV)"}</h3>
              <p className="text-[10px] text-slate-400 mt-1">
                {lang === 'bn' ? `মোট ${goals.length}টি লক্ষ্য রয়েছে` : `Tracking ${goals.length} target investment goals`}
              </p>
            </div>
            <div>
              <button
                id="export-goals-csv-btn"
                onClick={() => exportGoalsCSV(goals, lang)}
                className="w-full py-2 px-2.5 bg-slate-900 hover:bg-slate-850 dark:bg-slate-950/55 dark:hover:bg-slate-900 text-[10px] font-bold rounded-lg text-slate-350 dark:text-slate-300 border border-slate-250 dark:border-slate-850 flex items-center justify-center gap-1.5 cursor-pointer transition"
                title="Download CSV"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
                <span>EXPORT CSV</span>
              </button>
            </div>
          </div>

          {/* Card 4: Detailed PDF Audit Report */}
          <div className="bg-indigo-500/5 border border-indigo-500/10 dark:border-indigo-500/20 p-4 rounded-xl flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block font-mono">Audit Statement</span>
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 mt-1">{lang === 'bn' ? "পূর্ণাঙ্গ পিডিএফ রিপোর্ট" : "Complete Financial PDF"}</h3>
              <p className="text-[10px] text-slate-400 mt-1">
                {lang === 'bn' ? "সারসংক্ষেপ সহ রঙিন পিডিএফ বিবরণী" : "Generates formal portfolio with summary metrics analysis"}
              </p>
            </div>
            <div>
              <button
                id="export-pdf-report-btn"
                onClick={() => exportFinancialReportPDF(user, transactions, budgets, goals, currency, lang)}
                className="w-full py-2 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold text-white rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition shadow-sm"
                title="Download PDF"
              >
                <FileDown className="h-3.5 w-3.5 text-indigo-100" />
                <span>PDF REPORT</span>
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
