<?php

namespace App\Http\Requests;

use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class JournalFilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'date_from' => [
                'nullable',
                'date',
            ],

            'date_to' => [
                'nullable',
                'date',
                'after_or_equal:date_from',
            ],
        ];
    }

    public function withValidator(
        Validator $validator
    ): void {
        $validator->after(function (Validator $validator) {
            $dateFrom = $this->input('date_from');

            if (!$dateFrom) {
                return;
            }

            try {
                $from = Carbon::parse($dateFrom);

                $to = $this->input('date_to')
                    ? Carbon::parse($this->input('date_to'))
                    : Carbon::now();
            } catch (\Exception) {
                return;
            }

            if ($from->diffInDays($to) > 366) {
                $validator->errors()->add(
                    'date_to',
                    'The date range may not exceed 366 days.'
                );
            }
        });
    }

    public function filters(): array
    {
        $validated = $this->validated();

        $dateTo = $validated['date_to']
            ?? now()->toDateString();

        $dateFrom = $validated['date_from']
            ?? Carbon::parse($dateTo)
                ->subDays(29)
                ->toDateString();

        return [
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
        ];
    }
}
