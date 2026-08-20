<?php

namespace App\Http\Requests;

use App\Models\Sale;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
                Rule::exists('customers', 'id')->where(
                    fn ($query) => $query->where(
                        'business_id',
                        auth()->user()->business_id
                    )
                ),
            ],
            'amount' => [
                'required',
                'numeric',
                'min:' . $this->minimumSaleAmount(),
            ],
            'status' => [
                'required',
                'in:pending,paid,cancelled',
            ],
        ];
    }

    private function minimumSaleAmount(): float
    {
        /** @var Sale $sale */
        $sale = $this->route('sale');

        return max(
            0.01,
            (float) $sale->payments()->sum('amount')
        );
    }
}