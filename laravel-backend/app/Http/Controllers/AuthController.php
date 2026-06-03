<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * User registration API
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'email' => 'required|string|email|max:191|unique:users',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        $userId = 'u_user_' . Str::random(7);
        
        $user = User::create([
            'id' => $userId,
            'name' => $request->name,
            'email' => strtolower($request->email),
            'password' => Hash::make($request->password),
            'phone' => '',
            'profilePhoto' => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            'currency' => 'BDT',
            'languagePreference' => 'en',
            'themePreference' => 'light',
            'timezone' => 'Asia/Dhaka',
            'isAdmin' => false,
        ]);

        // Auto seed default Accounts for the new user so they are immediately live (matches Node.js backend)
        Account::create([
            'id' => 'acc_' . Str::random(7),
            'userId' => $user->id,
            'name' => 'Cash Wallet',
            'type' => 'cash',
            'balance' => 5000,
            'currency' => 'BDT',
            'color' => '#10B981'
        ]);

        Account::create([
            'id' => 'acc_' . Str::random(7),
            'userId' => $user->id,
            'name' => 'Bank Account',
            'type' => 'bank',
            'balance' => 25000,
            'currency' => 'BDT',
            'color' => '#3B82F6'
        ]);

        $token = $user->createToken('spendwise_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user
        ], 200);
    }

    /**
     * User login API
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Please enter both your email and password.'], 400);
        }

        $user = User::where('email', strtolower($request->email))->first();

        // Compatibility fallback: if password is stored in cleartext (e.g. from original demo seed),
        // or properly hashed.
        if (!$user || (!Hash::check($request->password, $user->password) && $request->password !== $user->password)) {
            return response()->json(['error' => 'Incorrect email combination or password credentials.'], 401);
        }

        $token = $user->createToken('spendwise_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user
        ], 200);
    }

    /**
     * Get authenticated user profile
     */
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()
        ]);
    }

    /**
     * Get profile (alternative route mapping)
     */
    public function profile(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Update user preferences / profile info
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'currency' => 'nullable|string|max:10',
            'languagePreference' => 'nullable|string|in:en,bn',
            'themePreference' => 'nullable|string|in:light,dark,system',
            'timezone' => 'nullable|string',
            'profilePhoto' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        $user->update($request->only([
            'name', 'phone', 'currency', 'languagePreference', 'themePreference', 'timezone', 'profilePhoto'
        ]));

        return response()->json([
            'user' => $user->fresh()
        ], 200);
    }

    /**
     * Update password
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'oldPassword' => 'required|string',
            'newPassword' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        if (!Hash::check($request->oldPassword, $user->password) && $request->oldPassword !== $user->password) {
            return response()->json(['error' => 'Incorrect old password.'], 400);
        }

        $user->password = Hash::make($request->newPassword);
        $user->save();

        return response()->json(['success' => true], 200);
    }

    /**
     * User logout API
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['success' => true], 200);
    }
}
