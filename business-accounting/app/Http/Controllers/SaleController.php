<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\SaleService;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Customer;
use App\Models\Sale;
use Illuminate\Http\RedirectResponse;

class SaleController extends Controller
{
    public function __construct(private SaleService $saleService)
    {
    }

    public function index(): Response
    {
        $sales = $this->saleService->getSalesForCurrentBusiness();

        return Inertia::render('Sales/Index', [
            'sales' => $sales
        ]);
    }

    public function create(): Response
    {
        $customers = Customer::where('business_id', auth()->user()->business_id)->get();

        return Inertia::render('Sales/Create', [
            'customers' => $customers
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'customer_id' => ['nullable', 'exists:customers,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
        ]);

        $this->saleService->createSale(
            auth()->user()->business_id,
            $validated
        );

        return redirect()->route('sales.index');
    }

    public function edit(Sale $sale): Response
    {
        $this->authorizeSale($sale);

        $customers = Customer::where(
            'business_id',
            auth()->user()->business_id
        )->get();

        return Inertia::render('Sales/Edit', [
            'sale' => $sale,
            'customers' => $customers,
        ]);
    }

    public function update(Request $request, Sale $sale): RedirectResponse
    {
        $this->authorizeSale($sale);

        $validated = $request->validate([
            'customer_id' => ['nullable', 'exists:customers,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'status' => ['required', 'in:pending,paid,cancelled'],
        ]);

        $this->saleService->updateSale($sale, $validated);

        return redirect()->route('sales.index');
    }

    public function destroy(Sale $sale): RedirectResponse
    {
        $this->authorizeSale($sale);

        $this->saleService->deleteSale($sale);

        return redirect()->route('sales.index');
    }

    private function authorizeSale(Sale $sale): void
    {
        abort_if(
            $sale->business_id !== auth()->user()->business_id,
            403
        );
    }
}
