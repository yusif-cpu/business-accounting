<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Expense;
use App\Models\Operation;
use App\Models\Payment;
use App\Models\Sale;
use Carbon\CarbonImmutable;

class DashboardService
{
    public function getDashboardData(
        int $businessId,
        ?string $startDate = null,
        ?string $endDate = null
    ): array {
        /*
        |--------------------------------------------------------------------------
        | Sales
        |--------------------------------------------------------------------------
        */

        $salesQuery = Sale::where(
            'business_id',
            $businessId
        )
            ->whereHas(
                'status',
                function ($query) {
                    $query->where(
                        'slug',
                        '!=',
                        'cancelled'
                    );
                }
            );

        /*
        |--------------------------------------------------------------------------
        | Income
        |--------------------------------------------------------------------------
        */

        $incomeQuery = Operation::where(
            'business_id',
            $businessId
        )
            ->where(
                'type',
                'income'
            );

        /*
        |--------------------------------------------------------------------------
        | Expenses
        |--------------------------------------------------------------------------
        */

        $expensesQuery = Expense::where(
            'business_id',
            $businessId
        );

        /*
        |--------------------------------------------------------------------------
        | Date Filters
        |--------------------------------------------------------------------------
        */

        $this->applyDateFilter(
            $salesQuery,
            'sold_at',
            $startDate,
            $endDate
        );

        $this->applyDateFilter(
            $incomeQuery,
            'operation_date',
            $startDate,
            $endDate
        );

        $this->applyDateFilter(
            $expensesQuery,
            'expense_date',
            $startDate,
            $endDate
        );

        /*
        |--------------------------------------------------------------------------
        | Summary
        |--------------------------------------------------------------------------
        */

        $totalSales = (float) (
            clone $salesQuery
        )->sum('amount');

        $totalIncome = (float) (
            clone $incomeQuery
        )->sum('amount');

        $salesIds = (
            clone $salesQuery
        )->pluck('id');

        $collected = (float) Payment::whereIn(
            'sale_id',
            $salesIds
        )->sum('amount');

        $expenses = (float) (
            clone $expensesQuery
        )->sum('amount');

        $salesCount = (
            clone $salesQuery
        )->count();

        $incomeCount = (
            clone $incomeQuery
        )->count();

        $customersCount = Customer::where(
            'business_id',
            $businessId
        )->count();

        $outstanding = max(
            0,
            $totalSales - $collected
        );

        /*
        |--------------------------------------------------------------------------
        | Net Balance
        |--------------------------------------------------------------------------
        |
        | Collected sales
        | + Other income
        | - Expenses
        |
        */

        $netBalance =
            $collected +
            $totalIncome -
            $expenses;

        /*
        |--------------------------------------------------------------------------
        | Return Dashboard Data
        |--------------------------------------------------------------------------
        */

        return [
            'totalSales' =>
                $totalSales,

            'totalIncome' =>
                $totalIncome,

            'collected' =>
                $collected,

            'outstanding' =>
                $outstanding,

            'expenses' =>
                $expenses,

            'netBalance' =>
                $netBalance,

            'profit' =>
                $netBalance,

            'salesCount' =>
                $salesCount,

            'incomeCount' =>
                $incomeCount,

            'customersCount' =>
                $customersCount,

            'monthlyOverview' =>
                $this->getMonthlyOverview(
                    $businessId,
                    $startDate,
                    $endDate
                ),

            'recentSales' =>
                $this->getRecentSales(
                    $businessId,
                    $startDate,
                    $endDate
                ),

            'recentIncome' =>
                $this->getRecentIncome(
                    $businessId,
                    $startDate,
                    $endDate
                ),

            'recentExpenses' =>
                $this->getRecentExpenses(
                    $businessId,
                    $startDate,
                    $endDate
                ),
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Date Filter
    |--------------------------------------------------------------------------
    */

    private function applyDateFilter(
        $query,
        string $column,
        ?string $startDate,
        ?string $endDate
    ): void {
        if ($startDate) {
            $query->whereDate(
                $column,
                '>=',
                $startDate
            );
        }

        if ($endDate) {
            $query->whereDate(
                $column,
                '<=',
                $endDate
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Monthly Overview
    |--------------------------------------------------------------------------
    */

    private function getMonthlyOverview(
        int $businessId,
        ?string $startDate = null,
        ?string $endDate = null
    ): array {
        $months = [];

        $currentMonth =
            CarbonImmutable::now()
                ->startOfMonth();

        for (
            $index = 5;
            $index >= 0;
            $index--
        ) {
            $month =
                $currentMonth->subMonths(
                    $index
                );

            /*
            |--------------------------------------------------------------------------
            | Sales
            |--------------------------------------------------------------------------
            */

            $salesQuery = Sale::where(
                'business_id',
                $businessId
            )
                ->whereHas(
                    'status',
                    function ($query) {
                        $query->where(
                            'slug',
                            '!=',
                            'cancelled'
                        );
                    }
                )
                ->whereBetween(
                    'sold_at',
                    [
                        $month->startOfMonth(),
                        $month->endOfMonth(),
                    ]
                );

            /*
            |--------------------------------------------------------------------------
            | Income
            |--------------------------------------------------------------------------
            */

            $incomeQuery = Operation::where(
                'business_id',
                $businessId
            )
                ->where(
                    'type',
                    'income'
                )
                ->whereBetween(
                    'operation_date',
                    [
                        $month
                            ->startOfMonth()
                            ->toDateString(),

                        $month
                            ->endOfMonth()
                            ->toDateString(),
                    ]
                );

            /*
            |--------------------------------------------------------------------------
            | Expenses
            |--------------------------------------------------------------------------
            */

            $expensesQuery = Expense::where(
                'business_id',
                $businessId
            )
                ->whereBetween(
                    'expense_date',
                    [
                        $month
                            ->startOfMonth()
                            ->toDateString(),

                        $month
                            ->endOfMonth()
                            ->toDateString(),
                    ]
                );

            /*
            |--------------------------------------------------------------------------
            | Selected Date Range
            |--------------------------------------------------------------------------
            */

            $this->applyDateFilter(
                $salesQuery,
                'sold_at',
                $startDate,
                $endDate
            );

            $this->applyDateFilter(
                $incomeQuery,
                'operation_date',
                $startDate,
                $endDate
            );

            $this->applyDateFilter(
                $expensesQuery,
                'expense_date',
                $startDate,
                $endDate
            );

            /*
            |--------------------------------------------------------------------------
            | Totals
            |--------------------------------------------------------------------------
            */

            $sales =
                (float) $salesQuery->sum(
                    'amount'
                );

            $income =
                (float) $incomeQuery->sum(
                    'amount'
                );

            $expenses =
                (float) $expensesQuery->sum(
                    'amount'
                );

            $months[] = [
                'label' =>
                    $month->format('M'),

                'sales' =>
                    $sales,

                'income' =>
                    $income,

                'expenses' =>
                    $expenses,

                'net' =>
                    $sales +
                    $income -
                    $expenses,
            ];
        }

        return $months;
    }

    /*
    |--------------------------------------------------------------------------
    | Recent Sales
    |--------------------------------------------------------------------------
    */

    private function getRecentSales(
        int $businessId,
        ?string $startDate = null,
        ?string $endDate = null
    ) {
        $query = Sale::with([
            'customer',
            'status',
        ])
            ->where(
                'business_id',
                $businessId
            )
            ->whereHas(
                'status',
                function ($query) {
                    $query->where(
                        'slug',
                        '!=',
                        'cancelled'
                    );
                }
            );

        $this->applyDateFilter(
            $query,
            'sold_at',
            $startDate,
            $endDate
        );

        return $query
            ->latest('sold_at')
            ->limit(5)
            ->get();
    }

    /*
    |--------------------------------------------------------------------------
    | Recent Income
    |--------------------------------------------------------------------------
    */

    private function getRecentIncome(
        int $businessId,
        ?string $startDate = null,
        ?string $endDate = null
    ) {
        $query = Operation::with([
            'customer',
            'category',
        ])
            ->where(
                'business_id',
                $businessId
            )
            ->where(
                'type',
                'income'
            );

        $this->applyDateFilter(
            $query,
            'operation_date',
            $startDate,
            $endDate
        );

        return $query
            ->latest('operation_date')
            ->limit(5)
            ->get();
    }

    /*
    |--------------------------------------------------------------------------
    | Recent Expenses
    |--------------------------------------------------------------------------
    */

    private function getRecentExpenses(
        int $businessId,
        ?string $startDate = null,
        ?string $endDate = null
    ) {
        $query = Expense::where(
            'business_id',
            $businessId
        );

        $this->applyDateFilter(
            $query,
            'expense_date',
            $startDate,
            $endDate
        );

        return $query
            ->latest('expense_date')
            ->limit(5)
            ->get();
    }
}