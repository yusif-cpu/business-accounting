<?php

namespace App\Http\Requests;

use App\Models\Sale;
use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'amount' => [
                'required',
                'numeric',
                'min:0.01',
                'max:' . $this->remainingAmount(),
            ],
            'method' => [
                'required',
                'in:cash,card,bank_transfer',
            ],
            'paid_at' => [
                'required',
                'date',
            ],
        ];
    }

    private function remainingAmount(): float
    {
        /** @var Sale $sale */
        $sale = $this->route('sale');

        $paidAmount = (float) $sale->payments()->sum('amount');
        $saleAmount = (float) $sale->amount;

        return max(0, $saleAmount - $paidAmount);
    }
}