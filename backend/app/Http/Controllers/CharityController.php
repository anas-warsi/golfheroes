<?php

namespace App\Http\Controllers;

use App\Http\Requests\SelectCharityRequest;
use App\Models\Charity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CharityController extends Controller
{
    public function index(): JsonResponse
    {
        $charities = Charity::orderBy('is_featured', 'desc')->get();
        return response()->json($charities);
    }

    public function show(Charity $charity): JsonResponse
    {
        return response()->json($charity);
    }

    public function select(SelectCharityRequest $request): JsonResponse
    {
        $user = $request->user();
        
        $user->update([
            'charity_id' => $request->charity_id,
            'charity_percentage' => $request->charity_percentage,
        ]);

        return response()->json([
            'message' => 'Charity preferences updated',
            'user' => $user->load('charity')
        ]);
    }
}
