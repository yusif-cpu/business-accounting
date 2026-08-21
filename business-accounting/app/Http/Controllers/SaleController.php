<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSaleRequest;
use App\Http\Requests\UpdateSaleRequest;
use App\Models\Customer;
use App\Models\Sale;
use App\Services\SaleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends Controller
{
    public function __construct(
        private SaleService $saleService
    ) {}

    public function index(): Response
    {
        $sales = $this->saleService->getSalesForCurrentBusiness();

        return Inertia::render('Sales/Index', [
            'sales' => $sales,
        ]);
    }

    public function create(): Response
    {
        $customers = Customer::where(
            'business_id',
            auth()->user()->business_id
        )->get();

        return Inertia::render('Sales/Create', [
            'customers' => $customers,
        ]);
    }

    public function store(StoreSaleRequest $request): RedirectResponse
    {
        $this->saleService->createSale(
            auth()->user()->business_id,
            $request->validated()
        );

        return redirect()
            ->route('sales.index')
            ->with('success', 'Sale created successfully.');
    }

    public function show(Sale $sale): Response
    {
        Gate::authorize('view', $sale);

        $sale->load([
            'customer',
            'payments' => function ($query) {
                $query->latest('paid_at');
            },
        ]);

        return Inertia::render('Sales/Show', [
            'sale' => $sale,
        ]);
    }

    public function edit(Sale $sale): Response
    {
        Gate::authorize('update', $sale);

        $customers = Customer::where(
            'business_id',
            auth()->user()->business_id
        )->get();

        return Inertia::render('Sales/Edit', [
            'sale' => $sale,
            'customers' => $customers,
        ]);
    }

    public function update(
        UpdateSaleRequest $request,
        Sale $sale
    ): RedirectResponse {
        Gate::authorize('update', $sale);

        $this->saleService->updateSale(
            $sale,
            $request->validated()
        );

        return redirect()
            ->route('sales.index')
            ->with('success', 'Sale updated successfully.');
    }

    public function destroy(Sale $sale): RedirectResponse
    {
        Gate::authorize('delete', $sale);

        $this->saleService->deleteSale($sale);

        return redirect()
            ->route('sales.index')
            ->with('success', 'Sale deleted successfully.');
    }
}
