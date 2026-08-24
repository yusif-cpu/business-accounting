<?php

namespace App\Services;

use App\Models\Sale;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class SaleService
{
    public function getSalesForCurrentBusiness(
        ?string $search = null,
        ?string $customerId = null,
        ?string $statusId = null,
        ?string $startDate = null,
        ?string $endDate = null
    ): LengthAwarePaginator {
        $query = Sale::with([
            'customer',
            'status',
        ])
            ->withSum(
                'payments',
                'amount'
            )
            ->where(
                'business_id',
                auth()->user()->business_id
            );

        if ($search) {
            $query->where(function ($query) use ($search) {
                $query
                    ->where(
                        'id',
                        'like',
                        "%{$search}%"
                    )
                    ->orWhereHas(
                        'customer',
                        function ($query) use ($search) {
                            $query->where(
                                'name',
                                'like',
                                "%{$search}%"
                            );
                        }
                    );
            });
        }

        if ($customerId) {
            $query->where(
                'customer_id',
                $customerId
            );
        }

        if ($statusId) {
            $query->where(
                'status_id',
                $statusId
            );
        }

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
            ->paginate(10)
            ->withQueryString();
    }

    public function getSalesSummary(
        ?string $search = null,
        ?string $customerId = null,
        ?string $statusId = null,
        ?string $startDate = null,
        ?string $endDate = null
    ): array {
        $query = Sale::where(
            'business_id',
            auth()->user()->business_id
        );

        if ($search) {
            $query->where(function ($query) use ($search) {
                $query
                    ->where(
                        'id',
                        'like',
                        "%{$search}%"
                    )
                    ->orWhereHas(
                        'customer',
                        function ($query) use ($search) {
                            $query->where(
                                'name',
                                'like',
                                "%{$search}%"
                            );
                        }
                    );
            });
        }

        if ($customerId) {
            $query->where(
                'customer_id',
                $customerId
            );
        }

        if ($statusId) {
            $query->where(
                'status_id',
                $statusId
            );
        }

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

        $sales = $query->get([
            'id',
            'amount',
        ]);

        $salesIds = $sales->pluck('id');

        $collected = \App\Models\Payment::whereIn(
            'sale_id',
            $salesIds
        )->sum('amount');

        $totalSales = $sales->sum(
            fn ($sale) =>
                (float) $sale->amount
        );

        return [
            'totalSales' =>
                (float) $totalSales,

            'collected' =>
                (float) $collected,

            'outstanding' =>
                (float) $totalSales -
                (float) $collected,

            'salesCount' =>
                $sales->count(),
        ];
    }

    public function createSale(
        int $businessId,
        array $data
    ): Sale {
        return Sale::create([
            'business_id' =>
                $businessId,

            'customer_id' =>
                $data['customer_id'] ?? null,

            'amount' =>
                $data['amount'],

            'status_id' =>
                $data['status_id'],

            'sold_at' =>
                now(),
        ]);
    }

    public function updateSale(
        Sale $sale,
        array $data
    ): Sale {
        $sale->update([
            'customer_id' =>
                $data['customer_id'] ?? null,

            'amount' =>
                $data['amount'],

            'status_id' =>
                $data['status_id'],
        ]);

        return $sale->fresh([
            'customer',
            'status',
        ]);
    }

    public function deleteSale(
        Sale $sale
    ): void {
        $sale->delete();
    }
}