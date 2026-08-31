<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\Operation;
use Illuminate\Contracts\Pagination\LengthAwarePaginator as LengthAwarePaginatorContract;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class ExpenseService
{
    public function getExpensesForCurrentBusiness(
        ?string $search = null,
        ?string $categoryId = null,
        ?string $startDate = null,
        ?string $endDate = null
    ): LengthAwarePaginatorContract {
        $items = $this->mergedExpenseItems(
            $search,
            $categoryId,
            $startDate,
            $endDate
        );

        $perPage = 10;

        $currentPage = max(
            1,
            (int) request('page', 1)
        );

        $itemsForPage = $items
            ->slice(
                ($currentPage - 1) * $perPage,
                $perPage
            )
            ->values();

        return new LengthAwarePaginator(
            $itemsForPage,
            $items->count(),
            $perPage,
            $currentPage,
            [
                'path' => request()->url(),
                'query' => request()->query(),
            ]
        );
    }

    public function getExpenseSummary(
        ?string $search = null,
        ?string $categoryId = null,
        ?string $startDate = null,
        ?string $endDate = null
    ): array {
        $items = $this->mergedExpenseItems(
            $search,
            $categoryId,
            $startDate,
            $endDate
        );

        return [
            'total' => (float) $items->sum('amount'),

            'count' => $items->count(),
        ];
    }

    /**
     * Merge Expense rows with Operation(type=expense) rows into a single,
     * normalized, date-sorted collection. Both tables are unrelated (no
     * shared key), so this fetches each filtered set and combines them
     * in memory rather than via a database-level UNION.
     */
    private function mergedExpenseItems(
        ?string $search,
        ?string $categoryId,
        ?string $startDate,
        ?string $endDate
    ): Collection {
        $businessId =
            auth()->user()->business_id;

        $expenses = $this
            ->filteredExpenseQuery(
                $businessId,
                $search,
                $categoryId,
                $startDate,
                $endDate
            )
            ->get()
            ->map(
                fn (Expense $expense) =>
                    $this->normalizeExpense($expense)
            );

        $operationExpenses = $this
            ->filteredOperationExpenseQuery(
                $businessId,
                $search,
                $categoryId,
                $startDate,
                $endDate
            )
            ->get()
            ->map(
                fn (Operation $operation) =>
                    $this->normalizeOperationExpense($operation)
            );

        return $expenses
            ->concat($operationExpenses)
            ->sort(
                fn (array $a, array $b) =>
                    $b['expense_date'] <=> $a['expense_date']
                        ?: $b['id'] <=> $a['id']
            )
            ->values();
    }

    private function filteredExpenseQuery(
        int $businessId,
        ?string $search,
        ?string $categoryId,
        ?string $startDate,
        ?string $endDate
    ): Builder {
        $query = Expense::with('category')
            ->where(
                'business_id',
                $businessId
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

        return $query;
    }

    private function filteredOperationExpenseQuery(
        int $businessId,
        ?string $search,
        ?string $categoryId,
        ?string $startDate,
        ?string $endDate
    ): Builder {
        $query = Operation::with('category')
            ->where(
                'business_id',
                $businessId
            )
            ->where(
                'type',
                'expense'
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
                'operation_date',
                '>=',
                $startDate
            );
        }

        if ($endDate) {
            $query->whereDate(
                'operation_date',
                '<=',
                $endDate
            );
        }

        return $query;
    }

    private function normalizeExpense(
        Expense $expense
    ): array {
        return [
            'id' => $expense->id,

            'source' => 'expense',

            'description' => $expense->description,

            'amount' => $expense->amount,

            'category' => $expense->category
                ? [
                    'id' => $expense->category->id,
                    'name' => $expense->category->name,
                ]
                : null,

            'expense_date' => $expense->expense_date->toDateString(),
        ];
    }

    private function normalizeOperationExpense(
        Operation $operation
    ): array {
        return [
            'id' => $operation->id,

            'source' => 'operation',

            'description' => $operation->description,

            'amount' => $operation->amount,

            'category' => $operation->category
                ? [
                    'id' => $operation->category->id,
                    'name' => $operation->category->name,
                ]
                : null,

            'expense_date' => $operation->operation_date->toDateString(),
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
