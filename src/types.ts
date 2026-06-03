/**
 * Types for SpendWise Smart Expense Tracking Application
 */

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profilePhoto?: string;
  currency: string;             // USD, BDT, EUR, GBP
  languagePreference: 'en' | 'bn';
  themePreference: 'light' | 'dark' | 'system';
  timezone: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: 'cash' | 'bank' | 'mobile_banking' | 'credit_card';
  balance: number;
  currency: string;
  color: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  note: string;
  attachment?: {
    name: string;
    type: string; // 'png' | 'jpg' | 'pdf'
    dataUrl?: string; // base64 or placeholder
  };
  recurringId?: string; // points to recurring rule if any
  createdAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  category: string; // 'all' or specific categories
  amount: number;
  type: 'monthly' | 'category';
  month: string; // YYYY-MM
  alertThreshold: number; // e.g. 80 for 80%
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  notes: string;
  createdAt: string;
}

export interface RecurringTransaction {
  id: string;
  userId: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  category: string;
  note: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDueDate: string; // YYYY-MM-DD
  isActive: boolean;
  createdAt: string;
}

export interface SystemNotification {
  id: string;
  userId: string;
  type: 'budget_warning' | 'budget_exceeded' | 'goal_achieved' | 'recurring_reminder' | 'system';
  titleEn: string;
  titleBn: string;
  messageEn: string;
  messageBn: string;
  read: boolean;
  createdAt: string;
}

export interface SystemSettings {
  defaultCurrency: string;
  siteName: string;
  allowRegistrations: boolean;
  enforceEmailVerification: boolean;
  underMaintenance: boolean;
}

export interface APIError {
  error: string;
}
