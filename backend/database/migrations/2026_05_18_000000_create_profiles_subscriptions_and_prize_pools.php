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
        // 1. Create profiles table
        if (!Schema::hasTable('profiles')) {
            Schema::create('profiles', function (Blueprint $table) {
                $table->unsignedBigInteger('id')->primary();
                $table->string('full_name');
                $table->string('email')->unique();
                $table->string('selected_charity')->nullable();
                $table->string('subscription_status')->default('inactive');
                $table->timestamps();
            });
        }

        // 2. Create subscriptions table
        if (!Schema::hasTable('subscriptions')) {
            Schema::create('subscriptions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->decimal('amount', 10, 2);
                $table->string('status')->default('active');
                $table->timestamps();
            });
        }

        // 3. Create prize_pool table
        if (!Schema::hasTable('prize_pool')) {
            Schema::create('prize_pool', function (Blueprint $table) {
                $table->id();
                $table->decimal('total_pool', 15, 2)->default(0.00);
                $table->decimal('jackpot_pool', 15, 2)->default(0.00);
                $table->decimal('four_match_pool', 15, 2)->default(0.00);
                $table->decimal('three_match_pool', 15, 2)->default(0.00);
                $table->timestamps();
            });
        }

        // Seed initial prize pool starting at ₹0 (per user's feedback)
        \DB::table('prize_pool')->updateOrInsert(
            ['id' => 1],
            [
                'total_pool' => 0.00,
                'jackpot_pool' => 0.00,
                'four_match_pool' => 0.00,
                'three_match_pool' => 0.00,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        // Sync existing users if any
        $users = \DB::table('users')->get();
        foreach ($users as $user) {
            $charityName = null;
            if ($user->charity_id) {
                $charityName = \DB::table('charities')->where('id', $user->charity_id)->value('name');
            }

            \DB::table('profiles')->updateOrInsert(
                ['id' => $user->id],
                [
                    'full_name' => $user->name,
                    'email' => $user->email,
                    'selected_charity' => $charityName,
                    'subscription_status' => $user->subscription_status,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profiles');
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('prize_pool');
    }
};
