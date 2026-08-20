<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreExpenseRequest;
use App\Http\Requests\UpdateExpenseRequest;
use App\Models\Expense;
use App\Services\ExpenseService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    public function __construct(
        private ExpenseService $expenseService
    ) {
    }

    public function index(): Response
    {
        $expenses = $this->expenseService
            ->getExpensesForCurrentBusiness();

        return Inertia::render('Expenses/Index', [
            'expenses' => $expenses,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Expenses/Create');
    }

    public function store(
        StoreExpenseRequest $request
    ): RedirectResponse {
        $this->expenseService->createExpense(
            auth()->user()->business_id,
            $request->validated()
        );

        return redirect()->route('expenses.index');
    }

    public function edit(Expense $expense): Response
    {
        $this->authorizeExpense($expense);

        return Inertia::render('Expenses/Edit', [
            'expense' => $expense,
        ]);
    }

    public function update(
        UpdateExpenseRequest $request,
        Expense $expense
    ): RedirectResponse {
        $this->authorizeExpense($expense);

        $this->expenseService->updateExpense(
            $expense,
            $request->validated()
        );

        return redirect()->route('expenses.index');
    }

    public function destroy(Expense $expense): RedirectResponse
    {
        $this->authorizeExpense($expense);

        $this->expenseService->deleteExpense($expense);

        return redirect()->route('expenses.index');
    }

    private function authorizeExpense(Expense $expense): void
    {
        abort_if(
            $expense->business_id !== auth()->user()->business_id,
            403
        );
    }
}