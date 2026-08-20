<?php

namespace App\Services;

use App\Models\Sale;
use Illuminate\Database\Eloquent\Collection;
class SaleService
{
    public function getSalesForCurrentBusiness(): Collection
    {
        $businessId = auth()->user()->business_id;

        return Sale::where('business_id', $businessId)
        ->latest('sold_at')
        ->get();
    }

    public function createSale(int $businessId, array $data): Sale
    {
        return Sale::create([
            'business_id' => $businessId,
            'customer_id' => $data['customer_id'] ?? null,
            'amount' => $data['amount'],
            'status' => 'pending',
            'sold_at' => now(),
        ]);
    }

    public function updateSale(Sale $sale, array $data): Sale
    {
        $sale->update([
            'customer_id' => $data['customer_id'] ?? null,
            'amount' => $data['amount'],
            'status' => $data['status'],
        ]);

        return $sale;
    }

    public function deleteSale(Sale $sale): void
    {
        $sale->delete();
    }
}