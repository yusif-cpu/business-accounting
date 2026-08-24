<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreExpenseRequest;
use App\Http\Requests\UpdateExpenseRequest;
use App\Models\Category;
use App\Models\Expense;
use App\Services\ExpenseService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    public function __construct(
        private ExpenseService $expenseService
    ) {}

    public function index(): Response
    {
        $search = request()->string('search')->toString();

        $categoryId = request()
            ->string('category_id')
            ->toString();

        $startDate = request()
            ->string('start_date')
            ->toString();

        $endDate = request()
            ->string('end_date')
            ->toString();

        $expenses = $this->expenseService
            ->getExpensesForCurrentBusiness(
                $search ?: null,
                $categoryId ?: null,
                $startDate ?: null,
                $endDate ?: null
            );

        $summary = $this->expenseService
            ->getExpenseSummary(
                $search ?: null,
                $categoryId ?: null,
                $startDate ?: null,
                $endDate ?: null
            );

        $categories = Category::where(
            'business_id',
            auth()->user()->business_id
        )
            ->where('type', 'expense')
            ->orderBy('name')
            ->get([
                'id',
                'name',
            ]);

        return Inertia::render('Expenses/Index', [
            'expenses' => $expenses,

            'summary' => $summary,

            'categories' => $categories,

            'filters' => [
                'search' => $search,
                'category_id' => $categoryId,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function create(): Response
    {
        $categories = Category::where(
            'business_id',
            auth()->user()->business_id
        )
            ->where('type', 'expense')
            ->orderBy('name')
            ->get([
                'id',
                'name',
            ]);

        return Inertia::render('Expenses/Create', [
            'categories' => $categories,
        ]);
    }

    public function store(
        StoreExpenseRequest $request
    ): RedirectResponse {
        $this->expenseService->createExpense(
            auth()->user()->business_id,
            $request->validated()
        );

        return redirect()
            ->route('expenses.index')
            ->with('success', 'Expense created successfully.');
    }

    public function edit(Expense $expense): Response
    {
        Gate::authorize('update', $expense);

        $categories = Category::where(
            'business_id',
            auth()->user()->business_id
        )
            ->where('type', 'expense')
            ->orderBy('name')
            ->get([
                'id',
                'name',
            ]);

        return Inertia::render('Expenses/Edit', [
            'expense' => $expense->load('category'),
            'categories' => $categories,
        ]);
    }

    public function update(
        UpdateExpenseRequest $request,
        Expense $expense
    ): RedirectResponse {
        Gate::authorize('update', $expense);

        $this->expenseService->updateExpense(
            $expense,
            $request->validated()
        );

        return redirect()
            ->route('expenses.index')
            ->with('success', 'Expense updated successfully.');
    }

    public function destroy(Expense $expense): RedirectResponse
    {
        Gate::authorize('delete', $expense);

        $this->expenseService->deleteExpense($expense);

        return redirect()
            ->route('expenses.index')
            ->with('success', 'Expense deleted successfully.');
    }
}