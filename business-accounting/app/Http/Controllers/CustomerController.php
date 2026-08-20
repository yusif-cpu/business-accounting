<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Models\Customer;
use App\Services\CustomerService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function __construct(
        private CustomerService $customerService
    ) {
    }

    public function index(): Response
    {
        $customers = $this->customerService->getCustomersForCurrentBusiness();

        return Inertia::render('Customers/Index', [
            'customers' => $customers,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Customers/Create');
    }

    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        $this->customerService->createCustomer(
            auth()->user()->business_id,
            $request->validated()
        );

        return redirect()->route('customers.index');
    }

    public function edit(Customer $customer): Response
    {
        $this->authorizeCustomer($customer);

        return Inertia::render('Customers/Edit', [
            'customer' => $customer,
        ]);
    }

    public function update(
        UpdateCustomerRequest $request,
        Customer $customer
    ): RedirectResponse {
        $this->authorizeCustomer($customer);

        $this->customerService->updateCustomer(
            $customer,
            $request->validated()
        );

        return redirect()->route('customers.index');
    }

    public function destroy(Customer $customer): RedirectResponse
    {
        $this->authorizeCustomer($customer);

        $this->customerService->deleteCustomer($customer);

        return redirect()->route('customers.index');
    }

    private function authorizeCustomer(Customer $customer): void
    {
        abort_if(
            $customer->business_id !== auth()->user()->business_id,
            403
        );
    }
}