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
        Schema::create('accounts', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('userId');
            $table->string('name');
            $table->enum('type', ['cash', 'bank', 'mobile_banking', 'credit_card']);
            $table->decimal('balance', 15, 2)->default(0);
            $table->string('currency')->default('BDT');
            $table->string('color')->default('#4F46E5');
            $table->timestamps();

            // Set cascade foreign key constraints
            $table->foreign('userId')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
