<?php

namespace App\Services\Api\V1;

use App\Models\Customer;
use App\Models\Sale;
use App\Models\SaleStatus;
use Illuminate\Validation\ValidationException;

class SaleSyncService
{
    public function sync(
        int $businessId,
        array $data
    ): array {
        $customer = null;

        if (!empty($data['customer_external_id'])) {
            $customer = Customer::where(
                'business_id',
                $businessId
            )
                ->where(
                    'external_id',
                    $data['customer_external_id']
                )
                ->first();

            if (!$customer) {
                throw ValidationException::withMessages([
                    'customer_external_id' => [
                        'The specified customer does not exist.',
                    ],
                ]);
            }
        }

        $status = $this->resolveStatus(
            $businessId,
            $data['status_slug'] ?? null
        );

        $sale = Sale::where(
            'business_id',
            $businessId
        )
            ->where(
                'external_id',
                $data['external_id']
            )
            ->first();

        if ($sale) {
            $sale->update([
                'customer_id' => $customer?->id,
                'amount' => $data['amount'],
                'status_id' => $status->id,
                'sold_at' => $data['sold_at'] ?? $sale->sold_at,
            ]);

            return [
                'sale' => $sale->fresh([
                    'customer',
                    'status',
                ]),
                'created' => false,
            ];
        }

        $sale = Sale::create([
            'business_id' => $businessId,
            'customer_id' => $customer?->id,
            'external_id' => $data['external_id'],
            'amount' => $data['amount'],
            'status_id' => $status->id,
            'sold_at' => $data['sold_at'] ?? now(),
        ]);

        return [
            'sale' => $sale->load([
                'customer',
                'status',
            ]),
            'created' => true,
        ];
    }

    private function resolveStatus(
        int $businessId,
        ?string $statusSlug
    ): SaleStatus {
        if ($statusSlug) {
            $status = SaleStatus::where(
                'business_id',
                $businessId
            )
                ->where(
                    'slug',
                    $statusSlug
                )
                ->first();

            if (!$status) {
                throw ValidationException::withMessages([
                    'status_slug' => [
                        'The specified sale status does not exist.',
                    ],
                ]);
            }

            return $status;
        }

        $status = SaleStatus::where(
            'business_id',
            $businessId
        )
            ->where(
                'is_default',
                true
            )
            ->first();

        if (!$status) {
            throw ValidationException::withMessages([
                'status_slug' => [
                    'No default sale status exists.',
                ],
            ]);
        }

        return $status;
    }
}