<?php

namespace App\Services;

use App\Models\Operation;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class OperationService
{
    private function applyFilters(
        Builder $query,
        ?string $search = null,
        ?string $type = null,
        ?string $startDate = null,
        ?string $endDate = null,
        ?string $categoryId = null
    ): Builder {
        $query->where(
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
                        'customer',
                        function ($query) use ($search) {
                            $query->where(
                                'name',
                                'like',
                                "%{$search}%"
                            );
                        }
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

        if (
            $type &&
            in_array(
                $type,
                [
                    'income',
                    'expense',
                ],
                true
            )
        ) {
            $query->where(
                'type',
                $type
            );
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

    public function getOperationsForCurrentBusiness(
        ?string $search = null,
        ?string $type = null,
        ?string $startDate = null,
        ?string $endDate = null,
        ?string $categoryId = null
    ): LengthAwarePaginator {
        $query = Operation::with([
            'customer',
            'category',
        ]);

        $this->applyFilters(
            $query,
            $search,
            $type,
            $startDate,
            $endDate,
            $categoryId
        );

        return $query
            ->latest('operation_date')
            ->latest('id')
            ->paginate(10)
            ->withQueryString();
    }

    public function getOperationSummary(
        ?string $search = null,
        ?string $type = null,
        ?string $startDate = null,
        ?string $endDate = null,
        ?string $categoryId = null
    ): array {
        $query = Operation::query();

        $this->applyFilters(
            $query,
            $search,
            $type,
            $startDate,
            $endDate,
            $categoryId
        );

        $income = (clone $query)
            ->where(
                'type',
                'income'
            )
            ->sum('amount');

        $expenses = (clone $query)
            ->where(
                'type',
                'expense'
            )
            ->sum('amount');

        return [
            'income' =>
                (float) $income,

            'expenses' =>
                (float) $expenses,

            'balance' =>
                (float) $income -
                (float) $expenses,

            'count' =>
                (clone $query)->count(),
        ];
    }

    public function createOperation(
        int $businessId,
        array $data
    ): Operation {
        return Operation::create([
            'business_id' =>
                $businessId,

            'customer_id' =>
                $data['customer_id'] ?? null,

            'type' =>
                $data['type'],

            'operation_date' =>
                $data['operation_date'],

            'currency' =>
                strtoupper(
                    $data['currency']
                ),

            'amount' =>
                $data['amount'],

            'category_id' =>
                $data['category_id'] ?? null,

            'description' =>
                $data['description'],

            'note' =>
                $data['note'] ?? null,
        ]);
    }

    public function updateOperation(
        Operation $operation,
        array $data
    ): Operation {
        $operation->update([
            'customer_id' =>
                $data['customer_id'] ?? null,

            'type' =>
                $data['type'],

            'operation_date' =>
                $data['operation_date'],

            'currency' =>
                strtoupper(
                    $data['currency']
                ),

            'amount' =>
                $data['amount'],

            'category_id' =>
                $data['category_id'] ?? null,

            'description' =>
                $data['description'],

            'note' =>
                $data['note'] ?? null,
        ]);

        return $operation->fresh([
            'customer',
            'category',
        ]);
    }

    public function deleteOperation(
        Operation $operation
    ): void {
        $operation->delete();
    }
}