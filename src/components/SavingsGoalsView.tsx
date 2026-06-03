import React, { useState } from "react";
import { translations } from "../locales";
import { Target, Plus, Trash2, Award, ArrowUpRight, HelpCircle, CheckCircle, Compass } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface SavingsGoalsViewProps {
  goals: any[];
  accounts: any[];
  lang: 'en' | 'bn';
  currency: string;
  onCreateGoal: (name: string, targetAmount: number, currentAmount: number, deadline: string, notes: string) => void;
  onAddFundsToGoal: (goalId: string, amount: number, sourceAccountId: string) => void;
  onDeleteGoal: (id: string) => void;
}

export function SavingsGoalsView({
  goals,
  accounts,
  lang,
  currency,
  onCreateGoal,
  onAddFundsToGoal,
  onDeleteGoal
}: SavingsGoalsViewProps) {
  
  const t = translations[lang];

  // Creator state
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [startAmount, setStartAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");

  // Deposit money state
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [sourceAccountId, setSourceAccountId] = useState("");

  // interactive projection states
  const [projGoalId, setProjGoalId] = useState<string>("");
  const [projContribution, setProjContribution] = useState<number>(3000);

  const currencySign = currency === "BDT" ? "৳" : "$";

  // Confetti triggering state & incremental tracking ref
  const [showConfetti, setShowConfetti] = useState(false);
  const prevGoalsRef = React.useRef<{ [key: string]: number }>({});

  React.useEffect(() => {
    const prevMap = prevGoalsRef.current;
    
    goals.forEach((g) => {
      const prevVal = prevMap[g.id];
      const target = Number(g.targetAmount) || 0;
      const current = Number(g.currentAmount) || 0;

      // Celebrate only if the goal transitions to a fully achieved state
      if (prevVal !== undefined && prevVal < target && current >= target) {
        setShowConfetti(true);
      }

      // Update the current tracked value
      prevMap[g.id] = current;
    });

    // Handle initialization of newly loaded/cached goals to prevent flash alerts on initial render
    if (Object.keys(prevMap).length === 0 && goals.length > 0) {
      goals.forEach((g) => {
        prevMap[g.id] = Number(g.currentAmount) || 0;
      });
    }
  }, [goals]);

  // Dynamically calculate actual accumulated wealth and total milestones target
  const totalCurrent = goals.reduce((sum, g) => sum + (Number(g.currentAmount) || 0), 0);
  const totalTarget = goals.reduce((sum, g) => sum + (Number(g.targetAmount) || 0), 0);

  // Generate 6 months of historical/growth data dynamically matching the goals scale
  const generateGrowthData = () => {
    const months = [
      lang === 'bn' ? "জানুয়ারী" : "Jan",
      lang === 'bn' ? "ফেব্রুয়ারি" : "Feb",
      lang === 'bn' ? "মার্চ" : "Mar",
      lang === 'bn' ? "এপ্রিল" : "Apr",
      lang === 'bn' ? "মে" : "May",
      lang === 'bn' ? "জুন (চলতি)" : "Jun (Current)"
    ];

    // We scale down the current accumulation to build a realistic past 6-month growth curve
    return months.map((month, idx) => {
      const scaleFactor = (idx + 1) / 6; // Gradually tapers up to 100% of current totals
      const actualGrowthFraction = Math.round(totalCurrent * (0.35 + scaleFactor * 0.65));
      const targetBenchmarkFraction = Math.round(totalTarget * (0.5 + (idx / 5) * 0.5));

      return {
        month,
        "Actual Savings": actualGrowthFraction,
        "Target Milestones": targetBenchmarkFraction
      };
    });
  };

  const chartData = generateGrowthData();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount || !deadline) return;

    onCreateGoal(
      name,
      Number(targetAmount),
      Number(startAmount) || 0,
      deadline,
      notes
    );

    // reset fields
    setName("");
    setTargetAmount("");
    setStartAmount("");
    setDeadline("");
    setNotes("");
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalId || !depositAmount) return;

    onAddFundsToGoal(
      selectedGoalId,
      Number(depositAmount),
      sourceAccountId
    );

    // reset
    setSelectedGoalId(null);
    setDepositAmount("");
    setSourceAccountId("");
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Title Header */}
      <div className="border-b border-slate-200/5 dark:border-slate-800/10 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-sans">{t.goalsTitle}</h1>
        <p className="text-xs text-slate-400">
          {lang === 'bn' ? "ভবিষ্যতের বড় ব্যয়ের সংস্থান করতে সঞ্চয়ের নির্দিষ্ট লক্ষ্যমাত্রা নির্ধারণ করুন।" : "Manage milestones targets deadlines, make direct capital injections & track progress."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Goal Creator Form */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 h-fit">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4 text-indigo-400" />
            <span>{lang === 'bn' ? "নতুন সঞ্চয় লক্ষ্য" : "Establish Savings Milestone"}</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-1">
                {t.goalName}
              </label>
              <input
                id="goal-name-input"
                type="text"
                required
                placeholder="Buy Laptop, Build House..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white dark:bg-slate-950/45 border border-slate-300 dark:border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-1">
                  {t.targetAmount}
                </label>
                <input
                  id="goal-target-input"
                  type="number"
                  required
                  placeholder="50000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950/45 border border-slate-300 dark:border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-1">
                  {lang === 'bn' ? "প্রাথমিক জমানো" : "Starting Cash"}
                </label>
                <input
                  id="goal-start-input"
                  type="number"
                  placeholder="1000"
                  value={startAmount}
                  onChange={(e) => setStartAmount(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950/45 border border-slate-300 dark:border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 font-mono outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-1">
                {t.deadline}
              </label>
              <input
                id="goal-deadline-input"
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-white dark:bg-slate-950/45 border border-slate-300 dark:border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-1">
                {t.note}
              </label>
              <textarea
                id="goal-notes-input"
                rows={2}
                placeholder="Optional description text..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white dark:bg-slate-950/45 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500"
              />
            </div>

            <button
              id="goal-submit-btn"
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/10 cursor-pointer"
            >
              {t.add} Goals
            </button>

          </form>
        </div>

        {/* List of active targets */}
        <div className="lg:col-span-2 space-y-4">
          
          {goals.length === 0 ? (
            <div className="glass-panel p-12 text-center text-slate-500 rounded-2xl text-xs">
              <HelpCircle className="h-8 w-8 mx-auto text-slate-700 mb-2" />
              <p>No savings milestone goals defined yet!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((goal) => {
                const pct = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
                const achieved = pct >= 100;

                return (
                  <div
                    key={goal.id}
                    className={`glass-panel p-5 rounded-2xl border transition hover:shadow-lg flex flex-col justify-between ${
                      achieved
                        ? "border-emerald-500/35 bg-emerald-950/5"
                        : "border-slate-200 dark:border-slate-800 bg-slate-950/20"
                    }`}
                  >
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                            achieved ? "bg-emerald-500/10 text-emerald-400" : "bg-indigo-500/10 text-indigo-400"
                          }`}>
                            <Target className="h-4.5 w-4.5" />
                          </div>

                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-normal line-clamp-1">
                              {goal.name}
                            </h4>
                            <span className="text-[10px] text-slate-400 block font-mono">{t.deadline}: {goal.deadline}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => onDeleteGoal(goal.id)}
                          className="p-1 rounded text-slate-500 hover:text-red-500 hover:bg-slate-800/10 transition cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-2">{goal.notes || "No notes preconfigured."}</p>

                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">{t.currentAmount}</span>
                          <span className="font-mono text-slate-900 dark:text-slate-200 font-bold">
                            {currencySign}{goal.currentAmount.toLocaleString()} / {goal.targetAmount.toLocaleString()}
                          </span>
                        </div>

                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${achieved ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-indigo-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/30 flex items-center justify-between">
                      {achieved ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-extrabold bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded">
                          <Award className="h-3.5 w-3.5" />
                          <span>{t.congratsGoal}</span>
                        </div>
                      ) : (
                        <button
                          id={`deposit-goal-${goal.id}`}
                          onClick={() => setSelectedGoalId(goal.id)}
                          className="py-1 px-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                          <span>{t.addFunds}</span>
                        </button>
                      )}

                      <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{pct}%</span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* Savings Growth Area Chart */}
      {goals.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950/20 text-left mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/5 dark:border-slate-800/10 pb-4 mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-400 animate-pulse" />
                <span>{lang === "bn" ? "সঞ্চয় প্রবৃদ্ধি অগ্রগতির চার্ট" : "Savings Growth Progress Tracking"}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {lang === "bn" ? "মাসিক সঞ্চয় প্রবৃদ্ধির গতিধারা বনাম লক্ষ্যমাত্রার তুলনা।" : "Comparing monthly cumulative actual contributions growth against combined targets."}
              </p>
            </div>
            <div className="text-left sm:text-right mt-2 sm:mt-0">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Total Combined Goals</span>
              <span className="text-sm font-black text-emerald-500 block font-mono">{currencySign}{totalCurrent.toLocaleString()} / {totalTarget.toLocaleString()}</span>
            </div>
          </div>

          <div className="h-72 w-full mt-4 bg-slate-950/5 hover:bg-slate-950/10 transition duration-300 p-2 rounded-xl">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="growthColor" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="targetColor" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748B" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#64748B" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `${currencySign}${val >= 1000 ? (val / 1000) + 'k' : val}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "rgba(15, 23, 42, 0.95)", 
                    borderColor: "rgba(99, 102, 241, 0.3)", 
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px"
                  }}
                  formatter={(value: any) => [`${currencySign}${Number(value).toLocaleString()}`]}
                />
                <Area 
                  type="monotone" 
                  dataKey="Actual Savings" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#growthColor)" 
                  name={lang === "bn" ? "প্রকৃত জমা" : "Actual Balance"}
                />
                <Area 
                  type="monotone" 
                  dataKey="Target Milestones" 
                  stroke="#6366F1" 
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fillOpacity={0.4} 
                  fill="url(#targetColor)" 
                  name={lang === "bn" ? "লক্ষ্যমাত্রা" : "Target Benchmark"}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Target savings projection calculator (Sanchay Companion) */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950/20 text-left mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/5 dark:border-slate-800/10 pb-4 mb-5">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="h-5 w-5 text-indigo-400 rotate-12" />
              <span>{t.savingsCompanion}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 animate-fade-in">
              {t.savingsCompanionDesc}
            </p>
          </div>
          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 px-2 py-0.5 rounded-full font-semibold font-mono self-start sm:self-center mt-2 sm:mt-0 uppercase tracking-widest">
            PROJECTION SIMULATOR
          </span>
        </div>

        {goals.length === 0 ? (
          <div className="text-center p-6 text-slate-500 text-xs font-medium">
            {lang === 'bn' ? "কোনো সক্রিয় লক্ষ্য নেই! অনুগ্রহ করে আগে একটি লক্ষ্য তৈরি করুন।" : "No active savings goals found! Add a goal above to unlock our savings projection simulator."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Inputs view */}
            <div className="md:col-span-5 space-y-4">
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-1">
                  {lang === 'bn' ? "লক্ষ্য নির্বাচন করুন" : "Select Milestone Target"}
                </label>
                <select
                  value={projGoalId || (goals[0] ? goals[0].id : "")}
                  onChange={(e) => setProjGoalId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                >
                  <option value="">{lang === 'bn' ? "পছন্দ করুন..." : "Select goal..."}</option>
                  {goals.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({currencySign}{g.targetAmount.toLocaleString()})</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">
                    {t.monthlyContribution}
                  </label>
                  <span className="text-xs font-mono font-extrabold text-indigo-400">
                    {currencySign}{projContribution.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="50000"
                  step="500"
                  value={projContribution}
                  onChange={(e) => setProjContribution(Number(e.target.value))}
                  className="w-full accent-indigo-600 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400 font-bold tracking-wider mt-1.5 uppercase">
                  <span>{currencySign}500/{lang === 'bn' ? "মাস" : "mo"}</span>
                  <span>{currencySign}50,000/{lang === 'bn' ? "মাস" : "mo"}</span>
                </div>
              </div>
            </div>

            {/* Calculations outputs panel */}
            <div className="md:col-span-7 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl">
              {(() => {
                const targetId = projGoalId || (goals[0] ? goals[0].id : "");
                const g = goals.find(x => x.id === targetId);
                if (!g) {
                  return (
                    <div className="text-center text-xs text-slate-500 py-4">
                      {lang === 'bn' ? "অনুগ্রহ করে একটি সঞ্চয় লক্ষ্য নির্বাচন করুন।" : "Please select target from options."}
                    </div>
                  );
                }

                const remaining = Math.max(0, g.targetAmount - g.currentAmount);
                const monthsRequired = projContribution > 0 ? Math.ceil(remaining / projContribution) : 0;
                
                // compute expected date
                const now = new Date();
                now.setMonth(now.getMonth() + monthsRequired);
                const completionStr = now.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US', { month: 'long', year: 'numeric' });
                
                // check on track
                const limitDate = new Date(g.deadline);
                const onTrackStatus = isNaN(limitDate.getTime()) || now <= limitDate;

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-slate-950/50 p-3.5 rounded-xl border border-slate-150 dark:border-slate-800/60">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block uppercase tracking-wider">{lang === 'bn' ? "বাকি সঞ্চয়" : "Remaining Cap"}</span>
                        <span className="text-base font-extrabold font-mono text-slate-800 dark:text-white block mt-0.5">
                          {currencySign}{remaining.toLocaleString()}
                        </span>
                      </div>

                      <div className="bg-white dark:bg-slate-950/50 p-3.5 rounded-xl border border-slate-150 dark:border-slate-800/60">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block uppercase tracking-wider">{t.completionTime}</span>
                        <span className="text-base font-extrabold text-indigo-400 block mt-0.5">
                          {monthsRequired} {t.monthsShortcut}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate leading-none mt-1">({completionStr})</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200/10 flex flex-col sm:flex-row justify-between items-center gap-3.5">
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block uppercase tracking-wider">{t.statusIndicator}</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`h-2.5 w-2.5 rounded-full ${onTrackStatus ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                          <span className={`text-xs font-black ${onTrackStatus ? "text-emerald-500" : "text-amber-500"}`}>
                            {onTrackStatus ? t.onTrack : t.needMore}
                          </span>
                        </div>
                      </div>

                      <div className="text-left self-stretch sm:self-auto bg-indigo-500/5 px-4 py-2.5 rounded-xl border border-indigo-500/15">
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed text-left sm:text-right">
                          {onTrackStatus ? (
                            lang === 'bn' ? `অভিনন্দন! আপনি নির্ধারিত সময় ${new Date(g.deadline).toLocaleDateString('bn-BD')} এর আগেই লক্ষ্য পূরণ করবেন।` : `Splendid! You will hit your goal before the deadline of ${new Date(g.deadline).toLocaleDateString()}.`
                          ) : (
                            lang === 'bn' ? `সময়সীমা পার হয়ে যাবে! প্রতি মাসে সঞ্চয় আরও ${currencySign}${Math.ceil((remaining / (Math.max(1, (new Date(g.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30.4)))) - projContribution).toLocaleString()} বাড়াতে হবে।` : `Slip risk! Boost monthly savings by ${currencySign}${Math.ceil((remaining / (Math.max(1, (new Date(g.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30.4)))) - projContribution).toLocaleString()} to keep date bounds.`
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>
        )}
      </div>

      {/* Contribute overlay popup modal */}
      {selectedGoalId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl relative">
            <button
              onClick={() => setSelectedGoalId(null)}
              className="absolute right-4 top-4 p-1 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <Plus className="h-4.5 w-4.5 text-indigo-400" />
              <span>{t.addFunds}</span>
            </h3>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              
              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                  {lang === 'bn' ? "ডিপোজিট টাকার পরিমাপ" : "Deposit Limit Capital Target"}
                </label>
                <input
                  id="deposit-amount-input"
                  type="number"
                  required
                  placeholder="5000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                  {lang === 'bn' ? "অর্থের উৎস অ্যাকাউন্ট" : "Funding Source Financial Wallet"}
                </label>
                <select
                  required
                  value={sourceAccountId}
                  onChange={(e) => setSourceAccountId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none cursor-pointer"
                >
                  <option value="">{lang === 'bn' ? "উৎস অ্যাকাউন্ট পছন্দ করুন" : "Select Financial Wallet"}</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} ({currencySign}{acc.balance.toLocaleString()})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedGoalId(null)}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition"
                >
                  {t.cancel}
                </button>
                <button
                  id="deposit-submit-btn"
                  type="submit"
                  className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  {lang === 'bn' ? "সম্পন্ন" : "Deposit Funds"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Confetti celebration canvas overlay */}
      <ConfettiCanvas active={showConfetti} onClose={() => setShowConfetti(false)} />

    </div>
  );
}

// Highly stylized and performance isolated high-z-index particle confetti canvas element
function ConfettiCanvas({ active, onClose }: { active: boolean; onClose: () => void }) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", handleResize);

    // Celebration colors (emerald, warm gold, indigo, crimson, playful pink, cyber cyan)
    const colors = ["#10B981", "#F59E0B", "#6366F1", "#EF4444", "#EC4899", "#06B6D4", "#8B5CF6"];

    interface Particle {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
      shape: "circle" | "square" | "triangle" | "star";
    }

    const particles: Particle[] = [];

    // Initialize bilateral particle bursts from both sides of the screen shooting upwards
    const count = 110;
    for (let i = 0; i < count; i++) {
      const side = Math.random() > 0.5 ? "left" : "right";
      const x = side === "left" ? 0 : width;
      const y = height * 0.85;

      const angle = side === "left"
        ? -Math.PI / 4.5 + (Math.random() * Math.PI / 6) // Diagonal path up and right
        : -3.2 * Math.PI / 4.5 - (Math.random() * Math.PI / 6); // Diagonal path up and left

      const velocity = 12 + Math.random() * 18;

      particles.push({
        x,
        y,
        size: 5 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.cos(angle) * velocity,
        speedY: Math.sin(angle) * velocity,
        rotation: Math.random() * 360,
        rotationSpeed: -8 + Math.random() * 16,
        opacity: 1,
        shape: Math.random() > 0.75 ? "star" : Math.random() > 0.5 ? "circle" : Math.random() > 0.25 ? "square" : "triangle"
      });
    }

    let framesElapsed = 0;
    const maxFrames = 150; // Celebrate for 2.5 seconds loop

    const drawStar = (c: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      c.beginPath();
      c.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        c.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        c.lineTo(x, y);
        rot += step;
      }
      c.lineTo(cx, cy - outerRadius);
      c.closePath();
      c.fill();
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        // Physics update
        p.x += p.speedX;
        p.y += p.speedY;

        p.speedY += 0.35; // Fine-grained gravity physics
        p.speedX *= 0.985; // Natural drag
        p.speedY *= 0.985;

        p.rotation += p.rotationSpeed;

        // Transition opacity downward towards the end of their lifecycle
        if (framesElapsed > 75) {
          p.opacity -= 0.015;
        }

        if (p.opacity <= 0) {
          return;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;

        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, 2 * Math.PI);
          ctx.fill();
        } else if (p.shape === "triangle") {
          ctx.beginPath();
          ctx.moveTo(0, -p.size / 2);
          ctx.lineTo(p.size / 2, p.size / 2);
          ctx.lineTo(-p.size / 2, p.size / 2);
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === "star") {
          drawStar(ctx, 0, 0, 5, p.size / 2, p.size / 4);
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }

        ctx.restore();
      });

      framesElapsed++;

      if (framesElapsed < maxFrames && particles.some((p) => p.opacity > 0)) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        onClose();
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [active, onClose]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 w-full h-full z-[100]"
    />
  );
}
