<?php

namespace App\Http\Controllers;

use App\Http\Requests\ExpenseFilterRequest;
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

    public function index(
        ExpenseFilterRequest $request
    ): Response {
        $filters =
            $request->filters();

        $expenses =
            $this->expenseService
                ->getExpensesForCurrentBusiness(
                    $filters['search'],
                    $filters['category_id'],
                    $filters['start_date'],
                    $filters['end_date']
                );

        $summary =
            $this->expenseService
                ->getExpenseSummary(
                    $filters['search'],
                    $filters['category_id'],
                    $filters['start_date'],
                    $filters['end_date']
                );

        $categories = Category::where(
            'business_id',
            auth()->user()->business_id
        )
            ->where(
                'type',
                'expense'
            )
            ->orderBy('name')
            ->get([
                'id',
                'name',
            ]);

        return Inertia::render(
            'Expenses/Index',
            [
                'expenses' =>
                    $expenses,

                'summary' =>
                    $summary,

                'categories' =>
                    $categories,

                'filters' => [
                    'search' =>
                        $filters['search'] ?? '',

                    'category_id' =>
                        $filters['category_id']
                            ? (string) $filters['category_id']
                            : '',

                    'start_date' =>
                        $filters['start_date'] ?? '',

                    'end_date' =>
                        $filters['end_date'] ?? '',
                ],
            ]
        );
    }

    public function create(): Response
    {
        $categories = Category::where(
            'business_id',
            auth()->user()->business_id
        )
            ->where(
                'type',
                'expense'
            )
            ->orderBy('name')
            ->get([
                'id',
                'name',
            ]);

        return Inertia::render(
            'Expenses/Create',
            [
                'categories' =>
                    $categories,
            ]
        );
    }

    public function store(
        StoreExpenseRequest $request
    ): RedirectResponse {
        $this->expenseService
            ->createExpense(
                auth()->user()->business_id,
                $request->validated()
            );

        return redirect()
            ->route('expenses.index')
            ->with(
                'success',
                'Expense created successfully.'
            );
    }

    public function edit(
        Expense $expense
    ): Response {
        Gate::authorize(
            'update',
            $expense
        );

        $categories = Category::where(
            'business_id',
            auth()->user()->business_id
        )
            ->where(
                'type',
                'expense'
            )
            ->orderBy('name')
            ->get([
                'id',
                'name',
            ]);

        return Inertia::render(
            'Expenses/Edit',
            [
                'expense' =>
                    $expense->load(
                        'category'
                    ),

                'categories' =>
                    $categories,
            ]
        );
    }

    public function update(
        UpdateExpenseRequest $request,
        Expense $expense
    ): RedirectResponse {
        Gate::authorize(
            'update',
            $expense
        );

        $this->expenseService
            ->updateExpense(
                $expense,
                $request->validated()
            );

        return redirect()
            ->route('expenses.index')
            ->with(
                'success',
                'Expense updated successfully.'
            );
    }

    public function destroy(
        Expense $expense
    ): RedirectResponse {
        Gate::authorize(
            'delete',
            $expense
        );

        $this->expenseService
            ->deleteExpense(
                $expense
            );

        return redirect()
            ->route('expenses.index')
            ->with(
                'success',
                'Expense deleted successfully.'
            );
    }
}