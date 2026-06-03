<?php

namespace App\Http\Controllers;

use App\Models\SavingsGoal;
use App\Models\Account;
use App\Models\Transaction;
use App\Models\SystemNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class SavingsGoalController extends Controller
{
    /**
     * List user milestones and saving goals
     */
    public function index(Request $request)
    {
        $goals = SavingsGoal::where('userId', $request->user()->id)->get();
        return response()->json($goals, 200);
    }

    /**
     * Store brand new goal
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:150',
            'targetAmount' => 'required|numeric|min:1',
            'deadline' => 'required|date_format:Y-m-d',
            'currentAmount' => 'nullable|numeric',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Goal Name, Target Amount, and Target Date Deadline are mandatory.'], 400);
        }

        $userId = $request->user()->id;

        $goal = SavingsGoal::create([
            'id' => 'gl_' . Str::random(7),
            'userId' => $userId,
            'name' => $request->name,
            'targetAmount' => floatval($request->targetAmount),
            'currentAmount' => floatval($request->currentAmount ?: 0),
            'deadline' => $request->deadline,
            'notes' => $request->notes ?: ''
        ]);

        return response()->json($goal, 200);
    }

    /**
     * Deposit funds into savings goal & deduct it from source account with auto-logged expense
     */
    public function addFunds(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0.01',
            'sourceAccountId' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Deposit amount is mandatory.'], 400);
        }

        $userId = $request->user()->id;
        $goal = SavingsGoal::where('id', $id)->where('userId', $userId)->first();

        if (!$goal) {
            return response()->json(['error' => 'Milestone goal not found.'], 404);
        }

        $depositAmount = floatval($request->amount);
        $goal->currentAmount += $depositAmount;
        $goal->save();

        // If a wallet balance is chosen, deduct & log transaction
        if ($request->has('sourceAccountId') && !empty($request->sourceAccountId)) {
            $account = Account::where('id', $request->sourceAccountId)->where('userId', $userId)->first();
            if ($account) {
                // Deduct balance
                $account->balance -= $depositAmount;
                $account->save();

                // Log a tracking expense transaction mapping the saving contribution
                Transaction::create([
                    'id' => 'tx_' . Str::random(7),
                    'userId' => $userId,
                    'accountId' => $request->sourceAccountId,
                    'type' => 'expense',
                    'amount' => $depositAmount,
                    'category' => 'Others',
                    'date' => date('Y-m-d'),
                    'note' => "Savings Deposit contribution to goal: " . $goal->name,
                    'createdAt' => now()->toISOString()
                ]);
            }
        }

        // Trigger victory notification if target amount completed now
        if ($goal->currentAmount >= $goal->targetAmount) {
            SystemNotification::create([
                'id' => 'nt_goal_ch_' . Str::random(7),
                'userId' => $userId,
                'type' => 'goal_achieved',
                'titleEn' => "Milestone Achieved: {$goal->name}!",
                'titleBn' => "লক্ষ্য অর্জিত হয়েছে: {$goal->name}!",
                'messageEn' => "Terrific! You have raised {$goal->currentAmount} BDT / {$goal->targetAmount} BDT to fully realize savings milestone: {$goal->name}!",
                'messageBn' => "অসাধারণ সাফল্য! সঞ্চয় লক্ষ্যমাত্রা পূর্ণ করে আপনি {$goal->currentAmount} টাকা অলরেডি জমিয়ে ফেলেছেন!",
                'read' => false
            ]);
        }

        return response()->json($goal, 200);
    }

    /**
     * Delete goal
     */
    public function destroy(Request $request, $id)
    {
        $goal = SavingsGoal::where('id', $id)->where('userId', $request->user()->id)->first();
        if (!$goal) {
            return response()->json(['error' => 'Milestone goal context not found.'], 404);
        }

        $goal->delete();
        return response()->json(['success' => true], 200);
    }
}
