<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\SyncExpenseRequest;
use App\Services\Api\V1\ExpenseSyncService;
use Illuminate\Http\JsonResponse;

class ExpenseController extends Controller
{
    public function __construct(
        private ExpenseSyncService $expenseSyncService
    ) {}

    public function sync(
        SyncExpenseRequest $request
    ): JsonResponse {
        $result = $this->expenseSyncService->sync(
            $request->user()->business_id,
            $request->validated()
        );

        return response()->json([
            'message' => $result['created']
                ? 'Expense created successfully.'
                : 'Expense updated successfully.',

            'data' => $result['expense'],

            'created' => $result['created'],
        ], $result['created'] ? 201 : 200);
    }
}
