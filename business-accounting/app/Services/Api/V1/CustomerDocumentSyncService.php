<?php

namespace App\Services\Api\V1;

use App\Models\Customer;
use App\Models\CustomerDocument;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class CustomerDocumentSyncService
{
    public function sync(
        int $businessId,
        array $data
    ): array {
        $customer = Customer::where(
            'business_id',
            $businessId
        )
            ->where(
                'external_id',
                $data['customer_external_id']
            )
            ->first();

        if (!$customer) {
            throw ValidationException::withMessages([
                'customer_external_id' => [
                    'The specified customer does not exist.',
                ],
            ]);
        }

        /** @var UploadedFile $file */
        $file = $data['document'];

        $path = $file->store(
            'customer-documents/' . $customer->id,
            'public'
        );

        $document = CustomerDocument::where(
            'business_id',
            $businessId
        )
            ->where(
                'external_id',
                $data['external_id']
            )
            ->first();

        if ($document) {
            if (
                Storage::disk('public')->exists(
                    $document->file_path
                )
            ) {
                Storage::disk('public')->delete(
                    $document->file_path
                );
            }

            $document->update([
                'customer_id' => $customer->id,
                'name' => $file->getClientOriginalName(),
                'file_path' => $path,
                'mime_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize(),
            ]);

            return [
                'document' => $document->fresh('customer'),
                'created' => false,
            ];
        }

        $document = CustomerDocument::create([
            'business_id' => $businessId,
            'external_id' => $data['external_id'],
            'customer_id' => $customer->id,
            'name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'mime_type' => $file->getClientMimeType(),
            'file_size' => $file->getSize(),
        ]);

        return [
            'document' => $document->load('customer'),
            'created' => true,
        ];
    }
}
