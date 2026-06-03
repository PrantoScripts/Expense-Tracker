import React from "react";
import { translations } from "../locales";
import { SpendWiseLogo } from "./SpendWiseLogo";
import {
  Layers,
  ListMinus,
  Sparkles,
  PieChart,
  Target,
  CreditCard,
  Settings,
  Calendar,
  ShieldCheck,
  Wallet,
  Clock,
  HelpCircle,
  X
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: 'en' | 'bn';
  user: any;
  onCloseMobile: () => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  lang,
  user,
  onCloseMobile
}: SidebarProps) {
  
  const t = translations[lang];

  const menuItems = [
    { id: "dashboard", label: t.dashboard, icon: Layers },
    { id: "transactions", label: t.transactions, icon: ListMinus },
    { id: "budgets", label: t.budgets, icon: PieChart },
    { id: "savings", label: t.savings, icon: Target },
    { id: "accounts", label: t.accounts, icon: CreditCard },
    { id: "recurring", label: t.recurring, icon: Clock },
    { id: "help", label: lang === 'bn' ? "সহায়তা ও গাইডবট" : "FAQ & Help Center", icon: HelpCircle },
    { id: "settings", label: t.settings, icon: Settings }
  ];

  if (user?.isAdmin) {
    menuItems.push({ id: "admin", label: t.adminPanel, icon: ShieldCheck });
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 transition-colors duration-200">
      
      {/* Brand Header with Custom Logo */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
          <SpendWiseLogo className="h-9 w-9 shrink-0" />
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white block leading-tight">
              {t.appName}
            </span>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 block uppercase tracking-wider font-semibold">
              {t.tagline}
            </span>
          </div>
        </div>

        {/* Close button for mobile */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 md:hidden outline-none cursor-pointer"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Nav List with Flat, Bordered, Balanced Aesthetics */}
      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg outline-none transition duration-150 text-left cursor-pointer group ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Icon className={`h-4.5 w-4.5 transition duration-150 ${
                isActive 
                  ? "text-indigo-600 dark:text-indigo-400" 
                  : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
              }`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Pro Panel info box in Sidebar */}
      <div className="border-t border-slate-200/60 dark:border-slate-800 p-4">
        <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-200/40 dark:border-slate-800/50 text-left">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            PRO LICENSE ACTIVE
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-normal">
            {user.name && <span className="font-semibold text-slate-700 dark:text-slate-200 block truncate">{user.name}</span>}
            Unlock advanced intelligent financial analytics and smart predictions.
          </p>
        </div>
      </div>

    </aside>
  );
}
