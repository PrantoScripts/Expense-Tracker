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
        Schema::create('system_notifications', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('userId');
            $table->string('type'); // 'budget_warning', 'budget_exceeded', 'goal_achieved', 'recurring_reminder', 'system'
            $table->text('titleEn');
            $table->text('titleBn');
            $table->text('messageEn');
            $table->text('messageBn');
            $table->boolean('read')->default(false);
            $table->timestamps();

            $table->foreign('userId')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_notifications');
    }
};
