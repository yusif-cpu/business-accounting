<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\UpdateBusinessInfoRequest;
use App\Models\Business;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BusinessController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $business = Business::findOrFail(
            $request->user()->business_id
        );

        return response()->json([
            'data' => $business,
        ]);
    }

    public function update(
        UpdateBusinessInfoRequest $request
    ): JsonResponse {
        $business = Business::findOrFail(
            $request->user()->business_id
        );

        $business->update(
            $request->validated()
        );

        return response()->json([
            'message' => 'Business information updated successfully.',
            'data' => $business->fresh(),
        ]);
    }
}
