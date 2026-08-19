<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SaleController;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

// new one
Route::middleware('auth')->group(function () {
    Route::resource('sales', SaleController::class);
});

require __DIR__.'/settings.php';
