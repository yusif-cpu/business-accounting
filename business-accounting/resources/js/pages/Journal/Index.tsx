import { router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { formatDate, formatMoney } from '@/lib/formatters';

type PaymentSources = {
    cart2cart: number;
    cash: number;
    company_bank_account: number;
    deposit: number;
};

type JournalRow = {
    date: string;
    order_count: number;
    panel_sales: number;
    operation_income: number;
    total_income: number;
    average_order_value: number;
    payment_sources: PaymentSources;
    expenses: number;
    profit: number;
    margin_percent: number;
};

type JournalTotals = Omit<JournalRow, 'date'>;

type Journal = {
    date_from: string;
    date_to: string;
    rows: JournalRow[];
    totals: JournalTotals;
};

type Filters = {
    date_from: string;
    date_to: string;
};

type Props = {
    journal: Journal;
    filters: Filters;
};

function toDateString(date: Date): string {
    return date.toISOString().slice(0, 10);
}

function marginClass(marginPercent: number): string {
    return marginPercent < 0 ? 'text-red-400' : 'text-neutral-200';
}

function profitClass(profit: number): string {
    return profit < 0 ? 'text-red-400' : 'text-emerald-400';
}

export default function Index({ journal, filters }: Props) {
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processingFilter, setProcessingFilter] = useState(false);

    const invalidDateRange = !!dateFrom && !!dateTo && dateFrom > dateTo;

    const rangeTooLong =
        !!dateFrom &&
        !!dateTo &&
        !invalidDateRange &&
        (new Date(dateTo).getTime() - new Date(dateFrom).getTime()) /
            (1000 * 60 * 60 * 24) >
            366;

    const goToJournal = (
        params: Record<string, string | undefined>,
    ) => {
        setProcessingFilter(true);

        router.get('/accounting', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,

            onSuccess: (page) => {
                const nextFilters = page.props.filters as Filters;

                setDateFrom(nextFilters.date_from);
                setDateTo(nextFilters.date_to);
                setErrors({});
            },

            onError: (pageErrors) => {
                setErrors(pageErrors as Record<string, string>);
            },

            onFinish: () => {
                setProcessingFilter(false);
            },
        });
    };

    const handleFilter = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (invalidDateRange || rangeTooLong) {
            return;
        }

        goToJournal({
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
        });
    };

    const clearFilters = () => {
        setErrors({});
        goToJournal({});
    };

    const applyPreset = (from: Date, to: Date) => {
        goToJournal({
            date_from: toDateString(from),
            date_to: toDateString(to),
        });
    };

    const presetLast7Days = () => {
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - 6);
        applyPreset(from, to);
    };

    const presetThisMonth = () => {
        const now = new Date();
        const from = new Date(now.getFullYear(), now.getMonth(), 1);
        applyPreset(from, now);
    };

    const presetLastMonth = () => {
        const now = new Date();
        const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const to = new Date(now.getFullYear(), now.getMonth(), 0);
        applyPreset(from, to);
    };

    const exportUrl = `/accounting/export?date_from=${journal.date_from}&date_to=${journal.date_to}`;

    return (
        <AppLayout>
            <div className="bg-neutral-950 p-6 text-neutral-100">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* HEADER */}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-neutral-500">
                                Finance
                            </p>

                            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                                Daily Journal
                            </h1>

                            <p className="mt-2 text-sm text-neutral-400">
                                One row per day: sales, income, expenses and
                                profit, calculated from your existing records.
                            </p>
                        </div>

                        <a
                            href={exportUrl}
                            className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-neutral-200 transition hover:bg-neutral-800"
                        >
                            Export CSV
                        </a>
                    </div>

                    {/* FILTERS */}

                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h2 className="text-base font-semibold">
                                    Filters
                                </h2>

                                <p className="mt-1 text-sm text-neutral-500">
                                    Filter the journal by payment date.
                                    Maximum range: 366 days.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={presetLast7Days}
                                    disabled={processingFilter}
                                    className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-medium text-neutral-300 transition hover:bg-neutral-800 disabled:opacity-50"
                                >
                                    Last 7 days
                                </button>

                                <button
                                    type="button"
                                    onClick={presetThisMonth}
                                    disabled={processingFilter}
                                    className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-medium text-neutral-300 transition hover:bg-neutral-800 disabled:opacity-50"
                                >
                                    This Month
                                </button>

                                <button
                                    type="button"
                                    onClick={presetLastMonth}
                                    disabled={processingFilter}
                                    className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-medium text-neutral-300 transition hover:bg-neutral-800 disabled:opacity-50"
                                >
                                    Last Month
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleFilter} className="space-y-4">
                            {/* FILTER ROW */}

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="date_from"
                                        className="mb-2 block text-sm font-medium text-neutral-400"
                                    >
                                        Start Date
                                    </label>

                                    <input
                                        id="date_from"
                                        type="date"
                                        value={dateFrom}
                                        onChange={(event) =>
                                            setDateFrom(event.target.value)
                                        }
                                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 outline-none transition focus:border-neutral-600"
                                    />

                                    {errors.date_from && (
                                        <p className="mt-2 text-sm text-red-400">
                                            {errors.date_from}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="date_to"
                                        className="mb-2 block text-sm font-medium text-neutral-400"
                                    >
                                        End Date
                                    </label>

                                    <input
                                        id="date_to"
                                        type="date"
                                        value={dateTo}
                                        onChange={(event) =>
                                            setDateTo(event.target.value)
                                        }
                                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 outline-none transition focus:border-neutral-600"
                                    />

                                    {errors.date_to && (
                                        <p className="mt-2 text-sm text-red-400">
                                            {errors.date_to}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* DATE ERRORS */}

                            {!errors.date_to && invalidDateRange && (
                                <p className="text-sm text-red-400">
                                    End date must be after or equal to the
                                    start date.
                                </p>
                            )}

                            {!errors.date_to &&
                                !invalidDateRange &&
                                rangeTooLong && (
                                    <p className="text-sm text-red-400">
                                        The date range may not exceed 366
                                        days.
                                    </p>
                                )}

                            {/* BUTTONS */}

                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="submit"
                                    disabled={
                                        processingFilter ||
                                        invalidDateRange ||
                                        rangeTooLong
                                    }
                                    className="rounded-xl bg-neutral-100 px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processingFilter
                                        ? 'Loading...'
                                        : 'Apply'}
                                </button>

                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    disabled={processingFilter}
                                    className="rounded-xl border border-neutral-800 bg-neutral-950 px-5 py-3 text-sm font-semibold text-neutral-300 transition hover:bg-neutral-800 disabled:opacity-50"
                                >
                                    Clear
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* TABLE */}

                    <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1400px] text-left text-sm">
                                <thead className="border-b border-neutral-800">
                                    <tr>
                                        <th className="sticky left-0 z-10 bg-neutral-900 px-4 py-3 font-medium text-neutral-500">
                                            Date
                                        </th>
                                        <th className="px-4 py-3 font-medium text-neutral-500">
                                            Orders
                                        </th>
                                        <th className="px-4 py-3 font-medium text-neutral-500">
                                            Panel Sales
                                        </th>
                                        <th className="px-4 py-3 font-medium text-neutral-500">
                                            Operation Income
                                        </th>
                                        <th className="px-4 py-3 font-medium text-neutral-500">
                                            Total Income
                                        </th>
                                        <th className="px-4 py-3 font-medium text-neutral-500">
                                            Avg Order
                                        </th>
                                        <th className="px-4 py-3 font-medium text-neutral-500">
                                            Cart2Cart
                                        </th>
                                        <th className="px-4 py-3 font-medium text-neutral-500">
                                            Cash
                                        </th>
                                        <th className="px-4 py-3 font-medium text-neutral-500">
                                            Bank Account
                                        </th>
                                        <th className="px-4 py-3 font-medium text-neutral-500">
                                            Deposit
                                        </th>
                                        <th className="px-4 py-3 font-medium text-neutral-500">
                                            Expenses
                                        </th>
                                        <th className="px-4 py-3 font-medium text-neutral-500">
                                            Profit
                                        </th>
                                        <th className="px-4 py-3 font-medium text-neutral-500">
                                            Margin %
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-neutral-800">
                                    {journal.rows.map((row) => (
                                        <tr
                                            key={row.date}
                                            className="transition hover:bg-neutral-800/30"
                                        >
                                            <td className="sticky left-0 z-10 bg-neutral-900 px-4 py-3 font-medium text-neutral-200">
                                                {formatDate(row.date, true)}
                                            </td>
                                            <td className="px-4 py-3 text-neutral-300">
                                                {row.order_count}
                                            </td>
                                            <td className="px-4 py-3 text-neutral-300">
                                                {formatMoney(row.panel_sales)}
                                            </td>
                                            <td className="px-4 py-3 text-neutral-300">
                                                {formatMoney(
                                                    row.operation_income,
                                                )}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-neutral-100">
                                                {formatMoney(
                                                    row.total_income,
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-neutral-300">
                                                {formatMoney(
                                                    row.average_order_value,
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-neutral-400">
                                                {formatMoney(
                                                    row.payment_sources
                                                        .cart2cart,
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-neutral-400">
                                                {formatMoney(
                                                    row.payment_sources.cash,
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-neutral-400">
                                                {formatMoney(
                                                    row.payment_sources
                                                        .company_bank_account,
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-neutral-400">
                                                {formatMoney(
                                                    row.payment_sources
                                                        .deposit,
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-red-400">
                                                {formatMoney(row.expenses)}
                                            </td>
                                            <td
                                                className={`px-4 py-3 font-medium ${profitClass(row.profit)}`}
                                            >
                                                {formatMoney(row.profit)}
                                            </td>
                                            <td
                                                className={`px-4 py-3 ${marginClass(row.margin_percent)}`}
                                            >
                                                {row.margin_percent.toFixed(
                                                    2,
                                                )}
                                                %
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>

                                <tfoot>
                                    <tr className="border-t-2 border-neutral-700 bg-neutral-950 font-semibold">
                                        <td className="sticky left-0 z-10 bg-neutral-950 px-4 py-4 text-neutral-100">
                                            Total
                                        </td>
                                        <td className="px-4 py-4 text-neutral-200">
                                            {journal.totals.order_count}
                                        </td>
                                        <td className="px-4 py-4 text-neutral-200">
                                            {formatMoney(
                                                journal.totals.panel_sales,
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-neutral-200">
                                            {formatMoney(
                                                journal.totals
                                                    .operation_income,
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-neutral-100">
                                            {formatMoney(
                                                journal.totals.total_income,
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-neutral-200">
                                            {formatMoney(
                                                journal.totals
                                                    .average_order_value,
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-neutral-300">
                                            {formatMoney(
                                                journal.totals.payment_sources
                                                    .cart2cart,
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-neutral-300">
                                            {formatMoney(
                                                journal.totals.payment_sources
                                                    .cash,
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-neutral-300">
                                            {formatMoney(
                                                journal.totals.payment_sources
                                                    .company_bank_account,
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-neutral-300">
                                            {formatMoney(
                                                journal.totals.payment_sources
                                                    .deposit,
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-red-400">
                                            {formatMoney(
                                                journal.totals.expenses,
                                            )}
                                        </td>
                                        <td
                                            className={`px-4 py-4 ${profitClass(journal.totals.profit)}`}
                                        >
                                            {formatMoney(
                                                journal.totals.profit,
                                            )}
                                        </td>
                                        <td
                                            className={`px-4 py-4 ${marginClass(journal.totals.margin_percent)}`}
                                        >
                                            {journal.totals.margin_percent.toFixed(
                                                2,
                                            )}
                                            %
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    <p className="text-xs text-neutral-600">
                        Not included in this MVP: gateway commissions,
                        refunds, cost of goods sold and advertising spend —
                        this project has no product cost, refund, or ad-spend
                        tracking yet, so these figures are intentionally
                        omitted rather than shown as estimates.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
