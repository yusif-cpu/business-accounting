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
}