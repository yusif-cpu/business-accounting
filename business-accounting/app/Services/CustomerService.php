<?php

namespace App\Services;

use App\Models\Customer;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CustomerService
{
    public function getCustomersForCurrentBusiness(
        ?string $search = null
    ): LengthAwarePaginator {
        return Customer::where(
            'business_id',
            auth()->user()->business_id
        )
            ->when(
                $search,
                function ($query) use ($search) {
                    $query->where(function ($query) use (
                        $search
                    ) {
                        $query
                            ->where(
                                'name',
                                'like',
                                "%{$search}%"
                            )
                            ->orWhere(
                                'email',
                                'like',
                                "%{$search}%"
                            )
                            ->orWhere(
                                'phone',
                                'like',
                                "%{$search}%"
                            );
                    });
                }
            )
            ->latest()
            ->paginate(10)
            ->withQueryString();
    }

    public function createCustomer(
        int $businessId,
        array $data
    ): Customer {
        return Customer::create([
            'business_id' => $businessId,
            'name' => $data['name'],
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
        ]);
    }

    public function updateCustomer(
        Customer $customer,
        array $data
    ): Customer {
        $customer->update([
            'name' => $data['name'],
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
        ]);

        return $customer;
    }

    public function deleteCustomer(
        Customer $customer
    ): void {
        $customer->delete();
    }
}