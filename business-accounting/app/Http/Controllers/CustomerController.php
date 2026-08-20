<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Services\CustomerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
        ]);

        $this->customerService->createCustomer(
            auth()->user()->business_id,
            $validated
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
        Request $request,
        Customer $customer
    ): RedirectResponse {
        $this->authorizeCustomer($customer);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
        ]);

        $this->customerService->updateCustomer(
            $customer,
            $validated
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
