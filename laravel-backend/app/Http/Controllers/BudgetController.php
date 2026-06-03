<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class BudgetController extends Controller
{
    /**
     * Display budgets for the authenticated user.
     */
    public function index(Request $request)
    {
        $budgets = Budget::where('userId', $request->user()->id)->get();
        return response()->json($budgets, 200);
    }

    /**
     * Store a newly created budget.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:1',
            'type' => 'required|string|in:monthly,category',
            'category' => 'nullable|string',
            'month' => 'nullable|string', // Format 'YYYY-MM'
            'alertThreshold' => 'nullable|integer|min:1|max:100'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Amount and budget type are mandatory fields.'], 400);
        }

        $userId = $request->user()->id;
        $month = $request->month ?: date('Y-m');

        $budget = Budget::create([
            'id' => 'bd_' . Str::random(7),
            'userId' => $userId,
            'category' => $request->category ?: 'all',
            'amount' => floatval($request->amount),
            'type' => $request->type,
            'month' => $month,
            'alertThreshold' => $request->has('alertThreshold') ? intval($request->alertThreshold) : 80
        ]);

        return response()->json($budget, 200);
    }

    /**
     * Delete a budget card.
     */
    public function destroy(Request $request, $id)
    {
        $budget = Budget::where('id', $id)
            ->where('userId', $request->user()->id)
            ->first();

        if (!$budget) {
            return response()->json(['error' => 'Budget context not found.'], 404);
        }

        $budget->delete();

        return response()->json(['success' => true], 200);
    }
}
