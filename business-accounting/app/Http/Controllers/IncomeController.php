<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOperationRequest;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Operation;
use App\Services\OperationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IncomeController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request
            ->string('search')
            ->toString();

        $categoryId = $request
            ->string('category_id')
            ->toString();

        $startDate = $request
            ->string('start_date')
            ->toString();

        $endDate = $request
            ->string('end_date')
            ->toString();

        $incomes = app(OperationService::class)
            ->getOperationsForCurrentBusiness(
                $search ?: null,
                'income',
                $startDate ?: null,
                $endDate ?: null,
                $categoryId ?: null
            );

        $summary = app(OperationService::class)
            ->getOperationSummary(
                $search ?: null,
                'income',
                $startDate ?: null,
                $endDate ?: null,
                $categoryId ?: null
            );

        $categories = Category::where(
            'business_id',
            auth()->user()->business_id
        )
            ->where('type', 'income')
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'type',
            ]);

        return Inertia::render(
            'Income/Index',
            [
                'incomes' => $incomes,

                'summary' => $summary,

                'categories' => $categories,

                'filters' => [
                    'search' => $search,
                    'category_id' => $categoryId,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ],
            ]
        );
    }

    public function create(): Response
    {
        $customers = Customer::where(
            'business_id',
            auth()->user()->business_id
        )
            ->orderBy('name')
            ->get([
                'id',
                'name',
            ]);

        $categories = Category::where(
            'business_id',
            auth()->user()->business_id
        )
            ->where('type', 'income')
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'type',
            ]);

        return Inertia::render(
            'Income/Create',
            [
                'customers' => $customers,
                'categories' => $categories,
            ]
        );
    }

    public function store(
        StoreOperationRequest $request
    ): RedirectResponse {
        $data = $request->validated();

        $data['type'] = 'income';

        app(OperationService::class)
            ->createOperation(
                auth()->user()->business_id,
                $data
            );

        return redirect()
            ->route('income.create')
            ->with(
                'success',
                'Income added successfully.'
            );
    }

    public function show(int $id): Response
    {
        $income = Operation::where(
            'business_id',
            auth()->user()->business_id
        )
            ->where('type', 'income')
            ->with([
                'customer',
                'category',
            ])
            ->findOrFail($id);

        return Inertia::render(
            'Income/Show',
            [
                'income' => $income,
            ]
        );
    }

    public function edit(int $id): Response
    {
        $income = Operation::where(
            'business_id',
            auth()->user()->business_id
        )
            ->where('type', 'income')
            ->with([
                'customer',
                'category',
            ])
            ->findOrFail($id);

        $customers = Customer::where(
            'business_id',
            auth()->user()->business_id
        )
            ->orderBy('name')
            ->get([
                'id',
                'name',
            ]);

        $categories = Category::where(
            'business_id',
            auth()->user()->business_id
        )
            ->where('type', 'income')
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'type',
            ]);

        return Inertia::render(
            'Income/Edit',
            [
                'income' => $income,
                'customers' => $customers,
                'categories' => $categories,
            ]
        );
    }

    public function update(
        StoreOperationRequest $request,
        int $id
    ): RedirectResponse {
        $income = Operation::where(
            'business_id',
            auth()->user()->business_id
        )
            ->where('type', 'income')
            ->findOrFail($id);

        $data = $request->validated();

        $data['type'] = 'income';

        app(OperationService::class)
            ->updateOperation(
                $income,
                $data
            );

        return redirect()
            ->route('income.index')
            ->with(
                'success',
                'Income updated successfully.'
            );
    }

    public function destroy(int $id): RedirectResponse
    {
        $income = Operation::where(
            'business_id',
            auth()->user()->business_id
        )
            ->where('type', 'income')
            ->findOrFail($id);

        app(OperationService::class)
            ->deleteOperation($income);

        return redirect()
            ->route('income.index')
            ->with(
                'success',
                'Income deleted successfully.'
            );
    }
}