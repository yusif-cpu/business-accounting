<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Expense;
use App\Models\Payment;
use App\Models\Sale;

class DashboardService
{
    public function getDashboardData(int $businessId): array
    {
        $totalSales = Sale::where('business_id', $businessId)
            ->where('status', '!=', 'cancelled')
            ->sum('amount');

        $collected = Payment::whereHas('sale', function ($query) use ($businessId) {
            $query->where('business_id', $businessId)
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
            'totalSales' => $totalSales,
            'collected' => $collected,
            'outstanding' => $totalSales - $collected,
            'expenses' => $expenses,
            'profit' => $collected - $expenses,
            'salesCount' => $salesCount,
            'customersCount' => $customersCount,
        ];
    }
}
