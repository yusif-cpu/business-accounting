<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\SyncIncomeRequest;
use App\Services\Api\V1\IncomeSyncService;
use Illuminate\Http\JsonResponse;

class IncomeController extends Controller
{
    public function __construct(
        private IncomeSyncService $incomeSyncService
    ) {}

    public function sync(
        SyncIncomeRequest $request
    ): JsonResponse {
        $result = $this->incomeSyncService->sync(
            $request->user()->business_id,
            $request->validated()
        );

        return response()->json([
            'message' => $result['created']
                ? 'Income created successfully.'
                : 'Income updated successfully.',

            'data' => $result['income'],

            'created' => $result['created'],
        ], $result['created'] ? 201 : 200);
    }
}
