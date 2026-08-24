<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_category_belongs_to_a_business(): void
    {
        $business = Business::create([
            'business_name' => 'Test Business',
        ]);

        $category = Category::create([
            'business_id' => $business->id,
            'type' => 'expense',
            'name' => 'Marketing / reklam',
        ]);

        $this->assertEquals(
            $business->id,
            $category->business->id
        );
    }

    public function test_category_can_be_created_for_a_business(): void
    {
        $business = Business::create([
            'business_name' => 'Test Business',
        ]);

        $category = Category::create([
            'business_id' => $business->id,
            'type' => 'expense',
            'name' => 'Əmək haqqı',
        ]);

        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'business_id' => $business->id,
            'type' => 'expense',
            'name' => 'Əmək haqqı',
        ]);
    }

    public function test_expense_and_income_categories_can_have_the_same_name(): void
    {
        $business = Business::create([
            'business_name' => 'Test Business',
        ]);

        Category::create([
            'business_id' => $business->id,
            'type' => 'expense',
            'name' => 'Digər',
        ]);

        Category::create([
            'business_id' => $business->id,
            'type' => 'income',
            'name' => 'Digər',
        ]);

        $this->assertDatabaseCount('categories', 2);
    }

    public function test_same_category_cannot_be_created_twice_for_the_same_business_and_type(): void
    {
        $business = Business::create([
            'business_name' => 'Test Business',
        ]);

        Category::create([
            'business_id' => $business->id,
            'type' => 'expense',
            'name' => 'Marketing / reklam',
        ]);

        $this->expectException(\Illuminate\Database\QueryException::class);

        Category::create([
            'business_id' => $business->id,
            'type' => 'expense',
            'name' => 'Marketing / reklam',
        ]);
    }

    public function test_same_category_can_exist_for_different_businesses(): void
    {
        $businessA = Business::create([
            'business_name' => 'Business A',
        ]);

        $businessB = Business::create([
            'business_name' => 'Business B',
        ]);

        Category::create([
            'business_id' => $businessA->id,
            'type' => 'expense',
            'name' => 'Marketing / reklam',
        ]);

        Category::create([
            'business_id' => $businessB->id,
            'type' => 'expense',
            'name' => 'Marketing / reklam',
        ]);

        $this->assertDatabaseCount('categories', 2);
    }

    public function test_user_can_view_categories_for_their_business(): void
    {
        $business = Business::create([
            'business_name' => 'Test Business',
        ]);

        $user = User::factory()->create([
            'business_id' => $business->id,
        ]);

        Category::create([
            'business_id' => $business->id,
            'type' => 'expense',
            'name' => 'Marketing / reklam',
        ]);

        $response = $this
            ->actingAs($user)
            ->get('/categories');

        $response->assertOk();
    }

    public function test_user_can_create_a_category(): void
    {
        $business = Business::create([
            'business_name' => 'Test Business',
        ]);

        $user = User::factory()->create([
            'business_id' => $business->id,
        ]);

        $response = $this
            ->actingAs($user)
            ->post('/categories', [
                'type' => 'expense',
                'name' => 'Marketing / reklam',
            ]);

        $response->assertRedirect('/categories');

        $this->assertDatabaseHas('categories', [
            'business_id' => $business->id,
            'type' => 'expense',
            'name' => 'Marketing / reklam',
        ]);
    }

    public function test_user_cannot_create_duplicate_category_for_the_same_business_and_type(): void
    {
        $business = Business::create([
            'business_name' => 'Test Business',
        ]);

        $user = User::factory()->create([
            'business_id' => $business->id,
        ]);

        Category::create([
            'business_id' => $business->id,
            'type' => 'expense',
            'name' => 'Marketing / reklam',
        ]);

        $response = $this
            ->actingAs($user)
            ->post('/categories', [
                'type' => 'expense',
                'name' => 'Marketing / reklam',
            ]);

        $response->assertSessionHasErrors('name');
    }

    public function test_user_cannot_update_another_business_category(): void
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
            'name' => 'Marketing / reklam',
        ]);

        $response = $this
            ->actingAs($userA)
            ->put("/categories/{$categoryB->id}", [
                'type' => 'expense',
                'name' => 'Hacked Category',
            ]);

        $response->assertForbidden();

        $this->assertDatabaseHas('categories', [
            'id' => $categoryB->id,
            'business_id' => $businessB->id,
            'name' => 'Marketing / reklam',
        ]);
    }

    public function test_user_cannot_delete_another_business_category(): void
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
            'name' => 'Marketing / reklam',
        ]);

        $response = $this
            ->actingAs($userA)
            ->delete("/categories/{$categoryB->id}");

        $response->assertForbidden();

        $this->assertDatabaseHas('categories', [
            'id' => $categoryB->id,
        ]);
    }
}