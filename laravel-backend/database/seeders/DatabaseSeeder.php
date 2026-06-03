<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Account;
use App\Models\Transaction;
use App\Models\Budget;
use App\Models\SavingsGoal;
use App\Models\RecurringTransaction;
use App\Models\SystemNotification;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Demo & Admin Users
        $demoUser = User::create([
            'id' => 'u_demo',
            'name' => 'Abu Sayeed Pranto',
            'email' => 'demo@spendwise.com',
            'password' => Hash::make('demo123'), // Securely hashed
            'phone' => '+8801712345678',
            'profilePhoto' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            'currency' => 'BDT',
            'languagePreference' => 'en',
            'themePreference' => 'dark',
            'timezone' => 'Asia/Dhaka',
            'isAdmin' => false,
        ]);

        $adminUser = User::create([
            'id' => 'u_admin',
            'name' => 'Admin Moderator',
            'email' => 'admin@spendwise.com',
            'password' => Hash::make('admin123'),
            'phone' => '+8801999999999',
            'profilePhoto' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
            'currency' => 'USD',
            'languagePreference' => 'en',
            'themePreference' => 'light',
            'timezone' => 'UTC',
            'isAdmin' => true,
        ]);

        // 2. Seed Accounts for u_demo
        Account::create([
            'id' => 'acc_cash',
            'userId' => 'u_demo',
            'name' => 'Cash Wallet',
            'type' => 'cash',
            'balance' => 12500,
            'currency' => 'BDT',
            'color' => '#10B981'
        ]);

        Account::create([
            'id' => 'acc_bank',
            'userId' => 'u_demo',
            'name' => 'Prime Bank Savings',
            'type' => 'bank',
            'balance' => 85300,
            'currency' => 'BDT',
            'color' => '#3B82F6'
        ]);

        Account::create([
            'id' => 'acc_mobile',
            'userId' => 'u_demo',
            'name' => 'bKash Premium',
            'type' => 'mobile_banking',
            'balance' => 24700,
            'currency' => 'BDT',
            'color' => '#EC4899'
        ]);

        Account::create([
            'id' => 'acc_credit',
            'userId' => 'u_demo',
            'name' => 'SCB Visa Platinum',
            'type' => 'credit_card',
            'balance' => -8200,
            'currency' => 'BDT',
            'color' => '#F59E0B'
        ]);

        // 3. Seed Transactions for u_demo
        Transaction::create([
            'id' => 'tx_1',
            'userId' => 'u_demo',
            'accountId' => 'acc_bank',
            'type' => 'income',
            'amount' => 65000,
            'category' => 'Salary',
            'date' => date('Y-m-d', strtotime('-5 days')),
            'note' => 'Monthly corporate salary credit'
        ]);

        Transaction::create([
            'id' => 'tx_2',
            'userId' => 'u_demo',
            'accountId' => 'acc_mobile',
            'type' => 'income',
            'amount' => 15400,
            'category' => 'Freelancing',
            'date' => date('Y-m-d', strtotime('-18 days')),
            'note' => 'Web dashboard React development UI/UX layout'
        ]);

        Transaction::create([
            'id' => 'tx_3',
            'userId' => 'u_demo',
            'accountId' => 'acc_bank',
            'type' => 'expense',
            'amount' => 18000,
            'category' => 'Rent',
            'date' => date('Y-m-d', strtotime('-24 days')),
            'note' => 'Apartment rental monthly BDT payment'
        ]);

        Transaction::create([
            'id' => 'tx_4',
            'userId' => 'u_demo',
            'accountId' => 'acc_cash',
            'type' => 'expense',
            'amount' => 3200,
            'category' => 'Food',
            'date' => date('Y-m-d', strtotime('-10 days')),
            'note' => 'Dinner outing with family & friends'
        ]);

        Transaction::create([
            'id' => 'tx_5',
            'userId' => 'u_demo',
            'accountId' => 'acc_credit',
            'type' => 'expense',
            'amount' => 4800,
            'category' => 'Shopping',
            'date' => date('Y-m-d', strtotime('-5 days')),
            'note' => 'Washed denim jacket shopping discount'
        ]);

        Transaction::create([
            'id' => 'tx_6',
            'userId' => 'u_demo',
            'accountId' => 'acc_bank',
            'type' => 'expense',
            'amount' => 1500,
            'category' => 'Bills',
            'date' => date('Y-m-d', strtotime('-3 days')),
            'note' => 'High-speed broadband internet subscription fee'
        ]);

        Transaction::create([
            'id' => 'tx_7',
            'userId' => 'u_demo',
            'accountId' => 'acc_cash',
            'type' => 'expense',
            'amount' => 850,
            'category' => 'Transport',
            'date' => date('Y-m-d', strtotime('-1 days')),
            'note' => 'Uber ride share to business park office district'
        ]);

        Transaction::create([
            'id' => 'tx_8',
            'userId' => 'u_demo',
            'accountId' => 'acc_mobile',
            'type' => 'expense',
            'amount' => 2400,
            'category' => 'Healthcare',
            'date' => date('Y-m-d', strtotime('-2 days')),
            'note' => 'Monthly allergy control medicine prescription refills'
        ]);

        // 4. Seed Budgets for u_demo
        Budget::create([
            'id' => 'bd_1',
            'userId' => 'u_demo',
            'category' => 'all',
            'amount' => 45000,
            'type' => 'monthly',
            'month' => date('Y-m'),
            'alertThreshold' => 80
        ]);

        Budget::create([
            'id' => 'bd_2',
            'userId' => 'u_demo',
            'category' => 'Food',
            'amount' => 10000,
            'type' => 'category',
            'month' => date('Y-m'),
            'alertThreshold' => 90
        ]);

        Budget::create([
            'id' => 'bd_3',
            'userId' => 'u_demo',
            'category' => 'Transport',
            'amount' => 3000,
            'type' => 'category',
            'month' => date('Y-m'),
            'alertThreshold' => 80
        ]);

        // 5. Seed Savings Goals for u_demo
        SavingsGoal::create([
            'id' => 'gl_1',
            'userId' => 'u_demo',
            'name' => 'High Performance Mac Studio Desktop Setup',
            'targetAmount' => 220000,
            'currentAmount' => 110000,
            'deadline' => date('Y-m-d', strtotime('+300 days')),
            'notes' => 'Workstation hardware configuration setup'
        ]);

        SavingsGoal::create([
            'id' => 'gl_2',
            'userId' => 'u_demo',
            'name' => 'Summer Retreat Family Vacation Travel Fund',
            'targetAmount' => 85000,
            'currentAmount' => 42000,
            'deadline' => date('Y-m-d', strtotime('+120 days')),
            'notes' => 'Flight tickets reservation & lodging budget limits'
        ]);

        // 6. Seed RecurringTransactions for u_demo
        RecurringTransaction::create([
            'id' => 'rc_1',
            'userId' => 'u_demo',
            'accountId' => 'acc_bank',
            'type' => 'expense',
            'amount' => 1200,
            'category' => 'Bills',
            'note' => 'Spotify & Netflix global media premium billing subscriptions',
            'frequency' => 'monthly',
            'nextDueDate' => date('Y-m-d', strtotime('+2 days')),
            'isActive' => true
        ]);

        RecurringTransaction::create([
            'id' => 'rc_2',
            'userId' => 'u_demo',
            'accountId' => 'acc_cash',
            'type' => 'income',
            'amount' => 2500,
            'category' => 'Gift',
            'note' => 'Weekly tutoring allowance or contribution',
            'frequency' => 'weekly',
            'nextDueDate' => date('Y-m-d', strtotime('+5 days')),
            'isActive' => true
        ]);

        // 7. Seed System Notifications for u_demo
        SystemNotification::create([
            'id' => 'nt_1',
            'userId' => 'u_demo',
            'type' => 'system',
            'titleEn' => 'Welcome to SpendWise Premium!',
            'titleBn' => 'স্পেন্ডওয়াইজ প্রিমিয়ামে আপনাকে স্বাগতম!',
            'messageEn' => "Tap 'AI Financial Coach' in the dashboard to unlock state-of-the-art predictive budgeting forecasts driven by Gemini.",
            'messageBn' => "জেমিণী চালিত অত্যাধুনিক বাজেট পূর্বাভাস আনলক করতে ড্যাশবোর্ডে 'এআই ফাইন্যান্সিয়াল কোচ' ট্যাপ করুন।",
            'read' => false
        ]);
    }
}
?>
