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

    public function rules(): array
    {
        return [
            'customer_id' => [
                'nullable',
                Rule::exists('customers', 'id')->where(
                    fn ($query) => $query->where(
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
        ];
    }
}