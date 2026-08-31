<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\SyncPaymentRequest;
use App\Services\Api\V1\PaymentSyncService;
use Illuminate\Http\JsonResponse;

class PaymentController extends Controller
{
    public function __construct(
        private PaymentSyncService $paymentSyncService
    ) {}

    public function sync(
        SyncPaymentRequest $request
    ): JsonResponse {
        $result = $this->paymentSyncService->sync(
            $request->user()->business_id,
            $request->validated()
        );

        return response()->json([
            'message' => $result['created']
                ? 'Payment created successfully.'
                : 'Payment updated successfully.',

            'data' => $result['payment'],

            'created' => $result['created'],
        ], $result['created'] ? 201 : 200);
    }
}
