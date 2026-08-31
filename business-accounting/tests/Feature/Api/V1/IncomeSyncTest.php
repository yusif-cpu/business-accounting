<?php

namespace Tests\Feature\Api\V1;

use App\Models\Business;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class IncomeSyncTest extends TestCase
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

    public function test_income_can_be_created_via_sync(): void
    {
        $business = Business::create([
            'business_name' =>
                'Test Business',
        ]);

        $this->actingAsIntegration($business);

        $response = $this->postJson(
            '/api/v1/incomes',
            [
                'external_id' =>
                    'shop-income-001',

                'description' =>
                    'Consulting fee',

                'amount' =>
                    250,

                'operation_date' =>
                    '2026-08-25',
            ]
        );

        $response->assertCreated();
        $response->assertJson([
            'created' => true,
        ]);

        $this->assertDatabaseHas(
            'operations',
            [
                'business_id' =>
                    $business->id,

                'external_id' =>
                    'shop-income-001',

                'type' =>
                    'income',

                'description' =>
                    'Consulting fee',

                'amount' =>
                    250,

                'category_id' =>
                    null,

                'currency' =>
                    'AZN',
            ]
        );
    }

    public function test_syncing_same_income_updates_it_instead_of_duplicating(): void
    {
        $business = Business::create([
            'business_name' =>
                'Test Business',
        ]);

        $this->actingAsIntegration($business);

        $payload = [
            'external_id' =>
                'shop-income-001',

            'description' =>
                'Consulting fee',

            'amount' =>
                100,

            'operation_date' =>
                '2026-08-25',
        ];

        $first = $this->postJson('/api/v1/incomes', $payload);
        $first->assertCreated();
        $first->assertJson(['created' => true]);

        $payload['description'] = 'Consulting fee (updated)';
        $payload['amount'] = 175;

        $second = $this->postJson('/api/v1/incomes', $payload);
        $second->assertOk();
        $second->assertJson(['created' => false]);

        $this->assertDatabaseCount('operations', 1);

        $this->assertDatabaseHas(
            'operations',
            [
                'business_id' =>
                    $business->id,

                'external_id' =>
                    'shop-income-001',

                'type' =>
                    'income',

                'description' =>
                    'Consulting fee (updated)',

                'amount' =>
                    175,
            ]
        );
    }

    public function test_income_can_be_created_with_an_existing_category(): void
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
                'income',

            'name' =>
                'Consulting',
        ]);

        $response = $this->postJson(
            '/api/v1/incomes',
            [
                'external_id' =>
                    'shop-income-002',

                'description' =>
                    'Consulting revenue',

                'amount' =>
                    500,

                'category_name' =>
                    'Consulting',
            ]
        );

        $response->assertCreated();

        $this->assertDatabaseHas(
            'operations',
            [
                'external_id' =>
                    'shop-income-002',

                'type' =>
                    'income',

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
            '/api/v1/incomes',
            [
                'external_id' =>
                    'shop-income-003',

                'description' =>
                    'Mystery income',

                'amount' =>
                    10,

                'category_name' =>
                    'Nonexistent Category',
            ]
        );

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('category_name');

        $this->assertDatabaseMissing(
            'operations',
            [
                'external_id' =>
                    'shop-income-003',
            ]
        );
    }

    public function test_sync_fails_for_expense_category_used_as_income_category(): void
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
                'expense',

            'name' =>
                'Office Supplies',
        ]);

        $response = $this->postJson(
            '/api/v1/incomes',
            [
                'external_id' =>
                    'shop-income-004',

                'description' =>
                    'Should fail',

                'amount' =>
                    10,

                'category_name' =>
                    'Office Supplies',
            ]
        );

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('category_name');
    }

    public function test_income_sync_is_scoped_to_business(): void
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
                'income',

            'name' =>
                'Consulting',
        ]);

        $this->actingAsIntegration($businessA);

        $response = $this->postJson(
            '/api/v1/incomes',
            [
                'external_id' =>
                    'shop-income-005',

                'description' =>
                    'Cross business attempt',

                'amount' =>
                    10,

                'category_name' =>
                    'Consulting',
            ]
        );

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('category_name');

        $this->assertDatabaseMissing(
            'operations',
            [
                'external_id' =>
                    'shop-income-005',
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
            '/api/v1/incomes',
            [
                'external_id' =>
                    'shared-income-001',

                'description' =>
                    'Business A income',

                'amount' =>
                    10,
            ]
        )->assertCreated();

        $this->actingAsIntegration($businessB);

        $this->postJson(
            '/api/v1/incomes',
            [
                'external_id' =>
                    'shared-income-001',

                'description' =>
                    'Business B income',

                'amount' =>
                    20,
            ]
        )->assertCreated();

        $this->assertDatabaseCount('operations', 2);
    }

    public function test_income_sync_does_not_affect_expense_operations(): void
    {
        $business = Business::create([
            'business_name' =>
                'Test Business',
        ]);

        $this->actingAsIntegration($business);

        $response = $this->postJson(
            '/api/v1/incomes',
            [
                'external_id' =>
                    'shop-income-006',

                'description' =>
                    'Income only',

                'amount' =>
                    30,
            ]
        );

        $response->assertCreated();

        $this->assertDatabaseHas(
            'operations',
            [
                'external_id' =>
                    'shop-income-006',

                'type' =>
                    'income',
            ]
        );

        $this->assertDatabaseMissing(
            'operations',
            [
                'external_id' =>
                    'shop-income-006',

                'type' =>
                    'expense',
            ]
        );
    }
}
