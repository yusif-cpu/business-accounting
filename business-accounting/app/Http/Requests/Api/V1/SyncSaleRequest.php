<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class SyncSaleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'external_id' => [
                'required',
                'string',
                'max:255',
            ],

            'customer_external_id' => [
                'nullable',
                'string',
                'max:255',
            ],

            'amount' => [
                'required',
                'numeric',
                'min:0.01',
            ],

            'status_slug' => [
                'nullable',
                'string',
                'max:255',
            ],

            'sold_at' => [
                'nullable',
                'date',
            ],
        ];
    }
}