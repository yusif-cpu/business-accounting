<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class SyncPaymentRequest extends FormRequest
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

            'sale_external_id' => [
                'required',
                'string',
                'max:255',
            ],

            'amount' => [
                'required',
                'numeric',
                'min:0.01',
            ],

            'payment_source' => [
                'nullable',
                'string',
                'in:cart2cart,cash,company_bank_account,deposit',
            ],

            'paid_at' => [
                'nullable',
                'date',
            ],
        ];
    }
}
