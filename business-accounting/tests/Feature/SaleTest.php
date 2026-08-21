<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SaleTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_a_sale_for_their_business(): void
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
            'phone' => '123456789',
        ]);

        $response = $this
            ->actingAs($user)
            ->post('/sales', [
                'customer_id' => $customer->id,
                'amount' => 100,
            ]);

        $response->assertRedirect('/sales');

        $this->assertDatabaseHas('sales', [
            'business_id' => $business->id,
            'customer_id' => $customer->id,
            'amount' => 100,
            'status' => 'pending',
        ]);
    }

    public function test_payment_cannot_exceed_remaining_sale_amount(): void
    {
        $business = Business::create([
            'business_name' => 'Test Business',
        ]);

        $user = User::factory()->create([
            'business_id' => $business->id,
        ]);

        $sale = Sale::create([
            'business_id' => $business->id,
            'amount' => 100,
            'status' => 'pending',
            'sold_at' => now(),
        ]);

        $response = $this
            ->actingAs($user)
            ->post("/sales/{$sale->id}/payments", [
                'amount' => 150,
                'method' => 'cash',
                'paid_at' => now()->format('Y-m-d H:i:s'),
            ]);

        $response->assertSessionHasErrors('amount');

        $this->assertDatabaseMissing('payments', [
            'sale_id' => $sale->id,
            'amount' => 150,
        ]);
    }

    public function test_full_payment_marks_sale_as_paid(): void
    {
        $business = Business::create([
            'business_name' => 'Test Business',
        ]);

        $user = User::factory()->create([
            'business_id' => $business->id,
        ]);

        $sale = Sale::create([
            'business_id' => $business->id,
            'amount' => 100,
            'status' => 'pending',
            'sold_at' => now(),
        ]);

        $response = $this
            ->actingAs($user)
            ->post("/sales/{$sale->id}/payments", [
                'amount' => 100,
                'method' => 'cash',
                'paid_at' => now()->format('Y-m-d H:i:s'),
            ]);

        $response->assertRedirect("/sales/{$sale->id}");

        $this->assertDatabaseHas('payments', [
            'sale_id' => $sale->id,
            'amount' => 100,
            'method' => 'cash',
        ]);

        $this->assertDatabaseHas('sales', [
            'id' => $sale->id,
            'status' => 'paid',
        ]);
    }

    public function test_partial_payment_keeps_sale_pending(): void
    {
        $business = Business::create([
            'business_name' => 'Test Business',
        ]);

        $user = User::factory()->create([
            'business_id' => $business->id,
        ]);

        $sale = Sale::create([
            'business_id' => $business->id,
            'amount' => 100,
            'status' => 'pending',
            'sold_at' => now(),
        ]);

        $this
            ->actingAs($user)
            ->post("/sales/{$sale->id}/payments", [
                'amount' => 40,
                'method' => 'card',
                'paid_at' => now()->format('Y-m-d H:i:s'),
            ]);

        $this->assertDatabaseHas('payments', [
            'sale_id' => $sale->id,
            'amount' => 40,
        ]);

        $this->assertDatabaseHas('sales', [
            'id' => $sale->id,
            'status' => 'pending',
        ]);
    }

    public function test_deleting_full_payment_returns_sale_to_pending(): void
    {
        $business = Business::create([
            'business_name' => 'Test Business',
        ]);

        $user = User::factory()->create([
            'business_id' => $business->id,
        ]);

        $sale = Sale::create([
            'business_id' => $business->id,
            'amount' => 100,
            'status' => 'paid',
            'sold_at' => now(),
        ]);

        $payment = Payment::create([
            'sale_id' => $sale->id,
            'amount' => 100,
            'method' => 'cash',
            'paid_at' => now(),
        ]);

        $response = $this
            ->actingAs($user)
            ->delete("/payments/{$payment->id}");

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseMissing('payments', [
            'id' => $payment->id,
        ]);

        $this->assertDatabaseHas('sales', [
            'id' => $sale->id,
            'status' => 'pending',
        ]);
    }

    public function test_user_cannot_delete_another_business_payment(): void
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

        $saleB = Sale::create([
            'business_id' => $businessB->id,
            'amount' => 100,
            'status' => 'paid',
            'sold_at' => now(),
        ]);

        $paymentB = Payment::create([
            'sale_id' => $saleB->id,
            'amount' => 100,
            'method' => 'cash',
            'paid_at' => now(),
        ]);

        $response = $this
            ->actingAs($userA)
            ->delete("/payments/{$paymentB->id}");

        $response->assertForbidden();

        $this->assertDatabaseHas('payments', [
            'id' => $paymentB->id,
        ]);
    }
}
