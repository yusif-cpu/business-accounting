<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\Expense;
use App\Models\Payment;
use App\Models\Sale;
use App\Models\User;
use App\Services\DashboardService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_calculates_financial_data_correctly(): void
    {
        $business = Business::create([
            'business_name' => 'Test Business',
        ]);

        $user = User::factory()->create([
            'business_id' => $business->id,
        ]);

        $saleOne = Sale::create([
            'business_id' => $business->id,
            'amount' => 500,
            'status' => 'pending',
            'sold_at' => now(),
        ]);

        $saleTwo = Sale::create([
            'business_id' => $business->id,
            'amount' => 300,
            'status' => 'pending',
            'sold_at' => now(),
        ]);

        Sale::create([
            'business_id' => $business->id,
            'amount' => 200,
            'status' => 'cancelled',
            'sold_at' => now(),
        ]);

        Payment::create([
            'sale_id' => $saleOne->id,
            'amount' => 300,
            'method' => 'cash',
            'paid_at' => now(),
        ]);

        Payment::create([
            'sale_id' => $saleTwo->id,
            'amount' => 100,
            'method' => 'card',
            'paid_at' => now(),
        ]);

        Expense::create([
            'business_id' => $business->id,
            'description' => 'Office Rent',
            'amount' => 150,
            'category' => 'Rent',
            'expense_date' => now()->toDateString(),
        ]);

        Expense::create([
            'business_id' => $business->id,
            'description' => 'Utilities',
            'amount' => 50,
            'category' => 'Utilities',
            'expense_date' => now()->toDateString(),
        ]);

        $data = app(DashboardService::class)
            ->getDashboardData($business->id);

        $this->assertSame(800.0, $data['totalSales']);
        $this->assertSame(400.0, $data['collected']);
        $this->assertSame(400.0, $data['outstanding']);
        $this->assertSame(200.0, $data['expenses']);
        $this->assertSame(600.0, $data['profit']);
        $this->assertSame(2, $data['salesCount']);
    }

    public function test_dashboard_does_not_include_another_business_data(): void
    {
        $businessA = Business::create([
            'business_name' => 'Business A',
        ]);

        $businessB = Business::create([
            'business_name' => 'Business B',
        ]);

        User::factory()->create([
            'business_id' => $businessA->id,
        ]);

        Sale::create([
            'business_id' => $businessA->id,
            'amount' => 500,
            'status' => 'pending',
            'sold_at' => now(),
        ]);

        Sale::create([
            'business_id' => $businessB->id,
            'amount' => 9999,
            'status' => 'pending',
            'sold_at' => now(),
        ]);

        Expense::create([
            'business_id' => $businessA->id,
            'description' => 'Rent',
            'amount' => 100,
            'category' => 'Rent',
            'expense_date' => now()->toDateString(),
        ]);

        Expense::create([
            'business_id' => $businessB->id,
            'description' => 'Big Expense',
            'amount' => 5000,
            'category' => 'Other',
            'expense_date' => now()->toDateString(),
        ]);

        $data = app(DashboardService::class)
            ->getDashboardData($businessA->id);

        $this->assertSame(500.0, $data['totalSales']);
        $this->assertSame(100.0, $data['expenses']);
        $this->assertSame(400.0, $data['profit']);
        $this->assertSame(1, $data['salesCount']);
    }

    public function test_dashboard_route_requires_authentication(): void
    {
        $response = $this->get('/dashboard');

        $response->assertRedirect('/login');
    }
}
