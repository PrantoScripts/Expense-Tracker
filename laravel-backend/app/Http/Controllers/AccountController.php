<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AccountController extends Controller
{
    /**
     * Display accounts belonging to the authenticated user.
     */
    public function index(Request $request)
    {
        $accounts = Account::where('userId', $request->user()->id)->get();
        return response()->json($accounts, 200);
    }

    /**
     * Store a newly created financial account.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'type' => 'required|string|in:cash,bank,mobile_banking,credit_card',
            'balance' => 'required|numeric',
            'currency' => 'nullable|string|max:10',
            'color' => 'nullable|string|max:20'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Name, Account Type, and Opening Balance are mandatory fields.'], 400);
        }

        $account = Account::create([
            'id' => 'acc_' . Str::random(7),
            'userId' => $request->user()->id,
            'name' => $request->name,
            'type' => $request->type,
            'balance' => floatval($request->balance),
            'currency' => $request->currency ?: $request->user()->currency ?: 'BDT',
            'color' => $request->color ?: '#4F46E5'
        ]);

        return response()->json($account, 200);
    }

    /**
     * Delete an account and its linked statistics.
     */
    public function destroy(Request $request, $id)
    {
        $account = Account::where('id', $id)
            ->where('userId', $request->user()->id)
            ->first();

        if (!$account) {
            return response()->json(['error' => 'Account not found or access denied.'], 404);
        }

        // Delete associated transactions (cascade delete rules usually handle this, but
        // let's explicitly remove them here for robust local consistency)
        Transaction::where('accountId', $id)->where('userId', $request->user()->id)->delete();
        $account->delete();

        return response()->json(['success' => true], 200);
    }
}
