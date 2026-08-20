<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\Expense;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExpenseTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_an_expense_for_their_business(): void
    {
        $business = Business::create([
            'business_name' => 'Test Business',
        ]);

        $user = User::factory()->create([
            'business_id' => $business->id,
        ]);

        $response = $this
            ->actingAs($user)
            ->post('/expenses', [
                'description' => 'Office Rent',
                'amount' => 500,
                'category' => 'Rent',
                'expense_date' => '2026-08-20',
            ]);

        $response->assertRedirect('/expenses');

        $this->assertDatabaseHas('expenses', [
            'business_id' => $business->id,
            'description' => 'Office Rent',
            'amount' => 500,
            'category' => 'Rent',
            'expense_date' => '2026-08-20',
        ]);
    }

    public function test_user_cannot_update_another_business_expense(): void
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

        $expenseB = Expense::create([
            'business_id' => $businessB->id,
            'description' => 'Business B Expense',
            'amount' => 250,
            'category' => 'Utilities',
            'expense_date' => '2026-08-20',
        ]);

        $response = $this
            ->actingAs($userA)
            ->put("/expenses/{$expenseB->id}", [
                'description' => 'Hacked Expense',
                'amount' => 1,
                'category' => 'Test',
                'expense_date' => '2026-08-20',
            ]);

        $response->assertForbidden();

        $this->assertDatabaseHas('expenses', [
            'id' => $expenseB->id,
            'business_id' => $businessB->id,
            'description' => 'Business B Expense',
        ]);
    }

    public function test_user_cannot_delete_another_business_expense(): void
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

        $expenseB = Expense::create([
            'business_id' => $businessB->id,
            'description' => 'Business B Expense',
            'amount' => 250,
            'category' => 'Utilities',
            'expense_date' => '2026-08-20',
        ]);

        $response = $this
            ->actingAs($userA)
            ->delete("/expenses/{$expenseB->id}");

        $response->assertForbidden();

        $this->assertDatabaseHas('expenses', [
            'id' => $expenseB->id,
        ]);
    }
}