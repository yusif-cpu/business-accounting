<?php

namespace App\Services\Api\V1;

use App\Models\Category;
use App\Models\Expense;
use Illuminate\Validation\ValidationException;

class ExpenseSyncService
{
    public function sync(
        int $businessId,
        array $data
    ): array {
        $categoryId = $this->resolveCategoryId(
            $businessId,
            $data['category_name'] ?? null
        );

        $expense = Expense::where(
            'business_id',
            $businessId
        )
            ->where(
                'external_id',
                $data['external_id']
            )
            ->first();

        if ($expense) {
            $expense->update([
                'description' => $data['description'],
                'amount' => $data['amount'],
                'category_id' => $categoryId,
                'expense_date' => $data['expense_date'] ?? $expense->expense_date,
            ]);

            return [
                'expense' => $expense->fresh('category'),
                'created' => false,
            ];
        }

        $expense = Expense::create([
            'business_id' => $businessId,
            'external_id' => $data['external_id'],
            'description' => $data['description'],
            'amount' => $data['amount'],
            'category_id' => $categoryId,
            'expense_date' => $data['expense_date'] ?? now(),
        ]);

        return [
            'expense' => $expense->load('category'),
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
                'expense'
            )
            ->where(
                'name',
                $categoryName
            )
            ->first();

        if (!$category) {
            throw ValidationException::withMessages([
                'category_name' => [
                    'The specified expense category does not exist.',
                ],
            ]);
        }

        return $category->id;
    }
}
