<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'description' => [
                'required',
                'string',
                'max:255',
            ],
            'amount' => [
                'required',
                'numeric',
                'min:0.01',
            ],
            'category' => [
                'nullable',
                'string',
                'max:100',
            ],
            'expense_date' => [
                'required',
                'date',
            ],
        ];
    }
}
