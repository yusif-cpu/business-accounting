<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaymentRequest;
use App\Models\Payment;
use App\Models\Sale;
use App\Services\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
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
        Gate::authorize('view', $sale);

        return Inertia::render('Payments/Create', [
            'sale' => $sale,
        ]);
    }

    public function store(
        StorePaymentRequest $request,
        Sale $sale
    ): RedirectResponse {
        Gate::authorize('view', $sale);

        $this->paymentService->createPayment(
            $sale,
            $request->validated()
        );

        return redirect()->route('sales.show', $sale);
    }

    public function destroy(Payment $payment): RedirectResponse
    {
        Gate::authorize('delete', $payment);

        $this->paymentService->deletePayment($payment);

        return redirect()->back();
    }
}