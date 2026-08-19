<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\SaleService;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends Controller
{
    public function __construct(private SaleService $saleService)
    {
    }

    public function index(): Response
    {
        $sales = $this->saleService->getSalesForCurrentBusiness();

        return Inertia::render('Sales/Index', [
            'sales' => $sales
        ]);
    }
}
