<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaymentRequest;
use App\Models\Payment;
use App\Models\Sale;
use App\Services\PaymentService;
use Illuminate\Http\RedirectResponse;
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
        StorePaymentRequest $request,
        Sale $sale
    ): RedirectResponse {
        $this->authorizeSale($sale);

        $this->paymentService->createPayment(
            $sale,
            $request->validated()
        );

        return redirect()->route('sales.show', $sale);
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
}
