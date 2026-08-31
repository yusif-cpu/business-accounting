<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\Category;
use App\Models\Expense;
use App\Models\Operation;
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

        $category = Category::create([
            'business_id' => $business->id,
            'type' => 'expense',
            'name' => 'Rent',
        ]);

        $response = $this
            ->actingAs($user)
            ->post('/expenses', [
                'description' => 'Office Rent',
                'amount' => 500,
                'category_id' => $category->id,
                'expense_date' => '2026-08-20',
            ]);

        $response->assertRedirect('/expenses');

        $this->assertDatabaseHas('expenses', [
            'business_id' => $business->id,
            'description' => 'Office Rent',
            'amount' => 500,
            'category_id' => $category->id,
            'expense_date' => '2026-08-20',
        ]);
    }

    public function test_user_cannot_use_another_business_category(): void
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

        $categoryB = Category::create([
            'business_id' => $businessB->id,
            'type' => 'expense',
            'name' => 'Rent',
        ]);

        $response = $this
            ->actingAs($userA)
            ->post('/expenses', [
                'description' => 'Invalid Expense',
                'amount' => 500,
                'category_id' => $categoryB->id,
                'expense_date' => '2026-08-20',
            ]);

        $response->assertSessionHasErrors('category_id');

        $this->assertDatabaseMissing('expenses', [
            'business_id' => $businessA->id,
            'description' => 'Invalid Expense',
        ]);
    }

    public function test_user_cannot_use_an_income_category_for_an_expense(): void
    {
        $business = Business::create([
            'business_name' => 'Test Business',
        ]);

        $user = User::factory()->create([
            'business_id' => $business->id,
        ]);

        $category = Category::create([
            'business_id' => $business->id,
            'type' => 'income',
            'name' => 'Customer Payment',
        ]);

        $response = $this
            ->actingAs($user)
            ->post('/expenses', [
                'description' => 'Invalid Expense',
                'amount' => 500,
                'category_id' => $category->id,
                'expense_date' => '2026-08-20',
            ]);

        $response->assertSessionHasErrors('category_id');
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

        $categoryB = Category::create([
            'business_id' => $businessB->id,
            'type' => 'expense',
            'name' => 'Utilities',
        ]);

        $expenseB = Expense::create([
            'business_id' => $businessB->id,
            'description' => 'Business B Expense',
            'amount' => 250,
            'category_id' => $categoryB->id,
            'expense_date' => '2026-08-20',
        ]);

        $response = $this
            ->actingAs($userA)
            ->put("/expenses/{$expenseB->id}", [
                'description' => 'Hacked Expense',
                'amount' => 1,
                'category_id' => $categoryB->id,
                'expense_date' => '2026-08-20',
            ]);

    $response->assertRedirect();

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

        $categoryB = Category::create([
            'business_id' => $businessB->id,
            'type' => 'expense',
            'name' => 'Utilities',
        ]);

        $expenseB = Expense::create([
            'business_id' => $businessB->id,
            'description' => 'Business B Expense',
            'amount' => 250,
            'category_id' => $categoryB->id,
            'expense_date' => '2026-08-20',
        ]);

        $response = $this
            ->actingAs($userA)
            ->delete("/expenses/{$expenseB->id}");

        $this->assertSame(403, $response->status());

        $this->assertDatabaseHas('expenses', [
            'id' => $expenseB->id,
        ]);
    }

    public function test_operation_expenses_appear_in_expenses_list_and_summary_without_double_counting(): void
    {
        $business = Business::create([
            'business_name' => 'Test Business',
        ]);

        $user = User::factory()->create([
            'business_id' => $business->id,
        ]);

        $category = Category::create([
            'business_id' => $business->id,
            'type' => 'expense',
            'name' => 'Rent',
        ]);

        $incomeCategory = Category::create([
            'business_id' => $business->id,
            'type' => 'income',
            'name' => 'Sales',
        ]);

        Expense::create([
            'business_id' => $business->id,
            'description' => 'Plain Expense',
            'amount' => 100,
            'category_id' => $category->id,
            'expense_date' => '2026-08-20',
        ]);

        Operation::create([
            'business_id' => $business->id,
            'type' => 'expense',
            'operation_date' => '2026-08-21',
            'currency' => 'AZN',
            'amount' => 50,
            'category_id' => $category->id,
            'description' => 'Operation Expense',
        ]);

        Operation::create([
            'business_id' => $business->id,
            'type' => 'income',
            'operation_date' => '2026-08-22',
            'currency' => 'AZN',
            'amount' => 999,
            'category_id' => $incomeCategory->id,
            'description' => 'Operation Income',
        ]);

        $response = $this
            ->actingAs($user)
            ->get('/expenses');

        $response->assertInertia(
            fn ($page) => $page
                ->where(
                    'summary.total',
                    150
                )
                ->where(
                    'summary.count',
                    2
                )
                ->where(
                    'expenses.data',
                    function ($data) {
                        $descriptions = collect($data)
                            ->pluck('description')
                            ->all();

                        return count($data) === 2
                            && in_array('Plain Expense', $descriptions, true)
                            && in_array('Operation Expense', $descriptions, true)
                            && !in_array('Operation Income', $descriptions, true);
                    }
                )
        );
    }

    public function test_operation_expense_is_not_editable_or_deletable_via_expense_routes(): void
    {
        $business = Business::create([
            'business_name' => 'Test Business',
        ]);

        $user = User::factory()->create([
            'business_id' => $business->id,
        ]);

        $category = Category::create([
            'business_id' => $business->id,
            'type' => 'expense',
            'name' => 'Rent',
        ]);

        $operation = Operation::create([
            'business_id' => $business->id,
            'type' => 'expense',
            'operation_date' => '2026-08-21',
            'currency' => 'AZN',
            'amount' => 50,
            'category_id' => $category->id,
            'description' => 'Operation Expense',
        ]);

        $response = $this
            ->actingAs($user)
            ->get("/expenses/{$operation->id}/edit");

        $response->assertStatus(404);
    }
}