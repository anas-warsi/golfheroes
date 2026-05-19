<?php

namespace App\Http\Controllers;

use App\Models\Draw;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DrawController extends Controller
{
    public function index(): JsonResponse
    {
        $draws = Draw::withCount('winners')->where('status', 'published')->orderBy('draw_date', 'desc')->get();
        return response()->json($draws);
    }

    public function current(): JsonResponse
    {
        $draw = Draw::where('status', 'pending')->orderBy('draw_date', 'asc')->first();
        return response()->json($draw);
    }

    public function getSettings(): JsonResponse
    {
        $settings = \App\Models\DrawSetting::find(1);
        if (!$settings) {
            $settings = \App\Models\DrawSetting::create([
                'id' => 1,
                'next_draw_date' => '2026-05-31 20:00:00',
            ]);
        }
        return response()->json($settings);
    }

    public function winners(): JsonResponse
    {
        $winners = \App\Models\Winner::with(['user', 'draw'])->latest()->get();
        return response()->json($winners);
    }
}
