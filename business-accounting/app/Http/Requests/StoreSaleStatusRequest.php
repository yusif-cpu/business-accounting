<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSaleStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:100',

                Rule::unique('sale_statuses', 'name')
                    ->where(
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