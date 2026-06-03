import React, { useState, useMemo } from "react";
import { translations, getTranslatedCategory } from "../locales";
import {
  Search,
  Filter,
  Download,
  Calendar,
  CreditCard,
  Briefcase,
  Trash2,
  Edit2,
  Plus,
  Table,
  ArrowUpDown,
  FileSpreadsheet,
  FileJson,
  Printer
} from "lucide-react";

interface TransactionsViewProps {
  transactions: any[];
  accounts: any[];
  lang: 'en' | 'bn';
  currency: string;
  onAddTransactionClick: () => void;
  onEditTransactionClick: (tx: any) => void;
  onDeleteTransactionClick: (txId: string) => void;
}

export function TransactionsView({
  transactions,
  accounts,
  lang,
  currency,
  onAddTransactionClick,
  onEditTransactionClick,
  onDeleteTransactionClick
}: TransactionsViewProps) {
  
  const t = translations[lang];

  // Filtering + Listing states
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Calendar Click Modal state
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  const currencySign = currency === "BDT" ? "৳" : "$";

  // Categories list collected for dropdown filter
  const categoriesList = useMemo(() => {
    const list = new Set<string>();
    transactions.forEach(t => {
      if (t.category) list.add(t.category);
    });
    return Array.from(list);
  }, [transactions]);

  // Apply full filters on client side
  const filteredTxs = useMemo(() => {
    return transactions.filter(tx => {
      // Search text query
      const textMatches =
        tx.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.note?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Type
      const typeMatches = typeFilter === "all" || tx.type === typeFilter;

      // Category
      const categoryMatches = categoryFilter === "all" || tx.category.toLowerCase() === categoryFilter.toLowerCase();

      // Dates
      const dateFromMatches = !fromDate || tx.date >= fromDate;
      const dateToMatches = !toDate || tx.date <= toDate;

      // Amounts
      const minAmountMatches = !minAmount || tx.amount >= Number(minAmount);
      const maxAmountMatches = !maxAmount || tx.amount <= Number(maxAmount);

      return textMatches && typeMatches && categoryMatches && dateFromMatches && dateToMatches && minAmountMatches && maxAmountMatches;
    }).sort((a,b) => {
      if (sortBy === "date-desc") return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "date-asc") return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === "amount-desc") return b.amount - a.amount;
      if (sortBy === "amount-asc") return a.amount - b.amount;
      return 0;
    });
  }, [transactions, searchQuery, typeFilter, categoryFilter, fromDate, toDate, minAmount, maxAmount, sortBy]);

  // Calendar generation logic for current month
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth()); // 0-based

  const calendarDays = useMemo(() => {
    // Total days in calendarMonth
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    // Week day index of first day of month (0 = Sun, 1 = Mon...)
    const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay();

    const days = [];
    // Prepend empty slots for alignment
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      // Collect transactions on this date
      const dateTxs = transactions.filter(tx => tx.date === dayStr);
      days.push({
        dayNum: d,
        dateStr: dayStr,
        txs: dateTxs
      });
    }

    return days;
  }, [calendarYear, calendarMonth, transactions]);

  const changeMonth = (val: number) => {
    let nextMonth = calendarMonth + val;
    let nextYear = calendarYear;
    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    } else if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }
    setCalendarMonth(nextMonth);
    setCalendarYear(nextYear);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setCategoryFilter("all");
    setFromDate("");
    setToDate("");
    setMinAmount("");
    setMaxAmount("");
    setSortBy("date-desc");
  };

  // Click date txs collection for popup
  const selectedDateTxs = useMemo(() => {
    if (!selectedCalendarDate) return [];
    return transactions.filter(tx => tx.date === selectedCalendarDate);
  }, [selectedCalendarDate, transactions]);

  // Trigger browser PDF print print out
  const handlePdfPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Banner Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/5 dark:border-slate-800/20 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-sans">{t.transactions}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">{lang === 'bn' ? "সকল আয়ের খাত এবং ব্যয়ের নথিপত্র অনুসন্ধান করুন" : "Analyze historical journals, perform multi-filter queries & generate sheets"}</p>
        </div>

        <div className="flex gap-2.5 w-full sm:w-auto">
          {/* List vs Calendar views toggle switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
                viewMode === 'list' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Table className="h-3.5 w-3.5" />
              <span>{lang === 'bn' ? "তালিকা" : "List Table"}</span>
            </button>
            
            <button
              id="view-mode-calendar-btn"
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
                viewMode === 'calendar' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>{lang === 'bn' ? "ক্যালেন্ডার" : "Calendar View"}</span>
            </button>
          </div>

          <button
            onClick={onAddTransactionClick}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{t.add}</span>
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Advanced Search Sidebar Block */}
          <div className="lg:col-span-1 glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800/10 dark:border-slate-800/30 pb-3">
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">{lang === 'bn' ? "ফিল্টার প্যানেল" : `${t.filter} Console`}</span>
              <button
                onClick={resetFilters}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 hover:underline font-semibold cursor-pointer"
              >
                {t.resetFilters}
              </button>
            </div>

            {/* In-view Search Input bar */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">{t.search}</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                <input
                  id="tx-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === 'bn' ? "নোট, ক্যাটাগরি দিয়ে খুঁজুন..." : "Query note, category..."}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none placeholder-slate-400 dark:placeholder-slate-600 font-sans"
                />
              </div>
            </div>

            {/* Income Expense classes filter */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">{lang === 'bn' ? "লেনদেনের ধরন" : "Transaction Type"}</label>
              <select
                id="tx-type-filter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none cursor-pointer"
              >
                <option value="all" className="text-slate-800 dark:text-white bg-white dark:bg-slate-950">{lang === 'bn' ? "সবগুলো" : "All Types"}</option>
                <option value="income" className="text-slate-800 dark:text-white bg-white dark:bg-slate-950">{t.incoming}</option>
                <option value="expense" className="text-slate-800 dark:text-white bg-white dark:bg-slate-950">{t.outgoing}</option>
              </select>
            </div>

            {/* Categories filter */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">{t.category}</label>
              <select
                id="tx-category-filter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none cursor-pointer"
              >
                <option value="all" className="text-slate-800 dark:text-white bg-white dark:bg-slate-950">{lang === 'bn' ? "সব ক্যাটাগরি" : "All Categories"}</option>
                {categoriesList.map(cat => (
                  <option key={cat} value={cat.toLowerCase()} className="text-slate-800 dark:text-white bg-white dark:bg-slate-950">{getTranslatedCategory(cat, lang)}</option>
                ))}
              </select>
            </div>

            {/* Start & End Dates Range limit */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">{t.fromDate}</label>
              <input
                id="tx-fromdate-input"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">{t.toDate}</label>
              <input
                id="tx-todate-input"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Minimum - Maximum amounts interval */}
            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">{t.amountRange}</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  id="tx-minamount-input"
                  type="number"
                  placeholder={lang === 'bn' ? "নূন্যতম" : "Min"}
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 outline-none"
                />
                <input
                  id="tx-maxamount-input"
                  type="number"
                  placeholder={lang === 'bn' ? "সর্বোচ্চ" : "Max"}
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>
            </div>

            {/* Sorting controls */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
                <span className="flex items-center gap-1">
                  <ArrowUpDown className="h-3 w-3" />
                  <span>{t.sort}</span>
                </span>
              </label>
              <select
                id="tx-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none cursor-pointer"
              >
                <option value="date-desc" className="text-slate-800 dark:text-white bg-white dark:bg-slate-950">{lang === 'bn' ? "তারিখ (নতুন প্রথম)" : "Date (Newest first)"}</option>
                <option value="date-asc" className="text-slate-800 dark:text-white bg-white dark:bg-slate-950">{lang === 'bn' ? "তারিখ (পুরাতন প্রথম)" : "Date (Oldest first)"}</option>
                <option value="amount-desc" className="text-slate-800 dark:text-white bg-white dark:bg-slate-950">{lang === 'bn' ? "টাকার পরিমাণ (উচ্চ থেকে)" : "Amount (High - Low)"}</option>
                <option value="amount-asc" className="text-slate-800 dark:text-white bg-white dark:bg-slate-950">{lang === 'bn' ? "টাকার পরিমাণ (নিম্ন থেকে)" : "Amount (Low - High)"}</option>
              </select>
            </div>

          </div>

          {/* Right main table view */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Quick Export tools panel */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                {lang === 'bn' ? `মোট ${filteredTxs.length}টি তথ্য ফিল্টার করা হয়েছে` : `Query matches: ${filteredTxs.length} journals`}
              </span>
              
              <div className="flex gap-2">
                <a
                  href="/api/export/csv"
                  download
                  className="p-1 px-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-300 hover:text-white dark:hover:text-white hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:border-indigo-600 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>CSV</span>
                </a>
                <a
                  href="/api/export/json"
                  download
                  className="p-1 px-3 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900/50 text-cyan-700 dark:text-cyan-300 hover:text-white dark:hover:text-white hover:bg-cyan-600 dark:hover:bg-cyan-600 hover:border-cyan-600 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FileJson className="h-3.5 w-3.5" />
                  <span>Backup</span>
                </a>
                <button
                  onClick={handlePdfPrint}
                  className="p-1 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* List entries */}
            <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 font-bold">
                      <th className="p-4 font-bold uppercase tracking-wider">{t.date}</th>
                      <th className="p-4 font-bold uppercase tracking-wider">{t.category}</th>
                      <th className="p-4 font-bold uppercase tracking-wider">{t.note}</th>
                      <th className="p-4 font-bold uppercase tracking-wider">{t.accountType}</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-right">{t.amount}</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-center">{t.actions}</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/40">
                    {filteredTxs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-slate-500 font-medium">
                          {t.noData}
                        </td>
                      </tr>
                    ) : (
                      filteredTxs.map((tx) => {
                        const accountObj = accounts.find(a => a.id === tx.accountId);
                        return (
                          <tr key={tx.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/20 transition-all">
                            <td className="p-4 font-mono font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">{tx.date}</td>
                            
                            <td className="p-4">
                              <span className="font-bold text-slate-900 dark:text-slate-200">
                                {getTranslatedCategory(tx.category, lang)}
                              </span>
                            </td>

                            <td className="p-4 max-w-[150px] truncate">
                              <span className="text-slate-500 dark:text-slate-400 block truncate" title={tx.note}>
                                {tx.note || "—"}
                              </span>
                            </td>

                            <td className="p-4 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded text-[10px] bg-white text-slate-800 dark:bg-slate-800/60 dark:text-slate-300 font-bold border border-slate-300/35 dark:border-slate-800/80">
                                {accountObj ? accountObj.name : "N/A"}
                              </span>
                            </td>

                            <td className="p-4 text-right font-mono font-bold whitespace-nowrap">
                              <span className={tx.type === 'income' ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-200'}>
                                {tx.type === 'income' ? '+' : '-'}{currencySign}{tx.amount.toLocaleString()}
                              </span>
                            </td>

                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-1.5 shrink-0">
                                <button
                                  id={`edit-tx-${tx.id}`}
                                  onClick={() => onEditTransactionClick(tx)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition outline-none"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  id={`delete-tx-${tx.id}`}
                                  onClick={() => onDeleteTransactionClick(tx.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition outline-none"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>

                </table>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Calendar view grid */
        <div className="glass-panel p-6 rounded-2xl shadow border border-slate-200 dark:border-slate-800">
          
          {/* Calendar controller */}
          <div className="flex items-center justify-between border-b border-slate-200/10 pb-4 mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
               {new Date(calendarYear, calendarMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            
            <div className="flex gap-2">
              <button
                onClick={() => changeMonth(-1)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-white rounded-lg transition"
              >
                {lang === 'bn' ? "◀ পূর্ববর্তী" : "◀ Prev"}
              </button>
              <button
                onClick={() => {
                  setCalendarMonth(new Date().getMonth());
                  setCalendarYear(new Date().getFullYear());
                }}
                className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-900 text-xs font-bold text-indigo-700 dark:text-indigo-300 rounded-lg transition"
              >
                {lang === 'bn' ? "আজ" : "Today"}
              </button>
              <button
                onClick={() => changeMonth(1)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-white rounded-lg transition"
              >
                {lang === 'bn' ? "পরবর্তী ▶" : "Next ▶"}
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-550 dark:text-slate-400 mb-4">
            💡 {lang === 'bn' ? "যেকোনো তারিখে ক্লিক করুন তার সংশ্লিষ্ট সকল আয়ের ও ব্যয়ের বিবরণী দেখতে।" : "Click on any date calendar box to zoom into details of that specific day's records."}
          </p>

          <div className="grid grid-cols-7 gap-2.5 text-center">
            
            {/* Week Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((w, i) => (
              <span key={i} className="text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[10px] tracking-widest bg-slate-100 dark:bg-slate-900/40 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800/10">
                {w}
              </span>
            ))}

            {/* Days block */}
            {calendarDays.map((day, dIdx) => {
              if (day === null) {
                return <div key={`empty-${dIdx}`} className="bg-slate-200/40 dark:bg-slate-900/50 rounded-xl min-h-[75px] opacity-25" />;
              }

              const incSum = day.txs.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0);
              const expSum = day.txs.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0);
              
              const hasTxs = day.txs.length > 0;

              return (
                <div
                  key={`day-${day.dayNum}`}
                  onClick={() => {
                    if (hasTxs) {
                      setSelectedCalendarDate(day.dateStr);
                    }
                  }}
                  className={`p-1.5 rounded-xl border min-h-[85px] relative flex flex-col justify-between text-left transition ${
                    hasTxs
                      ? 'border-indigo-500/40 bg-indigo-500/5 hover:bg-indigo-500/10 active:scale-[0.98] cursor-pointer'
                      : 'border-slate-200 dark:border-slate-850 bg-slate-100/50 dark:bg-slate-950/20 text-slate-500'
                  }`}
                >
                  <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400">{day.dayNum}</span>
                  
                  {hasTxs && (
                    <div className="space-y-0.5 mt-2">
                      {incSum > 0 && (
                        <div className="text-[9px] font-mono font-bold text-emerald-500 bg-emerald-500/5 border border-emerald-500/10 px-1 rounded truncate">
                          +{currencySign}{incSum}
                        </div>
                      )}
                      {expSum > 0 && (
                        <div className="text-[9px] font-mono font-bold text-red-500 bg-red-500/5 border border-red-500/10 px-1 rounded truncate">
                          -{currencySign}{expSum}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

          </div>

          {/* Calendar date click detail Modal Overlay */}
          {selectedCalendarDate && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-2xl relative">
                
                <button
                  onClick={() => setSelectedCalendarDate(null)}
                  className="absolute right-4 top-4 p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                >
                  ✕
                </button>

                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                  <Calendar className="h-4.5 w-4.5 text-indigo-500 dark:text-indigo-400" />
                  <span>{lang === 'bn' ? `লেনদেনের বিবরণী: ${selectedCalendarDate}` : `Ledger logs: ${selectedCalendarDate}`}</span>
                </h3>

                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {selectedDateTxs.map((tx) => (
                    <div key={tx.id} className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{getTranslatedCategory(tx.category, lang)}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate max-w-[200px]">{tx.note || "N/A"}</span>
                      </div>

                      <span className={`font-mono font-bold ${tx.type === 'income' ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-300'}`}>
                        {tx.type === 'income' ? '+' : '-'}{currencySign}{tx.amount}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => setSelectedCalendarDate(null)}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-white rounded-xl cursor-pointer transition-colors"
                  >
                    {t.cancel}
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
