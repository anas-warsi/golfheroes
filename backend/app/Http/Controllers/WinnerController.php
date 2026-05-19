<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Winner;

class WinnerController extends Controller
{
    public function uploadProof(Request $request, Winner $winner)
    {
        try {

            $request->validate([
                'proof' => 'required|image|max:4096'
            ]);

            $path = $request->file('proof')->store(
                'winner-proofs',
                'public'
            );

            $winner->update([
                'proof_image' => $path,
                'verification_status' => 'pending'
            ]);

            return response()->json([
                'message' => 'Proof uploaded successfully',
                'path' => $path
            ]);

        } catch (\Exception $e) {

            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function index()
    {
        return Winner::with('user')
            ->latest()
            ->get();
    }

    public function verify(Winner $winner)
    {
        $winner->update([
            'verification_status' => 'approved'
        ]);

        return response()->json([
            'message' => 'Winner approved'
        ]);
    }

    public function reject(Winner $winner)
    {
        $winner->update([
            'verification_status' => 'rejected'
        ]);

        return response()->json([
            'message' => 'Winner rejected'
        ]);
    }

    public function markPaid(Winner $winner)
    {
        $winner->update([
            'payout_status' => 'paid'
        ]);

        return response()->json([
            'message' => 'Payout marked as paid'
        ]);
    }
}