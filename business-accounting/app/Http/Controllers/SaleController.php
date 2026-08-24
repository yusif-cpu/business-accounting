<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSaleRequest;
use App\Http\Requests\UpdateSaleRequest;
use App\Models\Customer;
use App\Models\Sale;
use App\Models\SaleStatus;
use App\Services\SaleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends Controller
{
    public function __construct(
        private SaleService $saleService
    ) {}

    public function index(
        Request $request
    ): Response {
        $businessId =
            auth()->user()->business_id;

        $search =
            $request->string(
                'search'
            )->trim()->toString();

        $customerId =
            $request->string(
                'customer_id'
            )->toString();

        $statusId =
            $request->string(
                'status_id'
            )->toString();

        $startDate =
            $request->string(
                'start_date'
            )->toString();

        $endDate =
            $request->string(
                'end_date'
            )->toString();

        $sales =
            $this->saleService
                ->getSalesForCurrentBusiness(
                    $search ?: null,
                    $customerId ?: null,
                    $statusId ?: null,
                    $startDate ?: null,
                    $endDate ?: null
                );

        $summary =
            $this->saleService
                ->getSalesSummary(
                    $search ?: null,
                    $customerId ?: null,
                    $statusId ?: null,
                    $startDate ?: null,
                    $endDate ?: null
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
                        $search,

                    'customer_id' =>
                        $customerId,

                    'status_id' =>
                        $statusId,

                    'start_date' =>
                        $startDate,

                    'end_date' =>
                        $endDate,
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