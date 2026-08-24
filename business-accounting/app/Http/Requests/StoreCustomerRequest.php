<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'nullable',
                'email',
                'max:255',
            ],

            'phone' => [
                'nullable',
                'string',
                'max:50',
            ],

            'documents' => [
                'nullable',
                'array',
                'max:10',
            ],

            'documents.*' => [
                'file',
                'mimes:pdf,csv,jpg,jpeg,png',
                'max:10240',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'documents.max' =>
                'You may upload a maximum of 10 documents.',

            'documents.*.file' =>
                'Each document must be a valid file.',

            'documents.*.mimes' =>
                'Only PDF, CSV, JPG and PNG files are allowed.',

            'documents.*.max' =>
                'Each document may not be larger than 10 MB.',
        ];
    }
}