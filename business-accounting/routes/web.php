<?php

use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\OperationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\CategoryController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('sales', SaleController::class);

    Route::resource('customers', CustomerController::class)
        ->except(['show']);

    Route::resource('expenses', ExpenseController::class)
        ->except(['show']);

    Route::get('/sales/{sale}/payments/create', [PaymentController::class, 'create'])
        ->name('payments.create');

    Route::post('/sales/{sale}/payments', [PaymentController::class, 'store'])
        ->name('payments.store');

    Route::delete('/payments/{payment}', [PaymentController::class, 'destroy'])
        ->name('payments.destroy');

    Route::resource('operations', OperationController::class);

    Route::resource('categories', CategoryController::class)
        ->except(['show']);
});

require __DIR__.'/settings.php';
