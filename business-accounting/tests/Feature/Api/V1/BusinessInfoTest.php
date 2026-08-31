<?php

namespace Tests\Feature\Api\V1;

use App\Models\Business;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BusinessInfoTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsIntegration(
        Business $business,
        array $abilities
    ): User {
        $user = User::factory()->create([
            'business_id' =>
                $business->id,
        ]);

        Sanctum::actingAs(
            $user,
            $abilities
        );

        return $user;
    }

    public function test_business_info_can_be_read(): void
    {
        $business = Business::create([
            'business_name' =>
                'Test Business',

            'phone' =>
                '123456789',

            'email' =>
                'contact@testbusiness.com',

            'address' =>
                '123 Main St',

            'website' =>
                'https://testbusiness.com',

            'tax_id' =>
                'TAX-001',

            'currency' =>
                'AZN',
        ]);

        $this->actingAsIntegration(
            $business,
            ['integration:read']
        );

        $response = $this->getJson('/api/v1/business');

        $response->assertOk();
        $response->assertJson([
            'data' => [
                'id' =>
                    $business->id,

                'business_name' =>
                    'Test Business',

                'phone' =>
                    '123456789',

                'email' =>
                    'contact@testbusiness.com',

                'address' =>
                    '123 Main St',

                'website' =>
                    'https://testbusiness.com',

                'tax_id' =>
                    'TAX-001',

                'currency' =>
                    'AZN',
            ],
        ]);
    }

    public function test_reading_business_info_requires_authentication(): void
    {
        $response = $this->getJson('/api/v1/business');

        $response->assertStatus(401);
    }

    public function test_reading_business_info_requires_integration_read_ability(): void
    {
        $business = Business::create([
            'business_name' =>
                'Test Business',
        ]);

        $this->actingAsIntegration(
            $business,
            ['integration:write']
        );

        $response = $this->getJson('/api/v1/business');

        $response->assertStatus(403);
    }

    public function test_business_info_can_be_updated(): void
    {
        $business = Business::create([
            'business_name' =>
                'Old Name',

            'currency' =>
                'AZN',
        ]);

        $this->actingAsIntegration(
            $business,
            ['integration:write']
        );

        $response = $this->putJson(
            '/api/v1/business',
            [
                'business_name' =>
                    'New Business Name',

                'phone' =>
                    '987654321',

                'email' =>
                    'new@testbusiness.com',

                'address' =>
                    '456 Elm St',

                'website' =>
                    'https://newbusiness.com',

                'tax_id' =>
                    'TAX-002',

                'currency' =>
                    'USD',
            ]
        );

        $response->assertOk();
        $response->assertJson([
            'data' => [
                'business_name' =>
                    'New Business Name',

                'currency' =>
                    'USD',
            ],
        ]);

        $this->assertDatabaseHas(
            'businesses',
            [
                'id' =>
                    $business->id,

                'business_name' =>
                    'New Business Name',

                'phone' =>
                    '987654321',

                'email' =>
                    'new@testbusiness.com',

                'address' =>
                    '456 Elm St',

                'website' =>
                    'https://newbusiness.com',

                'tax_id' =>
                    'TAX-002',

                'currency' =>
                    'USD',
            ]
        );
    }

    public function test_updating_business_info_requires_authentication(): void
    {
        $response = $this->putJson(
            '/api/v1/business',
            [
                'business_name' =>
                    'New Name',

                'currency' =>
                    'AZN',
            ]
        );

        $response->assertStatus(401);
    }

    public function test_updating_business_info_requires_integration_write_ability(): void
    {
        $business = Business::create([
            'business_name' =>
                'Test Business',
        ]);

        $this->actingAsIntegration(
            $business,
            ['integration:read']
        );

        $response = $this->putJson(
            '/api/v1/business',
            [
                'business_name' =>
                    'New Name',

                'currency' =>
                    'AZN',
            ]
        );

        $response->assertStatus(403);

        $this->assertDatabaseHas(
            'businesses',
            [
                'id' =>
                    $business->id,

                'business_name' =>
                    'Test Business',
            ]
        );
    }

    public function test_business_name_is_required_when_updating(): void
    {
        $business = Business::create([
            'business_name' =>
                'Test Business',
        ]);

        $this->actingAsIntegration(
            $business,
            ['integration:write']
        );

        $response = $this->putJson(
            '/api/v1/business',
            [
                'currency' =>
                    'AZN',
            ]
        );

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('business_name');
    }

    public function test_currency_must_be_a_supported_value(): void
    {
        $business = Business::create([
            'business_name' =>
                'Test Business',
        ]);

        $this->actingAsIntegration(
            $business,
            ['integration:write']
        );

        $response = $this->putJson(
            '/api/v1/business',
            [
                'business_name' =>
                    'Test Business',

                'currency' =>
                    'XXX',
            ]
        );

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('currency');
    }

    public function test_business_info_is_isolated_between_businesses(): void
    {
        $businessA = Business::create([
            'business_name' =>
                'Business A',

            'currency' =>
                'AZN',
        ]);

        $businessB = Business::create([
            'business_name' =>
                'Business B',

            'currency' =>
                'AZN',
        ]);

        $this->actingAsIntegration(
            $businessA,
            ['integration:write']
        );

        $this->putJson(
            '/api/v1/business',
            [
                'business_name' =>
                    'Business A Updated',

                'currency' =>
                    'USD',
            ]
        )->assertOk();

        $this->assertDatabaseHas(
            'businesses',
            [
                'id' =>
                    $businessA->id,

                'business_name' =>
                    'Business A Updated',

                'currency' =>
                    'USD',
            ]
        );

        $this->assertDatabaseHas(
            'businesses',
            [
                'id' =>
                    $businessB->id,

                'business_name' =>
                    'Business B',

                'currency' =>
                    'AZN',
            ]
        );
    }

    public function test_reading_business_info_returns_only_the_callers_own_business(): void
    {
        $businessA = Business::create([
            'business_name' =>
                'Business A',
        ]);

        Business::create([
            'business_name' =>
                'Business B',
        ]);

        $this->actingAsIntegration(
            $businessA,
            ['integration:read']
        );

        $response = $this->getJson('/api/v1/business');

        $response->assertOk();
        $response->assertJson([
            'data' => [
                'id' =>
                    $businessA->id,

                'business_name' =>
                    'Business A',
            ],
        ]);
    }
}
