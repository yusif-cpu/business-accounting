<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaleFilterRequest extends FormRequest
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

            'customer_id' => [
                'nullable',
                'integer',

                Rule::exists(
                    'customers',
                    'id'
                )->where(
                    fn ($query) =>
                        $query->where(
                            'business_id',
                            $businessId
                        )
                ),
            ],

            'status_id' => [
                'nullable',
                'integer',

                Rule::exists(
                    'sale_statuses',
                    'id'
                )->where(
                    fn ($query) =>
                        $query->where(
                            'business_id',
                            $businessId
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

            'customer_id' =>
                $validated['customer_id'] ?? null,

            'status_id' =>
                $validated['status_id'] ?? null,

            'start_date' =>
                $validated['start_date'] ?? null,

            'end_date' =>
                $validated['end_date'] ?? null,
        ];
    }
}