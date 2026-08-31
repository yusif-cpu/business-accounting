<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\SyncCustomerDocumentRequest;
use App\Services\Api\V1\CustomerDocumentSyncService;
use Illuminate\Http\JsonResponse;

class CustomerDocumentController extends Controller
{
    public function __construct(
        private CustomerDocumentSyncService $customerDocumentSyncService
    ) {}

    public function sync(
        SyncCustomerDocumentRequest $request
    ): JsonResponse {
        $result = $this->customerDocumentSyncService->sync(
            $request->user()->business_id,
            $request->validated()
        );

        return response()->json([
            'message' => $result['created']
                ? 'Customer document created successfully.'
                : 'Customer document updated successfully.',

            'data' => $result['document'],

            'created' => $result['created'],
        ], $result['created'] ? 201 : 200);
    }
}
