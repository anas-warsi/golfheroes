<?php

namespace App\Http\Controllers;

use App\Models\Charity;
use App\Models\CharityContribution;
use App\Models\Draw;
use App\Models\User;
use App\Models\Winner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function users(): JsonResponse
    {
        $users = User::with('charity')->paginate(20);
        return response()->json($users);
    }

    public function updateUser(Request $request, User $user): JsonResponse
    {
        // 1. Prevent self-demotion
        if ($request->has('role') && $request->role !== 'admin' && $user->id === auth()->id()) {
            return response()->json([
                'message' => 'You cannot remove your own admin access. Please ask another administrator to modify your role.'
            ], 403);
        }

        // 2. Prevent removing the last active administrator
        if ($request->has('role') && $request->role !== 'admin' && $user->role === 'admin') {
            $adminCount = User::where('role', 'admin')->count();
            if ($adminCount <= 1) {
                return response()->json([
                    'message' => 'Cannot remove the last administrator. The system requires at least one active admin.'
                ], 403);
            }
        }

        $user->update($request->all());
        return response()->json(['message' => 'User updated successfully', 'user' => $user]);
    }

    public function draws(): JsonResponse
    {
        $draws = Draw::orderBy('created_at', 'desc')->get();
        return response()->json($draws);
    }

    public function createDraw(Request $request): JsonResponse
    {
        $draw = Draw::create($request->all());
        return response()->json(['message' => 'Draw created', 'draw' => $draw], 201);
    }

    public function simulateDraw(Request $request, Draw $draw): JsonResponse
    {
        // 1. Generate 5 random golf scores (between 30 and 48 Stableford points)
        $winningNumbers = [];
        for ($i = 0; $i < 5; $i++) {
            $winningNumbers[] = rand(30, 48);
        }
        
        $draw->update([
            'numbers' => $winningNumbers,
            'status' => 'pending' // pending until officially published
        ]);

        // Clean previous winners for this draw if any
        Winner::where('draw_id', $draw->id)->delete();

        // 2. Fetch the prize pool details to assign accurate prize amounts
        $prizePool = \App\Models\PrizePool::find(1);
        $jackpot = $prizePool ? $prizePool->jackpot_pool : 0.00;
        $fourMatch = $prizePool ? $prizePool->four_match_pool : 0.00;
        $threeMatch = $prizePool ? $prizePool->three_match_pool : 0.00;

        // 3. Select 1 to 3 random users to simulate as winners
        $users = User::inRandomOrder()->take(rand(1, 3))->get();
        $matchTypes = ['5-Number Match', '4-Number Match', '3-Number Match'];
        $prizes = [$jackpot, $fourMatch, $threeMatch];

        foreach ($users as $index => $user) {
            $matchType = $matchTypes[$index % 3];
            $prizeAmount = $prizes[$index % 3];
            
            // In case the pool is empty, assign a default fun prize
            if ($prizeAmount <= 0) {
                $prizeAmount = ($index % 3 == 0) ? 25000.00 : (($index % 3 == 1) ? 15000.00 : 5000.00);
            }

            Winner::create([
                'draw_id' => $draw->id,
                'user_id' => $user->id,
                'prize_amount' => $prizeAmount,
                'match_type' => $matchType,
                'verification_status' => 'pending',
                'payout_status' => 'pending',
            ]);
        }

        return response()->json([
            'message' => 'Draw simulated successfully with simulated winners!',
            'draw' => $draw,
            'winners' => Winner::with('user')->where('draw_id', $draw->id)->get()
        ]);
    }

    public function publishDraw(Request $request, Draw $draw): JsonResponse
    {
        $prizePool = \App\Models\PrizePool::find(1);
        $totalPool = $prizePool ? $prizePool->total_pool : 0.00;

        // Mark the draw status as published and record the total prize pool
        $draw->update([
            'status' => 'published',
            'jackpot_amount' => $totalPool
        ]);

        // Reset the prize pool to ₹0 upon successful publication!
        if ($prizePool) {
            $prizePool->update([
                'total_pool' => 0.00,
                'jackpot_pool' => 0.00,
                'four_match_pool' => 0.00,
                'three_match_pool' => 0.00,
            ]);
        }

        return response()->json([
            'message' => 'Draw results published successfully and prize pool reset!',
            'draw' => $draw
        ]);
    }

    public function winners(): JsonResponse
    {
        $winners = Winner::with(['user', 'draw'])->get();
        return response()->json($winners);
    }

    public function verifyWinner(Request $request, Winner $winner): JsonResponse
    {
        $winner->update(['verification_status' => $request->status]);
        return response()->json(['message' => 'Winner verified', 'winner' => $winner]);
    }

    public function payoutWinner(Request $request, Winner $winner): JsonResponse
    {
        $winner->update(['payout_status' => $request->status]);
        return response()->json(['message' => 'Winner payout updated', 'winner' => $winner]);
    }

    public function analytics(): JsonResponse
    {
        $prizePool = \App\Models\PrizePool::find(1);
        $totalPool = $prizePool ? $prizePool->total_pool : 0.00;

        return response()->json([
            'total_users' => User::count(),
            'active_subscribers' => User::where('subscription_status', 'active')->count(),
            'total_prize_pool' => $totalPool,
            'total_charity_contributions' => CharityContribution::sum('amount'),
            'draws_this_month' => Draw::whereMonth('created_at', now()->month)->count(),
        ]);
    }

    public function charities(): JsonResponse
    {
        return response()->json(Charity::all());
    }

    public function createCharity(Request $request): JsonResponse
    {
        $charity = Charity::create($request->all());
        return response()->json(['message' => 'Charity created', 'charity' => $charity], 201);
    }

    public function updateCharity(Request $request, Charity $charity): JsonResponse
    {
        $charity->update($request->all());
        return response()->json(['message' => 'Charity updated', 'charity' => $charity]);
    }

    public function destroyCharity(Charity $charity): JsonResponse
    {
        $charity->delete();
        return response()->json(['message' => 'Charity deleted']);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $request->validate([
            'next_draw_date' => 'required',
        ]);

        // Validate that it's a valid date and not in the past
        $date = \Carbon\Carbon::parse($request->next_draw_date);
        if ($date->isPast()) {
            return response()->json([
                'message' => 'The next draw date must be a future date and time.'
            ], 422);
        }

        $settings = \App\Models\DrawSetting::find(1);
        if (!$settings) {
            $settings = \App\Models\DrawSetting::create([
                'id' => 1,
                'next_draw_date' => $date,
            ]);
        } else {
            $settings->update([
                'next_draw_date' => $date,
            ]);
        }

        return response()->json([
            'message' => 'Draw countdown settings updated successfully!',
            'settings' => $settings
        ]);
    }
}
