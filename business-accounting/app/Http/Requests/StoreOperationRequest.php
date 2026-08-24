<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOperationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'type' => [
                'required',
                'in:expense,income',
            ],

            'operation_date' => [
                'required',
                'date',
            ],

            'currency' => [
                'required',
                'string',
                'size:3',
            ],

            'amount' => [
                'required',
                'numeric',
                'min:0.01',
            ],

            'category_id' => [
                'nullable',
                'integer',
                Rule::exists('categories', 'id')
                    ->where(
                        fn ($query) => $query
                            ->where(
                                'business_id',
                                auth()->user()->business_id
                            )
                            ->where(
                                'type',
                                $this->input('type')
                            )
                    ),
            ],

            'customer_id' => [
                'nullable',
                Rule::exists('customers', 'id')->where(
                    fn ($query) => $query->where(
                        'business_id',
                        auth()->user()->business_id
                    )
                ),
            ],

            'description' => [
                'required',
                'string',
                'max:255',
            ],

            'note' => [
                'nullable',
                'string',
            ],
        ];
    }
}