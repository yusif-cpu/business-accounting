<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateBusinessRequest;
use App\Models\Business;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BusinessController extends Controller
{
    private function currentBusiness(): Business
    {
        $business = auth()->user()->business;

        abort_unless(
            $business !== null,
            404
        );

        return $business;
    }

    private function authorizeBusiness(
        Business $business
    ): void {
        abort_unless(
            $business->id === auth()->user()->business_id,
            403
        );
    }

    public function index(): Response
    {
        $business = $this->currentBusiness();

        return Inertia::render(
            'Business/Index',
            [
                'business' => [
                    'id' =>
                        $business->id,

                    'business_name' =>
                        $business->business_name,

                    'phone' =>
                        $business->phone,

                    'email' =>
                        $business->email,

                    'address' =>
                        $business->address,

                    'website' =>
                        $business->website,

                    'tax_id' =>
                        $business->tax_id,

                    'currency' =>
                        $business->currency,

                    'logo_url' =>
                        $this->logoUrl(
                            $business
                        ),
                ],
            ]
        );
    }

    public function show(
        Business $business
    ): Response {
        $this->authorizeBusiness(
            $business
        );

        return Inertia::render(
            'Business/Show',
            [
                'business' => [
                    'id' =>
                        $business->id,

                    'business_name' =>
                        $business->business_name,

                    'phone' =>
                        $business->phone,

                    'email' =>
                        $business->email,

                    'address' =>
                        $business->address,

                    'website' =>
                        $business->website,

                    'tax_id' =>
                        $business->tax_id,

                    'currency' =>
                        $business->currency,

                    'logo_url' =>
                        $this->logoUrl(
                            $business
                        ),
                ],

                'stats' => [
                    'customers' =>
                        $business
                            ->customers()
                            ->count(),

                    'sales' =>
                        $business
                            ->sales()
                            ->count(),

                    'expenses' =>
                        $business
                            ->expenses()
                            ->count(),

                    'operations' =>
                        $business
                            ->operations()
                            ->count(),

                    'categories' =>
                        $business
                            ->categories()
                            ->count(),
                ],
            ]
        );
    }

    public function edit(
        Business $business
    ): Response {
        $this->authorizeBusiness(
            $business
        );

        return Inertia::render(
            'Business/Edit',
            [
                'business' => [
                    'id' =>
                        $business->id,

                    'business_name' =>
                        $business->business_name,

                    'phone' =>
                        $business->phone,

                    'email' =>
                        $business->email,

                    'address' =>
                        $business->address,

                    'website' =>
                        $business->website,

                    'tax_id' =>
                        $business->tax_id,

                    'currency' =>
                        $business->currency,

                    'logo_url' =>
                        $this->logoUrl(
                            $business
                        ),
                ],
            ]
        );
    }

    public function update(
        UpdateBusinessRequest $request,
        Business $business
    ): RedirectResponse {
        $this->authorizeBusiness(
            $business
        );

        $data = $request->validated();

        if ($request->hasFile('logo')) {
            if (
                $business->logo_path &&
                Storage::disk('public')->exists(
                    $business->logo_path
                )
            ) {
                Storage::disk('public')->delete(
                    $business->logo_path
                );
            }

            $data['logo_path'] =
                $request
                    ->file('logo')
                    ->store(
                        'business-logos',
                        'public'
                    );
        }

        unset($data['logo']);

        $business->update($data);

        return redirect()
            ->route(
                'businesses.show',
                $business
            )
            ->with(
                'success',
                'Business information updated successfully.'
            );
    }

    public function destroyLogo(
        Business $business
    ): RedirectResponse {
        $this->authorizeBusiness(
            $business
        );

        if (
            $business->logo_path &&
            Storage::disk('public')->exists(
                $business->logo_path
            )
        ) {
            Storage::disk('public')->delete(
                $business->logo_path
            );
        }

        $business->update([
            'logo_path' => null,
        ]);

        return back()->with(
            'success',
            'Business logo removed successfully.'
        );
    }

    public function destroy(
        Business $business
    ): RedirectResponse {
        $this->authorizeBusiness(
            $business
        );

        $hasRelatedData =
            $business->customers()->exists() ||
            $business->sales()->exists() ||
            $business->expenses()->exists() ||
            $business->operations()->exists() ||
            $business->categories()->exists();

        if ($hasRelatedData) {
            return back()->with(
                'error',
                'This business cannot be deleted because it contains accounting data.'
            );
        }

        if (
            $business->logo_path &&
            Storage::disk('public')->exists(
                $business->logo_path
            )
        ) {
            Storage::disk('public')->delete(
                $business->logo_path
            );
        }

        $business->delete();

        return redirect()
            ->route('dashboard')
            ->with(
                'success',
                'Business deleted successfully.'
            );
    }

    private function logoUrl(
        Business $business
    ): ?string {
        if (!$business->logo_path) {
            return null;
        }

        return '/storage/' . ltrim(
            $business->logo_path,
            '/'
        );
    }
}