<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\Operation;
use App\Models\Payment;
use Carbon\CarbonImmutable;

class JournalService
{
    private const PAYMENT_SOURCES = [
        'cart2cart',
        'cash',
        'company_bank_account',
        'deposit',
    ];

    public function getDailyJournal(
        int $businessId,
        string $dateFrom,
        string $dateTo
    ): array {
        $rows = $this->buildRows(
            $businessId,
            $dateFrom,
            $dateTo
        );

        return [
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'rows' => $rows,
            'totals' => $this->buildTotals($rows),
        ];
    }

    private function buildRows(
        int $businessId,
        string $dateFrom,
        string $dateTo
    ): array {
        $paymentsByDate = $this->paymentsByDate(
            $businessId,
            $dateFrom,
            $dateTo
        );

        $operationIncomeByDate = $this->operationAmountsByDate(
            $businessId,
            'income',
            $dateFrom,
            $dateTo
        );

        $expenseByDate = $this->expenseAmountsByDate(
            $businessId,
            $dateFrom,
            $dateTo
        );

        $operationExpenseByDate = $this->operationAmountsByDate(
            $businessId,
            'expense',
            $dateFrom,
            $dateTo
        );

        $rows = [];

        $cursor = CarbonImmutable::parse($dateFrom);
        $end = CarbonImmutable::parse($dateTo);

        while ($cursor->lte($end)) {
            $date = $cursor->toDateString();

            $payments = $paymentsByDate->get($date, collect());

            $panelSales = (float) $payments->sum('amount');

            $orderCount = $payments
                ->pluck('sale_id')
                ->unique()
                ->count();

            $operationIncome = (float) ($operationIncomeByDate[$date] ?? 0);

            $totalIncome = $panelSales + $operationIncome;

            $averageOrderValue = $orderCount > 0
                ? $panelSales / $orderCount
                : 0.0;

            $paymentSources = $this->emptyPaymentSourceTotals();

            foreach ($payments as $payment) {
                $source = $payment->payment_source;

                if ($source && array_key_exists($source, $paymentSources)) {
                    $paymentSources[$source] += (float) $payment->amount;
                }
            }

            $expenses = (float) ($expenseByDate[$date] ?? 0)
                + (float) ($operationExpenseByDate[$date] ?? 0);

            $profit = $totalIncome - $expenses;

            $marginPercent = $totalIncome > 0
                ? ($profit / $totalIncome) * 100
                : 0.0;

            $rows[] = [
                'date' => $date,
                'order_count' => $orderCount,
                'panel_sales' => round($panelSales, 2),
                'operation_income' => round($operationIncome, 2),
                'total_income' => round($totalIncome, 2),
                'average_order_value' => round($averageOrderValue, 2),
                'payment_sources' => array_map(
                    fn ($value) => round($value, 2),
                    $paymentSources
                ),
                'expenses' => round($expenses, 2),
                'profit' => round($profit, 2),
                'margin_percent' => round($marginPercent, 2),
            ];

            $cursor = $cursor->addDay();
        }

        return $rows;
    }

    private function buildTotals(array $rows): array
    {
        $orderCount = array_sum(array_column($rows, 'order_count'));
        $panelSales = array_sum(array_column($rows, 'panel_sales'));
        $operationIncome = array_sum(array_column($rows, 'operation_income'));
        $totalIncome = array_sum(array_column($rows, 'total_income'));
        $expenses = array_sum(array_column($rows, 'expenses'));

        $profit = $totalIncome - $expenses;

        $marginPercent = $totalIncome > 0
            ? ($profit / $totalIncome) * 100
            : 0.0;

        $averageOrderValue = $orderCount > 0
            ? $panelSales / $orderCount
            : 0.0;

        $paymentSources = $this->emptyPaymentSourceTotals();

        foreach ($rows as $row) {
            foreach ($row['payment_sources'] as $source => $value) {
                $paymentSources[$source] += $value;
            }
        }

        return [
            'order_count' => $orderCount,
            'panel_sales' => round($panelSales, 2),
            'operation_income' => round($operationIncome, 2),
            'total_income' => round($totalIncome, 2),
            'average_order_value' => round($averageOrderValue, 2),
            'payment_sources' => array_map(
                fn ($value) => round($value, 2),
                $paymentSources
            ),
            'expenses' => round($expenses, 2),
            'profit' => round($profit, 2),
            'margin_percent' => round($marginPercent, 2),
        ];
    }

    /**
     * Scoped via the owning Sale's business_id rather than Payment.business_id
     * directly: web-created payments (PaymentController@store) never set
     * Payment.business_id, only the API sync path does. Scoping through the
     * Sale relationship is reliable regardless of that gap.
     */
    private function paymentsByDate(
        int $businessId,
        string $dateFrom,
        string $dateTo
    ) {
        return Payment::whereHas(
            'sale',
            function ($query) use ($businessId) {
                $query->where('business_id', $businessId);
            }
        )
            ->whereDate('paid_at', '>=', $dateFrom)
            ->whereDate('paid_at', '<=', $dateTo)
            ->get([
                'id',
                'sale_id',
                'amount',
                'payment_source',
                'paid_at',
            ])
            ->groupBy(
                fn (Payment $payment) => $payment->paid_at->toDateString()
            );
    }

    private function operationAmountsByDate(
        int $businessId,
        string $type,
        string $dateFrom,
        string $dateTo
    ): array {
        return Operation::where('business_id', $businessId)
            ->where('type', $type)
            ->whereDate('operation_date', '>=', $dateFrom)
            ->whereDate('operation_date', '<=', $dateTo)
            ->selectRaw('operation_date, SUM(amount) as total')
            ->groupBy('operation_date')
            ->pluck('total', 'operation_date')
            ->toArray();
    }

    private function expenseAmountsByDate(
        int $businessId,
        string $dateFrom,
        string $dateTo
    ): array {
        return Expense::where('business_id', $businessId)
            ->whereDate('expense_date', '>=', $dateFrom)
            ->whereDate('expense_date', '<=', $dateTo)
            ->selectRaw('expense_date, SUM(amount) as total')
            ->groupBy('expense_date')
            ->pluck('total', 'expense_date')
            ->toArray();
    }

    private function emptyPaymentSourceTotals(): array
    {
        return array_fill_keys(self::PAYMENT_SOURCES, 0.0);
    }
}
