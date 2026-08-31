<?php

namespace App\Services\Api\V1;

use App\Models\Payment;
use App\Models\Sale;
use App\Services\PaymentService;
use Illuminate\Validation\ValidationException;

class PaymentSyncService
{
    public function __construct(
        private PaymentService $paymentService
    ) {}

    public function sync(
        int $businessId,
        array $data
    ): array {
        $sale = Sale::where(
            'business_id',
            $businessId
        )
            ->where(
                'external_id',
                $data['sale_external_id']
            )
            ->first();

        if (!$sale) {
            throw ValidationException::withMessages([
                'sale_external_id' => [
                    'The specified sale does not exist.',
                ],
            ]);
        }

        $payment = Payment::where(
            'business_id',
            $businessId
        )
            ->where(
                'external_id',
                $data['external_id']
            )
            ->first();

        if ($payment) {
            $oldSale = $payment->sale;

            $payment->update([
                'sale_id' => $sale->id,
                'amount' => $data['amount'],
                'payment_source' => $data['payment_source'] ?? null,
                'paid_at' => $data['paid_at'] ?? $payment->paid_at,
            ]);

            $this->paymentService->updateSaleStatus($sale);

            if ($oldSale && $oldSale->id !== $sale->id) {
                $this->paymentService->updateSaleStatus($oldSale);
            }

            return [
                'payment' => $payment->fresh('sale'),
                'created' => false,
            ];
        }

        $payment = Payment::create([
            'business_id' => $businessId,
            'sale_id' => $sale->id,
            'external_id' => $data['external_id'],
            'amount' => $data['amount'],
            'payment_source' => $data['payment_source'] ?? null,
            'paid_at' => $data['paid_at'] ?? now(),
        ]);

        $this->paymentService->updateSaleStatus($sale);

        return [
            'payment' => $payment->load('sale'),
            'created' => true,
        ];
    }
}
