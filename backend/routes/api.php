<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CharityController;
use App\Http\Controllers\DrawController;
use App\Http\Controllers\ScoreController;
use App\Http\Controllers\SubscriptionController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WinnerController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/charities', [CharityController::class, 'index']);
Route::get('/charities/{charity}', [CharityController::class, 'show']);

Route::get('/draws', [DrawController::class, 'index']);
Route::get('/draws/current', [DrawController::class, 'current']);
Route::get('/prize-pool', [SubscriptionController::class, 'getPrizePool']);
Route::get('/draw-settings', [DrawController::class, 'getSettings']);
Route::get('/winners', [DrawController::class, 'winners']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Scores
    Route::get('/scores', [ScoreController::class, 'index']);
    Route::post('/scores', [ScoreController::class, 'store']);
    Route::put('/scores/{score}', [ScoreController::class, 'update']);
    Route::delete('/scores/{score}', [ScoreController::class, 'destroy']);

    // Subscriptions
    Route::post('/subscribe', [SubscriptionController::class, 'subscribe']);
    Route::get('/subscription/status', [SubscriptionController::class, 'status']);

    // Charities
    Route::post('/user/charity', [CharityController::class, 'select']);
    // Winnwer
    Route::post('/winners/{winner}/upload-proof', [WinnerController::class, 'uploadProof']);

    // Admin Routes
    Route::middleware(\App\Http\Middleware\AdminMiddleware::class)->prefix('admin')->group(function () {
        Route::get('/users', [AdminController::class, 'users']);
        Route::put('/users/{user}', [AdminController::class, 'updateUser']);

        Route::get('/draws', [AdminController::class, 'draws']);
        Route::post('/draws', [AdminController::class, 'createDraw']);
        Route::post('/draws/{draw}/simulate', [AdminController::class, 'simulateDraw']);
        Route::post('/draws/{draw}/publish', [AdminController::class, 'publishDraw']);

        Route::get('/winners', [AdminController::class, 'winners']);
        Route::put('/winners/{winner}/verify', [AdminController::class, 'verifyWinner']);
        Route::put('/winners/{winner}/payout', [AdminController::class, 'payoutWinner']);

        Route::get('/analytics', [AdminController::class, 'analytics']);

        Route::get('/charities', [AdminController::class, 'charities']);
        Route::post('/charities', [AdminController::class, 'createCharity']);
        Route::put('/charities/{charity}', [AdminController::class, 'updateCharity']);
        Route::delete('/charities/{charity}', [AdminController::class, 'destroyCharity']);

        Route::put('/draw-settings', [AdminController::class, 'updateSettings']);

        Route::get('/admin/winners', [WinnerController::class, 'index']);

        Route::patch(
            '/admin/winners/{winner}/verify',
            [WinnerController::class, 'verify']
        );

        Route::patch(
            '/admin/winners/{winner}/reject',
            [WinnerController::class, 'reject']
        );

        Route::patch(
            '/admin/winners/{winner}/mark-paid',
            [WinnerController::class, 'markPaid']
        );
    });
});
