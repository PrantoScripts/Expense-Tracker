/**
 * Locales definition for SpendWise (English and Bangla)
 * Direct state translation with instant toggles without page refreshes.
 */

export const translations = {
  en: {
    appName: "SpendWise",
    tagline: "Smart Expense Tracking Made Simple",
    dashboard: "Dashboard",
    transactions: "Transactions",
    budgets: "Budgets",
    savings: "Savings Goals",
    accounts: "Accounts",
    recurring: "Recurring Rules",
    aiCoach: "AI Financial Coach",
    adminPanel: "Admin Panel",
    settings: "Settings",
    login: "Login",
    register: "Register",
    logout: "Logout",
    profile: "Profile",

    // Common phrases
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    actions: "Actions",
    search: "Search...",
    filter: "Filter",
    sort: "Sort",
    all: "All",
    status: "Status",
    date: "Date",
    amount: "Amount",
    category: "Category",
    note: "Notes",
    attachment: "Attachment",
    noData: "No records found",
    loading: "Loading data...",
    success: "Success",
    error: "Error",
    incoming: "Income",
    outgoing: "Expense",
    balance: "Balance",
    currency: "Currency",
    language: "Language",
    theme: "Theme",
    timezone: "Timezone",
    phone: "Phone Number",
    photo: "Profile Photo",

    // Auth Page
    welcomeBack: "Welcome Back",
    signInPrompt: "Sign in to manage your budget and savings smarter.",
    emailAddress: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    fullName: "Full Name",
    forgotPassword: "Forgot Password?",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    createAccount: "Create Account",
    verifyEmailNeeded: "Please verify your email to log in",
    demoAccountNotice: "You can click any demo account below to instantly log in:",

    // Dashboard Items
    totalBalance: "Total Balance",
    totalIncome: "Total Income",
    totalExpenses: "Total Expenses",
    totalSavings: "Total Savings",
    netSavingsRate: "Savings Rate",
    budgetUsage: "Budget Usage",
    recentTransactions: "Recent Transactions",
    topExpenseCategories: "Top Expense Categories",
    savingsProgress: "Savings Goals Tracker",
    monthlyOverview: "Monthly Overview Trends",
    coachingPreview: "AI Advisor Insight",
    askCoachPrompt: "Get personalized intelligence on your expenditures",
    noReceiptUploaded: "No receipt uploaded",
    uploadReceipt: "Scan Receipt with AI",
    uploadBtn: "Upload JPG/PNG/PDF",
    analyzingReceipt: "Gemini is analyzing your receipt...",
    receiptSuccess: "Receipt imported successfully!",

    // Categories En
    categorySalary: "Salary",
    categoryFreelancing: "Freelancing",
    categoryBusiness: "Business",
    categoryInvestment: "Investment",
    categoryBonus: "Bonus",
    categoryGift: "Gift",
    categoryOther: "Other Source",

    categoryFood: "Food & Dining",
    categoryTransport: "Transport",
    categoryShopping: "Shopping",
    categoryEducation: "Education",
    categoryHealthcare: "Healthcare",
    categoryEntertainment: "Entertainment",
    categoryBills: "Utilities & Bills",
    categoryRent: "Rent & Housing",
    categoryTravel: "Travel",
    categoryOthers: "Miscellaneous",

    // Notifications
    notifications: "Notification Hub",
    markAllRead: "Mark all as read",
    noNotifications: "Comfortable and quiet! No unread notices.",

    // Budgets view
    budgetsTitle: "Category & Monthly Budgets",
    createBudget: "Establish New Budget Limit",
    budgetCategory: "Budget Category Scope",
    budgetAmount: "Allotted Capital Limit",
    budgetAlertThreshold: "Warning Notification Trigger (%)",
    budgetRemaining: "Remaining Pool",
    budgetOverLimit: "OVER BUDGET ALERT!",
    budgetWarningLimit: "Approaching budget warning threshold",
    monthName: "Target Month",

    // Savings Goal view
    goalsTitle: "Savings Milestones",
    goalName: "Milestone Milestone Name",
    targetAmount: "Destination Amount",
    currentAmount: "Acquired Funds",
    deadline: "Target Expiry Date",
    addFunds: "Contribute Capital",
    congratsGoal: "Outstanding! milestone reached!",

    // Accounts
    accountsTitle: "Financial Wallets & Portfolios",
    accountType: "Account Class",
    typeCash: "Cash Wallet",
    typeBank: "Bank Accounts",
    typeMobile: "Mobile Wallet (bKash/Nagad)",
    typeCredit: "Credit Card Account",
    addNewAccount: "Integrate Financial Account",

    // Recurring
    recurringList: "Auto-Recurring Journal Entries",
    frequency: "Generation Interval",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    yearly: "Yearly",
    nextOccur: "Next Scheduled Autolog",
    disabledRule: "Deactivated Settings",

    // Admin
    adminDashboard: "SaaS Admin Control Panel",
    totalUsers: "Global Users Count",
    systemStatus: "System Status Online",
    manageSystem: "Admin Panel Management",
    allowReg: "Allow Public Registrations",
    maintenance: "Developer Maintenance Mode",

    // AI Coach View
    coachHub: "SpendWise AI Coach Intelligence",
    askAssistant: "Ask AI Coach custom question...",
    aiLoading: "AI Analyst is computing spending models...",
    aiSamplePrompt1: "Analyze my category breakdowns and suggest how to clip healthcare/food expenses.",
    aiSamplePrompt2: "Give me an overview of my current financial health and goals.",
    aiSamplePrompt3: "Based on my budgets, forecast if I'll overspend this month.",
    aiIntroText: "Powered by Gemini 3.5, your financial assistant directly monitors your ledgers and generates tailored behavioral recommendations without manual entry.",

    // Dates & Ranges
    fromDate: "From Date",
    toDate: "To Date",
    exportBtn: "Export Report",
    exportCsv: "Export CSV Sheet",
    exportJson: "Export JSON File",
    exportPdf: "Print PDF Ledger",
    amountRange: "Financial Bracket (Min - Max)",
    resetFilters: "Clear Search Filters",
    makeRecurring: "Make this recurring",
    recurrenceFrequency: "Recurrence Frequency",
    recurrenceEndDate: "Recurrence End Date (Optional)",
    quickSnapshot: "Quick Snapshot",
    incomeVsExpenses: "Income vs Expenses",
    ofIncomeSpent: "of income spent",
    surplus: "Surplus",
    deficit: "Deficit",
    noActivity: "No activity yet",
    aiAdvisory: "Smart AI Advisory",
    aiAdvisoryDesc: "Dynamic suggestions & cost control ideas customized to your spending habits.",
    savingsCompanion: "Savings Companion",
    savingsCompanionDesc: "Interactive milestone calculator and target savings projection.",
    monthlyContribution: "Monthly Contribution",
    completionTime: "Expected Completion",
    statusIndicator: "Projection Status",
    onTrack: "On Track",
    needMore: "Undersaved",
    monthsShortcut: "months",
  },
  bn: {
    appName: "স্পেন্ডওয়াইজ",
    tagline: "সহজ ও স্মার্ট উপায়ে ব্যয় ট্র্যাকিং",
    dashboard: "ড্যাশবোর্ড",
    transactions: "লেনদেন সমূহ",
    budgets: "বাজেট সমূহ",
    savings: "সঞ্চয় লক্ষ্য",
    accounts: "হিসাব সমূহ",
    recurring: "চলতি নিয়ম",
    aiCoach: "এআই ফাইন্যান্সিয়াল কোচ",
    adminPanel: "অ্যাডমিন প্যানেল",
    settings: "সেটিংস",
    login: "লগইন",
    register: "নিবন্ধন",
    logout: "লগআউট",
    profile: "প্রোফাইল",

    // Common phrases
    add: "যুক্ত করুন",
    edit: "সম্পাদনা",
    delete: "মুছে ফেলুন",
    save: "সংরক্ষণ",
    cancel: "বাতিল",
    actions: "নিয়ন্ত্রণ",
    search: "অনুসন্ধান করুন...",
    filter: "ফিল্টার",
    sort: "সাজানো",
    all: "সবগুলো",
    status: "অবস্থা",
    date: "তারিখ",
    amount: "টাকার পরিমাণ",
    category: "ক্যাটাগরি",
    note: "নোট",
    attachment: "সংযুক্তি",
    noData: "কোনো লেনদেন পাওয়া যায়নি",
    loading: "লোড হচ্ছে...",
    success: "সম্পন্ন",
    error: "ত্রুটি",
    incoming: "আয়",
    outgoing: "ব্যয়",
    balance: "মোট ব্যালেন্স",
    currency: "মুদ্রা",
    language: "ভাষা",
    theme: "থিম",
    timezone: "টাইমজোন",
    phone: "ফোন নাম্বার",
    photo: "প্রোফাইল ছবি",

    // Auth Page
    welcomeBack: "স্বাগতম",
    signInPrompt: "আপনার বাজেট এবং সঞ্চয় আরো দক্ষতার সাথে পরিচালনা করতে সাইন ইন করুন।",
    emailAddress: "ইমেইল এড্রেস",
    password: "পাসওয়ার্ড",
    confirmPassword: "পাসওয়ার্ড নিশ্চিত করুন",
    fullName: "পূর্ণ নাম",
    forgotPassword: "পাসওয়ার্ড ভুলে গেছেন?",
    noAccount: "কোনো অ্যাকাউন্ট নেই?",
    hasAccount: "ইতিমধ্যে অ্যাকাউন্ট আছে?",
    createAccount: "নতুন অ্যাকাউন্ট তৈরি করুন",
    verifyEmailNeeded: "লগইন করতে দয়া করে আপনার পেইজ ভেরিফাই করুন",
    demoAccountNotice: "ঝটপট লগইন করতে নিচের ডেমো অ্যাকাউন্টগুলোতে ক্লিক করুন:",

    // Dashboard Items
    totalBalance: "মোট ব্যালেন্স",
    totalIncome: "সর্বমোট আয়",
    totalExpenses: "সর্বমোট ব্যয়",
    totalSavings: "সর্বমোট সঞ্চয়",
    netSavingsRate: "সঞ্চয়ের হার",
    budgetUsage: "বাজেট ব্যবহার শতাংশ",
    recentTransactions: "সাম্প্রতিক লেনদেন",
    topExpenseCategories: "শীর্ষ ব্যয় ক্যাটাগরি সমূহ",
    savingsProgress: "সঞ্চয় লক্ষ্যের অগ্রগতি",
    monthlyOverview: "মাসিক ব্যয়ের গতিধারা",
    coachingPreview: "স্মার্ট এআই পরামর্শ",
    askCoachPrompt: "আপনার ব্যয়ের উপর কৃত্রিম বুদ্ধিমত্তা চালিত বিশ্লেষণ পান",
    noReceiptUploaded: "কোনো রিসিট আপলোড করা হয়নি",
    uploadReceipt: "এআই রিসিট স্ক্যান",
    uploadBtn: "আপলোড করুন JPG/PNG/PDF",
    analyzingReceipt: "জেমিনি রিসিটটি বিশ্লেষণ করছে...",
    receiptSuccess: "রিসিট সফলভাবে যুক্ত হয়েছে!",

    // Categories Bn
    categorySalary: "বেতন",
    categoryFreelancing: "ফ্রিল্যান্সিং",
    categoryBusiness: "ব্যবসা",
    categoryInvestment: "বিনিয়োগ",
    categoryBonus: "বোনাস",
    categoryGift: "উপহার",
    categoryOther: "অন্যান্য উৎস",

    categoryFood: "খাদ্য ও ডাইনিং",
    categoryTransport: "পরিবহন",
    categoryShopping: "কেনাকাটা",
    categoryEducation: "শিক্ষা",
    categoryHealthcare: "স্বাস্থ্যসেবা",
    categoryEntertainment: "বিনোদন",
    categoryBills: "ইউটিলিটি ও বিল",
    categoryRent: "ভাড়া ও আবাসন",
    categoryTravel: "ভ্রমণ",
    categoryOthers: "বিবিধ ব্যয়",

    // Notifications
    notifications: "নোটিফিকেশন সেন্টার",
    markAllRead: "সবগুলো পড়া হয়েছে চিহ্নিত করুন",
    noNotifications: "কোনো অপঠিত বিজ্ঞপ্তি নেই!",

    // Budgets view
    budgetsTitle: "ক্যাটাগরি ও মাসিক বাজেট",
    createBudget: "নতুন বাজেট যোগ করুন",
    budgetCategory: "বাজেট ক্যাটাগরি",
    budgetAmount: "বাজেটকৃত নির্ধারণের পরিমাণ",
    budgetAlertThreshold: "সতর্কতা নোটিফিকেশন ট্রিগার (%)",
    budgetRemaining: "অবশিষ্ট বাজেট",
    budgetOverLimit: "বাজেট সীমা অতিক্রমের সতর্কতা!",
    budgetWarningLimit: "বাজেট প্রায় শেষ হওয়ার পথে!",
    monthName: "নির্দিষ্ট মাস",

    // Savings Goal view
    goalsTitle: "সঞ্চয়ের লক্ষ্যমাত্রা",
    goalName: "লক্ষ্যের নাম",
    targetAmount: "টার্গেট সঞ্চয়ের পরিমাণ",
    currentAmount: "বর্তমান জমানো পরিমাণ",
    deadline: "শেষ সময়সীমা",
    addFunds: "টাকা জমা করুন",
    congratsGoal: "অসাধারণ! আপনি সঞ্চয়ের লক্ষ্য পূরণ করেছেন!",

    // Accounts
    accountsTitle: "আর্থিক অ্যাকাউন্ট পোর্টফোলিও",
    accountType: "অ্যাকাউন্টের ধরন",
    typeCash: "ক্যাশ ওয়ালেট",
    typeBank: "ব্যাংক অ্যাকাউন্ট",
    typeMobile: "মোবাইল ওয়ালেট (বিকাশ/নগদ)",
    typeCredit: "ক্রেডিট কার্ড অ্যাকাউন্ট",
    addNewAccount: "নতুন অ্যাকাউন্ট যুক্ত করুন",

    // Recurring
    recurringList: "স্বয়ংক্রিয় পুনরাবৃত্তিমূলক লেনদেন",
    frequency: "অন্তরকাল",
    daily: "প্রতিদিন",
    weekly: "প্রতি সপ্তাহে",
    monthly: "প্রতি মাসে",
    yearly: "প্রতি বছর",
    nextOccur: "পরবর্তী স্বত্বাধিকারী এন্ট্রি",
    disabledRule: "নিষ্ক্রিয় করা নিয়ম",

    // Admin
    adminDashboard: "সাস অ্যাডমিন কন্ট্রোল প্যানেল",
    totalUsers: "বৈশ্বিক ব্যবহারকারী সংখ্যা",
    systemStatus: "সিস্টেম অত্যন্ত চমৎকার নিয়মে চলছে",
    manageSystem: "সিস্টেম সেটিংস অ্যাডমিন",
    allowReg: "পাবলিক নিবন্ধন সক্ষম করুন",
    maintenance: "ডেভলপার মেইনটেনেন্স মুড",

    // AI Coach View
    coachHub: "স্পেন্ডওয়াইজ এআই ফাইন্যান্সিয়াল কোচ",
    askAssistant: "ফাইন্যান্সিয়াল কোচকে যেকোনো প্রশ্ন করুন...",
    aiLoading: "আমাদের কৃত্রিম বুদ্ধিমত্তা আর্থিক বিশ্লেষণ করছে...",
    aiSamplePrompt1: "আমার এই মাসের ব্যয়ের উপর ভিত্তি করে বাজেট কীভাবে কাটছাঁট করব?",
    aiSamplePrompt2: "আমার বর্তমান আর্থিক স্বাস্থ্যের একটি সুন্দর সংক্ষিপ্ত রূপরেখা দিন।",
    aiSamplePrompt3: "আমার ক্যাটাগরি বাজেটগুলো কি এই মাসে শেষ হতে পারে? কোনো সতর্কতা আছে?",
    aiIntroText: "জেমিনি ৩.৫ দ্বারা চালিত এই চমৎকার অ্যাসিস্ট্যান্ট সরাসরি আপনার লেনদেনের খাতা পর্যবেক্ষণ করে ব্যক্তিগত আচরণগত পরামর্শ প্রদান করে থাকে।",

    // Dates & Ranges
    fromDate: "শুরুর তারিখ",
    toDate: "শেষ তারিখ",
    exportBtn: "রিপোর্ট রফতানি",
    exportCsv: "রফতানি করুন Excel/CSV",
    exportJson: "রফতানি করুন JSON ফাইল",
    exportPdf: "পিডিএফ রিপোর্ট প্রিন্ট করুন",
    amountRange: "টাকার সীমা বন্ধনী (নূন্যতম - সর্বোচ্চ)",
    resetFilters: "অনুসন্ধান ফিল্টার মুছে ফেলুন",
    makeRecurring: "এটি পুনরাবৃত্তিমূলক করুন",
    recurrenceFrequency: "পুনরাবৃত্তির ব্যবধান",
    recurrenceEndDate: "সমাপ্তির তারিখ (ঐচ্ছিক)",
    quickSnapshot: "কুইক স্ন্যাপশট",
    incomeVsExpenses: "আয় বনাম ব্যয়",
    ofIncomeSpent: "আয়ের অংশ ব্যয় হয়েছে",
    surplus: "উদ্বৃত্ত",
    deficit: "ঘাটতি",
    noActivity: "এখনও কোনো লেনদেন হয়নি",
    aiAdvisory: "স্মার্ট এআই পরামর্শ",
    aiAdvisoryDesc: "আপনার খরচের অভ্যাসের ওপর ভিত্তি করে স্বয়ংক্রিয় নির্দেশনা ও সাশ্রয় আইডিয়া।",
    savingsCompanion: "সঞ্চয় সহযোগী",
    savingsCompanionDesc: "ইন্টারেক্টিভ লক্ষ্যমাত্রা ক্যালকুলেটর ও সঞ্চয় প্রক্ষেপণ হিসাবকারী।",
    monthlyContribution: "মাসিক সম্ভাব্য সঞ্চয়",
    completionTime: "প্রত্যাশিত সমাপ্তির সময়কাল",
    statusIndicator: "প্রক্ষেপণ অবস্থা",
    onTrack: "সঠিক ট্র্যাকে আছেন",
    needMore: "আরও জমানো প্রয়োজন",
    monthsShortcut: "মাস",
  }
};

/**
 * Returns translation for key or defaultValue if not present
 */
export function getTranslatedCategory(categoryKey: string, lang: 'en' | 'bn'): string {
  const normKey = categoryKey.toLowerCase();
  
  if (lang === 'bn') {
    switch(normKey) {
      // Income
      case 'salary': return translations.bn.categorySalary;
      case 'freelancing': return translations.bn.categoryFreelancing;
      case 'business': return translations.bn.categoryBusiness;
      case 'investment': return translations.bn.categoryInvestment;
      case 'bonus': return translations.bn.categoryBonus;
      case 'gift': return translations.bn.categoryGift;
      case 'other': return translations.bn.categoryOther;
      // Expense
      case 'food': return translations.bn.categoryFood;
      case 'transport': return translations.bn.categoryTransport;
      case 'shopping': return translations.bn.categoryShopping;
      case 'education': return translations.bn.categoryEducation;
      case 'healthcare': return translations.bn.categoryHealthcare;
      case 'entertainment': return translations.bn.categoryEntertainment;
      case 'bills': return translations.bn.categoryBills;
      case 'rent': return translations.bn.categoryRent;
      case 'travel': return translations.bn.categoryTravel;
      case 'others':
      case 'other_expense': return translations.bn.categoryOthers;
      default: return categoryKey;
    }
  } else {
    switch(normKey) {
      // Income
      case 'salary': return translations.en.categorySalary;
      case 'freelancing': return translations.en.categoryFreelancing;
      case 'business': return translations.en.categoryBusiness;
      case 'investment': return translations.en.categoryInvestment;
      case 'bonus': return translations.en.categoryBonus;
      case 'gift': return translations.en.categoryGift;
      case 'other': return translations.en.categoryOther;
      // Expense
      case 'food': return translations.en.categoryFood;
      case 'transport': return translations.en.categoryTransport;
      case 'shopping': return translations.en.categoryShopping;
      case 'education': return translations.en.categoryEducation;
      case 'healthcare': return translations.en.categoryHealthcare;
      case 'entertainment': return translations.en.categoryEntertainment;
      case 'bills': return translations.en.categoryBills;
      case 'rent': return translations.en.categoryRent;
      case 'travel': return translations.en.categoryTravel;
      case 'others':
      case 'other_expense': return translations.en.categoryOthers;
      default: return categoryKey;
    }
  }
}
