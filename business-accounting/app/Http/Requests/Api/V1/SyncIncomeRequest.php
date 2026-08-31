<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class SyncIncomeRequest extends FormRequest
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

            'category_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'currency' => [
                'nullable',
                'string',
                'size:3',
            ],

            'note' => [
                'nullable',
                'string',
            ],

            'operation_date' => [
                'nullable',
                'date',
            ],
        ];
    }
}
