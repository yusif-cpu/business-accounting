<?php

namespace App\Services;

use App\Models\Operation;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class OperationService
{
    public function getOperationsForCurrentBusiness(): LengthAwarePaginator
    {
        return Operation::with([
            'customer',
            'category',
        ])
            ->where(
                'business_id',
                auth()->user()->business_id
            )
            ->latest('operation_date')
            ->latest('id')
            ->paginate(10);
    }

    public function createOperation(
        int $businessId,
        array $data
    ): Operation {
        return Operation::create([
            'business_id' => $businessId,
            'customer_id' => $data['customer_id'] ?? null,
            'type' => $data['type'],
            'operation_date' => $data['operation_date'],
            'currency' => strtoupper($data['currency']),
            'amount' => $data['amount'],
            'category_id' => $data['category_id'] ?? null,
            'description' => $data['description'],
            'note' => $data['note'] ?? null,
        ]);
    }

    public function updateOperation(
        Operation $operation,
        array $data
    ): Operation {
        $operation->update([
            'customer_id' => $data['customer_id'] ?? null,
            'type' => $data['type'],
            'operation_date' => $data['operation_date'],
            'currency' => strtoupper($data['currency']),
            'amount' => $data['amount'],
            'category_id' => $data['category_id'] ?? null,
            'description' => $data['description'],
            'note' => $data['note'] ?? null,
        ]);

        return $operation->fresh([
            'customer',
            'category',
        ]);
    }

    public function deleteOperation(Operation $operation): void
    {
        $operation->delete();
    }
}