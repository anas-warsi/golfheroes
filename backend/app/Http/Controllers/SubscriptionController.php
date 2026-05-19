<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\Subscription;
use App\Models\PrizePool;

class SubscriptionController extends Controller
{
    public function subscribe(Request $request): JsonResponse
    {
        $request->validate([
            'plan' => 'required|in:monthly,yearly',
        ]);

        $user = $request->user();
        $user->subscription_status = 'active';
        $user->subscription_plan = $request->plan;
        
        $amount = 499.00;
        if ($request->plan === 'monthly') {
            $user->subscription_renewal_date = Carbon::now()->addMonth();
            $amount = 499.00;
        } else {
            $user->subscription_renewal_date = Carbon::now()->addYear();
            $amount = 4999.00;
        }

        $charityAmount = 0.00;
        $prizePoolAmount = $amount;

        // Step 8 Debug Logs
        \Log::info("SUBSCRIBE ATTEMPT: User ID=" . $user->id . ", Name=" . $user->name);
        \Log::info("USER CHARITY DATA: charity_id=" . ($user->charity_id ?: 'NULL') . ", charity_percentage=" . ($user->charity_percentage ?: 'NULL'));
        \Log::info("PLAN CHOSEN: plan=" . $request->plan . ", total_amount=" . $amount);

        if ($user->charity_id) {
            $percentage = $user->charity_percentage ?: 10;
            $charityAmount = $amount * ($percentage / 100);
            $prizePoolAmount = $amount - $charityAmount;
            \Log::info("CALCULATED SPLITS: charityAmount=" . $charityAmount . ", prizePoolAmount=" . $prizePoolAmount);
        } else {
            \Log::info("CALCULATED SPLITS: No charity selected. charityAmount=0, prizePoolAmount=" . $prizePoolAmount);
        }

        $user->save();

        // 1. Create subscription record
        $subscription = Subscription::create([
            'user_id' => $user->id,
            'amount' => $amount,
            'status' => 'active',
        ]);
        \Log::info("SUBSCRIPTION CREATED: id=" . $subscription->id . ", amount=" . $subscription->amount);

        // 1b. Create charity contribution log row if charity is selected
        if ($user->charity_id && $charityAmount > 0) {
            $contribution = \App\Models\CharityContribution::create([
                'user_id' => $user->id,
                'charity_id' => $user->charity_id,
                'subscription_id' => $subscription->id,
                'amount' => $charityAmount
            ]);
            \Log::info("CHARITY CONTRIBUTION ROW INSERTED: id=" . $contribution->id . ", charity_id=" . $contribution->charity_id . ", amount=" . $contribution->amount);
        } else {
            \Log::info("SKIPPED CHARITY CONTRIBUTION INSERTION: charity_id=" . ($user->charity_id ?: 'NULL') . ", charityAmount=" . $charityAmount);
        }

        // 2. Load or create the single prize pool row (id = 1)
        $prizePool = PrizePool::find(1);
        if (!$prizePool) {
            $prizePool = PrizePool::create([
                'id' => 1,
                'total_pool' => 0.00,
                'jackpot_pool' => 0.00,
                'four_match_pool' => 0.00,
                'three_match_pool' => 0.00,
            ]);
        }

        // 3. Dynamically increment total and recalculate all percentages (excluding charity split)
        $newTotal = $prizePool->total_pool + $prizePoolAmount;
        $prizePool->update([
            'total_pool' => $newTotal,
            'jackpot_pool' => $newTotal * 0.40,
            'four_match_pool' => $newTotal * 0.35,
            'three_match_pool' => $newTotal * 0.25,
        ]);

        return response()->json([
            'message' => 'Subscribed successfully',
            'user' => $user->load('charity'),
            'prize_pool' => $prizePool
        ]);
    }

    public function status(Request $request): JsonResponse
    {
        $user = $request->user();
        return response()->json([
            'status' => $user->subscription_status,
            'plan' => $user->subscription_plan,
            'renewal_date' => $user->subscription_renewal_date
        ]);
    }

    public function getPrizePool(): JsonResponse
    {
        $prizePool = PrizePool::find(1);
        if (!$prizePool) {
            $prizePool = PrizePool::create([
                'id' => 1,
                'total_pool' => 0.00,
                'jackpot_pool' => 0.00,
                'four_match_pool' => 0.00,
                'three_match_pool' => 0.00,
            ]);
        }
        return response()->json($prizePool);
    }
}

