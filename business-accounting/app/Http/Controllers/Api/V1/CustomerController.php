<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\SyncCustomerRequest;
use App\Services\Api\V1\CustomerSyncService;
use Illuminate\Http\JsonResponse;

class CustomerController extends Controller
{
    public function __construct(
        private CustomerSyncService $customerSyncService
    ) {}

    public function sync(
        SyncCustomerRequest $request
    ): JsonResponse {
        $result = $this->customerSyncService->sync(
            $request->user()->business_id,
            $request->validated()
        );

        return response()->json([
            'message' => $result['created']
                ? 'Customer created successfully.'
                : 'Customer updated successfully.',

            'data' => $result['customer'],

            'created' => $result['created'],
        ], $result['created'] ? 201 : 200);
    }
}