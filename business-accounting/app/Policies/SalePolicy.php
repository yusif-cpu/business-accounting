<?php

namespace App\Policies;

use App\Models\Sale;
use App\Models\User;

class SalePolicy
{
    public function view(User $user, Sale $sale): bool
    {
        return $user->business_id === $sale->business_id;
    }

    public function update(User $user, Sale $sale): bool
    {
        return $user->business_id === $sale->business_id;
    }

    public function delete(User $user, Sale $sale): bool
    {
        return $user->business_id === $sale->business_id;
    }
}
