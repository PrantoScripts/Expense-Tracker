<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Transaction;
use App\Models\Budget;
use App\Models\SystemNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class TransactionController extends Controller
{
    /**
     * List, filter and sort transactions belonging to user
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $query = Transaction::where('userId', $userId);

        // Apply filters
        if ($request->has('search') && !empty($request->search)) {
            $search = strtolower($request->search);
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(note) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(category) LIKE ?', ["%{$search}%"]);
            });
        }

        if ($request->has('type') && !empty($request->type)) {
            $query->where('type', $request->type);
        }

        if ($request->has('category') && !empty($request->category)) {
            $query->whereRaw('LOWER(category) = ?', [strtolower($request->category)]);
        }

        if ($request->has('accountId') && !empty($request->accountId)) {
            $query->where('accountId', $request->accountId);
        }

        if ($request->has('fromDate') && !empty($request->fromDate)) {
            $query->where('date', '>=', $request->fromDate);
        }

        if ($request->has('toDate') && !empty($request->toDate)) {
            $query->where('date', '<=', $request->toDate);
        }

        if ($request->has('minAmount') && !empty($request->minAmount)) {
            $query->where('amount', '>=', floatval($request->minAmount));
        }

        if ($request->has('maxAmount') && !empty($request->maxAmount)) {
            $query->where('amount', '<=', floatval($request->maxAmount));
        }

        // Sort by date desc (match NodeJs behavior)
        $transactions = $query->orderBy('date', 'desc')->get();

        // Format to map attachment structure
        $formatted = $transactions->map(function ($tx) {
            $item = $tx->toArray();
            if ($tx->attachment_name || $tx->attachment_type || $tx->attachment_dataUrl) {
                $item['attachment'] = [
                    'name' => $tx->attachment_name ?: '',
                    'type' => $tx->attachment_type ?: '',
                    'dataUrl' => $tx->attachment_dataUrl ?: ''
                ];
            }
            unset($item['attachment_name']);
            unset($item['attachment_type']);
            unset($item['attachment_dataUrl']);
            return $item;
        });

        return response()->json($formatted, 200);
    }

    /**
     * Store new transaction log & update linked Account balance
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'accountId' => 'required|string',
            'type' => 'required|string|in:income,expense',
            'amount' => 'required|numeric|min:0.01',
            'category' => 'required|string',
            'date' => 'required|date_format:Y-m-d'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Missing required fields (Account, Type, Amount, Category, Date).'], 400);
        }

        $userId = $request->user()->id;
        $account = Account::where('id', $request->accountId)->where('userId', $userId)->first();
        if (!$account) {
            return response()->json(['error' => 'Selected financial account not found.'], 404);
        }

        $amount = floatval($request->amount);

        // Map optional attachment structure
        $attachmentName = null;
        $attachmentType = null;
        $attachmentDataUrl = null;
        if ($request->has('attachment')) {
            $att = $request->attachment;
            if (is_array($att)) {
                $attachmentName = $att['name'] ?? null;
                $attachmentType = $att['type'] ?? null;
                $attachmentDataUrl = $att['dataUrl'] ?? null;
            }
        }

        $transaction = Transaction::create([
            'id' => 'tx_' . Str::random(7),
            'userId' => $userId,
            'accountId' => $request->accountId,
            'type' => $request->type,
            'amount' => $amount,
            'category' => $request->category,
            'date' => $request->date,
            'note' => $request->note ?: '',
            'attachment_name' => $attachmentName,
            'attachment_type' => $attachmentType,
            'attachment_dataUrl' => $attachmentDataUrl,
            'recurringId' => $request->recurringId
        ]);

        // Adjust related Account balance
        if ($request->type === 'income') {
            $account->balance += $amount;
        } else {
            $account->balance -= $amount;
        }
        $account->save();

        // Recalculate immediate budgets and raise notifications if needed
        $this->checkBudgetThresholds($userId);

        $responseTx = $transaction->toArray();
        if ($attachmentName || $attachmentType || $attachmentDataUrl) {
            $responseTx['attachment'] = [
                'name' => $attachmentName ?: '',
                'type' => $attachmentType ?: '',
                'dataUrl' => $attachmentDataUrl ?: ''
            ];
        }
        unset($responseTx['attachment_name']);
        unset($responseTx['attachment_type']);
        unset($responseTx['attachment_dataUrl']);

        return response()->json($responseTx, 200);
    }

    /**
     * Update an existing transaction with full balance reconciliation
     */
    public function update(Request $request, $id)
    {
        $userId = $request->user()->id;
        $transaction = Transaction::where('id', $id)->where('userId', $userId)->first();
        if (!$transaction) {
            return response()->json(['error' => 'Transaction log not found.'], 404);
        }

        // Reverse prior account balance impact
        $oldAccount = Account::where('id', $transaction->accountId)->where('userId', $userId)->first();
        if ($oldAccount) {
            if ($transaction->type === 'income') {
                $oldAccount->balance -= $transaction->amount;
            } else {
                $oldAccount->balance += $transaction->amount;
            }
            $oldAccount->save();
        }

        // Validate new inputs
        $validator = Validator::make($request->all(), [
            'accountId' => 'nullable|string',
            'type' => 'nullable|string|in:income,expense',
            'amount' => 'nullable|numeric|min:0.01',
            'category' => 'nullable|string',
            'date' => 'nullable|date_format:Y-m-d'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        // Update fields
        if ($request->has('accountId')) $transaction->accountId = $request->accountId;
        if ($request->has('type')) $transaction->type = $request->type;
        if ($request->has('amount')) $transaction->amount = floatval($request->amount);
        if ($request->has('category')) $transaction->category = $request->category;
        if ($request->has('date')) $transaction->date = $request->date;
        if ($request->has('note')) $transaction->note = $request->note;

        if ($request->has('attachment')) {
            $att = $request->attachment;
            if (is_array($att)) {
                $transaction->attachment_name = $att['name'] ?? $transaction->attachment_name;
                $transaction->attachment_type = $att['type'] ?? $transaction->attachment_type;
                $transaction->attachment_dataUrl = $att['dataUrl'] ?? $transaction->attachment_dataUrl;
            }
        }

        $transaction->save();

        // Apply brand new balance adjustments on specified target account
        $newAccount = Account::where('id', $transaction->accountId)->where('userId', $userId)->first();
        if ($newAccount) {
            if ($transaction->type === 'income') {
                $newAccount->balance += $transaction->amount;
            } else {
                $newAccount->balance -= $transaction->amount;
            }
            $newAccount->save();
        }

        $this->checkBudgetThresholds($userId);

        $responseTx = $transaction->toArray();
        if ($transaction->attachment_name || $transaction->attachment_type || $transaction->attachment_dataUrl) {
            $responseTx['attachment'] = [
                'name' => $transaction->attachment_name ?: '',
                'type' => $transaction->attachment_type ?: '',
                'dataUrl' => $transaction->attachment_dataUrl ?: ''
            ];
        }
        unset($responseTx['attachment_name']);
        unset($responseTx['attachment_type']);
        unset($responseTx['attachment_dataUrl']);

        return response()->json($responseTx, 200);
    }

    /**
     * Delete transaction & restore Account balance impact
     */
    public function destroy(Request $request, $id)
    {
        $userId = $request->user()->id;
        $transaction = Transaction::where('id', $id)->where('userId', $userId)->first();
        if (!$transaction) {
            return response()->json(['error' => 'Transaction detail not found.'], 404);
        }

        // Revert balance on associated account
        $account = Account::where('id', $transaction->accountId)->where('userId', $userId)->first();
        if ($account) {
            if ($transaction->type === 'income') {
                $account->balance -= $transaction->amount;
            } else {
                $account->balance += $transaction->amount;
            }
            $account->save();
        }

        $transaction->delete();
        return response()->json(['success' => true], 200);
    }

    /**
     * Helper pattern matching NodeJs code: scans budget thresholds and throws warning triggers if needed
     */
    private function checkBudgetThresholds($userId)
    {
        $currentMonth = date('Y-m'); // 'YYYY-MM'
        $userBudgets = Budget::where('userId', $userId)->where('month', $currentMonth)->get();
        if ($userBudgets->isEmpty()) return;

        $monthExpenseTx = Transaction::where('userId', $userId)
            ->where('type', 'expense')
            ->whereRaw("SUBSTRING(date, 1, 7) = ?", [$currentMonth])
            ->get();

        foreach ($userBudgets as $b) {
            $spent = 0;
            if ($b->category === 'all') {
                $spent = $monthExpenseTx->sum('amount');
            } else {
                $spent = $monthExpenseTx->where('category', $b->category)->sum('amount');
            }

            $ratio = $b->amount > 0 ? ($spent / $b->amount) * 100 : 0;

            if ($ratio >= 100) {
                // Check if already notified this month
                $alreadyWarned = SystemNotification::where('userId', $userId)
                    ->where('type', 'budget_exceeded')
                    ->where('messageEn', 'like', "%{$b->category}%")
                    ->whereRaw("SUBSTRING(created_at, 1, 7) = ?", [$currentMonth])
                    ->exists();

                if (!$alreadyWarned) {
                    SystemNotification::create([
                        'id' => 'nt_limit_ex_' . Str::random(7),
                        'userId' => $userId,
                        'type' => 'budget_exceeded',
                        'titleEn' => "ALERT: Budget Exceeded for " . ($b->category === 'all' ? 'All categories' : $b->category),
                        'titleBn' => "সতর্কতা: " . ($b->category === 'all' ? 'সকল' : $b->category) . " বাজেট সীমা অতিক্রম করেছে",
                        'messageEn' => "You have spent {$spent} BDT out of your {$b->amount} BDT maximum budget limit on '{$b->category}'. Please analyze your cash reserves!",
                        'messageBn' => "আপনি '{$b->category}' ক্যাটাগরিতে বরাদ্দ দেয়া {$b->amount} টাকার বিপরীতে ইতিমধ্যেই {$spent} টাকা ব্যয় করে ফেলেছেন।",
                        'read' => false
                    ]);
                }
            } elseif ($ratio >= $b->alertThreshold) {
                $alreadyWarned = SystemNotification::where('userId', $userId)
                    ->where('type', 'budget_warning')
                    ->where('messageEn', 'like', "%{$b->category}%")
                    ->whereRaw("SUBSTRING(created_at, 1, 7) = ?", [$currentMonth])
                    ->exists();

                if (!$alreadyWarned) {
                    SystemNotification::create([
                        'id' => 'nt_limit_wr_' . Str::random(7),
                        'userId' => $userId,
                        'type' => 'budget_warning',
                        'titleEn' => "WARNING: Budget approaching limit for " . ($b->category === 'all' ? 'All categories' : $b->category),
                        'titleBn' => "সতর্কতা: " . ($b->category === 'all' ? 'সকল' : $b->category) . " বাজেট সতর্কবার্তা সীমার কাছে",
                        'messageEn' => "Your spending on '{$b->category}' is at " . round($ratio) . "% of your allocated budget ({$spent} BDT spent / {$b->amount} BDT limit).",
                        'messageBn' => "আপনার '{$b->category}' ক্যাটাগরির ব্যয়টি মোট নির্ধারিত বাজেটের " . round($ratio) . "% এ পৌঁছে গেছে ({$spent} টাকা ব্যয় / {$b->amount} টাকা লিমিট)।",
                        'read' => false
                    ]);
                }
            }
        }
    }
}
