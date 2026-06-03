<?php

namespace App\Http\Controllers;

use App\Models\RecurringTransaction;
use App\Models\Transaction;
use App\Models\Account;
use App\Models\SystemNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class RecurringController extends Controller
{
    /**
     * Get active rules and process overdue transactions
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        // Perform real-time autodiscovery sweep on overdue rules (identical to Express engine)
        $this->scanAndProcessRecurring($userId);

        $rules = RecurringTransaction::where('userId', $userId)->get();
        return response()->json($rules, 200);
    }

    /**
     * Create fresh recurring rule log
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'accountId' => 'required|string',
            'type' => 'required|string|in:income,expense',
            'amount' => 'required|numeric|min:0.01',
            'category' => 'required|string',
            'frequency' => 'required|string|in:daily,weekly,monthly,yearly',
            'nextDueDate' => 'required|date_format:Y-m-d'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Missing required inputs for recurring rule creation.'], 400);
        }

        $userId = $request->user()->id;

        $rule = RecurringTransaction::create([
            'id' => 'rc_' . Str::random(7),
            'userId' => $userId,
            'accountId' => $request->accountId,
            'type' => $request->type,
            'amount' => floatval($request->amount),
            'category' => $request->category,
            'note' => $request->note ?: $request->name ?: '',
            'frequency' => $request->frequency,
            'nextDueDate' => $request->nextDueDate,
            'isActive' => true
        ]);

        return response()->json($rule, 200);
    }

    /**
     * Toggle active toggle state
     */
    public function toggle(Request $request, $id)
    {
        $userId = $request->user()->id;
        $rule = RecurringTransaction::where('id', $id)->where('userId', $userId)->first();

        if (!$rule) {
            return response()->json(['error' => 'Recurring rule context not found.'], 404);
        }

        $rule->isActive = !$rule->isActive;
        $rule->save();

        return response()->json($rule, 200);
    }

    /**
     * Delete rule card
     */
    public function destroy(Request $request, $id)
    {
        $rule = RecurringTransaction::where('id', $id)->where('userId', $request->user()->id)->first();
        if (!$rule) {
            return response()->json(['error' => 'Recurring context not found.'], 404);
        }

        $rule->delete();
        return response()->json(['success' => true], 200);
    }

    /**
     * Auto scan and generate overdue recurring transactions
     */
    private function scanAndProcessRecurring($userId)
    {
        $todayStr = date('Y-m-d');
        $today = strtotime($todayStr);

        $rules = RecurringTransaction::where('userId', $userId)
            ->where('isActive', true)
            ->get();

        foreach ($rules as $rule) {
            $nextDueTime = strtotime($rule->nextDueDate);

            // Execute transaction creation loops while intermediate dates are past or equal to today
            while ($nextDueTime <= $today) {
                // Determine transaction date
                $txDate = date('Y-m-d', $nextDueTime);

                // Create transaction
                Transaction::create([
                    'id' => 'tx_auto_' . Str::random(7),
                    'userId' => $userId,
                    'accountId' => $rule->accountId,
                    'type' => $rule->type,
                    'amount' => $rule->amount,
                    'category' => $rule->category,
                    'date' => $txDate,
                    'note' => "[Auto-Recurring] " . ($rule->note ?: ''),
                    'recurringId' => $rule->id
                ]);

                // Balance adjustment on linked wallet
                $account = Account::find($rule->accountId);
                if ($account) {
                    if ($rule->type === 'income') {
                        $account->balance += $rule->amount;
                    } else {
                        $account->balance -= $rule->amount;
                    }
                    $account->save();
                }

                // Push System Notification alert
                SystemNotification::create([
                    'id' => 'nt_auto_' . Str::random(7),
                    'userId' => $userId,
                    'type' => 'recurring_reminder',
                    'titleEn' => "Recurring entry recorded: {$rule->category}",
                    'titleBn' => "স্বয়ংক্রিয় তথ্য সংগৃহীত হয়েছে: {$rule->category}",
                    'messageEn' => "Automatically logged {$rule->type} of {$rule->amount} BDT for subscription/service: " . ($rule->note ?: $rule->category),
                    'messageBn' => "নিয়মিত রুল অনুযায়ী {$rule->amount} টাকার বিবরণী স্বয়ংক্রিয় হিসাবের খাতা যুক্ত হয়েছে: " . ($rule->note ?: $rule->category),
                    'read' => false
                ]);

                // Advance boundary date forward by increment frequency type
                if ($rule->frequency === 'daily') {
                    $nextDueTime = strtotime('+1 day', $nextDueTime);
                } elseif ($rule->frequency === 'weekly') {
                    $nextDueTime = strtotime('+1 week', $nextDueTime);
                } elseif ($rule->frequency === 'monthly') {
                    $nextDueTime = strtotime('+1 month', $nextDueTime);
                } elseif ($rule->frequency === 'yearly') {
                    $nextDueTime = strtotime('+1 year', $nextDueTime);
                }

                $rule->nextDueDate = date('Y-m-d', $nextDueTime);
                $rule->save();
            }
        }
    }
}
?>
