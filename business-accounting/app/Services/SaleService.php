<?php

namespace App\Services;

use App\Models\Sale;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class SaleService
{
    public function getSalesForCurrentBusiness(): LengthAwarePaginator
    {
        return Sale::with('customer')
            ->withSum('payments', 'amount')
            ->where(
                'business_id',
                auth()->user()->business_id
            )
            ->latest('sold_at')
            ->paginate(10);
    }

    public function createSale(
        int $businessId,
        array $data
    ): Sale {
        return Sale::create([
            'business_id' => $businessId,
            'customer_id' => $data['customer_id'] ?? null,
            'amount' => $data['amount'],
            'status' => 'pending',
            'sold_at' => now(),
        ]);
    }

    public function updateSale(
        Sale $sale,
        array $data
    ): Sale {
        $sale->update([
            'customer_id' => $data['customer_id'] ?? null,
            'amount' => $data['amount'],
        ]);

        return $sale->fresh();
    }

    public function deleteSale(Sale $sale): void
    {
        $sale->delete();
    }
}
