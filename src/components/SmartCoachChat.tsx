import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  MessageSquare, 
  X, 
  Send, 
  HelpCircle, 
  Coins, 
  ChevronDown, 
  Bot, 
  BadgeHelp,
  ArrowRight,
  Zap,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

interface SmartCoachChatProps {
  lang: 'en' | 'bn';
  token: string | null;
  currency: string;
}

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  source: 'support' | 'advisor';
  timestamp: string;
  isHtml?: boolean;
}

export function SmartCoachChat({ lang, token, currency }: SmartCoachChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<'support' | 'advisor'>('advisor');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Suggested quick prompts depending on active mode and language preference
  const suggestions = {
    en: {
      advisor: [
        { label: "🔍 Expense Audit", text: "Analyze my category breakdowns and suggest how to clip food/healthcare expenses." },
        { label: "🏥 Health Scoring", text: "Give me an overview of my current financial health, goal progress, and net savings rate." },
        { label: "🔮 Overrun Forecast", text: "Based on my active budgets, forecast if I will overspend or breach any limits this month." },
        { label: "💡 Smart Tip", text: "Provide me one high-impact micro-habit to optimize my cash flow this weekend." }
      ],
      support: [
        { label: "📸 AI Receipt scan?", text: "How does the SpendWise Gemini AI receipt scanner automatically extract data?" },
        { label: "📉 Set up budget?", text: "Explain step by step how to establish a category budget with visual alerts." },
        { label: "🎯 Savings goal?", text: "How do I contribute capital to an active saving milestone?" },
        { label: "🔄 Recurring rules?", text: "What is a recurring transaction rule and how is it autologged?" }
      ]
    },
    bn: {
      advisor: [
        { label: "🔍 ব্যয় অডিট", text: "আমার ব্যয়ের খাতা অডিট করে স্বাস্থ্যসেবা ও খাবার খরচ কমানোর সুনির্দিষ্ট উপায় জানান।" },
        { label: "🏥 আর্থিক মূল্যায়ন", text: "আমার বর্তমান সঞ্চয় হার ও লক্ষ্যের উপর ভিত্তি করে ফাইন্যান্সিয়াল স্কোরকার্ড দিন।" },
        { label: "🔮 বাজেট পূর্বাভাস", text: "চলতি মাসের বাজেটের কি সীমা ছাড়িয়ে যেতে পারে? কোনো সতর্কতা আছে?" },
        { label: "💡 আর্থিক পরামর্শ", text: "আমার সঞ্চয় বাড়ানোর জন্য একটি সহজ ও চমৎকার বুদ্ধি দিন।" }
      ],
      support: [
        { label: "📸 রিসিট স্ক্যান", text: "জেমিনী এআই কীভাবে রিসিটের ছবি থেকে স্বয়ংক্রিয়ভাবে তথ্য পূরণ করে?" },
        { label: "📉 বাজেট তৈরি", text: "ধাপে ধাপে দেখান কীভাবে সীমা নির্ধারণ করে সতর্কবার্তা ট্রিগার করব।" },
        { label: "🎯 লক্ষ্যমাত্রা ফান্ডিং", text: "সঞ্চয়ের লক্ষ্য অর্জনে ব্যাংক থেকে টাকা কীভাবে স্থানান্তর করব?" },
        { label: "🔄 বাৎসরিক ও চলতি নিয়ম", text: "চলতি বা পৌনঃপুনিক নিয়ম কীভাবে কাজ করে?" }
      ]
    }
  };

  // Pre-seed chat history depending on Mode and Language when chat is first opened
  useEffect(() => {
    if (messages.length === 0) {
      const initialText = lang === 'bn'
        ? "নমস্কার! আমি স্পেন্ডওয়াইজের স্মার্ট এআই কোচ। আপনি চাইলে আপনার প্রকৃত ব্যয়ের খাতার আর্থিক অডিট অ বিশ্লেষণ নিতে পারেন অথবা স্পেন্ডওয়াইজের ফিচার সম্পর্কিত প্রশ্ন করতে পারেন।"
        : "Hello! I am your AI-powered Smart Coach support center. Ask me details about app features, or click 'Financial Insights Mode' above to receive fully synchronized audits of your actual financial transactions!";
      
      setMessages([
        {
          sender: 'bot',
          text: initialText,
          source: 'advisor',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [lang]);

  // Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const rawVal = textToSend || inputText;
    if (!rawVal.trim()) return;

    // Log user message
    const userMsg: ChatMessage = {
      sender: "user",
      text: rawVal.trim(),
      source: activeMode,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      if (activeMode === 'advisor') {
        // Send to Financial Coach API
        const response = await fetch("/api/coach/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            customPrompt: rawVal.trim(),
            language: lang
          })
        });

        if (response.ok) {
          const data = await response.json();
          const botMsg: ChatMessage = {
            sender: 'bot',
            text: data.analysis,
            isHtml: true, // Serve HTML format formatted inside coach response
            source: 'advisor',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, botMsg]);
        } else {
          throw new Error("Financial coach server error");
        }
      } else {
        // Send to FAQ Help bot API
        const response = await fetch("/api/chatbot", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            message: rawVal.trim(),
            language: lang
          })
        });

        if (response.ok) {
          const data = await response.json();
          const botMsg: ChatMessage = {
            sender: 'bot',
            text: data.response,
            isHtml: true,
            source: 'support',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, botMsg]);
        } else {
          throw new Error("Guideliner FAQ chatbot error");
        }
      }
    } catch (e) {
      const errorText = lang === 'bn' 
        ? "আমি অত্যন্ত দুঃখিত, সিস্টেম এআই সংযোগ বিচ্ছিন্ন হয়েছে। অনুগ্রহ করে কিছু সময় পর পুনরায় চেষ্টা করুন।"
        : "I am facing server connectivity limits. Please retry your inquiry shortly.";
      
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: errorText,
          source: activeMode,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const currentSuggestions = lang === 'bn' 
    ? (activeMode === 'advisor' ? suggestions.bn.advisor : suggestions.bn.support)
    : (activeMode === 'advisor' ? suggestions.en.advisor : suggestions.en.support);

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans text-left">
      {/* Floating Trigger Bubble Button Option */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group flex items-center gap-2 p-3.5 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-indigo-500/20 shadow-indigo-500/25"
          aria-label="Open Smart Coach Assistant"
        >
          <div className="relative">
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400"></span>
            </span>
            <Bot className="h-6 w-6 stroke-[2]" />
          </div>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-bold text-xs whitespace-nowrap leading-none pr-1 uppercase tracking-wider">
            {lang === 'bn' ? "স্মার্ট কোচ এআই" : "Smart Coach AI"}
          </span>
        </button>
      )}

      {/* Main Collapsible Chat Container Box */}
      {isOpen && (
        <div className="w-[380px] sm:w-[410px] h-[550px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-in relative">
          
          {/* Header Area */}
          <div className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse border border-white" />
                <div className="h-9 w-9 rounded-xl bg-indigo-500/15 flex items-center justify-center border border-indigo-500/10">
                  <Sparkles className="h-4.5 w-4.5 text-indigo-500 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5 leading-none">
                  {lang === 'bn' ? "স্পেন্ডওয়াইজ এআই কোচ" : "SpendWise Smart Coach"}
                </h3>
                <span className="text-[10px] text-emerald-500 font-bold block mt-1 tracking-wide uppercase">
                  ● {lang === 'bn' ? "জেমিনি সহায়তাকারী সক্রিয়" : "Gemini Engine Active"}
                </span>
              </div>
            </div>

            {/* Minimize control Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Selector Switcher Navigation Tabs Mode */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800/80 gap-1.5">
            <button
              onClick={() => {
                setActiveMode('advisor');
                // Auto seed a welcome message if modes are changed
                if (messages.filter(m => m.source === 'advisor').length === 0) {
                  setMessages(prev => [
                    ...prev,
                    {
                      sender: 'bot',
                      text: lang === 'bn' 
                        ? "আমি আপনার অ্যাকাউন্টের খাতা থেকে রিয়েল-টাইম ব্যালেন্স, ক্যাটাগরি বাজেট মাত্রা এবং সেভিং মাইলস্টোনের তথ্য সমন্বয় করতে প্রস্তুত। বলুন কী জানতে চান?"
                        : "Ready! I am analyzing your live ledger sheets, current currencies balances, and budgets alert ratios explicitly. How can I audit your finances today?",
                      source: 'advisor',
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  ]);
                }
              }}
              className={`py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeMode === 'advisor'
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-900/50"
              }`}
            >
              <Coins className="h-3 w-3" />
              <span>{lang === 'bn' ? "পার্সোনাল এ্যাডভাইজর" : "Financial Advisor Mode"}</span>
            </button>
            
            <button
              onClick={() => {
                setActiveMode('support');
                // Auto seed a welcome message if modes are changed
                if (messages.filter(m => m.source === 'support').length === 0) {
                  setMessages(prev => [
                    ...prev,
                    {
                      sender: 'bot',
                      text: lang === 'bn'
                        ? "স্পেন্ডওয়াইজ অ্যাপ নিয়ে যেকোনো কুয়েরী বা কীভাবে ব্যবহার করবেন তা জানতে আমাকে নিচে টাইপ করে জানান। আমি আপনাকে ধাপে ধাপে গাইড করব।"
                        : "Need a hand? Ask me about receipt scanning, configuring transactions, budgets alerts, or goal deposition routines immediately.",
                      source: 'support',
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  ]);
                }
              }}
              className={`py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeMode === 'support'
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-900/50"
              }`}
            >
              <HelpCircle className="h-3 w-3" />
              <span>{lang === 'bn' ? "ফিচার ট্র্যাকিং সাপোর্ট" : "App Support Mode"}</span>
            </button>
          </div>

          {/* Mode Warning Label Banner */}
          <div className="px-3 py-1.5 bg-yellow-500/5 dark:bg-yellow-500/10 border-b border-slate-200 dark:border-slate-800/80 flex items-center gap-2 text-[10px] text-amber-800 dark:text-yellow-400/90 font-bold">
            <Zap className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-yellow-500" />
            <span>
              {activeMode === 'advisor' 
                ? (lang === 'bn' ? "এই মোড জেমিনি ৩.৫ দিয়ে আপনার প্রকৃত খরচের খাতা বিশ্লেষণ করবে।" : "Powered by Gemini 3.5, active on your real spend transactions ledger.")
                : (lang === 'bn' ? "এই মোড অ্যাপের ফিচার এবং নির্দেশিকা ব্যবহারে সহায়তা করবে।" : "Ask how to operate budgets, OCR scanner, savings targets, etc.")}
            </span>
          </div>

          {/* Chat Logs viewport body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/20 scrollbar-thin">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex gap-2.5 max-w-[85%] ${
                  msg.sender === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {msg.sender === 'bot' && (
                  <div className="h-7 w-7 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/10">
                    <Bot className="h-3.5 w-3.5 text-indigo-500" />
                  </div>
                )}
                
                <div className="space-y-1">
                  <div 
                    className={`rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none font-sans"
                    }`}
                  >
                    {msg.isHtml ? (
                      <div 
                        className="prose prose-sm dark:prose-invert max-w-none text-[11px] space-y-1.5"
                        dangerouslySetInnerHTML={{ __html: msg.text }} 
                      />
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    )}
                  </div>
                  <span className={`text-[9px] text-slate-400 block ${msg.sender === 'user' ? "text-right" : "text-left"}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Smart simulated typing indicator loader loop */}
            {loading && (
              <div className="flex gap-2.5 max-w-[80%] mr-auto items-start">
                <div className="h-7 w-7 rounded-lg bg-indigo-500/15 flex items-center justify-center shrink-0 border border-indigo-500/10">
                  <Bot className="h-3.5 w-3.5 text-indigo-500 animate-bounce" />
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-200" />
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-300" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestions grid layout list */}
          <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-900/60">
            <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <BadgeHelp className="h-3.5 w-3.5" />
              <span>{lang === 'bn' ? "ঝটপট প্রশ্ন করুন" : "Quick Suggested Queries"}</span>
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto pr-1">
              {currentSuggestions.map((item, id) => (
                <button
                  key={id}
                  onClick={() => handleSendMessage(item.text)}
                  disabled={loading}
                  className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-bold transition flex items-center gap-1 outline-none disabled:opacity-45 cursor-pointer leading-none"
                >
                  <span>{item.label}</span>
                  <ArrowRight className="h-2.5 w-2.5 stroke-[2.5]" />
                </button>
              ))}
            </div>
          </div>

          {/* Input Chat Field form controls */}
          <div className="p-3 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={activeMode === 'advisor' 
                ? (lang === 'bn' ? "আর্থিক কোচকে যেকোনো প্রশ্ন করুন..." : "Consult your finance Guru...") 
                : (lang === 'bn' ? "স্পেন্ডওয়াইজ ট্র্যাকার হেল্প..." : "Learn about SpendWise features...")}
              className="flex-1 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 outline-none transition"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) handleSendMessage();
              }}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !inputText.trim()}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition shadow-xl shrink-0"
              title="Send Message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
