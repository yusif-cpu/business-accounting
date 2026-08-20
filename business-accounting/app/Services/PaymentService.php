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
        $payment = $sale->payments()->create([
            'amount' => $data['amount'],
            'method' => $data['method'],
            'paid_at' => $data['paid_at'],
        ]);

        $this->updateSaleStatus($sale);

        return $payment;
    }

    public function deletePayment(Payment $payment): void
    {
        $sale = $payment->sale;

        $payment->delete();

        $this->updateSaleStatus($sale);
    }

    private function updateSaleStatus(Sale $sale): void
    {
        $paidAmount = (float) $sale->payments()->sum('amount');
        $saleAmount = (float) $sale->amount;

        if ($paidAmount >= $saleAmount) {
            $sale->update([
                'status' => 'paid',
            ]);

            return;
        }

        $sale->update([
            'status' => 'pending',
        ]);
    }
}