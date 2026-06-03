import React from "react";
import { translations } from "../locales";
import { SpendWiseLogo } from "./SpendWiseLogo";
import { Bell, Menu, Globe, LogOut, ShieldAlert, Cpu } from "lucide-react";

interface NavbarProps {
  user: any;
  lang: 'en' | 'bn';
  setLang: (lang: 'en' | 'bn') => void;
  theme: string;
  setTheme: (theme: string) => void;
  onLogout: () => void;
  onOpenNotifications: () => void;
  onHamburgerClick: () => void;
  unreadCount: number;
}

export function Navbar({
  user,
  lang,
  setLang,
  theme,
  setTheme,
  onLogout,
  onOpenNotifications,
  onHamburgerClick,
  unreadCount
}: NavbarProps) {
  
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6 transition-colors dark:border-slate-800 dark:bg-slate-950">
      
      {/* Left side: Hamburger and logo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onHamburgerClick}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900 md:hidden outline-none"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 md:hidden">
          <SpendWiseLogo className="h-7 w-7 shrink-0" />
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            {t.appName}
          </span>
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-3">
        
        {/* Language selector toggle */}
        <button
          onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white/50 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white transition cursor-pointer"
        >
          <Globe className="h-3.5 w-3.5 text-indigo-500" />
          <span>{lang === 'en' ? "বাংলা" : "English"}</span>
        </button>

        {/* Theme select button */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 cursor-pointer text-xs font-semibold"
        >
          {theme === 'dark' ? (lang === 'bn' ? "☀️ উজ্জ্বল" : "☀️ Light") : (lang === 'bn' ? "🌙 অন্ধকার" : "🌙 Dark")}
        </button>

        {/* AI Health Alert Notification indicator */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 cursor-pointer"
        >
          <Bell className="h-4.5 w-4.5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-extrabold text-white animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Divider */}
        <span className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800" />

        {/* User Mini profile and quick signout */}
        <div className="flex items-center gap-2.5">
          <img
            src={user.profilePhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50"}
            alt={user.name}
            className="h-8 w-8 rounded-lg object-cover ring-2 ring-indigo-500/15"
          />
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
              {user.name}
            </div>
            <div className="text-[10px] text-slate-400 capitalize">
              {user.isAdmin ? `${t.settings} (Admin)` : t.profile}
            </div>
          </div>

          <button
            onClick={onLogout}
            title={t.logout}
            className="p-1 px-2.5 rounded-lg text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 bg-slate-100 hover:bg-red-50 dark:bg-slate-900 dark:hover:bg-red-950/20 transition cursor-pointer text-xs font-medium"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
