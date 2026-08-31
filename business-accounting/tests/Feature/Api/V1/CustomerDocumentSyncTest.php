<?php

namespace Tests\Feature\Api\V1;

use App\Models\Business;
use App\Models\Customer;
use App\Models\CustomerDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class CustomerDocumentSyncTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
    }

    private function actingAsIntegration(
        Business $business
    ): User {
        $user = User::factory()->create([
            'business_id' =>
                $business->id,
        ]);

        Sanctum::actingAs(
            $user,
            ['integration:write']
        );

        return $user;
    }

    public function test_document_can_be_created_via_sync(): void
    {
        $business = Business::create([
            'business_name' =>
                'Test Business',
        ]);

        $this->actingAsIntegration($business);

        $customer = Customer::create([
            'business_id' =>
                $business->id,

            'external_id' =>
                'shop-customer-001',

            'name' =>
                'John Doe',
        ]);

        $response = $this->post(
            '/api/v1/customer-documents',
            [
                'external_id' =>
                    'shop-document-001',

                'customer_external_id' =>
                    'shop-customer-001',

                'document' =>
                    UploadedFile::fake()->create(
                        'invoice.pdf',
                        100,
                        'application/pdf'
                    ),
            ]
        );

        $response->assertCreated();
        $response->assertJson([
            'created' => true,
        ]);

        $this->assertDatabaseHas(
            'customer_documents',
            [
                'business_id' =>
                    $business->id,

                'customer_id' =>
                    $customer->id,

                'external_id' =>
                    'shop-document-001',

                'name' =>
                    'invoice.pdf',
            ]
        );

        $document = CustomerDocument::where(
            'external_id',
            'shop-document-001'
        )->firstOrFail();

        Storage::disk('public')->assertExists(
            $document->file_path
        );
    }

    public function test_syncing_same_document_replaces_the_file(): void
    {
        $business = Business::create([
            'business_name' =>
                'Test Business',
        ]);

        $this->actingAsIntegration($business);

        Customer::create([
            'business_id' =>
                $business->id,

            'external_id' =>
                'shop-customer-001',

            'name' =>
                'John Doe',
        ]);

        $first = $this->post(
            '/api/v1/customer-documents',
            [
                'external_id' =>
                    'shop-document-001',

                'customer_external_id' =>
                    'shop-customer-001',

                'document' =>
                    UploadedFile::fake()->create(
                        'invoice-v1.pdf',
                        100,
                        'application/pdf'
                    ),
            ]
        );

        $first->assertCreated();

        $originalPath = CustomerDocument::where(
            'external_id',
            'shop-document-001'
        )->firstOrFail()->file_path;

        Storage::disk('public')->assertExists($originalPath);

        $second = $this->post(
            '/api/v1/customer-documents',
            [
                'external_id' =>
                    'shop-document-001',

                'customer_external_id' =>
                    'shop-customer-001',

                'document' =>
                    UploadedFile::fake()->create(
                        'invoice-v2.pdf',
                        150,
                        'application/pdf'
                    ),
            ]
        );

        $second->assertOk();
        $second->assertJson(['created' => false]);

        $this->assertDatabaseCount('customer_documents', 1);

        $document = CustomerDocument::where(
            'external_id',
            'shop-document-001'
        )->firstOrFail();

        $this->assertSame(
            'invoice-v2.pdf',
            $document->name
        );

        Storage::disk('public')->assertMissing($originalPath);
        Storage::disk('public')->assertExists($document->file_path);
    }

    public function test_sync_fails_for_unknown_customer_external_id(): void
    {
        $business = Business::create([
            'business_name' =>
                'Test Business',
        ]);

        $this->actingAsIntegration($business);

        $response = $this->post(
            '/api/v1/customer-documents',
            [
                'external_id' =>
                    'shop-document-001',

                'customer_external_id' =>
                    'does-not-exist',

                'document' =>
                    UploadedFile::fake()->create(
                        'invoice.pdf',
                        100,
                        'application/pdf'
                    ),
            ]
        );

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('customer_external_id');

        $this->assertDatabaseMissing(
            'customer_documents',
            [
                'external_id' =>
                    'shop-document-001',
            ]
        );
    }

    public function test_document_sync_is_scoped_to_business(): void
    {
        $businessA = Business::create([
            'business_name' =>
                'Business A',
        ]);

        $businessB = Business::create([
            'business_name' =>
                'Business B',
        ]);

        Customer::create([
            'business_id' =>
                $businessB->id,

            'external_id' =>
                'shop-customer-001',

            'name' =>
                'Jane Doe',
        ]);

        $this->actingAsIntegration($businessA);

        $response = $this->post(
            '/api/v1/customer-documents',
            [
                'external_id' =>
                    'shop-document-001',

                'customer_external_id' =>
                    'shop-customer-001',

                'document' =>
                    UploadedFile::fake()->create(
                        'invoice.pdf',
                        100,
                        'application/pdf'
                    ),
            ]
        );

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('customer_external_id');
    }

    public function test_document_sync_rejects_invalid_mime_type(): void
    {
        $business = Business::create([
            'business_name' =>
                'Test Business',
        ]);

        $this->actingAsIntegration($business);

        Customer::create([
            'business_id' =>
                $business->id,

            'external_id' =>
                'shop-customer-001',

            'name' =>
                'John Doe',
        ]);

        $response = $this->post(
            '/api/v1/customer-documents',
            [
                'external_id' =>
                    'shop-document-001',

                'customer_external_id' =>
                    'shop-customer-001',

                'document' =>
                    UploadedFile::fake()->create(
                        'malware.exe',
                        100,
                        'application/x-msdownload'
                    ),
            ]
        );

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('document');

        $this->assertDatabaseMissing(
            'customer_documents',
            [
                'external_id' =>
                    'shop-document-001',
            ]
        );
    }

    public function test_document_sync_rejects_oversized_file(): void
    {
        $business = Business::create([
            'business_name' =>
                'Test Business',
        ]);

        $this->actingAsIntegration($business);

        Customer::create([
            'business_id' =>
                $business->id,

            'external_id' =>
                'shop-customer-001',

            'name' =>
                'John Doe',
        ]);

        $response = $this->post(
            '/api/v1/customer-documents',
            [
                'external_id' =>
                    'shop-document-001',

                'customer_external_id' =>
                    'shop-customer-001',

                'document' =>
                    UploadedFile::fake()->create(
                        'huge.pdf',
                        10241,
                        'application/pdf'
                    ),
            ]
        );

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('document');
    }

    public function test_same_external_id_can_be_used_by_different_businesses(): void
    {
        $businessA = Business::create([
            'business_name' =>
                'Business A',
        ]);

        $businessB = Business::create([
            'business_name' =>
                'Business B',
        ]);

        Customer::create([
            'business_id' =>
                $businessA->id,

            'external_id' =>
                'shop-customer-001',

            'name' =>
                'Customer A',
        ]);

        Customer::create([
            'business_id' =>
                $businessB->id,

            'external_id' =>
                'shop-customer-001',

            'name' =>
                'Customer B',
        ]);

        $this->actingAsIntegration($businessA);

        $this->post(
            '/api/v1/customer-documents',
            [
                'external_id' =>
                    'shared-document-001',

                'customer_external_id' =>
                    'shop-customer-001',

                'document' =>
                    UploadedFile::fake()->create(
                        'a.pdf',
                        100,
                        'application/pdf'
                    ),
            ]
        )->assertCreated();

        $this->actingAsIntegration($businessB);

        $this->post(
            '/api/v1/customer-documents',
            [
                'external_id' =>
                    'shared-document-001',

                'customer_external_id' =>
                    'shop-customer-001',

                'document' =>
                    UploadedFile::fake()->create(
                        'b.pdf',
                        100,
                        'application/pdf'
                    ),
            ]
        )->assertCreated();

        $this->assertDatabaseCount('customer_documents', 2);
    }

    public static function newlySupportedFormatProvider(): array
    {
        return [
            'webp' => [
                'photo.webp',
                'image/webp',
            ],

            'gif' => [
                'photo.gif',
                'image/gif',
            ],

            'docx' => [
                'contract.docx',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ],

            'xlsx' => [
                'ledger.xlsx',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ],

            'txt' => [
                'notes.txt',
                'text/plain',
            ],
        ];
    }

    #[DataProvider('newlySupportedFormatProvider')]
    public function test_document_can_be_created_via_sync_with_newly_supported_format(
        string $fileName,
        string $mimeType
    ): void {
        $business = Business::create([
            'business_name' =>
                'Test Business',
        ]);

        $this->actingAsIntegration($business);

        Customer::create([
            'business_id' =>
                $business->id,

            'external_id' =>
                'shop-customer-001',

            'name' =>
                'John Doe',
        ]);

        $response = $this->post(
            '/api/v1/customer-documents',
            [
                'external_id' =>
                    'shop-document-' . $fileName,

                'customer_external_id' =>
                    'shop-customer-001',

                'document' =>
                    UploadedFile::fake()->create(
                        $fileName,
                        100,
                        $mimeType
                    ),
            ]
        );

        $response->assertCreated();
        $response->assertJson([
            'created' => true,
        ]);

        $this->assertDatabaseHas(
            'customer_documents',
            [
                'business_id' =>
                    $business->id,

                'external_id' =>
                    'shop-document-' . $fileName,

                'name' =>
                    $fileName,

                'mime_type' =>
                    $mimeType,
            ]
        );

        $document = CustomerDocument::where(
            'external_id',
            'shop-document-' . $fileName
        )->firstOrFail();

        Storage::disk('public')->assertExists(
            $document->file_path
        );
    }
}
