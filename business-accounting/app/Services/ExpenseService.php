<?php

namespace App\Services;

use App\Models\Expense;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ExpenseService
{
    public function getExpensesForCurrentBusiness(): LengthAwarePaginator
    {
        return Expense::where(
            'business_id',
            auth()->user()->business_id
        )
            ->latest('expense_date')
            ->paginate(10);
    }

    public function createExpense(
        int $businessId,
        array $data
    ): Expense {
        return Expense::create([
            'business_id' => $businessId,
            'description' => $data['description'],
            'amount' => $data['amount'],
            'category' => $data['category'] ?? null,
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
            'category' => $data['category'] ?? null,
            'expense_date' => $data['expense_date'],
        ]);

        return $expense;
    }

    public function deleteExpense(Expense $expense): void
    {
        $expense->delete();
    }
}
