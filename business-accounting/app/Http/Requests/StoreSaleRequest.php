<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSaleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    protected function prepareForValidation(): void
    {
        if (!$this->filled('status_id')) {
            $pendingStatusId = \App\Models\SaleStatus::where(
                'business_id',
                auth()->user()->business_id
            )
                ->where(
                    'slug',
                    'pending'
                )
                ->value('id');

            $this->merge([
                'status_id' => $pendingStatusId,
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'customer_id' => [
                'nullable',

                Rule::exists(
                    'customers',
                    'id'
                )->where(
                    fn ($query) =>
                        $query->where(
                            'business_id',
                            auth()->user()->business_id
                        )
                ),
            ],

            'amount' => [
                'required',
                'numeric',
                'min:0.01',
            ],

            'status_id' => [
                'required',

                Rule::exists(
                    'sale_statuses',
                    'id'
                )->where(
                    fn ($query) =>
                        $query->where(
                            'business_id',
                            auth()->user()->business_id
                        )
                ),
            ],
        ];
    }
}