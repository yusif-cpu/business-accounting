<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\CustomerDocument;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class CustomerDocumentService
{
    public function upload(
        Customer $customer,
        UploadedFile $file
    ): CustomerDocument {
        $path = $file->store(
            'customer-documents/' . $customer->id,
            'public'
        );

        return CustomerDocument::create([
            'business_id' =>
                $customer->business_id,

            'customer_id' =>
                $customer->id,

            'name' =>
                $file->getClientOriginalName(),

            'file_path' =>
                $path,

            'mime_type' =>
                $file->getClientMimeType(),

            'file_size' =>
                $file->getSize(),
        ]);
    }

    public function delete(
        CustomerDocument $document
    ): void {
        if (
            Storage::disk('public')->exists(
                $document->file_path
            )
        ) {
            Storage::disk('public')->delete(
                $document->file_path
            );
        }

        $document->delete();
    }
}