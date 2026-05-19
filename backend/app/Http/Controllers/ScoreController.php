<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreScoreRequest;
use App\Http\Requests\UpdateScoreRequest;
use App\Models\Score;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScoreController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $scores = $request->user()->scores;
        return response()->json($scores);
    }

    public function store(StoreScoreRequest $request): JsonResponse
    {
        $user = $request->user();

        // Ensure max 5 logic
        if ($user->scores()->count() >= 5) {
            $user->scores()->oldest('date')->first()->delete();
        }

        $score = $user->scores()->create($request->validated());

        return response()->json([
            'message' => 'Score created successfully',
            'score' => $score
        ], 201);
    }

    public function update(UpdateScoreRequest $request, Score $score): JsonResponse
    {
        if ($request->user()->id !== $score->user_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $score->update($request->validated());

        return response()->json([
            'message' => 'Score updated successfully',
            'score' => $score
        ]);
    }

    public function destroy(Request $request, Score $score): JsonResponse
    {
        if ($request->user()->id !== $score->user_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $score->delete();

        return response()->json(['message' => 'Score deleted successfully']);
    }
}
