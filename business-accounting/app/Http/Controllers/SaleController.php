<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaleFilterRequest;
use App\Http\Requests\StoreSaleRequest;
use App\Http\Requests\UpdateSaleRequest;
use App\Models\Customer;
use App\Models\Sale;
use App\Models\SaleStatus;
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

    public function index(
        SaleFilterRequest $request
    ): Response {
        $businessId =
            auth()->user()->business_id;

        $filters =
            $request->filters();

        $sales =
            $this->saleService
                ->getSalesForCurrentBusiness(
                    $filters['search'],
                    $filters['customer_id'],
                    $filters['status_id'],
                    $filters['start_date'],
                    $filters['end_date']
                );

        $summary =
            $this->saleService
                ->getSalesSummary(
                    $filters['search'],
                    $filters['customer_id'],
                    $filters['status_id'],
                    $filters['start_date'],
                    $filters['end_date']
                );

        $customers = Customer::where(
            'business_id',
            $businessId
        )
            ->orderBy('name')
            ->get([
                'id',
                'name',
            ]);

        $statuses = SaleStatus::where(
            'business_id',
            $businessId
        )
            ->orderByDesc('is_default')
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'slug',
                'is_default',
            ]);

        return Inertia::render(
            'Sales/Index',
            [
                'sales' =>
                    $sales,

                'summary' =>
                    $summary,

                'customers' =>
                    $customers,

                'statuses' =>
                    $statuses,

                'filters' => [
                    'search' =>
                        $filters['search'] ?? '',

                    'customer_id' =>
                        $filters['customer_id']
                            ? (string) $filters['customer_id']
                            : '',

                    'status_id' =>
                        $filters['status_id']
                            ? (string) $filters['status_id']
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
        $businessId =
            auth()->user()->business_id;

        $customers = Customer::where(
            'business_id',
            $businessId
        )
            ->orderBy('name')
            ->get();

        $statuses = SaleStatus::where(
            'business_id',
            $businessId
        )
            ->orderByDesc('is_default')
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'slug',
                'is_default',
            ]);

        return Inertia::render(
            'Sales/Create',
            [
                'customers' =>
                    $customers,

                'statuses' =>
                    $statuses,
            ]
        );
    }

    public function store(
        StoreSaleRequest $request
    ): RedirectResponse {
        $this->saleService->createSale(
            auth()->user()->business_id,
            $request->validated()
        );

        return redirect()
            ->route('sales.index')
            ->with(
                'success',
                'Sale created successfully.'
            );
    }

    public function show(
        Sale $sale
    ): Response {
        Gate::authorize(
            'view',
            $sale
        );

        $sale->load([
            'customer',
            'status',

            'payments' => function ($query) {
                $query->latest(
                    'paid_at'
                );
            },
        ]);

        return Inertia::render(
            'Sales/Show',
            [
                'sale' =>
                    $sale,
            ]
        );
    }

    public function edit(
        Sale $sale
    ): Response {
        Gate::authorize(
            'update',
            $sale
        );

        $businessId =
            auth()->user()->business_id;

        $customers = Customer::where(
            'business_id',
            $businessId
        )
            ->orderBy('name')
            ->get();

        $statuses = SaleStatus::where(
            'business_id',
            $businessId
        )
            ->orderByDesc('is_default')
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'slug',
                'is_default',
            ]);

        $sale->load([
            'customer',
            'status',
        ]);

        return Inertia::render(
            'Sales/Edit',
            [
                'sale' =>
                    $sale,

                'customers' =>
                    $customers,

                'statuses' =>
                    $statuses,
            ]
        );
    }

    public function update(
        UpdateSaleRequest $request,
        Sale $sale
    ): RedirectResponse {
        Gate::authorize(
            'update',
            $sale
        );

        $this->saleService->updateSale(
            $sale,
            $request->validated()
        );

        return redirect()
            ->route('sales.index')
            ->with(
                'success',
                'Sale updated successfully.'
            );
    }

    public function destroy(
        Sale $sale
    ): RedirectResponse {
        Gate::authorize(
            'delete',
            $sale
        );

        $this->saleService->deleteSale(
            $sale
        );

        return redirect()
            ->route('sales.index')
            ->with(
                'success',
                'Sale deleted successfully.'
            );
    }
}