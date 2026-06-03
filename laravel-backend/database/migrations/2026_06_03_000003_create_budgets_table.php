<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('budgets', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('userId');
            $table->string('category')->default('all');
            $table->decimal('amount', 15, 2);
            $table->enum('type', ['monthly', 'category']);
            $table->string('month'); // Format 'YYYY-MM'
            $table->integer('alertThreshold')->default(80);
            $table->timestamps();

            $table->foreign('userId')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};
