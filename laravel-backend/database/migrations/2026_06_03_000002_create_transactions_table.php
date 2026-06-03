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
        Schema::create('transactions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('userId');
            $table->string('accountId');
            $table->enum('type', ['income', 'expense']);
            $table->decimal('amount', 15, 2);
            $table->string('category');
            $table->date('date');
            $table->text('note')->nullable();
            
            // Attachment info
            $table->string('attachment_name')->nullable();
            $table->string('attachment_type')->nullable(); // 'png', 'jpg', 'pdf'
            $table->longText('attachment_dataUrl')->nullable(); // Base64 data if any
            
            $table->string('recurringId')->nullable();
            $table->timestamps();

            // Set cascade foreign key constraints
            $table->foreign('userId')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('accountId')->references('id')->on('accounts')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
