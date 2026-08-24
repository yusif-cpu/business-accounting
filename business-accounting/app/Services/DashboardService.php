<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Expense;
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
        $salesQuery = Sale::where(
            'business_id',
            $businessId
        )->whereHas(
            'status',
            function ($query) {
                $query->where(
                    'slug',
                    '!=',
                    'cancelled'
                );
            }
        );

        $expensesQuery = Expense::where(
            'business_id',
            $businessId
        );

        if ($startDate) {
            $salesQuery->whereDate(
                'sold_at',
                '>=',
                $startDate
            );

            $expensesQuery->whereDate(
                'expense_date',
                '>=',
                $startDate
            );
        }

        if ($endDate) {
            $salesQuery->whereDate(
                'sold_at',
                '<=',
                $endDate
            );

            $expensesQuery->whereDate(
                'expense_date',
                '<=',
                $endDate
            );
        }

        $totalSales = (clone $salesQuery)
            ->sum('amount');

        $salesIds = (clone $salesQuery)
            ->pluck('id');

        $collected = Payment::whereIn(
            'sale_id',
            $salesIds
        )->sum('amount');

        $expenses = (clone $expensesQuery)
            ->sum('amount');

        $salesCount = (clone $salesQuery)
            ->count();

        $customersCount = Customer::where(
            'business_id',
            $businessId
        )->count();

        return [
            'totalSales' =>
                (float) $totalSales,

            'collected' =>
                (float) $collected,

            'outstanding' =>
                (float) $totalSales -
                (float) $collected,

            'expenses' =>
                (float) $expenses,

            'profit' =>
                (float) $totalSales -
                (float) $expenses,

            'salesCount' =>
                $salesCount,

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

            'recentExpenses' =>
                $this->getRecentExpenses(
                    $businessId,
                    $startDate,
                    $endDate
                ),

            'periodSales' =>
                $this->getPeriodSales(
                    $businessId,
                    $startDate,
                    $endDate
                ),

            'periodExpenses' =>
                $this->getPeriodExpenses(
                    $businessId,
                    $startDate,
                    $endDate
                ),

            'dailyBreakdown' =>
                $this->getDailyBreakdown(
                    $businessId,
                    $startDate,
                    $endDate
                ),
        ];
    }

    private function getMonthlyOverview(
        int $businessId,
        ?string $startDate = null,
        ?string $endDate = null
    ): array {
        $months = [];

        $currentMonth =
            CarbonImmutable::now()->startOfMonth();

        for (
            $index = 5;
            $index >= 0;
            $index--
        ) {
            $month =
                $currentMonth->subMonths(
                    $index
                );

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
                ->whereBetween('sold_at', [
                    $month->startOfMonth(),
                    $month->endOfMonth(),
                ]);

            $expensesQuery = Expense::where(
                'business_id',
                $businessId
            )->whereBetween('expense_date', [
                $month
                    ->startOfMonth()
                    ->toDateString(),

                $month
                    ->endOfMonth()
                    ->toDateString(),
            ]);

            if ($startDate) {
                $salesQuery->whereDate(
                    'sold_at',
                    '>=',
                    $startDate
                );

                $expensesQuery->whereDate(
                    'expense_date',
                    '>=',
                    $startDate
                );
            }

            if ($endDate) {
                $salesQuery->whereDate(
                    'sold_at',
                    '<=',
                    $endDate
                );

                $expensesQuery->whereDate(
                    'expense_date',
                    '<=',
                    $endDate
                );
            }

            $sales =
                $salesQuery->sum('amount');

            $expenses =
                $expensesQuery->sum('amount');

            $months[] = [
                'label' =>
                    $month->format('M'),

                'sales' =>
                    (float) $sales,

                'expenses' =>
                    (float) $expenses,
            ];
        }

        return $months;
    }

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

        if ($startDate) {
            $query->whereDate(
                'sold_at',
                '>=',
                $startDate
            );
        }

        if ($endDate) {
            $query->whereDate(
                'sold_at',
                '<=',
                $endDate
            );
        }

        return $query
            ->latest('sold_at')
            ->limit(5)
            ->get();
    }

    private function getRecentExpenses(
        int $businessId,
        ?string $startDate = null,
        ?string $endDate = null
    ) {
        $query = Expense::where(
            'business_id',
            $businessId
        );

        if ($startDate) {
            $query->whereDate(
                'expense_date',
                '>=',
                $startDate
            );
        }

        if ($endDate) {
            $query->whereDate(
                'expense_date',
                '<=',
                $endDate
            );
        }

        return $query
            ->latest('expense_date')
            ->limit(5)
            ->get();
    }

    private function getPeriodSales(
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

        if ($startDate) {
            $query->whereDate(
                'sold_at',
                '>=',
                $startDate
            );
        }

        if ($endDate) {
            $query->whereDate(
                'sold_at',
                '<=',
                $endDate
            );
        }

        return $query
            ->orderBy('sold_at')
            ->get();
    }

    private function getPeriodExpenses(
        int $businessId,
        ?string $startDate = null,
        ?string $endDate = null
    ) {
        $query = Expense::where(
            'business_id',
            $businessId
        );

        if ($startDate) {
            $query->whereDate(
                'expense_date',
                '>=',
                $startDate
            );
        }

        if ($endDate) {
            $query->whereDate(
                'expense_date',
                '<=',
                $endDate
            );
        }

        return $query
            ->orderBy('expense_date')
            ->get();
    }

    private function getDailyBreakdown(
        int $businessId,
        ?string $startDate = null,
        ?string $endDate = null
    ): array {
        if (!$startDate && !$endDate) {
            return [];
        }

        $start = CarbonImmutable::parse(
            $startDate ?? $endDate
        )->startOfDay();

        $end = CarbonImmutable::parse(
            $endDate ?? $startDate
        )->endOfDay();

        $sales = Sale::where(
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
            ->whereBetween('sold_at', [
                $start,
                $end,
            ])
            ->get()
            ->groupBy(
                fn ($sale) =>
                    CarbonImmutable::parse(
                        $sale->sold_at
                    )->toDateString()
            );

        $expenses = Expense::where(
            'business_id',
            $businessId
        )
            ->whereBetween('expense_date', [
                $start->toDateString(),
                $end->toDateString(),
            ])
            ->get()
            ->groupBy(
                fn ($expense) =>
                    CarbonImmutable::parse(
                        $expense->expense_date
                    )->toDateString()
            );

        $days = [];

        for (
            $date = $start;
            $date->lte($end);
            $date = $date->addDay()
        ) {
            $dateKey =
                $date->toDateString();

            $dailySales =
                $sales
                    ->get($dateKey, collect())
                    ->sum('amount');

            $dailyExpenses =
                $expenses
                    ->get($dateKey, collect())
                    ->sum('amount');

            $days[] = [
                'date' =>
                    $dateKey,

                'sales' =>
                    (float) $dailySales,

                'expenses' =>
                    (float) $dailyExpenses,

                'net' =>
                    (float) $dailySales -
                    (float) $dailyExpenses,
            ];
        }

        return $days;
    }
}