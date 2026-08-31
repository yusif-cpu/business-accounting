<?php

namespace Tests\Feature\Api\V1;

use App\Models\Business;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ExpenseSyncTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsIntegration(
        Business $business
    ): User {
        $user = User::factory()->create([
            'business_id' =>
                $business->id,
        ]);

        Sanctum::actingAs(
            $user,
            ['integration:write']
        );

        return $user;
    }

    public function test_expense_can_be_created_via_sync(): void
    {
        $business = Business::create([
            'business_name' =>
                'Test Business',
        ]);

        $this->actingAsIntegration($business);

        $response = $this->postJson(
            '/api/v1/expenses',
            [
                'external_id' =>
                    'shop-expense-001',

                'description' =>
                    'Office supplies',

                'amount' =>
                    75.50,

                'expense_date' =>
                    '2026-08-25',
            ]
        );

        $response->assertCreated();
        $response->assertJson([
            'created' => true,
        ]);

        $this->assertDatabaseHas(
            'expenses',
            [
                'business_id' =>
                    $business->id,

                'external_id' =>
                    'shop-expense-001',

                'description' =>
                    'Office supplies',

                'amount' =>
                    75.50,

                'category_id' =>
                    null,
            ]
        );
    }

    public function test_syncing_same_expense_updates_it_instead_of_duplicating(): void
    {
        $business = Business::create([
            'business_name' =>
                'Test Business',
        ]);

        $this->actingAsIntegration($business);

        $payload = [
            'external_id' =>
                'shop-expense-001',

            'description' =>
                'Office supplies',

            'amount' =>
                40,

            'expense_date' =>
                '2026-08-25',
        ];

        $first = $this->postJson('/api/v1/expenses', $payload);
        $first->assertCreated();
        $first->assertJson(['created' => true]);

        $payload['description'] = 'Office supplies (updated)';
        $payload['amount'] = 60;

        $second = $this->postJson('/api/v1/expenses', $payload);
        $second->assertOk();
        $second->assertJson(['created' => false]);

        $this->assertDatabaseCount('expenses', 1);

        $this->assertDatabaseHas(
            'expenses',
            [
                'business_id' =>
                    $business->id,

                'external_id' =>
                    'shop-expense-001',

                'description' =>
                    'Office supplies (updated)',

                'amount' =>
                    60,
            ]
        );
    }

    public function test_expense_can_be_created_with_an_existing_category(): void
    {
        $business = Business::create([
            'business_name' =>
                'Test Business',
        ]);

        $this->actingAsIntegration($business);

        $category = Category::create([
            'business_id' =>
                $business->id,

            'type' =>
                'expense',

            'name' =>
                'Utilities',
        ]);

        $response = $this->postJson(
            '/api/v1/expenses',
            [
                'external_id' =>
                    'shop-expense-002',

                'description' =>
                    'Electricity bill',

                'amount' =>
                    120,

                'category_name' =>
                    'Utilities',
            ]
        );

        $response->assertCreated();

        $this->assertDatabaseHas(
            'expenses',
            [
                'external_id' =>
                    'shop-expense-002',

                'category_id' =>
                    $category->id,
            ]
        );
    }

    public function test_sync_fails_for_unknown_category_name(): void
    {
        $business = Business::create([
            'business_name' =>
                'Test Business',
        ]);

        $this->actingAsIntegration($business);

        $response = $this->postJson(
            '/api/v1/expenses',
            [
                'external_id' =>
                    'shop-expense-003',

                'description' =>
                    'Mystery charge',

                'amount' =>
                    10,

                'category_name' =>
                    'Nonexistent Category',
            ]
        );

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('category_name');

        $this->assertDatabaseMissing(
            'expenses',
            [
                'external_id' =>
                    'shop-expense-003',
            ]
        );
    }

    public function test_sync_fails_for_income_category_used_as_expense_category(): void
    {
        $business = Business::create([
            'business_name' =>
                'Test Business',
        ]);

        $this->actingAsIntegration($business);

        Category::create([
            'business_id' =>
                $business->id,

            'type' =>
                'income',

            'name' =>
                'Sales Revenue',
        ]);

        $response = $this->postJson(
            '/api/v1/expenses',
            [
                'external_id' =>
                    'shop-expense-004',

                'description' =>
                    'Should fail',

                'amount' =>
                    10,

                'category_name' =>
                    'Sales Revenue',
            ]
        );

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('category_name');
    }

    public function test_expense_sync_is_scoped_to_business(): void
    {
        $businessA = Business::create([
            'business_name' =>
                'Business A',
        ]);

        $businessB = Business::create([
            'business_name' =>
                'Business B',
        ]);

        Category::create([
            'business_id' =>
                $businessB->id,

            'type' =>
                'expense',

            'name' =>
                'Office',
        ]);

        $this->actingAsIntegration($businessA);

        $response = $this->postJson(
            '/api/v1/expenses',
            [
                'external_id' =>
                    'shop-expense-005',

                'description' =>
                    'Cross business attempt',

                'amount' =>
                    10,

                'category_name' =>
                    'Office',
            ]
        );

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('category_name');

        $this->assertDatabaseMissing(
            'expenses',
            [
                'external_id' =>
                    'shop-expense-005',
            ]
        );
    }

    public function test_same_external_id_can_be_used_by_different_businesses(): void
    {
        $businessA = Business::create([
            'business_name' =>
                'Business A',
        ]);

        $businessB = Business::create([
            'business_name' =>
                'Business B',
        ]);

        $this->actingAsIntegration($businessA);

        $this->postJson(
            '/api/v1/expenses',
            [
                'external_id' =>
                    'shared-expense-001',

                'description' =>
                    'Business A expense',

                'amount' =>
                    10,
            ]
        )->assertCreated();

        $this->actingAsIntegration($businessB);

        $this->postJson(
            '/api/v1/expenses',
            [
                'external_id' =>
                    'shared-expense-001',

                'description' =>
                    'Business B expense',

                'amount' =>
                    20,
            ]
        )->assertCreated();

        $this->assertDatabaseCount('expenses', 2);
    }
}
