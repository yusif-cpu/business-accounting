<?php

namespace Tests\Feature\Api\V1;

use App\Models\Business;
use App\Models\Sale;
use App\Models\SaleStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PaymentSyncTest extends TestCase
{
    use RefreshDatabase;

    private function createStatuses(
        Business $business
    ): array {
        return [
            'pending' => SaleStatus::create([
                'business_id' =>
                    $business->id,

                'name' =>
                    'Pending',

                'slug' =>
                    'pending',

                'is_default' =>
                    true,
            ]),

            'paid' => SaleStatus::create([
                'business_id' =>
                    $business->id,

                'name' =>
                    'Paid',

                'slug' =>
                    'paid',

                'is_default' =>
                    false,
            ]),
        ];
    }

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

    public function test_payment_can_be_created_via_sync(): void
    {
        $business = Business::create([
            'business_name' =>
                'Test Business',
        ]);

        $statuses =
            $this->createStatuses($business);

        $this->actingAsIntegration($business);

        $sale = Sale::create([
            'business_id' =>
                $business->id,

            'external_id' =>
                'shop-order-001',

            'amount' =>
                100,

            'status_id' =>
                $statuses['pending']->id,

            'sold_at' =>
                now(),
        ]);

        $response = $this->postJson(
            '/api/v1/payments',
            [
                'external_id' =>
                    'shop-payment-001',

                'sale_external_id' =>
                    'shop-order-001',

                'amount' =>
                    100,

                'paid_at' =>
                    now()->format('Y-m-d H:i:s'),
            ]
        );

        $response->assertCreated();
        $response->assertJson([
            'created' => true,
        ]);

        $this->assertDatabaseHas(
            'payments',
            [
                'business_id' =>
                    $business->id,

                'sale_id' =>
                    $sale->id,

                'external_id' =>
                    'shop-payment-001',

                'amount' =>
                    100,
            ]
        );

        $this->assertDatabaseHas(
            'sales',
            [
                'id' =>
                    $sale->id,

                'status_id' =>
                    $statuses['paid']->id,
            ]
        );
    }

    public function test_syncing_same_payment_updates_it_instead_of_duplicating(): void
    {
        $business = Business::create([
            'business_name' =>
                'Test Business',
        ]);

        $statuses =
            $this->createStatuses($business);

        $this->actingAsIntegration($business);

        Sale::create([
            'business_id' =>
                $business->id,

            'external_id' =>
                'shop-order-001',

            'amount' =>
                100,

            'status_id' =>
                $statuses['pending']->id,

            'sold_at' =>
                now(),
        ]);

        $payload = [
            'external_id' =>
                'shop-payment-001',

            'sale_external_id' =>
                'shop-order-001',

            'amount' =>
                40,

            'paid_at' =>
                now()->format('Y-m-d H:i:s'),
        ];

        $first = $this->postJson('/api/v1/payments', $payload);
        $first->assertCreated();
        $first->assertJson(['created' => true]);

        $payload['amount'] = 100;

        $second = $this->postJson('/api/v1/payments', $payload);
        $second->assertOk();
        $second->assertJson(['created' => false]);

        $this->assertDatabaseCount('payments', 1);

        $this->assertDatabaseHas(
            'payments',
            [
                'business_id' =>
                    $business->id,

                'external_id' =>
                    'shop-payment-001',

                'amount' =>
                    100,
            ]
        );

        $this->assertDatabaseHas(
            'sales',
            [
                'status_id' =>
                    $statuses['paid']->id,
            ]
        );
    }

    public function test_sync_fails_for_unknown_sale_external_id(): void
    {
        $business = Business::create([
            'business_name' =>
                'Test Business',
        ]);

        $this->createStatuses($business);

        $this->actingAsIntegration($business);

        $response = $this->postJson(
            '/api/v1/payments',
            [
                'external_id' =>
                    'shop-payment-001',

                'sale_external_id' =>
                    'does-not-exist',

                'amount' =>
                    50,
            ]
        );

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('sale_external_id');

        $this->assertDatabaseMissing(
            'payments',
            [
                'external_id' =>
                    'shop-payment-001',
            ]
        );
    }

    public function test_payment_sync_is_scoped_to_business(): void
    {
        $businessA = Business::create([
            'business_name' =>
                'Business A',
        ]);

        $businessB = Business::create([
            'business_name' =>
                'Business B',
        ]);

        $statusesB =
            $this->createStatuses($businessB);

        Sale::create([
            'business_id' =>
                $businessB->id,

            'external_id' =>
                'shop-order-001',

            'amount' =>
                100,

            'status_id' =>
                $statusesB['pending']->id,

            'sold_at' =>
                now(),
        ]);

        $this->actingAsIntegration($businessA);

        $response = $this->postJson(
            '/api/v1/payments',
            [
                'external_id' =>
                    'shop-payment-001',

                'sale_external_id' =>
                    'shop-order-001',

                'amount' =>
                    50,
            ]
        );

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('sale_external_id');
    }

    public function test_payment_created_without_payment_source_is_null(): void
    {
        $business = Business::create([
            'business_name' =>
                'Test Business',
        ]);

        $statuses =
            $this->createStatuses($business);

        $this->actingAsIntegration($business);

        Sale::create([
            'business_id' =>
                $business->id,

            'external_id' =>
                'shop-order-001',

            'amount' =>
                100,

            'status_id' =>
                $statuses['pending']->id,

            'sold_at' =>
                now(),
        ]);

        $response = $this->postJson(
            '/api/v1/payments',
            [
                'external_id' =>
                    'shop-payment-001',

                'sale_external_id' =>
                    'shop-order-001',

                'amount' =>
                    50,
            ]
        );

        $response->assertCreated();

        $this->assertDatabaseHas(
            'payments',
            [
                'external_id' =>
                    'shop-payment-001',

                'payment_source' =>
                    null,
            ]
        );
    }
}
