<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSaleStatusRequest;
use App\Http\Requests\UpdateSaleStatusRequest;
use App\Models\SaleStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SaleStatusController extends Controller
{
    public function index(): Response
    {
        $statuses = SaleStatus::where(
            'business_id',
            auth()->user()->business_id
        )
            ->withCount('sales')
            ->orderByDesc('is_default')
            ->orderBy('name')
            ->get();

        return Inertia::render(
            'SaleStatuses/Index',
            [
                'statuses' => $statuses,
            ]
        );
    }

    public function create(): Response
    {
        return Inertia::render(
            'SaleStatuses/Create'
        );
    }

    public function store(
        StoreSaleStatusRequest $request
    ): RedirectResponse {
        $status = $this->createStatus(
            $request->validated()['name']
        );

        return redirect()
            ->route('sale-statuses.index')
            ->with(
                'success',
                'Sale status created successfully.'
            );
    }

    public function inlineStore(
        StoreSaleStatusRequest $request
    ): JsonResponse {
        $status = $this->createStatus(
            $request->validated()['name']
        );

        return response()->json(
            [
                'status' => $status,
            ],
            201
        );
    }

    public function edit(
        SaleStatus $saleStatus
    ): Response {
        $this->ensureSameBusiness(
            $saleStatus
        );

        return Inertia::render(
            'SaleStatuses/Edit',
            [
                'status' => $saleStatus,
            ]
        );
    }

    public function update(
        UpdateSaleStatusRequest $request,
        SaleStatus $saleStatus
    ): RedirectResponse {
        $this->ensureSameBusiness(
            $saleStatus
        );

        $name = trim(
            $request->validated()['name']
        );

        $slug = $this->generateUniqueSlug(
            $name,
            $saleStatus->id
        );

        $saleStatus->update([
            'name' => $name,
            'slug' => $slug,
        ]);

        return redirect()
            ->route('sale-statuses.index')
            ->with(
                'success',
                'Sale status updated successfully.'
            );
    }

    public function destroy(
        SaleStatus $saleStatus
    ): RedirectResponse {
        $this->ensureSameBusiness(
            $saleStatus
        );

        if ($saleStatus->is_default) {
            return back()->with(
                'error',
                'Default sale statuses cannot be deleted.'
            );
        }

        if ($saleStatus->sales()->exists()) {
            return back()->with(
                'error',
                'This status is already used by sales and cannot be deleted.'
            );
        }

        $saleStatus->delete();

        return redirect()
            ->route('sale-statuses.index')
            ->with(
                'success',
                'Sale status deleted successfully.'
            );
    }

    private function createStatus(
        string $name
    ): SaleStatus {
        $name = trim($name);

        $slug = $this->generateUniqueSlug(
            $name
        );

        return SaleStatus::create([
            'business_id' =>
                auth()->user()->business_id,

            'name' =>
                $name,

            'slug' =>
                $slug,

            'is_default' =>
                false,
        ]);
    }

    private function generateUniqueSlug(
        string $name,
        ?int $ignoreId = null
    ): string {
        $slug = str($name)
            ->slug()
            ->toString();

        $baseSlug = $slug;
        $counter = 2;

        while (
            SaleStatus::where(
                'business_id',
                auth()->user()->business_id
            )
                ->where(
                    'slug',
                    $slug
                )
                ->when(
                    $ignoreId !== null,
                    fn ($query) =>
                        $query->where(
                            'id',
                            '!=',
                            $ignoreId
                        )
                )
                ->exists()
        ) {
            $slug =
                $baseSlug .
                '-' .
                $counter;

            $counter++;
        }

        return $slug;
    }

    private function ensureSameBusiness(
        SaleStatus $saleStatus
    ): void {
        abort_unless(
            $saleStatus->business_id ===
                auth()->user()->business_id,
            403
        );
    }
}