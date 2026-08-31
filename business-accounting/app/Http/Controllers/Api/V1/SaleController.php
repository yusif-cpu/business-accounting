<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\SyncSaleRequest;
use App\Services\Api\V1\SaleSyncService;
use Illuminate\Http\JsonResponse;

class SaleController extends Controller
{
    public function __construct(
        private SaleSyncService $saleSyncService
    ) {}

    public function sync(
        SyncSaleRequest $request
    ): JsonResponse {
        $result = $this->saleSyncService->sync(
            $request->user()->business_id,
            $request->validated()
        );

        return response()->json([
            'message' => $result['created']
                ? 'Sale created successfully.'
                : 'Sale updated successfully.',

            'data' => $result['sale'],

            'created' => $result['created'],
        ], $result['created'] ? 201 : 200);
    }
}