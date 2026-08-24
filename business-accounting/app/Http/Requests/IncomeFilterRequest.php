<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IncomeFilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        $businessId =
            auth()->user()->business_id;

        return [
            'search' => [
                'nullable',
                'string',
                'max:255',
            ],

            'category_id' => [
                'nullable',
                'integer',

                Rule::exists(
                    'categories',
                    'id'
                )->where(
                    fn ($query) =>
                        $query
                            ->where(
                                'business_id',
                                $businessId
                            )
                            ->where(
                                'type',
                                'income'
                            )
                ),
            ],

            'start_date' => [
                'nullable',
                'date',
                'before_or_equal:end_date',
            ],

            'end_date' => [
                'nullable',
                'date',
                'after_or_equal:start_date',
            ],
        ];
    }

    public function filters(): array
    {
        $validated = $this->validated();

        return [
            'search' =>
                isset($validated['search'])
                    ? trim($validated['search'])
                    : null,

            'category_id' =>
                $validated['category_id'] ?? null,

            'start_date' =>
                $validated['start_date'] ?? null,

            'end_date' =>
                $validated['end_date'] ?? null,
        ];
    }
}