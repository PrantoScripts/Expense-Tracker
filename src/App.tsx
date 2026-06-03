import React, { useState, useEffect } from "react";
import { AuthView } from "./components/AuthView";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { DashboardView } from "./components/DashboardView";
import { TransactionsView } from "./components/TransactionsView";
import { BudgetsView } from "./components/BudgetsView";
import { SavingsGoalsView } from "./components/SavingsGoalsView";
import { AccountsView } from "./components/AccountsView";
import { RecurringView } from "./components/RecurringView";
import { AdminPanel } from "./components/AdminPanel";
import { SettingsView } from "./components/SettingsView";
import { HelpView } from "./components/HelpView";
import { SmartCoachChat } from "./components/SmartCoachChat";
import { translations, getTranslatedCategory } from "./locales";
import { ReceiptCameraScanner } from "./components/ReceiptCameraScanner";

import {
  X,
  CreditCard,
  Briefcase,
  AlertTriangle,
  Upload,
  Calendar,
  Layers,
  BellRing,
  Trash2,
  ListCollapse,
  Camera,
  Sparkles
} from "lucide-react";

export default function App() {
  // Auth state
  const [token, setToken] = useState<string | null>(localStorage.getItem("spendwise_token"));
  const [user, setUser] = useState<any | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Workspace configuration state
  const [lang, setLang] = useState<'en' | 'bn'>((localStorage.getItem("spendwise_lang") as any) || "en");
  const [theme, setTheme] = useState<string>(localStorage.getItem("spendwise_theme") || "dark");
  const [currency, setCurrency] = useState<string>("BDT");

  // Nav states
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Lists state
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [recurringRules, setRecurringRules] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Popups/Modals
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [txToEdit, setTxToEdit] = useState<any | null>(null);

  // Form entries for Add/Edit Transaction
  const [txAccountId, setTxAccountId] = useState("");
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [txAmount, setTxAmount] = useState("");
  const [txCategory, setTxCategory] = useState("Bills");
  const [txDate, setTxDate] = useState(new Date().toISOString().substring(0, 10));
  const [txNote, setTxNote] = useState("");
  const [txReceiptUrl, setTxReceiptUrl] = useState("");

  const [txIsRecurring, setTxIsRecurring] = useState(false);
  const [txRecFrequency, setTxRecFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [txRecEndDate, setTxRecEndDate] = useState("");

  const t = translations[lang];

  // Apply visual theme to document body and sync with database
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.backgroundColor = "#07090e";
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = "#fafafa";
    }
    localStorage.setItem("spendwise_theme", theme);

    // Sync themePreference to database whenever theme state changes for cross-device usage
    if (user && token && user.themePreference !== theme) {
      handleUpdateUserProfile({ themePreference: theme });
    }
  }, [theme, user, token]);

  // Persist language preference
  useEffect(() => {
    localStorage.setItem("spendwise_lang", lang);
  }, [lang]);

  // Auth bootstrap check
  useEffect(() => {
    const checkAuthSession = async () => {
      if (!token) {
        setAuthChecking(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/me", {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setCurrency(data.user.currency || "BDT");
          if (data.user.languagePreference) {
            setLang(data.user.languagePreference as 'en' | 'bn');
          }
          if (data.user.themePreference) {
            setTheme(data.user.themePreference);
          }
        } else {
          // Token expired
          handleLogout();
        }
      } catch (err) {
        console.error("Auth check failed", err);
      }
      setAuthChecking(false);
    };

    checkAuthSession();
  }, [token]);

  // Load all records once user is authenticated
  const fetchAllData = async () => {
    if (!token) return;
    try {
      const headers = { "Authorization": `Bearer ${token}` };

      const [accRes, txRes, budRes, goldRes, recRes, notifRes] = await Promise.all([
        fetch("/api/accounts", { headers }),
        fetch("/api/transactions", { headers }),
        fetch("/api/budgets", { headers }),
        fetch("/api/goals", { headers }),
        fetch("/api/recurring", { headers }),
        fetch("/api/notifications", { headers })
      ]);

      if (accRes.ok) setAccounts(await accRes.json());
      if (txRes.ok) setTransactions(await txRes.json());
      if (budRes.ok) setBudgets(await budRes.json());
      if (goldRes.ok) setGoals(await goldRes.json());
      if (recRes.ok) setRecurringRules(await recRes.json());
      if (notifRes.ok) setNotifications(await notifRes.json());

    } catch (e) {
      console.error("Error loading SpendWise metrics records", e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const handleLoginSuccess = (userToken: string, loggedUser: any) => {
    localStorage.setItem("spendwise_token", userToken);
    setToken(userToken);
    setUser(loggedUser);
    setCurrency(loggedUser.currency || "BDT");
    if (loggedUser.languagePreference) {
      setLang(loggedUser.languagePreference as 'en' | 'bn');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("spendwise_token");
    setToken(null);
    setUser(null);
    setAccounts([]);
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setRecurringRules([]);
    setNotifications([]);
    setActiveTab("dashboard");
  };

  // Transaction Actions CRUD
  const handleOpenAddTx = () => {
    setTxToEdit(null);
    // presets
    setTxAccountId(accounts[0]?.id || "");
    setTxType("expense");
    setTxAmount("");
    setTxCategory("Bills");
    setTxDate(new Date().toISOString().substring(0, 10));
    setTxNote("");
    setTxReceiptUrl("");
    setTxIsRecurring(false);
    setTxRecFrequency("monthly");
    setTxRecEndDate("");
    setShowAddTransactionModal(true);
  };

  const handleOpenEditTx = (tx: any) => {
    setTxToEdit(tx);
    setTxAccountId(tx.accountId);
    setTxType(tx.type);
    setTxAmount(tx.amount.toString());
    setTxCategory(tx.category);
    setTxDate(tx.date);
    setTxNote(tx.note);
    setTxReceiptUrl(tx.receiptUrl || "");
    setTxIsRecurring(false);
    setTxRecFrequency("monthly");
    setTxRecEndDate("");
    setShowAddTransactionModal(true);
  };

  const handleTxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAccountId || !txAmount || !txDate) return;

    const payload = {
      accountId: txAccountId,
      type: txType,
      amount: Number(txAmount),
      category: txCategory,
      date: txDate,
      note: txNote,
      receiptUrl: txReceiptUrl
    };

    try {
      const url = txToEdit ? `/api/transactions/${txToEdit.id}` : "/api/transactions";
      const method = txToEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        if (txIsRecurring && !txToEdit) {
          // Calculate the next run date based on transaction date and frequency
          let nextRunDate = txDate;
          const dateObj = new Date(txDate);
          if (!isNaN(dateObj.getTime())) {
            if (txRecFrequency === "daily") {
              dateObj.setDate(dateObj.getDate() + 1);
            } else if (txRecFrequency === "weekly") {
              dateObj.setDate(dateObj.getDate() + 7);
            } else if (txRecFrequency === "monthly") {
              dateObj.setMonth(dateObj.getMonth() + 1);
            } else if (txRecFrequency === "yearly") {
              dateObj.setFullYear(dateObj.getFullYear() + 1);
            }
            nextRunDate = dateObj.toISOString().split("T")[0];
          }

          // Automatically POST to recurring rule creation
          await fetch("/api/recurring", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              accountId: txAccountId,
              type: txType,
              amount: Number(txAmount),
              category: txCategory,
              name: txNote || `${txCategory} Subscription`,
              interval: txRecFrequency,
              nextRunDate: nextRunDate,
              endDate: txRecEndDate || null
            })
          });
        }

        setTxIsRecurring(false);
        setTxRecFrequency("monthly");
        setTxRecEndDate("");
        setShowAddTransactionModal(false);
        setTxToEdit(null);
        fetchAllData(); // refresh lists
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Error processing entry.");
      }
    } catch (err) {
      console.error("Transacting error", err);
    }
  };

  const handleDeleteTx = async (txId: string) => {
    if (!confirm(lang === 'bn' ? "আপনি কি নিশ্চিতভাবে এই লেনদেনটি ডিলিট করতে চান?" : "Are you sure you want to delete this ledger entry permanently?")) return;

    try {
      const res = await fetch(`/api/transactions/${txId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Budget Actions
  const handleCreateBudget = async (cat: string, amt: number, typeStr: string, thres: number) => {
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          category: cat,
          amount: amt,
          type: typeStr,
          alertThreshold: thres,
          month: new Date().toISOString().substring(0, 7)
        })
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      const res = await fetch(`/api/budgets/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Savings Goal Actions
  const handleCreateGoal = async (nameStr: string, targetAmt: number, currentAmt: number, dline: string, memo: string) => {
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: nameStr,
          targetAmount: targetAmt,
          currentAmount: currentAmt,
          deadline: dline,
          notes: memo
        })
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddFundsToGoal = async (goalId: string, amt: number, sourceAcc: string) => {
    try {
      const res = await fetch(`/api/goals/${goalId}/add-funds`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: amt,
          sourceAccountId: sourceAcc
        })
      });
      if (res.ok) {
        fetchAllData();
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Accounts Actions
  const handleCreateAccount = async (nameStr: string, actType: string, balAmt: number, cHex: string) => {
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: nameStr,
          type: actType,
          balance: balAmt,
          color: cHex
        })
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!confirm(lang === 'bn' ? "অ্যাকাউন্ট ডিলিট করলে এর অন্তর্গত সব লেনদেন হারিয়ে যেতে পারে। ডিলিট করবেন?" : "Deleting account will remove all metadata. Proceed?")) return;
    try {
      const res = await fetch(`/api/accounts/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Recurring Actions
  const handleCreateRecurringRule = async (
    nameStr: string,
    typeStr: 'income' | 'expense',
    amt: number,
    cat: string,
    freq: 'daily' | 'weekly' | 'monthly' | 'yearly',
    accId: string,
    nextRun: string
  ) => {
    try {
      const res = await fetch("/api/recurring", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: nameStr,
          type: typeStr,
          amount: amt,
          category: cat,
          interval: freq,
          accountId: accId,
          nextRunDate: nextRun
        })
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteRecurringRule = async (id: string) => {
    try {
      const res = await fetch(`/api/recurring/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // User preference update
  const handleUpdateUserProfile = async (updatedFields: any) => {
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Dismiss notification banner
  const handleDismissNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Active unread alerts
  const unreadAlerts = notifications.filter(n => !n.isRead);

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">
          Starting SpendWise Engine...
        </span>
      </div>
    );
  }

  // Not logged in routing
  if (!user) {
    return <AuthView lang={lang} onLoginSuccess={handleLoginSuccess} />;
  }

  // Router dispatcher
  const renderActiveScreen = () => {
    switch (activeTab) {
      case "transactions":
        return (
          <TransactionsView
            transactions={transactions}
            accounts={accounts}
            lang={lang}
            currency={currency}
            onAddTransactionClick={handleOpenAddTx}
            onEditTransactionClick={handleOpenEditTx}
            onDeleteTransactionClick={handleDeleteTx}
          />
        );
      case "budgets":
        return (
          <BudgetsView
            budgets={budgets}
            transactions={transactions}
            lang={lang}
            currency={currency}
            onCreateBudget={handleCreateBudget}
            onDeleteBudget={handleDeleteBudget}
          />
        );
      case "savings":
        return (
          <SavingsGoalsView
            goals={goals}
            accounts={accounts}
            lang={lang}
            currency={currency}
            onCreateGoal={handleCreateGoal}
            onAddFundsToGoal={handleAddFundsToGoal}
            onDeleteGoal={handleDeleteGoal}
          />
        );
      case "accounts":
        return (
          <AccountsView
            accounts={accounts}
            transactions={transactions}
            lang={lang}
            currency={currency}
            onAddNewAccount={handleCreateAccount}
            onDeleteAccount={handleDeleteAccount}
          />
        );
      case "recurring":
        return (
          <RecurringView
            recurringRules={recurringRules}
            accounts={accounts}
            lang={lang}
            currency={currency}
            onAddRecurringRule={handleCreateRecurringRule}
            onDeleteRecurringRule={handleDeleteRecurringRule}
          />
        );
      case "help":
        return <HelpView lang={lang} token={token} />;
      case "settings":
        return (
          <SettingsView
            user={user}
            lang={lang}
            setLang={setLang}
            currency={currency}
            setCurrency={setCurrency}
            theme={theme}
            setTheme={setTheme}
            onUpdateUser={handleUpdateUserProfile}
            transactions={transactions}
            budgets={budgets}
            goals={goals}
          />
        );
      case "admin":
        return user.isAdmin ? <AdminPanel lang={lang} currency={currency} /> : null;
      default:
        return (
          <DashboardView
            user={user}
            accounts={accounts}
            transactions={transactions}
            budgets={budgets}
            goals={goals}
            notifications={notifications}
            lang={lang}
            recurringRules={recurringRules}
            onAddTransactionClick={handleOpenAddTx}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onRefreshAllData={fetchAllData}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-[#07090e] transition-colors duration-200">
      
      {/* Sidebar navigation block */}
      <div className="hidden md:block shrink-0">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          lang={lang}
          user={user}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
      </div>

      {/* Mobile Sidebar overlay Drawer panel */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />
          <div className="relative z-10 animate-slide-in">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              lang={lang}
              user={user}
              onCloseMobile={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main layout pane right side wrapper */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        <Navbar
          user={user}
          lang={lang}
          setLang={setLang}
          theme={theme}
          setTheme={setTheme}
          onLogout={handleLogout}
          onOpenNotifications={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
          onHamburgerClick={() => setMobileSidebarOpen(true)}
          unreadCount={unreadAlerts.length}
        />

        {/* Global Notifications Alert bell list Dropdown */}
        {showNotificationsDropdown && (
          <div className="absolute top-16 right-4 z-50 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-slide-in text-left">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <BellRing className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
                <span>{lang === 'bn' ? "বিজ্ঞপ্তি কেন্দ্র" : "Notification Core"}</span>
              </span>
              <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-extrabold uppercase">
                {unreadAlerts.length} New Alerts
              </span>
            </div>

            <div className="mt-3.5 space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  {lang === 'bn' ? "কোনো বিজ্ঞপ্তি পাওয়া যায়নি।" : "Clear clear. No pending warnings."}
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-xl border text-xs relative ${
                      notif.isRead
                        ? "border-slate-100 dark:border-slate-800/50 bg-slate-100/50 dark:bg-slate-950/20 text-slate-400"
                        : "border-indigo-500/20 bg-indigo-500/5 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <button
                      onClick={() => handleDismissNotification(notif.id)}
                      className="absolute right-2 top-2 p-0.5 rounded hover:bg-slate-800 text-slate-500 hover:text-white"
                      title="Mark as read"
                    >
                      ✕
                    </button>
                    
                    <p className="font-bold leading-normal pr-5">{notif.title}</p>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">{notif.message}</p>
                    <span className="text-[9px] text-indigo-400/80 font-mono block mt-1.5">{notif.date}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Primary Screen viewport content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderActiveScreen()}
        </main>

        {/* Workspace dynamic footer info */}
        <footer className="py-4 border-t border-slate-200/55 dark:border-slate-900 bg-slate-900/10 text-center text-[10px] text-slate-500 flex flex-col sm:flex-row items-center justify-between px-6 gap-2">
          <span>SpendWise Intelligent Monitor Stack version 12.1.2026</span>
          <span>Crafted for commercial SaaS deployment & analytics under SLA policies</span>
        </footer>

      </div>

      {/* Add / Edit Transaction modal popup container */}
      {showAddTransactionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl relative text-left">
            
            <button
              onClick={() => {
                setShowAddTransactionModal(false);
                setTxToEdit(null);
              }}
              className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-indigo-400" />
              <span>{txToEdit ? (lang === 'bn' ? "লেনদেনের তথ্য পরিবর্তন করুন" : "Amend Ledger journal") : (lang === 'bn' ? "নতুন লেনদেনের তথ্য যুক্ত করুন" : "Add Ledger Entry")}</span>
            </h3>

            {/* AI Receipt Scanning Assist Bar */}
            {!txToEdit && (
              <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-xl p-3 flex items-center justify-between gap-3 shadow-inner mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 animate-pulse">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider block">AI Receipt Scanner</span>
                    <span className="text-[10px] text-slate-400">
                      {lang === 'bn' ? "রিসিটের ছবি আপলোড করে স্বয়ংক্রিয় তথ্য ইনপুট করুন" : "Upload receipt photo to let Gemini AI auto-fill details"}
                    </span>
                  </div>
                </div>
                <button
                  id="trigger-camera-scanner-modal"
                  type="button"
                  onClick={() => setShowCameraScanner(true)}
                  className="p-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition shadow-sm shrink-0"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>{lang === 'bn' ? "ছবি আপলোড" : "Upload File"}</span>
                </button>
              </div>
            )}

            <form onSubmit={handleTxSubmit} className="space-y-4">
              
              {/* Type Switcher */}
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">
                  {lang === 'bn' ? "লেনদেনের গতিপথ" : "Flow Class Direction"}
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setTxType("expense");
                      setTxCategory("Food");
                    }}
                    className={`py-2 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                      txType === 'expense' ? "bg-red-500 text-white shadow" : "text-slate-400"
                    }`}
                  >
                    {lang === 'bn' ? "-- ব্যয় হিসাব" : "-- Outflow Expense"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTxType("income");
                      setTxCategory("Salary");
                    }}
                    className={`py-2 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                      txType === 'income' ? "bg-emerald-500 text-white shadow" : "text-slate-400"
                    }`}
                  >
                    {lang === 'bn' ? "++ আয় হিসাব" : "++ Incoming Income"}
                  </button>
                </div>
              </div>

              {/* Amount and date column */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    {lang === 'bn' ? `টাকার পরিমাণ (${currency})` : `Amount Value (${currency})`}
                  </label>
                  <input
                    id="modal-tx-amount"
                    type="number"
                    required
                    placeholder="1200"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    {lang === 'bn' ? "ক্যালেন্ডার তারিখ" : "Calendar Date"}
                  </label>
                  <input
                    id="modal-tx-date"
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300 outline-none"
                  />
                </div>

              </div>

              {/* Selector account and select categories */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    {lang === 'bn' ? "উৎস অ্যাকাউন্টে" : "Funding Account"}
                  </label>
                  <select
                    required
                    value={txAccountId}
                    onChange={(e) => setTxAccountId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                  >
                    <option value="">{lang === 'bn' ? "অ্যাকাউন্ট উৎস নির্বাচন করুন" : "Select account source"}</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name} ({acc.balance.toLocaleString()})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    {lang === 'bn' ? "নির্দিষ্ট ক্যাটাগরি" : "Target Category"}
                  </label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                  >
                    {txType === "income" ? (
                      <>
                        <option value="Salary">{getTranslatedCategory("Salary", lang)}</option>
                        <option value="Freelancing">{getTranslatedCategory("Freelancing", lang)}</option>
                        <option value="Business">{getTranslatedCategory("Business", lang)}</option>
                        <option value="Investment">{getTranslatedCategory("Investment", lang)}</option>
                        <option value="Bonus">{getTranslatedCategory("Bonus", lang)}</option>
                        <option value="Gift">{getTranslatedCategory("Gift", lang)}</option>
                        <option value="Other">{getTranslatedCategory("Other", lang)}</option>
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
                  </select>
                </div>

              </div>

              {/* Optional Text and reference upload receipt mock */}
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                  {lang === 'bn' ? "লেনদেনের বিবরণী ও নোট" : "Note Description"}
                </label>
                <input
                  id="modal-tx-note"
                  type="text"
                  placeholder={lang === 'bn' ? "যেমনঃ আড়ং শপিং বা অ্যাপেল পেমেন্ট..." : "E.g. Agora SuperStore purchase..."}
                  value={txNote}
                  onChange={(e) => setTxNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>

              {/* Make Recurring Section */}
              {!txToEdit && (
                <div className="space-y-3.5 pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                    <input
                      id="modal-tx-recurring-checkbox"
                      type="checkbox"
                      checked={txIsRecurring}
                      onChange={(e) => setTxIsRecurring(e.target.checked)}
                      className="h-4 w-4 bg-slate-950 border-slate-800 rounded text-indigo-600 focus:ring-0 cursor-pointer outline-none"
                    />
                    <span className="font-medium">{t.makeRecurring}</span>
                  </label>

                  {txIsRecurring && (
                    <div className="grid grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 animate-fade-in text-[12px]">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                          {t.recurrenceFrequency}
                        </label>
                        <select
                          id="modal-tx-frequency"
                          value={txRecFrequency}
                          onChange={(e) => setTxRecFrequency(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none cursor-pointer"
                        >
                          <option value="daily">{t.daily}</option>
                          <option value="weekly">{t.weekly}</option>
                          <option value="monthly">{t.monthly}</option>
                          <option value="yearly">{t.yearly}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                          {t.recurrenceEndDate}
                        </label>
                        <input
                          id="modal-tx-enddate"
                          type="date"
                          value={txRecEndDate}
                          onChange={(e) => setTxRecEndDate(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2.5 pt-4 border-t border-slate-800/50">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTransactionModal(false);
                    setTxToEdit(null);
                  }}
                  className="flex-1 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 rounded-xl text-xs font-bold transition cursor-pointer text-center"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTxAccountId(accounts[0]?.id || "");
                    setTxType("expense");
                    setTxAmount("");
                    setTxCategory("Bills");
                    setTxDate(new Date().toISOString().substring(0, 10));
                    setTxNote("");
                    setTxReceiptUrl("");
                    setTxIsRecurring(false);
                    setTxRecFrequency("monthly");
                    setTxRecEndDate("");
                  }}
                  className="flex-1 py-2.5 bg-slate-800 border border-slate-700/60 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer text-center"
                >
                  {lang === 'bn' ? "মুছে ফেলুন" : "Clear"}
                </button>
                <button
                  id="modal-tx-submit-btn"
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/10 cursor-pointer text-center font-sans"
                >
                  {txToEdit ? (lang === 'bn' ? "সংশোধন করুন" : "Amend Entry") : (lang === 'bn' ? "যুক্ত করুন" : "Establish Entry")}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {token && (
        <SmartCoachChat lang={lang} token={token} currency={currency} />
      )}

      {showCameraScanner && (
        <ReceiptCameraScanner
          lang={lang}
          onClose={() => setShowCameraScanner(false)}
          onScanSuccess={(scanned) => {
            if (scanned.amount) {
              setTxAmount(scanned.amount.toString());
            }
            if (scanned.date) {
              setTxDate(scanned.date);
            }
            if (scanned.note) {
              setTxNote(scanned.note);
            }
            if (scanned.category) {
              setTxCategory(scanned.category);
            }
          }}
        />
      )}

    </div>
  );
}
