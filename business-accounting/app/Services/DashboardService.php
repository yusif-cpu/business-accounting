<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Expense;
use App\Models\Payment;
use App\Models\Sale;
use Carbon\CarbonImmutable;

class DashboardService
{
    public function getDashboardData(int $businessId): array
    {
        $totalSales = Sale::where('business_id', $businessId)
            ->where('status', '!=', 'cancelled')
            ->sum('amount');

        $collected = Payment::whereHas('sale', function ($query) use ($businessId) {
            $query
                ->where('business_id', $businessId)
                ->where('status', '!=', 'cancelled');
        })->sum('amount');

        $expenses = Expense::where('business_id', $businessId)
            ->sum('amount');

        $salesCount = Sale::where('business_id', $businessId)
            ->where('status', '!=', 'cancelled')
            ->count();

        $customersCount = Customer::where('business_id', $businessId)
            ->count();

        return [
            'totalSales' => (float) $totalSales,
            'collected' => (float) $collected,
            'outstanding' => (float) $totalSales - (float) $collected,
            'expenses' => (float) $expenses,

            // Profit is based on total sales, not only collected payments.
            'profit' => (float) $totalSales - (float) $expenses,

            'salesCount' => $salesCount,
            'customersCount' => $customersCount,
            'monthlyOverview' => $this->getMonthlyOverview($businessId),
            'recentSales' => $this->getRecentSales($businessId),
            'recentExpenses' => $this->getRecentExpenses($businessId),
        ];
    }

    private function getMonthlyOverview(int $businessId): array
    {
        $months = [];

        $currentMonth = CarbonImmutable::now()->startOfMonth();

        for ($index = 5; $index >= 0; $index--) {
            $month = $currentMonth->subMonths($index);

            $sales = Sale::where('business_id', $businessId)
                ->where('status', '!=', 'cancelled')
                ->whereBetween('sold_at', [
                    $month->startOfMonth(),
                    $month->endOfMonth(),
                ])
                ->sum('amount');

            $expenses = Expense::where('business_id', $businessId)
                ->whereBetween('expense_date', [
                    $month->startOfMonth()->toDateString(),
                    $month->endOfMonth()->toDateString(),
                ])
                ->sum('amount');

            $months[] = [
                'label' => $month->format('M'),
                'sales' => (float) $sales,
                'expenses' => (float) $expenses,
            ];
        }

        return $months;
    }

    private function getRecentSales(int $businessId)
    {
        return Sale::with('customer')
            ->where('business_id', $businessId)
            ->where('status', '!=', 'cancelled')
            ->latest('sold_at')
            ->limit(5)
            ->get();
    }

    private function getRecentExpenses(int $businessId)
    {
        return Expense::where('business_id', $businessId)
            ->latest('expense_date')
            ->limit(5)
            ->get();
    }
}
