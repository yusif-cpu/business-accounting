<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerDocumentRequest;
use App\Models\Customer;
use App\Models\CustomerDocument;
use App\Services\CustomerDocumentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CustomerDocumentController extends Controller
{
    public function __construct(
        private CustomerDocumentService $documentService
    ) {}

    public function store(
        StoreCustomerDocumentRequest $request
    ): RedirectResponse {
        $customer = Customer::where(
            'business_id',
            auth()->user()->business_id
        )->findOrFail(
            $request->validated()['customer_id']
        );

        $this->documentService->upload(
            $customer,
            $request->file('document')
        );

        return back()->with(
            'success',
            'Document uploaded successfully.'
        );
    }

    public function preview(
        CustomerDocument $customerDocument
    ): Response {
        abort_unless(
            $customerDocument->business_id ===
                auth()->user()->business_id,
            403
        );

        $disk = Storage::disk('public');

        abort_unless(
            $disk->exists(
                $customerDocument->file_path
            ),
            404
        );

        $mimeType =
            $customerDocument->mime_type;

        if (
            $mimeType ===
            'text/csv'
        ) {
            $contents =
                $disk->get(
                    $customerDocument->file_path
                );

            return response(
                $contents,
                200,
                [
                    'Content-Type' =>
                        'text/csv; charset=UTF-8',

                    'Content-Disposition' =>
                        'inline; filename="' .
                        $customerDocument->name .
                        '"',
                ]
            );
        }

        $nonPreviewableMimes = [
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];

        $disposition = in_array($mimeType, $nonPreviewableMimes, true)
            ? 'attachment'
            : 'inline';

        return response()->file(
            $disk->path(
                $customerDocument->file_path
            ),
            [
                'Content-Type' =>
                    $mimeType,

                'Content-Disposition' =>
                    $disposition . '; filename="' .
                    $customerDocument->name .
                    '"',
            ]
        );
    }

    public function download(
        CustomerDocument $customerDocument
    ): StreamedResponse {
        abort_unless(
            $customerDocument->business_id ===
                auth()->user()->business_id,
            403
        );

        abort_unless(
            Storage::disk('public')->exists(
                $customerDocument->file_path
            ),
            404
        );

        return Storage::disk('public')->download(
            $customerDocument->file_path,
            $customerDocument->name
        );
    }

    public function destroy(
        CustomerDocument $customerDocument
    ): RedirectResponse {
        abort_unless(
            $customerDocument->business_id ===
                auth()->user()->business_id,
            403
        );

        $this->documentService->delete(
            $customerDocument
        );

        return back()->with(
            'success',
            'Document deleted successfully.'
        );
    }
}