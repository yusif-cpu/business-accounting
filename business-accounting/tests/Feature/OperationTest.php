<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\Category;
use App\Models\Operation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OperationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_an_expense_operation(): void
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
            'name' => 'Marketing',
        ]);

        $response = $this
            ->actingAs($user)
            ->post('/operations', [
                'type' => 'expense',
                'operation_date' => '2026-08-20',
                'currency' => 'AZN',
                'amount' => 250,
                'category_id' => $category->id,
                'customer_id' => null,
                'description' => 'Facebook advertising',
                'note' => null,
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('operations', [
            'business_id' => $business->id,
            'type' => 'expense',
            'amount' => 250,
            'category_id' => $category->id,
            'description' => 'Facebook advertising',
        ]);
    }

    public function test_user_can_create_an_income_operation(): void
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
            ->post('/operations', [
                'type' => 'income',
                'operation_date' => '2026-08-20',
                'currency' => 'AZN',
                'amount' => 1000,
                'category_id' => $category->id,
                'customer_id' => null,
                'description' => 'Customer payment',
                'note' => null,
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('operations', [
            'business_id' => $business->id,
            'type' => 'income',
            'amount' => 1000,
            'category_id' => $category->id,
            'description' => 'Customer payment',
        ]);
    }

    public function test_user_cannot_use_an_income_category_for_an_expense_operation(): void
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
            ->post('/operations', [
                'type' => 'expense',
                'operation_date' => '2026-08-20',
                'currency' => 'AZN',
                'amount' => 500,
                'category_id' => $category->id,
                'description' => 'Invalid expense',
            ]);

        $response->assertSessionHasErrors('category_id');

        $this->assertDatabaseMissing('operations', [
            'description' => 'Invalid expense',
        ]);
    }

    public function test_user_cannot_use_an_expense_category_for_an_income_operation(): void
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
            'name' => 'Marketing',
        ]);

        $response = $this
            ->actingAs($user)
            ->post('/operations', [
                'type' => 'income',
                'operation_date' => '2026-08-20',
                'currency' => 'AZN',
                'amount' => 500,
                'category_id' => $category->id,
                'description' => 'Invalid income',
            ]);

        $response->assertSessionHasErrors('category_id');

        $this->assertDatabaseMissing('operations', [
            'description' => 'Invalid income',
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
            'name' => 'Marketing',
        ]);

        $response = $this
            ->actingAs($userA)
            ->post('/operations', [
                'type' => 'expense',
                'operation_date' => '2026-08-20',
                'currency' => 'AZN',
                'amount' => 500,
                'category_id' => $categoryB->id,
                'description' => 'Invalid operation',
            ]);

        $response->assertSessionHasErrors('category_id');

        $this->assertDatabaseMissing('operations', [
            'business_id' => $businessA->id,
            'description' => 'Invalid operation',
        ]);
    }

    public function test_user_can_update_their_operation_category(): void
    {
        $business = Business::create([
            'business_name' => 'Test Business',
        ]);

        $user = User::factory()->create([
            'business_id' => $business->id,
        ]);

        $oldCategory = Category::create([
            'business_id' => $business->id,
            'type' => 'expense',
            'name' => 'Marketing',
        ]);

        $newCategory = Category::create([
            'business_id' => $business->id,
            'type' => 'expense',
            'name' => 'Office',
        ]);

        $operation = Operation::create([
            'business_id' => $business->id,
            'type' => 'expense',
            'operation_date' => '2026-08-20',
            'currency' => 'AZN',
            'amount' => 500,
            'category_id' => $oldCategory->id,
            'description' => 'Office expense',
        ]);

        $response = $this
            ->actingAs($user)
            ->put("/operations/{$operation->id}", [
                'type' => 'expense',
                'operation_date' => '2026-08-20',
                'currency' => 'AZN',
                'amount' => 500,
                'category_id' => $newCategory->id,
                'description' => 'Office expense',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('operations', [
            'id' => $operation->id,
            'category_id' => $newCategory->id,
        ]);
    }

    public function test_operation_belongs_to_category(): void
    {
        $business = Business::create([
            'business_name' => 'Test Business',
        ]);

        $category = Category::create([
            'business_id' => $business->id,
            'type' => 'expense',
            'name' => 'Marketing',
        ]);

        $operation = Operation::create([
            'business_id' => $business->id,
            'type' => 'expense',
            'operation_date' => '2026-08-20',
            'currency' => 'AZN',
            'amount' => 300,
            'category_id' => $category->id,
            'description' => 'Marketing expense',
        ]);

        $this->assertEquals(
            $category->id,
            $operation->category->id
        );
    }
}