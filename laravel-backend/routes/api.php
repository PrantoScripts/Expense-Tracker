<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\SavingsGoalController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\RecurringController;
use App\Http\Controllers\AIController;

/*
|--------------------------------------------------------------------------
| SpendWise API Routes
|--------------------------------------------------------------------------
|
| Dual-lingual REST routes backing the SpendWise React application.
| All routes under '/api' prefix are protected by Sanctum / Middleware.
|
*/

// Open Authentication endpoints
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Authenticated/Protected endpoints (via Laravel Sanctum Tokens)
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth & User Profiling routes
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/me', [AuthController::class, 'updateProfile']);
    Route::get('/auth/profile', [AuthController::class, 'profile']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::put('/auth/change-password', [AuthController::class, 'changePassword']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Financial Cash/Bank/Mobile Accounts routes
    Route::get('/accounts', [AccountController::class, 'index']);
    Route::post('/accounts', [AccountController::class, 'store']);
    Route::delete('/accounts/{id}', [AccountController::class, 'destroy']);

    // Ledgers and Transactions routes
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::put('/transactions/{id}', [TransactionController::class, 'update']);
    Route::delete('/transactions/{id}', [TransactionController::class, 'destroy']);

    // Expense Limit Budgets routes
    Route::get('/budgets', [BudgetController::class, 'index']);
    Route::post('/budgets', [BudgetController::class, 'store']);
    Route::delete('/budgets/{id}', [BudgetController::class, 'destroy']);

    // Savings Goals & Fund Additions routes
    Route::get('/goals', [SavingsGoalController::class, 'index']);
    Route::post('/goals', [SavingsGoalController::class, 'store']);
    Route::put('/goals/{id}/add-funds', [SavingsGoalController::class, 'addFunds']);
    Route::delete('/goals/{id}', [SavingsGoalController::class, 'destroy']);

    // Auto-Recurring Billing Subscription routes
    Route::get('/recurring', [RecurringController::class, 'index']);
    Route::post('/recurring', [RecurringController::class, 'store']);
    Route::put('/recurring/{id}/toggle', [RecurringController::class, 'toggle']);
    Route::delete('/recurring/{id}', [RecurringController::class, 'destroy']);

    // System Notifications routes
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/mark-read', [NotificationController::class, 'markAllRead']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markSingleRead']);

    // Generative AI OCR Scanner & Coaching routes
    Route::post('/receipt/upload', [AIController::class, 'scanReceipt']);
    Route::post('/coach/analyze', [AIController::class, 'analyzeLedger']);
});
?>
