# SpendWise Laravel Backend API Service (Laravel 11 + MySQL)

Welcome to the backend API layer for **SpendWise** - state-of-the-art SaaS Smart Expense Tracking & Budgeting Application. 

This repository contains the complete, production-ready backend restructured from a Node.js Express server to a robust **Laravel 11** framework backed by a **MySQL** database. All existing features (dual-lingual alerts, dynamic auto-recurring billing cycles, financial savings milestones, and **Gemini API AI coach and receipt OCR parsing**) are preserved and optimally implemented using Eloquent models and clean controller actions.

---

## 🔑 Demo & Admin Credentials

Use these records to log in immediately after running database migrations and seeders:

| Account Type | Email Address | Password | Language / Currency | Role |
| :--- | :--- | :--- | :--- | :--- |
| **Abu Sayeed Pranto** | `demo@spendwise.com` | `demo123` | English / BDT (Taka) | Standard Active User |
| **Admin Moderator** | `admin@spendwise.com` | `admin123` | English / USD (Dollar) | Platform Administrator |

---

## 🛠️ Step-by-Step Installation Guide (Local Machine)

Follow these instructions to run the SpendWise Laravel API on your personal computer:

### Prerequisites:
Make sure you have the following software packages installed on your local machine:
- **PHP** (v8.2 or higher is recommended)
- **Composer** (PHP Package Manager)
- **MySQL Database Server** (or XAMPP / WampServer / LocalWP)

---

### Step 1: Copy Code and Move into Directory
Navigate to the `laravel-backend` directory:
```bash
cd laravel-backend
```

### Step 2: Install Project Dependencies
Run composer to install framework packages and Sanctum state engines:
```bash
composer install
```

### Step 3: Configure Environment Variables (`.env`)
Generate your live `.env` configuration file from the template:
```bash
cp .env.example .env
```

Open the newly created `.env` file in your preferred text editor and enter your local MySQL database connection parameters:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=spendwise_db
DB_USERNAME=root
DB_PASSWORD=YOUR_DB_PASSWORD_HERE

# [OPTIONAL] Set your Google Gemini key for AI coaching & receipt scanning
GEMINI_API_KEY=AIzaSy...
```
*Note: Make sure to create an empty schema database named `spendwise_db` in your MySQL server before proceeding.*

### Step 4: Generate Application Safe Key
Generate a secure encryption key for cookies and tokens encryption:
```bash
php artisan key:generate
```

### Step 5: Run Database Migrations and Seed Demo Data
Build all schemas (Users, Accounts, Budgets, Saving Goals, Recurring Rules, System Notifications) and seed the database with current mock datasets:
```bash
php artisan migrate --seed
```

### Step 6: Launch Laravel Local Development Server
Start the development server on `http://127.0.0.1:8000`:
```bash
php artisan serve
```
Excellent! Your backend API server is now running live! You can verify it by loading `http://127.0.0.1:8000` in your web browser.

---

## 🌐 Connecting React Frontend to Laravel API (Axios Integration)

To connect your existing React frontend to the new Laravel server, you can create a custom `api.ts` file or modify your global Axios configuration block. 

### Modern Laravel API Client Example:

Save this inside `/src/services/api.ts` in your frontend directory to pipe all API actions seamlessly into the Laravel backend:

```typescript
import axios from 'axios';

// 1. Set backend base endpoint
const API = axios.create({
  baseURL: 'http://localhost:8000/api', // Laravel standard local runtime
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// 2. Attach Authorization token interceptor for Sanctum
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('spendwise_session_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`; // Sanctum Bearer token scheme
  }
  return config;
});

// 3. User Authentication services
export const authService = {
  login: async (credentials: any) => {
    const res = await API.post('/auth/login', credentials);
    // Persist Sanctum plain-text token
    if (res.data.token) {
      localStorage.setItem('spendwise_session_token', res.data.token);
    }
    return res.data;
  },
  register: async (details: any) => {
    const res = await API.post('/auth/register', details);
    if (res.data.token) {
      localStorage.setItem('spendwise_session_token', res.data.token);
    }
    return res.data;
  },
  logout: async () => {
    await API.post('/auth/logout');
    localStorage.removeItem('spendwise_session_token');
  },
  getProfile: async () => {
    const res = await API.get('/auth/me');
    return res.data.user;
  },
  updateProfile: async (data: any) => {
    const res = await API.put('/auth/me', data);
    return res.data.user;
  },
  changePassword: async (passwords: any) => {
    const res = await API.put('/auth/change-password', passwords);
    return res.data;
  }
};

// 4. Financial accounts endpoints
export const accountService = {
  getAccounts: async () => {
    const res = await API.get('/accounts');
    return res.data;
  },
  createAccount: async (data: any) => {
    const res = await API.post('/accounts', data);
    return res.data;
  },
  deleteAccount: async (id: string) => {
    const res = await API.delete(`/accounts/${id}`);
    return res.data;
  }
};

// 5. LEDGER & TRANSACTIONS SERVICES
export const transactionService = {
  getTransactions: async (params?: any) => {
    const res = await API.get('/transactions', { params });
    return res.data;
  },
  createTransaction: async (data: any) => {
    const res = await API.post('/transactions', data);
    return res.data;
  },
  updateTransaction: async (id: string, data: any) => {
    const res = await API.put(`/transactions/${id}`, data);
    return res.data;
  },
  deleteTransaction: async (id: string) => {
    const res = await API.delete(`/transactions/${id}`);
    return res.data;
  }
};

// 6. EXPENSE LIMIT BUDGETS SERVICES
export const budgetService = {
  getBudgets: async () => {
    const res = await API.get('/budgets');
    return res.data;
  },
  createBudget: async (data: any) => {
    const res = await API.post('/budgets', data);
    return res.data;
  },
  deleteBudget: async (id: string) => {
    const res = await API.delete(`/budgets/${id}`);
    return res.data;
  }
};

// 7. SAVINGS GOALS SERVICES
export const goalsService = {
  getGoals: async () => {
    const res = await API.get('/goals');
    return res.data;
  },
  createGoal: async (data: any) => {
    const res = await API.post('/goals', data);
    return res.data;
  },
  addFunds: async (id: string, amount: number, sourceAccountId?: string) => {
    const res = await API.put(`/goals/${id}/add-funds`, { amount, sourceAccountId });
    return res.data;
  },
  deleteGoal: async (id: string) => {
    const res = await API.delete(`/goals/${id}`);
    return res.data;
  }
};

// 8. AUTO-RECURRING SUBSCRIPTIONS RULES SERVICES
export const recurringService = {
  getRules: async () => {
    const res = await API.get('/recurring');
    return res.data;
  },
  createRule: async (data: any) => {
    const res = await API.post('/recurring', data);
    return res.data;
  },
  toggleRule: async (id: string) => {
    const res = await API.put(`/recurring/${id}/toggle`);
    return res.data;
  },
  deleteRule: async (id: string) => {
    const res = await API.delete(`/recurring/${id}`);
    return res.data;
  }
};

// 9. SYSTEM NOTIFICATIONS SERVICES
export const notificationService = {
  getNotifications: async () => {
    const res = await API.get('/notifications');
    return res.data;
  },
  markAllRead: async () => {
    const res = await API.put('/notifications/mark-read');
    return res.data;
  },
  markRead: async (id: string) => {
    const res = await API.post(`/notifications/${id}/read`);
    return res.data;
  }
};

// 10. GENERATIVE AI SMART SCANNING & ADVISOR SERVICES
export const aiService = {
  uploadReceipt: async (fileDataUrl: string, fileName: string) => {
    const res = await API.post('/receipt/upload', { fileDataUrl, fileName });
    return res.data.parsedTx;
  },
  getCoachAnalysis: async (customPrompt?: string, language?: 'en' | 'bn') => {
    const res = await API.post('/coach/analyze', { customPrompt, language });
    return res.data.analysis;
  }
};

export default API;
```

---

## 🚀 Web Hosting Production Optimization

When deploying your Laravel API server to a live production database (e.g., VPS hosting, Hostinger, GoDaddy, cPanel, AWS EC2, or DigitalOcean), perform these configuration optimizations to speed up performance:

### Optimize Configurations Autoloader:
Caching configurations avoids reading raw file arrays on every API request:
```bash
php artisan config:cache
```

### Cache API and Web Routing Table:
Reduces execution path mapping computations significantly:
```bash
php artisan route:cache
```

### Boost Autoloaders:
Clean up Composer namespaces to load classes as fast as possible:
```bash
composer install --optimize-autoloader --no-dev
```

### Secure Database for Live Production:
Uncomment or edit database config rules in `.env` inside production files and hide debug trace logs:
```env
APP_ENV=production
APP_DEBUG=false
```
