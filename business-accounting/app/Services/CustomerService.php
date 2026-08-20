<?php

namespace App\Services;

use App\Models\Customer;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CustomerService
{
    public function getCustomersForCurrentBusiness(): LengthAwarePaginator
    {
        return Customer::where(
            'business_id',
            auth()->user()->business_id
        )
            ->latest()
            ->paginate(10);
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

    public function deleteCustomer(Customer $customer): void
    {
        $customer->delete();
    }
}
