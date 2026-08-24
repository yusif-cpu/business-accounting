<?php

namespace App\Http\Controllers;

use App\Http\Requests\DashboardFilterRequest;
use App\Services\DashboardService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private DashboardService $dashboardService
    ) {}

    public function index(
        DashboardFilterRequest $request
    ): Response {
        $filters =
            $request->filters();

        $data =
            $this->dashboardService
                ->getDashboardData(
                    auth()->user()->business_id,
                    $filters['start_date'],
                    $filters['end_date']
                );

        return Inertia::render(
            'dashboard',
            [
                'data' =>
                    $data,

                'filters' => [
                    'start_date' =>
                        $filters['start_date'] ?? '',

                    'end_date' =>
                        $filters['end_date'] ?? '',
                ],
            ]
        );
    }
}