<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCustomerDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        $businessId =
            auth()->user()->business_id;

        return [
            'customer_id' => [
                'required',
                'integer',

                Rule::exists(
                    'customers',
                    'id'
                )->where(
                    fn ($query) =>
                        $query->where(
                            'business_id',
                            $businessId
                        )
                ),
            ],

            'document' => [
                'required',
                'file',
                'mimes:pdf,csv,jpg,jpeg,png,webp,gif,docx,xlsx,txt',
                'max:10240',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'customer_id.exists' =>
                'The selected customer does not belong to your business.',

            'document.required' =>
                'Please select a document.',

            'document.file' =>
                'The selected document is invalid.',

            'document.mimes' =>
                'Only PDF, CSV, TXT, JPG, PNG, WEBP, GIF, DOCX and XLSX files are allowed.',

            'document.max' =>
                'The document may not be larger than 10 MB.',
        ];
    }
}