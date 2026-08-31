<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class SyncCustomerDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'external_id' => [
                'required',
                'string',
                'max:255',
            ],

            'customer_external_id' => [
                'required',
                'string',
                'max:255',
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
            'document.required' =>
                'Please provide a document.',

            'document.file' =>
                'The provided document is invalid.',

            'document.mimes' =>
                'Only PDF, CSV, TXT, JPG, PNG, WEBP, GIF, DOCX and XLSX files are allowed.',

            'document.max' =>
                'The document may not be larger than 10 MB.',
        ];
    }
}
