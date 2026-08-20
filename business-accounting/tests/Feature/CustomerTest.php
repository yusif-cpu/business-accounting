<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_a_customer_for_their_business(): void
    {
        $business = Business::create([
            'business_name' => 'Test Business',
        ]);

        $user = User::factory()->create([
            'business_id' => $business->id,
        ]);

        $response = $this
            ->actingAs($user)
            ->post('/customers', [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'phone' => '123456789',
            ]);

        $response->assertRedirect('/customers');

        $this->assertDatabaseHas('customers', [
            'business_id' => $business->id,
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '123456789',
        ]);
    }

    public function test_user_cannot_update_another_business_customer(): void
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

        $customerB = \App\Models\Customer::create([
            'business_id' => $businessB->id,
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '123456789',
        ]);

        $response = $this
            ->actingAs($userA)
            ->put("/customers/{$customerB->id}", [
                'name' => 'Hacked Name',
                'email' => 'hacked@example.com',
                'phone' => '000000000',
            ]);

        $response->assertForbidden();

        $this->assertDatabaseHas('customers', [
            'id' => $customerB->id,
            'business_id' => $businessB->id,
            'name' => 'John Doe',
        ]);
    }

    public function test_user_cannot_create_sale_with_another_business_customer(): void
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

        $customerB = \App\Models\Customer::create([
            'business_id' => $businessB->id,
            'name' => 'Customer B',
            'email' => 'customerb@example.com',
            'phone' => '123456789',
        ]);

        $response = $this
            ->actingAs($userA)
            ->post('/sales', [
                'customer_id' => $customerB->id,
                'amount' => 100,
            ]);

        $response->assertSessionHasErrors('customer_id');

        $this->assertDatabaseMissing('sales', [
            'business_id' => $businessA->id,
            'customer_id' => $customerB->id,
            'amount' => 100,
        ]);
    }
}