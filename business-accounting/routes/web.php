<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\IncomeController;
use App\Http\Controllers\OperationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\SaleStatusController;
use Illuminate\Support\Facades\Route;

Route::inertia(
    '/',
    'welcome'
)->name('home');

Route::middleware([
    'auth',
    'verified',
])->group(function () {
    Route::inertia(
        'dashboard',
        'dashboard'
    )->name('dashboard');
});

Route::middleware('auth')->group(function () {

    Route::get(
        '/dashboard',
        [
            DashboardController::class,
            'index',
        ]
    )->name('dashboard');

    /*
    |--------------------------------------------------------------------------
    | Sales
    |--------------------------------------------------------------------------
    */

    Route::resource(
        'sales',
        SaleController::class
    );

    Route::resource(
        'sale-statuses',
        SaleStatusController::class
    )->except([
        'show',
    ]);

    Route::post(
    '/sale-statuses/inline',
    [
        SaleStatusController::class,
        'inlineStore',
    ]
    )->name(
        'sale-statuses.inline-store'
    );

    /*
    |--------------------------------------------------------------------------
    | Customers
    |--------------------------------------------------------------------------
    */

    Route::resource(
        'customers',
        CustomerController::class
    );

    /*
    |--------------------------------------------------------------------------
    | Income
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/income',
        [
            IncomeController::class,
            'index',
        ]
    )->name('income.index');

    Route::get(
        '/income/create',
        [
            IncomeController::class,
            'create',
        ]
    )->name('income.create');

    Route::post(
        '/income',
        [
            IncomeController::class,
            'store',
        ]
    )->name('income.store');

    Route::get(
        '/income/{id}',
        [
            IncomeController::class,
            'show',
        ]
    )->name('income.show');

    Route::get(
        '/income/{id}/edit',
        [
            IncomeController::class,
            'edit',
        ]
    )->name('income.edit');

    Route::put(
        '/income/{id}',
        [
            IncomeController::class,
            'update',
        ]
    )->name('income.update');

    Route::delete(
        '/income/{id}',
        [
            IncomeController::class,
            'destroy',
        ]
    )->name('income.destroy');

    /*
    |--------------------------------------------------------------------------
    | Expenses
    |--------------------------------------------------------------------------
    */

    Route::resource(
        'expenses',
        ExpenseController::class
    )->except([
        'show',
    ]);

    /*
    |--------------------------------------------------------------------------
    | Payments
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/sales/{sale}/payments/create',
        [
            PaymentController::class,
            'create',
        ]
    )->name('payments.create');

    Route::post(
        '/sales/{sale}/payments',
        [
            PaymentController::class,
            'store',
        ]
    )->name('payments.store');

    Route::delete(
        '/payments/{payment}',
        [
            PaymentController::class,
            'destroy',
        ]
    )->name('payments.destroy');

    /*
    |--------------------------------------------------------------------------
    | Operations
    |--------------------------------------------------------------------------
    */

    Route::resource(
        'operations',
        OperationController::class
    );

    /*
    |--------------------------------------------------------------------------
    | Inline Categories
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/categories/inline',
        [
            CategoryController::class,
            'storeInline',
        ]
    )->name('categories.inline');

    /*
    |--------------------------------------------------------------------------
    | Categories
    |--------------------------------------------------------------------------
    */

    Route::resource(
        'categories',
        CategoryController::class
    )->except([
        'show',
    ]);
});

require __DIR__.'/settings.php';