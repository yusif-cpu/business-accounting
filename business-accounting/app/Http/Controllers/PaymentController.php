<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Sale;
use App\Services\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function __construct(
        private PaymentService $paymentService
    ) {
    }

    public function create(Sale $sale): Response
    {
        $this->authorizeSale($sale);

        return Inertia::render('Payments/Create', [
            'sale' => $sale,
        ]);
    }

    public function store(
        Request $request,
        Sale $sale
    ): RedirectResponse {
        $this->authorizeSale($sale);

        $validated = $request->validate([
            'amount' => [
                'required',
                'numeric',
                'min:0.01',
                'max:' . $this->getRemainingAmount($sale),
            ],
            'method' => [
                'required',
                'in:cash,card,bank_transfer',
            ],
            'paid_at' => [
                'required',
                'date',
            ],
        ]);

        $this->paymentService->createPayment(
            $sale,
            $validated
        );

        return redirect()->route('sales.index');
    }

    public function destroy(Payment $payment): RedirectResponse
    {
        $this->authorizePayment($payment);

        $this->paymentService->deletePayment($payment);

        return redirect()->back();
    }

    private function authorizeSale(Sale $sale): void
    {
        abort_if(
            $sale->business_id !== auth()->user()->business_id,
            403
        );
    }

    private function authorizePayment(Payment $payment): void
    {
        abort_if(
            $payment->sale->business_id !== auth()->user()->business_id,
            403
        );
    }

    private function getRemainingAmount(Sale $sale): float
    {
        $paidAmount = (float) $sale->payments()->sum('amount');

        return (float) $sale->amount - $paidAmount;
    }
}
