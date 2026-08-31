<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\Category;
use App\Models\Expense;
use App\Models\Operation;
use App\Models\Payment;
use App\Models\Sale;
use App\Models\SaleStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JournalTest extends TestCase
{
    use RefreshDatabase;

    private function createStatuses(
        Business $business
    ): array {
        return [
            'pending' => SaleStatus::create([
                'business_id' => $business->id,
                'name' => 'Pending',
                'slug' => 'pending',
                'is_default' => true,
            ]),

            'paid' => SaleStatus::create([
                'business_id' => $business->id,
                'name' => 'Paid',
                'slug' => 'paid',
                'is_default' => false,
            ]),
        ];
    }

    public function test_journal_defaults_to_last_30_days_with_one_row_per_day(): void
    {
        $business = Business::create([
            'business_name' => 'Test Business',
        ]);

        $user = User::factory()->create([
            'business_id' => $business->id,
        ]);

        $response = $this
            ->actingAs($user)
            ->get('/accounting');

        $response->assertOk();

        $response->assertInertia(
            fn ($page) => $page
                ->component('Journal/Index')
                ->where(
                    'journal.date_from',
                    now()->subDays(29)->toDateString()
                )
                ->where(
                    'journal.date_to',
                    now()->toDateString()
                )
                ->where(
                    'journal.rows',
                    fn ($rows) => count($rows) === 30
                )
        );
    }

    public function test_journal_groups_by_payment_date_not_sale_date(): void
    {
        $business = Business::create([
            'business_name' => 'Test Business',
        ]);

        $user = User::factory()->create([
            'business_id' => $business->id,
        ]);

        $statuses = $this->createStatuses($business);

        $sale = Sale::create([
            'business_id' => $business->id,
            'amount' => 100,
            'status_id' => $statuses['pending']->id,
            'sold_at' => '2026-08-01 10:00:00',
        ]);

        Payment::create([
            'sale_id' => $sale->id,
            'amount' => 100,
            'payment_source' => 'cash',
            'paid_at' => '2026-08-10 10:00:00',
        ]);

        $response = $this
            ->actingAs($user)
            ->get('/accounting?date_from=2026-08-01&date_to=2026-08-10');

        $response->assertInertia(
            fn ($page) => $page
                ->where(
                    'journal.rows',
                    function ($rows) {
                        $byDate = collect($rows)->keyBy('date');

                        return (float) $byDate->get('2026-08-01')['panel_sales'] === 0.0
                            && (float) $byDate->get('2026-08-10')['panel_sales'] === 100.0
                            && $byDate->get('2026-08-10')['order_count'] === 1;
                    }
                )
        );
    }

    public function test_journal_includes_web_created_payments_that_have_no_business_id_set(): void
    {
        $business = Business::create([
            'business_name' => 'Test Business',
        ]);

        $user = User::factory()->create([
            'business_id' => $business->id,
        ]);

        $statuses = $this->createStatuses($business);

        $sale = Sale::create([
            'business_id' => $business->id,
            'amount' => 75,
            'status_id' => $statuses['pending']->id,
            'sold_at' => '2026-08-05 10:00:00',
        ]);

        // Mirrors PaymentService::createPayment(), which never sets
        // Payment.business_id directly.
        Payment::create([
            'sale_id' => $sale->id,
            'amount' => 75,
            'payment_source' => 'cash',
            'paid_at' => '2026-08-05 10:00:00',
        ]);

        $response = $this
            ->actingAs($user)
            ->get('/accounting?date_from=2026-08-05&date_to=2026-08-05');

        $response->assertInertia(
            fn ($page) => $page
                ->where(
                    'journal.rows.0.panel_sales',
                    75
                )
        );
    }

    public function test_journal_includes_operations_and_categories_without_double_counting(): void
    {
        $business = Business::create([
            'business_name' => 'Test Business',
        ]);

        $user = User::factory()->create([
            'business_id' => $business->id,
        ]);

        $expenseCategory = Category::create([
            'business_id' => $business->id,
            'type' => 'expense',
            'name' => 'Rent',
        ]);

        Expense::create([
            'business_id' => $business->id,
            'description' => 'Plain Expense',
            'amount' => 40,
            'category_id' => $expenseCategory->id,
            'expense_date' => '2026-08-15',
        ]);

        Operation::create([
            'business_id' => $business->id,
            'type' => 'expense',
            'operation_date' => '2026-08-15',
            'currency' => 'AZN',
            'amount' => 10,
            'description' => 'Operation Expense',
        ]);

        Operation::create([
            'business_id' => $business->id,
            'type' => 'income',
            'operation_date' => '2026-08-15',
            'currency' => 'AZN',
            'amount' => 60,
            'description' => 'Operation Income',
        ]);

        $response = $this
            ->actingAs($user)
            ->get('/accounting?date_from=2026-08-15&date_to=2026-08-15');

        $response->assertInertia(
            fn ($page) => $page
                ->where('journal.rows.0.operation_income', 60)
                ->where('journal.rows.0.expenses', 50)
                ->where('journal.rows.0.total_income', 60)
                ->where('journal.rows.0.profit', 10)
        );
    }

    public function test_journal_breaks_down_payment_sources(): void
    {
        $business = Business::create([
            'business_name' => 'Test Business',
        ]);

        $user = User::factory()->create([
            'business_id' => $business->id,
        ]);

        $statuses = $this->createStatuses($business);

        $saleOne = Sale::create([
            'business_id' => $business->id,
            'amount' => 20,
            'status_id' => $statuses['pending']->id,
            'sold_at' => '2026-08-12 09:00:00',
        ]);

        $saleTwo = Sale::create([
            'business_id' => $business->id,
            'amount' => 30,
            'status_id' => $statuses['pending']->id,
            'sold_at' => '2026-08-12 09:00:00',
        ]);

        Payment::create([
            'sale_id' => $saleOne->id,
            'amount' => 20,
            'payment_source' => 'cash',
            'paid_at' => '2026-08-12 12:00:00',
        ]);

        Payment::create([
            'sale_id' => $saleTwo->id,
            'amount' => 30,
            'payment_source' => 'company_bank_account',
            'paid_at' => '2026-08-12 13:00:00',
        ]);

        $response = $this
            ->actingAs($user)
            ->get('/accounting?date_from=2026-08-12&date_to=2026-08-12');

        $response->assertInertia(
            fn ($page) => $page
                ->where('journal.rows.0.payment_sources.cash', 20)
                ->where(
                    'journal.rows.0.payment_sources.company_bank_account',
                    30
                )
                ->where('journal.rows.0.payment_sources.cart2cart', 0)
                ->where('journal.rows.0.payment_sources.deposit', 0)
                ->where('journal.rows.0.order_count', 2)
                ->where('journal.rows.0.average_order_value', 25)
        );
    }

    public function test_journal_rejects_date_from_after_date_to(): void
    {
        $business = Business::create([
            'business_name' => 'Test Business',
        ]);

        $user = User::factory()->create([
            'business_id' => $business->id,
        ]);

        $response = $this
            ->actingAs($user)
            ->get('/accounting?date_from=2026-08-20&date_to=2026-08-10');

        $response->assertSessionHasErrors('date_to');
    }

    public function test_journal_rejects_range_over_366_days(): void
    {
        $business = Business::create([
            'business_name' => 'Test Business',
        ]);

        $user = User::factory()->create([
            'business_id' => $business->id,
        ]);

        $response = $this
            ->actingAs($user)
            ->get('/accounting?date_from=2025-01-01&date_to=2026-06-01');

        $response->assertSessionHasErrors('date_to');
    }

    public function test_journal_is_scoped_to_business(): void
    {
        $businessA = Business::create([
            'business_name' => 'Business A',
        ]);

        $businessB = Business::create([
            'business_name' => 'Business B',
        ]);

        $userA = User::factory()->create([
            'business_id' => $businessA->id,
        ]);

        $statusesB = $this->createStatuses($businessB);

        $saleB = Sale::create([
            'business_id' => $businessB->id,
            'amount' => 500,
            'status_id' => $statusesB['pending']->id,
            'sold_at' => '2026-08-18 10:00:00',
        ]);

        Payment::create([
            'sale_id' => $saleB->id,
            'amount' => 500,
            'payment_source' => 'cash',
            'paid_at' => '2026-08-18 10:00:00',
        ]);

        $response = $this
            ->actingAs($userA)
            ->get('/accounting?date_from=2026-08-18&date_to=2026-08-18');

        $response->assertInertia(
            fn ($page) => $page
                ->where('journal.rows.0.panel_sales', 0)
                ->where('journal.rows.0.order_count', 0)
        );
    }

    public function test_journal_csv_export_returns_csv_with_totals(): void
    {
        $business = Business::create([
            'business_name' => 'Test Business',
        ]);

        $user = User::factory()->create([
            'business_id' => $business->id,
        ]);

        $statuses = $this->createStatuses($business);

        $sale = Sale::create([
            'business_id' => $business->id,
            'amount' => 90,
            'status_id' => $statuses['pending']->id,
            'sold_at' => '2026-08-22 10:00:00',
        ]);

        Payment::create([
            'sale_id' => $sale->id,
            'amount' => 90,
            'payment_source' => 'deposit',
            'paid_at' => '2026-08-22 10:00:00',
        ]);

        $response = $this
            ->actingAs($user)
            ->get('/accounting/export?date_from=2026-08-22&date_to=2026-08-22');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');

        $content = $response->streamedContent();

        $this->assertStringContainsString('2026-08-22', $content);
        $this->assertStringContainsString('TOTAL', $content);
    }
}
