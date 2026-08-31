<?php

namespace App\Services\Api\V1;

use App\Models\Customer;

class CustomerSyncService
{
    public function sync(
        int $businessId,
        array $data
    ): array {
        $customer = Customer::where(
            'business_id',
            $businessId
        )
            ->where(
                'external_id',
                $data['external_id']
            )
            ->first();

        if ($customer) {
            $customer->update([
                'name' => $data['name'],
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
            ]);

            return [
                'customer' => $customer->fresh(),
                'created' => false,
            ];
        }

        $customer = Customer::create([
            'business_id' => $businessId,
            'external_id' => $data['external_id'],
            'name' => $data['name'],
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
        ]);

        return [
            'customer' => $customer,
            'created' => true,
        ];
    }
}