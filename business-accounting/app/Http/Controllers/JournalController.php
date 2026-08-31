<?php

namespace App\Http\Controllers;

use App\Http\Requests\JournalFilterRequest;
use App\Services\JournalService;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class JournalController extends Controller
{
    public function __construct(
        private JournalService $journalService
    ) {}

    public function index(
        JournalFilterRequest $request
    ): Response {
        $filters = $request->filters();

        $journal = $this->journalService
            ->getDailyJournal(
                auth()->user()->business_id,
                $filters['date_from'],
                $filters['date_to']
            );

        return Inertia::render(
            'Journal/Index',
            [
                'journal' => $journal,
                'filters' => $filters,
            ]
        );
    }

    public function export(
        JournalFilterRequest $request
    ): StreamedResponse {
        $filters = $request->filters();

        $journal = $this->journalService
            ->getDailyJournal(
                auth()->user()->business_id,
                $filters['date_from'],
                $filters['date_to']
            );

        $fileName = "daily-journal-{$filters['date_from']}-to-{$filters['date_to']}.csv";

        return response()->streamDownload(
            function () use ($journal) {
                $handle = fopen('php://output', 'w');

                fputcsv($handle, [
                    'Date',
                    'Order Count',
                    'Panel Sales',
                    'Operation Income',
                    'Total Income',
                    'Average Order Value',
                    'Cart2Cart',
                    'Cash',
                    'Company Bank Account',
                    'Deposit',
                    'Expenses',
                    'Profit',
                    'Margin %',
                ]);

                foreach ($journal['rows'] as $row) {
                    fputcsv($handle, [
                        $row['date'],
                        $row['order_count'],
                        $row['panel_sales'],
                        $row['operation_income'],
                        $row['total_income'],
                        $row['average_order_value'],
                        $row['payment_sources']['cart2cart'],
                        $row['payment_sources']['cash'],
                        $row['payment_sources']['company_bank_account'],
                        $row['payment_sources']['deposit'],
                        $row['expenses'],
                        $row['profit'],
                        $row['margin_percent'],
                    ]);
                }

                $totals = $journal['totals'];

                fputcsv($handle, []);

                fputcsv($handle, [
                    'TOTAL',
                    $totals['order_count'],
                    $totals['panel_sales'],
                    $totals['operation_income'],
                    $totals['total_income'],
                    $totals['average_order_value'],
                    $totals['payment_sources']['cart2cart'],
                    $totals['payment_sources']['cash'],
                    $totals['payment_sources']['company_bank_account'],
                    $totals['payment_sources']['deposit'],
                    $totals['expenses'],
                    $totals['profit'],
                    $totals['margin_percent'],
                ]);

                fclose($handle);
            },
            $fileName,
            [
                'Content-Type' => 'text/csv',
            ]
        );
    }
}
