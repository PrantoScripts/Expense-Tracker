import React, { useEffect, useState } from "react";
import { translations } from "../locales";
import { ShieldCheck, Users, Activity, ToggleLeft, ToggleRight, Radio, HelpCircle, HardDrive } from "lucide-react";

interface AdminPanelProps {
  lang: 'en' | 'bn';
  currency: string;
}

export function AdminPanel({ lang, currency }: AdminPanelProps) {
  const t = translations[lang];

  // Admin state
  const [metrics, setMetrics] = useState<any | null>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const currencySign = currency === "BDT" ? "৳" : "$";

  const fetchAdminData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const headers = { "Authorization": `Bearer ${localStorage.getItem("spendwise_token")}` };
      
      const metricsRes = await fetch("/api/admin/metrics", { headers });
      const usersRes = await fetch("/api/admin/users", { headers });

      if (metricsRes.ok && usersRes.ok) {
        const metricsData = await metricsRes.json();
        const usersData = await usersRes.json();
        setMetrics(metricsData);
        setUsersList(usersData);
      } else {
        setErrorMsg("Failed to authenticate admin access token.");
      }
    } catch (e) {
      setErrorMsg("Error communicating with admin sub-routes.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const toggleRegistrations = async () => {
    try {
      const res = await fetch("/api/admin/settings/toggle-reg", {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("spendwise_token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMetrics((prev: any) => ({ ...prev, allowRegistrations: data.allowRegistrations }));
      }
    } catch (e) {
      console.error("Toggle failed", e);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-2">
        <div className="h-6 w-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <span className="text-xs text-slate-500">{t.loading}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left animate-fade-in font-sans">
      
      {/* Title */}
      <div className="border-b border-slate-200/5 dark:border-slate-800/10 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-sans flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-indigo-400" />
          <span>{t.adminDashboard}</span>
        </h1>
        <p className="text-xs text-slate-400">
          Monitor aggregated SaaS performance, active user metrics, registration rules, database structures & system status logs.
        </p>
      </div>

      {errorMsg ? (
        <div className="p-4 bg-red-950/20 border border-red-900/50 rounded-2xl text-xs text-red-200">
          ⚠️ {errorMsg}
        </div>
      ) : null}

      {metrics && (
        <>
          {/* Quick Metrics Statistics Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase tracking-wider">{t.totalUsers}</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{metrics.activeUsersCount} Users</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Aggregation Volume</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{metrics.transactionCount} entries</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Activity className="h-5 w-5" />
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Platform Reserves</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block font-mono">{currencySign}{metrics.totalSystemCashpool.toLocaleString()}</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <HardDrive className="h-5 w-5" />
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Host Status</span>
                <span className="text-sm font-bold text-emerald-400 mt-1 block flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                  <span>ONLINE / SLA 99%</span>
                </span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Radio className="h-5 w-5 text-emerald-400" />
              </div>
            </div>

          </div>

          {/* System Settings & Registrations togglers */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-202 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{t.manageSystem}</h3>
            <p className="text-xs text-slate-400">Perform direct system manipulation or developer configurations changes.</p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800/55">
                <div>
                  <span className="text-xs font-bold text-slate-950 dark:text-slate-100 block">{t.allowReg}</span>
                  <span className="text-[10px] text-slate-500 block">Allow public signups on the landing page</span>
                </div>

                <button onClick={toggleRegistrations} className="cursor-pointer text-indigo-400">
                  {metrics.allowRegistrations ? (
                    <ToggleRight className="h-8 w-8 text-indigo-500" />
                  ) : (
                    <ToggleLeft className="h-8 w-8 text-slate-600" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800/55">
                <div>
                  <span className="text-xs font-bold text-slate-950 dark:text-slate-100 block">{t.maintenance}</span>
                  <span className="text-[10px] text-slate-500 block">Block access on page assets for safety</span>
                </div>

                <button className="cursor-pointer text-slate-600">
                  <ToggleLeft className="h-8 w-8 text-slate-600" />
                </button>
              </div>

            </div>
          </div>

          {/* User Directory Table list */}
          <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800/40 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Active Users Directory list</span>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-indigo-500/10 text-indigo-400">Global Registry</span>
            </div>

            <div className="overflow-x-auto text-xs text-left">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800/80 text-slate-400">
                    <th className="p-4 uppercase tracking-wider font-bold">User Information</th>
                    <th className="p-4 uppercase tracking-wider font-bold">Email</th>
                    <th className="p-4 uppercase tracking-wider font-bold">Currency Preference</th>
                    <th className="p-4 uppercase tracking-wider font-bold">Registration Date</th>
                    <th className="p-4 uppercase tracking-wider font-bold text-center">Admin Privileges</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {usersList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">No users recorded.</td>
                    </tr>
                  ) : (
                    usersList.map((usr) => (
                      <tr key={usr.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/10 transition">
                        <td className="p-4 font-bold text-slate-900 dark:text-slate-200">{usr.name}</td>
                        <td className="p-4 font-mono text-slate-400">{usr.email}</td>
                        <td className="p-4 font-bold text-slate-600 dark:text-slate-400">{usr.currency || "BDT"}</td>
                        <td className="p-4 font-mono text-slate-400">{usr.createdAt?.substring(0, 10) || "N/A"}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold font-mono ${
                            usr.isAdmin ? "bg-red-500/10 text-red-400 border border-red-500/10" : "bg-slate-800 text-slate-400"
                          }`}>
                            {usr.isAdmin ? "SYSTEMS ADMIN" : "REGULAR CLIENT"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
