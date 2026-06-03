import React, { useState } from "react";
import { translations } from "../locales";
import { User, Shield, Eye, EyeOff } from "lucide-react";
import { SpendWiseLogo } from "./SpendWiseLogo";

interface AuthViewProps {
  onLoginSuccess: (token: string, user: any) => void;
  lang: 'en' | 'bn';
}

export function AuthView({ onLoginSuccess, lang }: AuthViewProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const t = translations[lang];

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    if (isRegister) {
      if (!name || !email || !password) {
        setErrorMsg(lang === 'bn' ? "সবগুলো ক্ষেত্র পূরণ করুন।" : "Please fill out all required fields.");
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg(lang === 'bn' ? "পাসওয়ার্ড দুটি মেলেনি।" : "Passwords do not match.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password })
        });
        const data = await response.json();
        if (response.ok) {
          setSuccessMsg(lang === 'bn' ? "অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! অনুগ্রহ করে লগইন করুন।" : "Registration successful! You may now log in.");
          setIsRegister(false);
          // reset fields
          setName("");
          setPassword("");
          setConfirmPassword("");
        } else {
          setErrorMsg(data.error || "Failed/Server Registration error.");
        }
      } catch (err) {
        setErrorMsg("API communication error.");
      }
    } else {
      // login
      if (!email || !password) {
        setErrorMsg(lang === 'bn' ? "ইমেইল ও পাসওয়ার্ড প্রদান করুন।" : "Please enter your email and password.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
          onLoginSuccess(data.token, data.user);
        } else {
          setErrorMsg(data.error || "Invalid login credentials.");
        }
      } catch (err) {
        setErrorMsg("API connection failure.");
      }
    }
    setLoading(false);
  };

  const handleQuickLogin = async (quickEmail: string, quickPass: string) => {
    setErrorMsg("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: quickEmail, password: quickPass })
      });
      const data = await response.json();
      if (response.ok) {
        onLoginSuccess(data.token, data.user);
      } else {
        setErrorMsg(data.error);
      }
    } catch (e) {
      setErrorMsg("Quick-login connection failed.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07090e] text-slate-100 p-4 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background radial overlays */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/85 backdrop-blur-xl border border-slate-800/80 p-8 rounded-2xl shadow-2xl relative z-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <SpendWiseLogo className="h-14 w-14 mb-3 filter drop-shadow-[0_4px_12px_rgba(59,130,246,0.35)]" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
            {t.appName}
          </h1>
          <p className="text-xs text-indigo-400 mt-1 uppercase tracking-wider font-semibold">
            {t.tagline}
          </p>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold text-slate-100 mb-1">
            {isRegister ? t.register : t.welcomeBack}
          </h2>
          <p className="text-xs text-slate-400">
            {isRegister ? (lang === 'bn' ? "নতুন হিসাব খুলতে নিচের বিবরণী দিন।" : "Create an account to start smart expense tracking.") : t.signInPrompt}
          </p>
        </div>

        {/* Informational Boxes */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-200 flex items-start gap-2">
            <span>⚠️</span>
            <p>{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-xs text-emerald-300 flex items-start gap-2">
            <span>✅</span>
            <p>{successMsg}</p>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">
                {t.fullName}
              </label>
              <input
                id="reg-fullname"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={lang === 'bn' ? "আপনার নাম দিন" : "Your Full Name"}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all duration-200 focus:ring-1 focus:ring-indigo-500/20"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">
              {t.emailAddress}
            </label>
            <input
              id="auth-email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={lang === 'bn' ? "আপনার ইমেইল এড্রেস" : "yourname@example.com"}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all duration-200 focus:ring-1 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider">
                {t.password}
              </label>
              {!isRegister && (
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline transition"
                >
                  {t.forgotPassword}
                </button>
              )}
            </div>
            
            <div className="relative">
              <input
                id="auth-password-input"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/80 rounded-xl pl-4 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all duration-200 focus:ring-1 focus:ring-indigo-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">
                {t.confirmPassword}
              </label>
              <input
                id="reg-confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all duration-200 focus:ring-1 focus:ring-indigo-500/20"
              />
            </div>
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-sm font-semibold cursor-pointer shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all duration-200 disabled:opacity-50 mt-2 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
          >
            {loading ? t.loading : (isRegister ? t.createAccount : t.login)}
          </button>
        </form>

        {/* Toggle Account Mode */}
        <div className="mt-6 text-center text-xs">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className="text-slate-400 hover:text-white transition"
          >
            {isRegister ? t.hasAccount : t.noAccount}{" "}
            <span className="text-indigo-400 font-semibold hover:underline cursor-pointer">
              {isRegister ? t.login : t.register}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
