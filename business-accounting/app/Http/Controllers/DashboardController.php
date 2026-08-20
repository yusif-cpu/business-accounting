<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private DashboardService $dashboardService
    ) {
    }

    public function index(): Response
    {
        $data = $this->dashboardService->getDashboardData(
            auth()->user()->business_id
        );

        return Inertia::render('dashboard', [
            'data' => $data,
        ]);
    }
}
