<?php

use App\Http\Controllers\Api\V1\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])
        ->name('api.v1.login');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout'])
            ->name('api.v1.logout');

        Route::get('/user', function (Request $request) {
            return response()->json([
                'data' => $request->user(),
            ]);
        })->name('api.v1.user');
    });
});