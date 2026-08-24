<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
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
                Rule::in(['expense', 'income']),
            ],

            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('categories', 'name')
                    ->ignore($this->route('category'))
                    ->where(
                        fn ($query) => $query
                            ->where(
                                'business_id',
                                auth()->user()->business_id
                            )
                            ->where('type', $this->input('type'))
                    ),
            ],
        ];
    }
}