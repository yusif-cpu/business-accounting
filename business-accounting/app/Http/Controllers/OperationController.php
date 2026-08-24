<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOperationRequest;
use App\Http\Requests\UpdateOperationRequest;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Operation;
use App\Services\OperationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class OperationController extends Controller
{
    public function __construct(
        private OperationService $operationService
    ) {}

    public function index(): Response
    {
        return Inertia::render('Operations/Index', [
            'operations' => $this->operationService
                ->getOperationsForCurrentBusiness(),
        ]);
    }

    public function create(): Response
    {
        $customers = Customer::where(
            'business_id',
            auth()->user()->business_id
        )
            ->orderBy('name')
            ->get();

        $categories = Category::where(
            'business_id',
            auth()->user()->business_id
        )
            ->orderBy('type')
            ->orderBy('name')
            ->get([
                'id',
                'type',
                'name',
            ]);

        return Inertia::render('Operations/Create', [
            'customers' => $customers,
            'categories' => $categories,
        ]);
    }

    public function store(
        StoreOperationRequest $request
    ): RedirectResponse {
        $this->operationService->createOperation(
            auth()->user()->business_id,
            $request->validated()
        );

        return redirect()
            ->route('operations.create')
            ->with('success', 'Operation added successfully.');
    }

    public function show(Operation $operation): Response
    {
        Gate::authorize('view', $operation);

        return Inertia::render('Operations/Show', [
            'operation' => $operation->load([
                'customer',
                'category',
            ]),
        ]);
    }

    public function edit(Operation $operation): Response
    {
        Gate::authorize('update', $operation);

        $customers = Customer::where(
            'business_id',
            auth()->user()->business_id
        )
            ->orderBy('name')
            ->get();

        $categories = Category::where(
            'business_id',
            auth()->user()->business_id
        )
            ->orderBy('type')
            ->orderBy('name')
            ->get([
                'id',
                'type',
                'name',
            ]);

        return Inertia::render('Operations/Edit', [
            'operation' => $operation->load([
                'customer',
                'category',
            ]),
            'customers' => $customers,
            'categories' => $categories,
        ]);
    }

    public function update(
        UpdateOperationRequest $request,
        Operation $operation
    ): RedirectResponse {
        Gate::authorize('update', $operation);

        $this->operationService->updateOperation(
            $operation,
            $request->validated()
        );

        return redirect()
            ->route('operations.show', $operation)
            ->with('success', 'Operation updated successfully.');
    }

    public function destroy(Operation $operation): RedirectResponse
    {
        Gate::authorize('delete', $operation);

        $this->operationService->deleteOperation($operation);

        return redirect()
            ->route('operations.index')
            ->with('success', 'Operation deleted successfully.');
    }
}