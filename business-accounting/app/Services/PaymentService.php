<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Sale;
use Illuminate\Database\Eloquent\Collection;

class PaymentService
{
    public function getPaymentsForSale(Sale $sale): Collection
    {
        return $sale->payments()
            ->latest('paid_at')
            ->get();
    }

    public function createPayment(
        Sale $sale,
        array $data
    ): Payment {
        return $sale->payments()->create([
            'amount' => $data['amount'],
            'method' => $data['method'],
            'paid_at' => $data['paid_at'],
        ]);
    }

    public function deletePayment(Payment $payment): void
    {
        $payment->delete();
    }
}