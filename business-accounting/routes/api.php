<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BusinessController;
use App\Http\Controllers\Api\V1\CustomerController;
use App\Http\Controllers\Api\V1\CustomerDocumentController;
use App\Http\Controllers\Api\V1\ExpenseController;
use App\Http\Controllers\Api\V1\IncomeController;
use App\Http\Controllers\Api\V1\IntegrationController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\SaleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/login',
        [AuthController::class, 'login']
    )->name('api.v1.login');

    Route::middleware('auth:sanctum')->group(function () {

        Route::post(
            '/logout',
            [AuthController::class, 'logout']
        )->name('api.v1.logout');

        Route::get(
            '/user',
            function (Request $request) {
                return response()->json([
                    'data' => $request->user(),
                ]);
            }
        )->name('api.v1.user');

        /*
        |--------------------------------------------------------------------------
        | Integration
        |--------------------------------------------------------------------------
        */

        Route::middleware(
            'abilities:integration:read'
        )->group(function () {

            Route::get(
                '/integration/ping',
                [
                    IntegrationController::class,
                    'ping',
                ]
            )->name('api.v1.integration.ping');

            /*
            |--------------------------------------------------------------------------
            | Business Information
            |--------------------------------------------------------------------------
            */

            Route::get(
                '/business',
                [
                    BusinessController::class,
                    'show',
                ]
            )->name('api.v1.business.show');

        });

        /*
        |--------------------------------------------------------------------------
        | Customer Sync
        |--------------------------------------------------------------------------
        */

        Route::middleware(
            'abilities:integration:write'
        )->group(function () {

            Route::post(
                '/customers',
                [
                    CustomerController::class,
                    'sync',
                ]
            )->name('api.v1.customers.sync');

            /*
            |--------------------------------------------------------------------------
            | Sales Sync
            |--------------------------------------------------------------------------
            */

            Route::post(
                '/sales',
                [
                    SaleController::class,
                    'sync',
                ]
            )->name('api.v1.sales.sync');

            /*
            |--------------------------------------------------------------------------
            | Payment Sync
            |--------------------------------------------------------------------------
            */

            Route::post(
                '/payments',
                [
                    PaymentController::class,
                    'sync',
                ]
            )->name('api.v1.payments.sync');

            /*
            |--------------------------------------------------------------------------
            | Expense Sync
            |--------------------------------------------------------------------------
            */

            Route::post(
                '/expenses',
                [
                    ExpenseController::class,
                    'sync',
                ]
            )->name('api.v1.expenses.sync');

            /*
            |--------------------------------------------------------------------------
            | Income Sync
            |--------------------------------------------------------------------------
            */

            Route::post(
                '/incomes',
                [
                    IncomeController::class,
                    'sync',
                ]
            )->name('api.v1.incomes.sync');

            /*
            |--------------------------------------------------------------------------
            | Customer Document Sync
            |--------------------------------------------------------------------------
            */

            Route::post(
                '/customer-documents',
                [
                    CustomerDocumentController::class,
                    'sync',
                ]
            )->name('api.v1.customer-documents.sync');

            /*
            |--------------------------------------------------------------------------
            | Business Information
            |--------------------------------------------------------------------------
            */

            Route::put(
                '/business',
                [
                    BusinessController::class,
                    'update',
                ]
            )->name('api.v1.business.update');

        });

    });

});