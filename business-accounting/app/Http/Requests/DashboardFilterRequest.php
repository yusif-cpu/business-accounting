<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DashboardFilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
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
            'start_date' =>
                $validated['start_date'] ?? null,

            'end_date' =>
                $validated['end_date'] ?? null,
        ];
    }
}