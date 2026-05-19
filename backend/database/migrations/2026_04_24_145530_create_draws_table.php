<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('draws', function (Blueprint $table) {
            $table->id();
            $table->date('draw_date');
            $table->json('numbers')->nullable();
            $table->string('status')->default('pending'); // pending/published
            $table->decimal('jackpot_amount', 10, 2)->default(0);
            $table->boolean('jackpot_rollover')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('draws');
    }
};
