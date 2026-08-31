<?php

namespace App\Http\Requests;

use App\Models\Sale;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\ValidationException;

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
                'max:'.$this->remainingAmount(),
            ],
            'payment_source' => [
                'required',
                'in:cart2cart,cash,company_bank_account,deposit',
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

        if ($sale->business_id !== auth()->user()->business_id) {
            throw ValidationException::withMessages([
                'sale' => 'You are not allowed to add a payment to this sale.',
            ]);
        }

        $paidAmount = (float) $sale->payments()->sum('amount');
        $saleAmount = (float) $sale->amount;

        return max(0, $saleAmount - $paidAmount);
    }
}
