<?php

namespace App\Services;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Collection;

class CustomerService
{
    public function getCustomersForCurrentBusiness(): Collection
    {
        return Customer::where(
            'business_id',
            auth()->user()->business_id
        )->latest()->get();
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