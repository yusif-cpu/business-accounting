<?php

namespace App\Services;

use App\Models\Expense;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ExpenseService
{
    public function getExpensesForCurrentBusiness(
        ?string $search = null,
        ?string $categoryId = null,
        ?string $startDate = null,
        ?string $endDate = null
    ): LengthAwarePaginator {
        $query = Expense::with('category')
            ->where(
                'business_id',
                auth()->user()->business_id
            );

        if ($search) {
            $query->where(function ($query) use ($search) {
                $query
                    ->where(
                        'description',
                        'like',
                        "%{$search}%"
                    )
                    ->orWhereHas(
                        'category',
                        function ($query) use ($search) {
                            $query->where(
                                'name',
                                'like',
                                "%{$search}%"
                            );
                        }
                    );
            });
        }

        if ($categoryId) {
            $query->where(
                'category_id',
                $categoryId
            );
        }

        if ($startDate) {
            $query->whereDate(
                'expense_date',
                '>=',
                $startDate
            );
        }

        if ($endDate) {
            $query->whereDate(
                'expense_date',
                '<=',
                $endDate
            );
        }

        return $query
            ->latest('expense_date')
            ->latest('id')
            ->paginate(10)
            ->withQueryString();
    }

    public function getExpenseSummary(
        ?string $search = null,
        ?string $categoryId = null,
        ?string $startDate = null,
        ?string $endDate = null
    ): array {
        $query = Expense::where(
            'business_id',
            auth()->user()->business_id
        );

        if ($search) {
            $query->where(function ($query) use ($search) {
                $query
                    ->where(
                        'description',
                        'like',
                        "%{$search}%"
                    )
                    ->orWhereHas(
                        'category',
                        function ($query) use ($search) {
                            $query->where(
                                'name',
                                'like',
                                "%{$search}%"
                            );
                        }
                    );
            });
        }

        if ($categoryId) {
            $query->where(
                'category_id',
                $categoryId
            );
        }

        if ($startDate) {
            $query->whereDate(
                'expense_date',
                '>=',
                $startDate
            );
        }

        if ($endDate) {
            $query->whereDate(
                'expense_date',
                '<=',
                $endDate
            );
        }

        return [
            'total' => (float) $query->sum('amount'),

            'count' => (clone $query)->count(),
        ];
    }

    public function createExpense(
        int $businessId,
        array $data
    ): Expense {
        return Expense::create([
            'business_id' => $businessId,
            'description' => $data['description'],
            'amount' => $data['amount'],
            'category_id' => $data['category_id'] ?? null,
            'expense_date' => $data['expense_date'],
        ]);
    }

    public function updateExpense(
        Expense $expense,
        array $data
    ): Expense {
        $expense->update([
            'description' => $data['description'],
            'amount' => $data['amount'],
            'category_id' => $data['category_id'] ?? null,
            'expense_date' => $data['expense_date'],
        ]);

        return $expense->fresh('category');
    }

    public function deleteExpense(
        Expense $expense
    ): void {
        $expense->delete();
    }
}