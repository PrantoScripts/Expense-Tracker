<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => 'SpendWise Laravel API Service',
        'status' => 'online',
        'version' => '1.0.0',
        'author' => 'Abu Sayeed Pranto',
        'timestamp' => now()->toISOString()
    ]);
});
