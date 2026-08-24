<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Operation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_their_customer(): void
    {
        $business = Business::create([
            'business_name' => 'Test Business',
        ]);

        $user = User::factory()->create([
            'business_id' => $business->id,
        ]);

        $customer = Customer::create([
            'business_id' => $business->id,
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '+994501234567',
        ]);

        $response = $this
            ->actingAs($user)
            ->get("/customers/{$customer->id}");

        $response->assertOk();

        $response->assertInertia(fn ($page) =>
            $page
                ->component('Customers/Show')
                ->where('customer.id', $customer->id)
                ->where('customer.name', 'John Doe')
        );
    }

    public function test_user_cannot_view_another_business_customer(): void
    {
        $businessA = Business::create([
            'business_name' => 'Business A',
        ]);

        $businessB = Business::create([
            'business_name' => 'Business B',
        ]);

        $userA = User::factory()->create([
            'business_id' => $businessA->id,
        ]);

        $customerB = Customer::create([
            'business_id' => $businessB->id,
            'name' => 'Business B Customer',
            'email' => 'customer@example.com',
            'phone' => null,
        ]);

        $response = $this
            ->actingAs($userA)
            ->get("/customers/{$customerB->id}");

        $response->assertForbidden();
    }

    public function test_customer_overview_calculates_income_correctly(): void
    {
        $business = Business::create([
            'business_name' => 'Test Business',
        ]);

        $user = User::factory()->create([
            'business_id' => $business->id,
        ]);

        $customer = Customer::create([
            'business_id' => $business->id,
            'name' => 'John Doe',
            'email' => null,
            'phone' => null,
        ]);

        $category = Category::create([
            'business_id' => $business->id,
            'type' => 'income',
            'name' => 'Sales',
        ]);

        Operation::create([
            'business_id' => $business->id,
            'customer_id' => $customer->id,
            'type' => 'income',
            'operation_date' => '2026-08-24',
            'currency' => 'AZN',
            'amount' => 500,
            'category_id' => $category->id,
            'description' => 'Customer payment',
            'note' => null,
        ]);

        Operation::create([
            'business_id' => $business->id,
            'customer_id' => $customer->id,
            'type' => 'income',
            'operation_date' => '2026-08-24',
            'currency' => 'AZN',
            'amount' => 300,
            'category_id' => $category->id,
            'description' => 'Second payment',
            'note' => null,
        ]);

        $response = $this
            ->actingAs($user)
            ->get("/customers/{$customer->id}");

        $response->assertOk();

        $response->assertInertia(fn ($page) =>
            $page->where('totalIncome', 800)
        );
    }

    public function test_customer_overview_calculates_expenses_correctly(): void
    {
        $business = Business::create([
            'business_name' => 'Test Business',
        ]);

        $user = User::factory()->create([
            'business_id' => $business->id,
        ]);

        $customer = Customer::create([
            'business_id' => $business->id,
            'name' => 'John Doe',
            'email' => null,
            'phone' => null,
        ]);

        $category = Category::create([
            'business_id' => $business->id,
            'type' => 'expense',
            'name' => 'Service',
        ]);

        Operation::create([
            'business_id' => $business->id,
            'customer_id' => $customer->id,
            'type' => 'expense',
            'operation_date' => '2026-08-24',
            'currency' => 'AZN',
            'amount' => 150,
            'category_id' => $category->id,
            'description' => 'Service expense',
            'note' => null,
        ]);

        Operation::create([
            'business_id' => $business->id,
            'customer_id' => $customer->id,
            'type' => 'expense',
            'operation_date' => '2026-08-24',
            'currency' => 'AZN',
            'amount' => 50,
            'category_id' => $category->id,
            'description' => 'Additional expense',
            'note' => null,
        ]);

        $response = $this
            ->actingAs($user)
            ->get("/customers/{$customer->id}");

        $response->assertOk();

        $response->assertInertia(fn ($page) =>
            $page->where('totalExpenses', 200)
        );
    }

    public function test_customer_overview_calculates_balance_correctly(): void
    {
        $business = Business::create([
            'business_name' => 'Test Business',
        ]);

        $user = User::factory()->create([
            'business_id' => $business->id,
        ]);

        $customer = Customer::create([
            'business_id' => $business->id,
            'name' => 'John Doe',
            'email' => null,
            'phone' => null,
        ]);

        $incomeCategory = Category::create([
            'business_id' => $business->id,
            'type' => 'income',
            'name' => 'Sales',
        ]);

        $expenseCategory = Category::create([
            'business_id' => $business->id,
            'type' => 'expense',
            'name' => 'Delivery',
        ]);

        Operation::create([
            'business_id' => $business->id,
            'customer_id' => $customer->id,
            'type' => 'income',
            'operation_date' => '2026-08-24',
            'currency' => 'AZN',
            'amount' => 1000,
            'category_id' => $incomeCategory->id,
            'description' => 'Income',
            'note' => null,
        ]);

        Operation::create([
            'business_id' => $business->id,
            'customer_id' => $customer->id,
            'type' => 'expense',
            'operation_date' => '2026-08-24',
            'currency' => 'AZN',
            'amount' => 350,
            'category_id' => $expenseCategory->id,
            'description' => 'Expense',
            'note' => null,
        ]);

        $response = $this
            ->actingAs($user)
            ->get("/customers/{$customer->id}");

        $response->assertOk();

        $response->assertInertia(fn ($page) =>
            $page
                ->where('totalIncome', 1000)
                ->where('totalExpenses', 350)
                ->where('balance', 650)
        );
    }

    public function test_customer_overview_only_contains_that_customers_operations(): void
    {
        $business = Business::create([
            'business_name' => 'Test Business',
        ]);

        $user = User::factory()->create([
            'business_id' => $business->id,
        ]);

        $customerA = Customer::create([
            'business_id' => $business->id,
            'name' => 'Customer A',
            'email' => null,
            'phone' => null,
        ]);

        $customerB = Customer::create([
            'business_id' => $business->id,
            'name' => 'Customer B',
            'email' => null,
            'phone' => null,
        ]);

        $category = Category::create([
            'business_id' => $business->id,
            'type' => 'income',
            'name' => 'Sales',
        ]);

        Operation::create([
            'business_id' => $business->id,
            'customer_id' => $customerA->id,
            'type' => 'income',
            'operation_date' => '2026-08-24',
            'currency' => 'AZN',
            'amount' => 500,
            'category_id' => $category->id,
            'description' => 'Customer A operation',
            'note' => null,
        ]);

        Operation::create([
            'business_id' => $business->id,
            'customer_id' => $customerB->id,
            'type' => 'income',
            'operation_date' => '2026-08-24',
            'currency' => 'AZN',
            'amount' => 900,
            'category_id' => $category->id,
            'description' => 'Customer B operation',
            'note' => null,
        ]);

        $response = $this
            ->actingAs($user)
            ->get("/customers/{$customerA->id}");

        $response->assertOk();

        $response->assertInertia(fn ($page) =>
            $page->where(
                'customer.operations',
                function ($operations) {
                    return count($operations) === 1
                        && $operations[0]['description'] === 'Customer A operation';
                }
            )
        );
    }
}