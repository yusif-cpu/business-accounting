<?php

namespace App\Services\Api\V1;

use App\Models\Category;
use App\Models\Operation;
use Illuminate\Validation\ValidationException;

class IncomeSyncService
{
    public function sync(
        int $businessId,
        array $data
    ): array {
        $categoryId = $this->resolveCategoryId(
            $businessId,
            $data['category_name'] ?? null
        );

        $operation = Operation::where(
            'business_id',
            $businessId
        )
            ->where(
                'external_id',
                $data['external_id']
            )
            ->first();

        if ($operation) {
            $operation->update([
                'description' => $data['description'],
                'amount' => $data['amount'],
                'category_id' => $categoryId,
                'currency' => strtoupper($data['currency'] ?? $operation->currency),
                'note' => $data['note'] ?? $operation->note,
                'operation_date' => $data['operation_date'] ?? $operation->operation_date,
            ]);

            return [
                'income' => $operation->fresh('category'),
                'created' => false,
            ];
        }

        $operation = Operation::create([
            'business_id' => $businessId,
            'external_id' => $data['external_id'],
            'type' => 'income',
            'description' => $data['description'],
            'amount' => $data['amount'],
            'category_id' => $categoryId,
            'currency' => strtoupper($data['currency'] ?? 'AZN'),
            'note' => $data['note'] ?? null,
            'operation_date' => $data['operation_date'] ?? now(),
        ]);

        return [
            'income' => $operation->load('category'),
            'created' => true,
        ];
    }

    private function resolveCategoryId(
        int $businessId,
        ?string $categoryName
    ): ?int {
        if (!$categoryName) {
            return null;
        }

        $category = Category::where(
            'business_id',
            $businessId
        )
            ->where(
                'type',
                'income'
            )
            ->where(
                'name',
                $categoryName
            )
            ->first();

        if (!$category) {
            throw ValidationException::withMessages([
                'category_name' => [
                    'The specified income category does not exist.',
                ],
            ]);
        }

        return $category->id;
    }
}
