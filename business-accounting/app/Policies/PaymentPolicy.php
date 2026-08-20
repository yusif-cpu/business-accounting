<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;

class PaymentPolicy
{
    public function delete(User $user, Payment $payment): bool
    {
        return $user->business_id === $payment->sale->business_id;
    }
}