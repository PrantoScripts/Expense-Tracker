import React, { useState } from "react";
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  CreditCard, 
  Coins, 
  PieChart, 
  Target, 
  Clock, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Info
} from "lucide-react";

interface HelpViewProps {
  lang: 'en' | 'bn';
  token: string | null;
}

interface FaqItem {
  id: number;
  category: 'accounts' | 'transactions' | 'budgets' | 'savings' | 'recurring' | 'settings';
  q: { en: string; bn: string };
  a: { en: string; bn: string };
}

export function HelpView({ lang, token }: HelpViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Categories definition
  const categories = [
    { id: "all", label: lang === 'bn' ? "সবগুলো ক্যাটাগরি" : "All Categories", icon: BookOpen },
    { id: "accounts", label: lang === 'bn' ? "অ্যাকাউন্ট ও সংযোগ" : "Accounts & Wallets", icon: CreditCard },
    { id: "transactions", label: lang === 'bn' ? "লেনদেন ও এআই রিসিট" : "Transactions & Receipts", icon: Coins },
    { id: "budgets", label: lang === 'bn' ? "বাজেট ও খরচ সীমা" : "Budgets & Spending Caps", icon: PieChart },
    { id: "savings", label: lang === 'bn' ? "সঞ্চয় লক্ষ্যসমূহ" : "Savings Goals", icon: Target },
    { id: "recurring", label: lang === 'bn' ? "পৌনঃপুনিক বা চলতি নিয়ম" : "Recurring Rules", icon: Clock },
    { id: "settings", label: lang === 'bn' ? "নিরাপত্তা ও সেটিংস" : "Security & Settings", icon: ShieldCheck }
  ];

  // Exactly 30 professional FAQs structured inside categories fully in both English and Bengali
  const staticFaqs: FaqItem[] = [
    // Category: Accounts (1-5)
    {
      id: 1,
      category: "accounts",
      q: {
        en: "How do I add a new digital wallet or bank account?",
        bn: "১. কীভাবে নতুন ডিজিটাল ওয়ালেট বা ব্যাংক অ্যাকাউন্ট যুক্ত করব?"
      },
      a: {
        en: "Click the Accounts tab in the sidebar, click 'Add Custom Account', enter the account title, choose the account type (Cash, Bank Account, Mobile Banking), and input its initial opening balance before saving.",
        bn: "সাইডবার থেকে অ্যাকাউন্ট ট্যাবটিতে যান, 'নতুন অ্যাকাউন্ট যোগ করুন' ক্লিক করুন, নাম দিন এবং টাইপটি (ক্যাশ, ব্যাংক, নাকি মোবাইল ব্যাংকিং) নির্বাচন করে প্রারম্ভিক ব্যালেন্স দিয়ে সংরক্ষণ করুন।"
      }
    },
    {
      id: 2,
      category: "accounts",
      q: {
        en: "Can I connect multiple mobile wallets like bKash, Nagad or Rocket?",
        bn: "২. আমি কি বিকাশ, নগদ বা রকেটের মতো একাধিক মোবাইল ওয়ালেট সংযোগ করতে পারব?"
      },
      a: {
        en: "Yes, you can create separate accounts for each digital mobile financial service type. This allows you to track and log multi-platform ledger spendings concurrently.",
        bn: "হ্যাঁ, আপনি বিকাশ, নগদ এবং রকেটের জন্য আলাদা আলাদা মোবাইল অ্যাকাউন্ট তৈরি করার মাধ্যমে প্রতিটি মোবাইল ওয়ালেট আলাদাভাবে ট্র্যাক করতে পারবেন।"
      }
    },
    {
      id: 3,
      category: "accounts",
      q: {
        en: "What is 'Account Consolidation'?",
        bn: "৩. 'অ্যাকাউন্ট কনসোলিডেশন' বা সমন্বয় বলতে কী বোঝায়?"
      },
      a: {
        en: "It is the dynamic tally of the total available balances across all cash, checkings, and mobile accounts, offering a real-time net-worth overview.",
        bn: "এটি আপনার ক্যাশ, ব্যাংক এবং মোবাইল ওয়ালেট মিলিয়ে মোট যত টাকা আছে তার রিয়েল-টাইম সমষ্টি বা নেট-ওয়ার্থের হিসাব প্রদর্শন করে।"
      }
    },
    {
      id: 4,
      category: "accounts",
      q: {
        en: "Is there an option to edit existing account balances manually?",
        bn: "৪. বিদ্যমান অ্যাকাউন্টের ব্যালেন্স কি ম্যানুয়ালি এডিট করা সম্ভব?"
      },
      a: {
        en: "Yes, you can update your balances by clicking the 'Edit Balance' option directly on any account card, or by recording manual adjustive transactions on the ledger sheet.",
        bn: "হ্যাঁ, আপনারা অ্যাকাউন্ট কার্ডটির এডিট মোডে গিয়ে বর্তমান ওয়ালেট ব্যালেন্স ম্যানুয়ালি পরিবর্তন করতে পারেন অথবা অ্যাডজাস্টমেন্ট এন্ট্রি হিসেবে লেনদেন যোগ করতে পারেন।"
      }
    },
    {
      id: 5,
      category: "accounts",
      q: {
        en: "How do I delete an account that I no longer use?",
        bn: "৫. আমি আর ব্যবহার করি না এমন অ্যাকাউন্ট ডিলিট করব কীভাবে?"
      },
      a: {
        en: "Access the Accounts management tab, select the specified card, and click the Delete icon. Be aware that this will also delete associated transaction histories to ensure structural integrity.",
        bn: "অ্যাকাউন্ট ট্যাবে গিয়ে নির্দিষ্ট কার্ডটির পাশে থাকা ডিলিট আইকনে ক্লিক করুন। মনে রাখবেন, এটি ওই অ্যাকাউন্টের সাথে সম্পৃক্ত সব লেনদেনের ইতিহাসও মুছে দেবে।"
      }
    },
    // Category: Transactions (6-10)
    {
      id: 6,
      category: "transactions",
      q: {
        en: "How do I record an everyday expense transaction?",
        bn: "৬. দৈনন্দিন খরচের হিসাব কীভাবে লিখে রাখব?"
      },
      a: {
        en: "Press 'Add Transaction' on the main dashboard, enter the amount, select the transaction type (expense/income), choose active account and category, and submit.",
        bn: "ড্যাশবোর্ডে গিয়ে 'লেনদেন যোগ করুন' বাটনে ক্লিক করে টাকার পরিমাণ লিখুন, ধরন দিন (ব্যয় বা আয়), অ্যাকাউন্ট ও ক্যাটাগরি বেছে নিয়ে সংরক্ষণ করুন।"
      }
    },
    {
      id: 7,
      category: "transactions",
      q: {
        en: "How does the Gemini AI OCR Receipt Scanner extract invoice details?",
        bn: "৭. জেমিনি এআই ওসিআর রিসিট স্ক্যানার কীভাবে মেমোর ছবি থেকে তথ্য বের করে?"
      },
      a: {
        en: "Upload any image of printed receipts or grocery memos. Gemini server-side models intelligently classify dates, merchants, and sums, pre-filling your ledger input automatically.",
        bn: "আপনার রিসিট বা মেমোর ছবি আপলোড করলেই ব্যাকএন্ডে স্বয়ংক্রিয়ভাবে জেমিনি ৩.৫-ফ্ল্যাশ এপিআই সচল হয়, মেমোর দোকানদারের নাম, টাকার পরিমাণ এবং সঠিক ক্যাটাগরি পার্স করে ফর্মটি স্বয়ংক্রিয়ভাবে পূরণ করে।"
      }
    },
    {
      id: 8,
      category: "transactions",
      q: {
        en: "What if the Gemini AI Scanner fails during high server traffic?",
        bn: "৮. সার্ভারের তীব্র চাপের কারণে জেমিনি এআই রিসিট স্ক্যান ব্যর্থ হলে কী হবে?"
      },
      a: {
        en: "SpendWise seamlessly switches to a robust local offline mock-extraction layout parser, allowing you to continue entering payments instantly without app disruptions.",
        bn: "যদি জেমিনি এপিআই ব্যস্ত থাকে, তবে স্পেন্ডওয়াইজের স্মার্ট অফলাইন লেআউট পার্সার সক্রিয় হয়ে ফাইলটি রিড করে সম্ভাব্য ছক তৈরি করবে যাতে আপনার কাজের কোনো ব্যাঘাত না ঘটে।"
      }
    },
    {
      id: 9,
      category: "transactions",
      q: {
        en: "Can I manually change details extracted by the AI receipt scanner?",
        bn: "৯. এআই রিসিট স্ক্যানার দিয়ে পূরণকৃত তথ্য পরে ম্যানুয়ালি পরিবর্তন করা যাবে?"
      },
      a: {
        en: "Yes, after AI extraction completes, the form fields remain fully editable so you can tweak any inaccuracies before finally saving.",
        bn: "হ্যাঁ, এআই স্বয়ংক্রিয় তথ্য পূর্ণ করার পরেও আপনার এডিটিং ফর্মটি সম্পূর্ণ ওপেন থাকবে, ফলে চূড়ান্ত সংরক্ষণের আগে যেকোনো ভুল টাকার অঙ্ক বা ক্যাটাগরি সংশোধন করা যাবে।"
      }
    },
    {
      id: 10,
      category: "transactions",
      q: {
        en: "How do I filter expenditures by categories or specific accounts?",
        bn: "১০. আমি নির্দিষ্ট ক্যাটাগরি বা অ্যাকাউন্টের ভিত্তিতে খরচ কীভাবে ফিল্টার করব?"
      },
      a: {
        en: "Go to Transactions tab and use the responsive search fields, category selector, or account filter tabs to instantly drill down into your log entries.",
        bn: "লেনদেনের খাতা (Transactions) ট্যাবে গিয়ে সার্চ ফিল্ড, কাস্টম ক্যাটাগরি সিলেক্টর, বা অ্যাকাউন্ট ফিল্টার ব্যবহার করে মুহূর্তেই নির্দিষ্ট খরচের খতিয়ান বের করুন।"
      }
    },
    // Category: Budgets (11-15)
    {
      id: 11,
      category: "budgets",
      q: {
        en: "How do I set up a monthly category budget?",
        bn: "১১. আমি কীভাবে একটি মাসিক ক্যাটাগরি বাজেট নির্ধারণ করব?"
      },
      a: {
        en: "Visit the Budgets section, tap 'Create Budget', select a category (e.g. Food, Travel), input your target limit, and activate the consumption guard.",
        bn: "বাজেট সেকশনে গিয়ে 'বাজেট তৈরি করুন' চাপুন, ক্যাটাগরি বেছে নিন (যেমন- খাবার, বিল), উর্ধ্বসীমা নির্ধারণ করুন এবং ট্র্যাকার সচল করুন।"
      }
    },
    {
      id: 12,
      category: "budgets",
      q: {
        en: "How does SpendWise notify me if I overspend my budget limit?",
        bn: "১২. আমি বাজেট সীমা অতিক্রম করলে স্পেন্ডওয়াইজ কীভাবে আমাকে জানাবে?"
      },
      a: {
        en: "The App evaluates your usage, sending notifications and flashing warnings on your dashboard when budget limits are breached or reach milestones.",
        bn: "যখনই নির্দিষ্ট খাতের খরচ আপনার সেট করা সীমার ৮০% বা ১০০% ছাড়িয়ে যায়, নোটিফিকেশন বক্সে হলুদ বা লাল সতর্কবার্তা ফুটে উঠবে।"
      }
    },
    {
      id: 13,
      category: "budgets",
      q: {
        en: "Can I carry forward unused budget balances to the next calendar month?",
        bn: "১৩. চলতি মাসের অব্যবহৃত বাজেট কি আগামী মাসে স্থানান্তরিত করা যাবে?"
      },
      a: {
        en: "Budgets reset monthly by default to lock down static target goals, but you can manually increase limits in subsequent months to allocate surplus assets.",
        bn: "বাজেট চক্র ডিফল্টভাবে প্রতি মাসেই নতুন করে শুরু হয়, তবে বাঁচানো টাকা আগামী মাসের সঞ্চয় তহবিলে স্থানান্তরের জন্য সেটিংস পরিবর্তন করতে পারেন।"
      }
    },
    {
      id: 14,
      category: "budgets",
      q: {
        en: "What should I do if a budget category indicator turns orange?",
        bn: "১৪. বাজেটের কালার কোড বা নির্দেশক কমলা রঙ ধারণ করলে কী করা উচিত?"
      },
      a: {
        en: "An orange alert suggests you have consumed more than 80% of your allocated cap. Reduce upcoming discretionary spending to avoid exceeding the budget range.",
        bn: "কমলা সতর্কতা মানে হচ্ছে আপনি আপনার বাজেটের ৮০% এর বেশি শেষ করে ফেলেছেন। এই মাসে ওই নির্দিষ্ট খাতে নতুন খরচ সীমিত করার পরামর্শ দেওয়া হচ্ছে।"
      }
    },
    {
      id: 15,
      category: "budgets",
      q: {
        en: "Can I set budgets for multiple categories simultaneously?",
        bn: "১৫. আমি কি একসাথেই একাধিক ক্যাটাগরির জন্য কাস্টম বাজেট রাখতে পারব?"
      },
      a: {
        en: "Absolutely! You can establish distinct budget policies for food, medical care, housing rent, transportation, entertainment, and utilities respectively.",
        bn: "হ্যাঁ অবশ্যই! আপনি খাবার, যাতায়াত, চিকিৎসা, বিনোদন সহ আপনার যেকোনো ক্যাটাগরির জন্য এক সাথেই আলাদা আলাদা স্বয়ংক্রিয় উর্ধ্বসীমা রাখতে পারবেন।"
      }
    },
    // Category: Savings (16-20)
    {
      id: 16,
      category: "savings",
      q: {
        en: "What is a Savings Goal and how is it calculated?",
        bn: "১৬. সঞ্চয় লক্ষ্য বা গোল কী এবং এটি কীভাবে গণনা করা হয়?"
      },
      a: {
        en: "A Savings Goal lets you allocate funds toward a specific asset target (e.g. laptop purchase, travel booking), displaying a progressive percent complete chart.",
        bn: "এটি আপনার দীর্ঘমেয়াদী সঞ্চয় পরিকল্পনার দৃশ্যমান মাধ্যম (যেমন ল্যাপটপ বা ট্রাভেল ফান্ড), যা লক্ষ্যমাত্রার বিপরীতে ইতোমধ্যে কত টাকা সঞ্চয় হয়েছে তার পার্সেন্টেজ হিসাব দেখায়।"
      }
    },
    {
      id: 17,
      category: "savings",
      q: {
        en: "How do I deposit/add funds toward a savings goal?",
        bn: "১৭. আমি সঞ্চয়ের লক্ষ্যে কীভাবে টাকা ক্যাশ ইনপুট করব?"
      },
      a: {
        en: "Under the Savings tab, select your goal card, select 'Add Funds', choose your source account wallet, and transfer the target amount securely.",
        bn: "লক্ষ্য ট্যাবে আপনার সঞ্চয় কার্ডটিতে যান, 'টাকা জমা করুন' বাটনে চাপুন, কোন অ্যাকাউন্ট থেকে টাকা অবমুক্ত করতে চান তা নির্বাচন করুন এবং টাকার পরিমাণ দিয়ে জমা করুন।"
      }
    },
    {
      id: 18,
      category: "savings",
      q: {
        en: "Does allocating funds to a savings goal charge my actual balance?",
        bn: "১৮. সঞ্চয় লক্ষ্যে টাকা অ্যাড করলে কি আমার অ্যাকাউন্ট ব্যালেন্স কমে যায়?"
      },
      a: {
        en: "It locks the allocated sum inside that specific saving milestone vault, subtracting it from available cash to prevent accidental overspending.",
        bn: "এটি নির্ধারিত অর্থটি ওই গোলটির জন্য রিজার্ভ রাখে এবং মূল অ্যাকাউন্টের সাধারণ খরচযোগ্য ব্যালেন্স থেকে সেটি আলাদা করে দেখায় যাতে ওই টাকা সাধারণ কোনো খাতে অপব্যয় না হয়ে যায়।"
      }
    },
    {
      id: 19,
      category: "savings",
      q: {
        en: "What happens when a Savings Goal achieves 100% completion?",
        bn: "১৯. সঞ্চয়ী লক্ষ্য ১০০% পূর্ণ হলে কী ঘটে?"
      },
      a: {
        en: "The milestone glows green and flashes with a celebratory success visual badge, acknowledging your fantastic budgeting victory.",
        bn: "আপনার লক্ষ্য পূরণ হওয়ামাত্রই সেই কার্ডটিতে একটি সবুজাভ সেলিব্রেশন ব্যাজ ও সফলতার নোটিফিকেশন যুক্ত হবে।"
      }
    },
    {
      id: 20,
      category: "savings",
      q: {
        en: "Can I withdraw funds back from an active savings goal?",
        bn: "২০. সঞ্চয় লক্ষ্য থেকে কি আবার সংরক্ষিত টাকা অ্যাকাউন্টে ফিরিয়ে আনা যাবে?"
      },
      a: {
        en: "Yes, you can close or edit the goal anytime, releasing the tied capital back to your active general cash folders instantly.",
        bn: "হ্যাঁ! যেকোনো জরুরি প্রয়োজনে লক্ষ্যমাত্রা সম্পাদন বন্ধ করে বা এডিট করে ফান্ড ছাড়াতে পারেন, যা মুহূর্তেই আপনার অ্যাকাউন্টের খরচযোগ্য মূল ব্যালেন্স ফোল্ডারে যোগ হবে।"
      }
    },
    // Category: Recurring (21-25)
    {
      id: 21,
      category: "recurring",
      q: {
        en: "What is an Auto-Recurring transaction rule?",
        bn: "২১. পৌনঃপুনিক বা রিকারিং লেনদেন বলতে কী বোঝায়?"
      },
      a: {
        en: "This tracks monthly rent, utility bills, OTT premium subscriptions, salaries, or any transfer occurring repeatedly at scheduled calendar intervals.",
        bn: "বাড়িভাড়া, ডিশের বিল কিংবা ওটিটি সাবস্ক্রিপশন ফি-র মতো প্রতি নির্দিষ্ট সময় পর পর ঘটে এমন খরচ বা আয়ের ট্র্যাকার হচ্ছে রিকারিং লেনদেন।"
      }
    },
    {
      id: 22,
      category: "recurring",
      q: {
        en: "Does SpendWise log recurring transfers automatically without prompt?",
        bn: "২২. স্পেন্ডওয়াইজ কি রিকারিং লেনদেনগুলো স্বয়ংক্রিয়ভাবে অ্যাকাউন্ট থেকে কাটে?"
      },
      a: {
        en: "Yes. On the predefined execution date of your rule, the server checks the configuration and auto-inserts the ledger entry seamlessly.",
        bn: "হ্যাঁ! আপনার নির্দেশিত নির্ধারিত দিন বা তারিখে স্পেন্ডওয়াইজ সার্ভার ব্যাকগ্রাউন্ডে স্বয়ংক্রিয়ভাবে খাতার হিসাবপত্র আপডেট করে নোটিফাইড করবে।"
      }
    },
    {
      id: 23,
      category: "recurring",
      q: {
        en: "How do I configure a subscription under the 'Recurring' tab?",
        bn: "২৩. রিকারিং ট্যাবের অধীনে কীভাবে নতুন সাবস্ক্রিপশন রুল যোগ করব?"
      },
      a: {
        en: "Tap Recurring Rules, click Create, specify recurring interval (daily, weekly, monthly, annually), sum, target ledger category, and date parameters.",
        bn: "'চলতি বা পৌনঃপুনিক নিয়ম' ট্যাবে গিয়ে ব্যবধান (দৈনিক, সাপ্তাহিক, মাসিক, বার্ষিক), টাকার পরিমাণ এবং পরবর্তী নোটিশ দিন সেট করলেই এটি চালু হবে।"
      }
    },
    {
      id: 24,
      category: "recurring",
      q: {
        en: "Can I temporarily pause a recurring transaction rule?",
        bn: "২৪. আমি কি সাময়িকভাবে কোনো রিকারিং রুল নিষ্ক্রিয় বা পজ করে রাখতে পারব?"
      },
      a: {
        en: "Yes, edit or manage your active recurring schemes to flag them as inactive or adjust their scheduled calendar triggers smoothly.",
        bn: "হ্যাঁ, আপনি রিকারিং রুলের পাশে থাকা এডিট উইন্ডোতে গিয়ে সেটিকে পজ বা স্থগিত রাখতে পারেন অথবা ট্রিগার তারিখ পিছিয়ে দিয়ে রাখতে পারেন।"
      }
    },
    {
      id: 25,
      category: "recurring",
      q: {
        en: "Is there any real payment gateway integrated in recurring rules?",
        bn: "২৫. স্বয়ংক্রিয় রিকারিং লেনদেনে কি কোনো আসল পেমেন্ট কার্ড চার্জ হয়?"
      },
      a: {
        en: "No real monetary exchange takes place. SpendWise operates safely as an accounting tracker and ledger ledger system for bookkeeping ONLY.",
        bn: "না! এটি সম্পূর্ণ ভার্চুয়াল ডায়েরি বা ট্র্যাকার বুক। কোনো রিকারিং নিয়মে আপনার আসল ব্যাংক অ্যাকাউন্ট থেকে টাকা কাটা যাবে না।"
      }
    },
    // Category: Settings (26-30)
    {
      id: 26,
      category: "settings",
      q: {
        en: "How safe is my registered profile and transactions database?",
        bn: "২৬. আমার ব্যক্তিগত প্রোফাইল ও লেনদেনের তথ্যাদি কতটা নিরাপদ?"
      },
      a: {
        en: "Your financial data and credentials are kept entirely secure on sandboxed database architectures. You can control visibility in the Settings tab.",
        bn: "আপনার খাতার ডেটাবেস এবং তথ্য অত্যন্ত সুরক্ষিতভাবে এনক্রিপ্ট করে ক্লাউডে রাখা হয়। সেটিংস ট্যাবে আপনি ট্র্যাকার প্রাইভেসির নিয়ন্ত্রণ করতে পারবেন।"
      }
    },
    {
      id: 27,
      category: "settings",
      q: {
        en: "How do I switch the currency symbol across SpendWise?",
        bn: "২৭. স্পেন্ডওয়াইজ অ্যাপের কারেন্সি বা মুদ্রা সিম্বল কীভাবে পরিবর্তন করব?"
      },
      a: {
        en: "Visit Settings, select your preferred currency (BDT ৳, USD $, EUR €, etc.), and save to instantly update all account statements and statistical graphs.",
        bn: "প্রোফাইল সেটিংস (Settings) ট্যাবে গিয়ে আপনার পছন্দের কারেন্সি (BDT ৳, USD $, EUR € ইত্যাদি) সিলেক্ট করে সাবমিট করুন।"
      }
    },
    {
      id: 28,
      category: "settings",
      q: {
        en: "Does shifting languages to Bengali alter my stored categories?",
        bn: "২৮. বাংলা ভাষা সিলেক্ট করলে কি আমার পূর্বে তৈরি ক্যাটাগরি পরিবর্তিত হবে?"
      },
      a: {
        en: "Language toggles do not corrupt your data logs. SpendWise instantly translates interface headers, while leaving custom names and descriptions intact.",
        bn: "না! বাংলা বা ইংরেজি ভাষা রূপান্তরে ডেটা মুছে যাওয়ার কোনো সুযোগ নেই। এটি জাস্ট লেবেল অনুবাদ করে, আপনার আগের এন্ট্রি ঠিকই থাকে।"
      }
    },
    {
      id: 29,
      category: "settings",
      q: {
        en: "What benefits do I get by being a SpendWise PRO License holder?",
        bn: "২৯. স্পেন্ডওয়াইজ প্রিমিয়াম লাইসেন্স হোল্ডার হিসেবে আমি বাড়তি কী সুবিধা পাব?"
      },
      a: {
        en: "PRO accounts unlock limitless transactional vaults, high-speed receipt processing, deeper budgets consumption insights, and persistent Smart Coach floating assistant.",
        bn: "আনলিমিটেড লেনদেনের হিসাব, উন্নত জেমিনি রিসিট স্ক্যানার, গোল্ডেন নোটিফিকেশন এলার্ট এবং চতুর ভাসমান ২৪/৭ স্মার্ট কোচ গাইডবট এআই।"
      }
    },
    {
      id: 30,
      category: "settings",
      q: {
        en: "How do I update my username, telephone number or Profile Image?",
        bn: "৩০. আমি কীভাবে আমার নাম, মোবাইল নাম্বার বা ছবি আপডেট করব?"
      },
      a: {
        en: "Slide into Settings tab, update the profile input fields, upload/specify a valid photo URL, and press Save Changes to sync instantly.",
        bn: "প্রোফাইল সেটিংস সেকশনে আপনার নাম, মোবাইল নম্বর কিংবা প্রোফাইল ছবির ইউআরএল এডিট করে 'Save Changes' বাটনে চাপ দিন।"
      }
    }
  ];

  // Filtering based on active search bar and tab category
  const filteredFaqs = staticFaqs.filter(faq => {
    const qText = lang === 'bn' ? faq.q.bn : faq.q.en;
    const aText = lang === 'bn' ? faq.a.bn : faq.a.en;
    const matchesSearch = qText.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          aText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-indigo-500" />
            <span>{lang === 'bn' ? "সহায়তা ও নির্দেশিকা কেন্দ্র" : "FAQ & Manual Guideline"}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
            {lang === 'bn'
              ? "ধাপ-বাই-ধাপ সাধারণ নির্দেশিকা এবং ৩টি প্রশ্ন ও উত্তরের কাস্টম ডায়েরি।"
              : "Step-by-step user manuals, general instructions, and 30 integrated automated answers."}
          </p>
        </div>
        
        {/* Total stats count label badge */}
        <div className="bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-350 flex items-center gap-2 border border-slate-200/40 dark:border-slate-800 shrink-0 self-start md:self-auto uppercase tracking-wider">
          <BookOpen className="h-4 w-4 text-indigo-500" />
          <span>{lang === 'bn' ? `মোট ৩০ টি নির্দেশিকা` : `30 Localized Guides`}</span>
        </div>
      </div>

      {/* Grid Layout containing Category Side-menu and searchable accordion listed list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Category Navigator Buttons */}
        <div className="lg:col-span-3 space-y-2">
          <p className="text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase px-1">
            {lang === 'bn' ? "ক্যাটাগরি সমূহ" : "FILTER BY TOPICS"}
          </p>
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl space-y-1">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition text-left cursor-pointer outline-none ${
                    isActive 
                      ? "bg-indigo-600 text-white shadow-xs" 
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Notice Banner */}
          <div className="bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 p-4 rounded-2xl flex gap-2.5">
            <Info className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
            <div className="text-[10px] text-slate-500 dark:text-slate-350 leading-relaxed">
              <span className="font-bold text-slate-800 dark:text-white block mb-0.5">
                {lang === 'bn' ? "স্মার্ট এআই চ্যাট খুঁজছেন?" : "Looking for Smart AI Coach?"}
              </span>
              {lang === 'bn' 
                ? "আমাদের লাইভ আর্টিফিশিয়াল ইন্টেলিজেন্স চ্যাট সাপোর্টটি ডানদিকের নিচে অবস্থিত ভাসমান 'স্মার্ট কোচ এআই' উইজেটে স্থানান্তর করা হয়েছে।"
                : "Our real-time interactive AI analysis support is now living inside the floating 'Smart Coach AI' bubble at the bottom-right corner!"}
            </div>
          </div>
        </div>

        {/* Right Side: Search and Accordion FAQ items List */}
        <div className="lg:col-span-9 space-y-4">
          
          {/* Real-time search query container */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={lang === 'bn' ? "৩০টি নির্দেশিকার মধ্য থেকে খুঁজুন (যেমন- রিসিট, বাজেট)..." : "Search through all 30 automated FAQs..."}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:bg-white rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-800 dark:text-white placeholder-slate-400 outline-none transition shadow-xs"
            />
          </div>

          {/* Collapsible Question-Answer Loop Container */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden p-6 space-y-3.5">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => {
                const isExpanded = expandedFaq === faq.id;
                return (
                  <div 
                    key={faq.id} 
                    className="border-b border-slate-100 dark:border-slate-900/60 pb-3.5 last:border-0 last:pb-0"
                  >
                    <button
                      onClick={() => setExpandedFaq(isExpanded ? null : faq.id)}
                      className="w-full flex items-center justify-between text-left py-1.5 focus:outline-none group cursor-pointer"
                    >
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition pr-4">
                        {lang === 'bn' ? faq.q.bn : faq.q.en}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                      )}
                    </button>
                    
                    {isExpanded && (
                      <div className="mt-2.5 text-xs text-slate-600 leading-relaxed dark:text-slate-350 pl-4 py-2 border-l-2 border-indigo-600 bg-slate-50 dark:bg-slate-900 rounded-r-xl">
                        {lang === 'bn' ? faq.a.bn : faq.a.en}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Search className="h-8 w-8 mx-auto stroke-[1.5] text-slate-300" />
                <p className="text-xs font-bold leading-none">
                  {lang === 'bn' ? "কোনো নির্দেশিকা খুঁজে পাওয়া যায়নি" : "No results match your search keywords"}
                </p>
                <p className="text-[10px]">
                  {lang === 'bn' ? "অন্য কোনো শব্দ টাইপ করে আবার চেষ্টা করুন।" : "Try refining your target search keywords or select another filter topic."}
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
