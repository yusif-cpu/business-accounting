<?php

namespace Tests\Feature\Auth;

use App\Models\SaleStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        $response = $this->post('/register', [
            'business_name' => 'Test Business',
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();

        $response->assertRedirect(
            route('dashboard', absolute: false)
        );

        $user = User::where(
            'email',
            'test@example.com'
        )->first();

        $this->assertNotNull($user);

        $this->assertNotNull($user->business_id);

        $this->assertDatabaseHas('businesses', [
            'id' => $user->business_id,
            'business_name' => 'Test Business',
        ]);
    }

    public function test_registration_creates_default_sale_statuses_for_the_business(): void
    {
        $this->post('/register', [
            'business_name' => 'Test Business',
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $user = User::where(
            'email',
            'test@example.com'
        )->firstOrFail();

        $statuses = SaleStatus::where(
            'business_id',
            $user->business_id
        )->get();

        $this->assertCount(3, $statuses);

        $this->assertDatabaseHas('sale_statuses', [
            'business_id' => $user->business_id,
            'slug' => 'pending',
            'name' => 'Pending',
            'is_default' => true,
        ]);

        $this->assertDatabaseHas('sale_statuses', [
            'business_id' => $user->business_id,
            'slug' => 'paid',
            'name' => 'Paid',
            'is_default' => false,
        ]);

        $this->assertDatabaseHas('sale_statuses', [
            'business_id' => $user->business_id,
            'slug' => 'cancelled',
            'name' => 'Cancelled',
            'is_default' => false,
        ]);
    }
}
