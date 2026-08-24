<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSaleStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        $status = $this->route('saleStatus');

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
                    )
                    ->ignore($status?->id),
            ],
        ];
    }
}