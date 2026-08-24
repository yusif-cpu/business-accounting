<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CategoryService
{
    public function getCategoriesForCurrentBusiness(): LengthAwarePaginator
    {
        return Category::where(
            'business_id',
            auth()->user()->business_id
        )
            ->orderBy('type')
            ->orderBy('name')
            ->paginate(20);
    }

    public function createCategory(
        int $businessId,
        array $data
    ): Category {
        return Category::create([
            'business_id' => $businessId,
            'type' => $data['type'],
            'name' => $data['name'],
        ]);
    }

    public function updateCategory(
        Category $category,
        array $data
    ): Category {
        $category->update([
            'type' => $data['type'],
            'name' => $data['name'],
        ]);

        return $category->fresh();
    }

    public function deleteCategory(Category $category): void
    {
        $category->delete();
    }
}