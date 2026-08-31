<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IntegrationController extends Controller
{
    public function ping(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'message' => 'Integration authenticated successfully.',
            'data' => [
                'user_id' => $user->id,
                'business_id' => $user->business_id,
                'business_name' => $user->business?->business_name,
            ],
        ]);
    }
}