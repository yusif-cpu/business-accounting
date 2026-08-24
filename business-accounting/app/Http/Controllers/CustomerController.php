<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Models\Customer;
use App\Services\CustomerDocumentService;
use App\Services\CustomerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function __construct(
        private CustomerService $customerService,
        private CustomerDocumentService $documentService
    ) {}

    public function index(
        Request $request
    ): Response {
        $search =
            $request
                ->string('search')
                ->trim()
                ->toString();

        $customers =
            $this->customerService
                ->getCustomersForCurrentBusiness(
                    $search ?: null
                );

        return Inertia::render(
            'Customers/Index',
            [
                'customers' =>
                    $customers,

                'filters' => [
                    'search' =>
                        $search,
                ],
            ]
        );
    }

    public function create(): Response
    {
        return Inertia::render(
            'Customers/Create'
        );
    }

    public function store(
        StoreCustomerRequest $request
    ): RedirectResponse {
        $validated =
            $request->validated();

        $customer =
            $this->customerService
                ->createCustomer(
                    auth()->user()->business_id,
                    [
                        'name' =>
                            $validated['name'],

                        'email' =>
                            $validated['email'] ??
                            null,

                        'phone' =>
                            $validated['phone'] ??
                            null,
                    ]
                );

        foreach (
            $request->file(
                'documents',
                []
            ) as $file
        ) {
            $this->documentService->upload(
                $customer,
                $file
            );
        }

        return redirect()
            ->route(
                'customers.show',
                $customer
            )
            ->with(
                'success',
                'Customer created successfully.'
            );
    }

    public function show(
        Customer $customer
    ): Response {
        Gate::authorize(
            'view',
            $customer
        );

        $customer->load([
            'operations.category',
            'documents',
        ]);

        $totalIncome =
            $customer->operations
                ->where(
                    'type',
                    'income'
                )
                ->sum('amount');

        $totalExpenses =
            $customer->operations
                ->where(
                    'type',
                    'expense'
                )
                ->sum('amount');

        $balance =
            $totalIncome -
            $totalExpenses;

        return Inertia::render(
            'Customers/Show',
            [
                'customer' =>
                    $customer,

                'totalIncome' =>
                    $totalIncome,

                'totalExpenses' =>
                    $totalExpenses,

                'balance' =>
                    $balance,
            ]
        );
    }

    public function edit(
        Customer $customer
    ): Response {
        Gate::authorize(
            'update',
            $customer
        );

        $customer->load([
            'documents',
        ]);

        return Inertia::render(
            'Customers/Edit',
            [
                'customer' =>
                    $customer,
            ]
        );
    }

    public function update(
        UpdateCustomerRequest $request,
        Customer $customer
    ): RedirectResponse {
        Gate::authorize(
            'update',
            $customer
        );

        $validated =
            $request->validated();

        $this->customerService
            ->updateCustomer(
                $customer,
                [
                    'name' =>
                        $validated['name'],

                    'email' =>
                        $validated['email'] ??
                        null,

                    'phone' =>
                        $validated['phone'] ??
                        null,
                ]
            );

        foreach (
            $request->file(
                'documents',
                []
            ) as $file
        ) {
            $this->documentService->upload(
                $customer,
                $file
            );
        }

        return redirect()
            ->route(
                'customers.edit',
                $customer
            )
            ->with(
                'success',
                'Customer updated successfully.'
            );
    }

    public function destroy(
        Customer $customer
    ): RedirectResponse {
        Gate::authorize(
            'delete',
            $customer
        );

        $this->customerService
            ->deleteCustomer(
                $customer
            );

        return redirect()
            ->route(
                'customers.index'
            )
            ->with(
                'success',
                'Customer deleted successfully.'
            );
    }
}