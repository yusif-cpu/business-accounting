<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSaleRequest extends FormRequest
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
                'exists:customers,id',
            ],
            'amount' => [
                'required',
                'numeric',
                'min:0.01',
            ],
            'status' => [
                'required',
                'in:pending,paid,cancelled',
            ],
        ];
    }
}