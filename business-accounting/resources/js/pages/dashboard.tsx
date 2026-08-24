import { Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { formatDate, formatMoney } from '@/lib/formatters';

type MonthlyOverview = {
    label: string;
    sales: number;
    expenses: number;
};

type Sale = {
    id: number;
    amount: string;
    status: string;
    sold_at: string;
    customer: {
        id: number;
        name: string;
    } | null;
};

type Expense = {
    id: number;
    description: string;
    amount: string;
    category: string | null;
    expense_date: string;
};

type DailyBreakdown = {
    date: string;
    sales: number;
    expenses: number;
    net: number;
};

type DashboardData = {
    totalSales: number;
    collected: number;
    outstanding: number;
    expenses: number;
    profit: number;
    salesCount: number;
    customersCount: number;
    monthlyOverview: MonthlyOverview[];
    recentSales: Sale[];
    recentExpenses: Expense[];
    periodSales: Sale[];
    periodExpenses: Expense[];
    dailyBreakdown: DailyBreakdown[];
};

type Props = {
    data: DashboardData;
    filters: {
        start_date: string | null;
        end_date: string | null;
    };
};

type StatCardProps = {
    label: string;
    value: string;
    description: string;
};

function StatCard({
    label,
    value,
    description,
}: StatCardProps) {
    return (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <p className="text-sm font-medium text-neutral-500">
                {label}
            </p>

            <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-100">
                {value}
            </p>

            <p className="mt-2 text-xs text-neutral-500">
                {description}
            </p>
        </div>
    );
}

function StatusBadge({
    status,
}: {
    status: string;
}) {
    const styles: Record<string, string> = {
        paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        cancelled:
            'bg-red-500/10 text-red-400 border-red-500/20',
    };

    return (
        <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${
                styles[status] ??
                'border-neutral-700 bg-neutral-800 text-neutral-300'
            }`}
        >
            {status}
        </span>
    );
}

export default function Dashboard({
    data,
    filters,
}: Props) {
    const [startDate, setStartDate] = useState(
        filters.start_date ?? '',
    );

    const [endDate, setEndDate] = useState(
        filters.end_date ?? '',
    );

    const [processing, setProcessing] =
        useState(false);

    const invalidDateRange =
        !!startDate &&
        !!endDate &&
        startDate > endDate;

    const maxValue = Math.max(
        ...data.monthlyOverview.flatMap((month) => [
            month.sales,
            month.expenses,
        ]),
        1,
    );

    const handleFilter = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        if (invalidDateRange) {
            return;
        }

        setProcessing(true);

        router.get(
            '/dashboard',
            {
                start_date:
                    startDate || undefined,
                end_date:
                    endDate || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
    };

    const clearFilter = () => {
        setStartDate('');
        setEndDate('');
        setProcessing(true);

        router.get(
            '/dashboard',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
    };

    return (
        <AppLayout>
            <div className="bg-neutral-950 p-6 text-neutral-100">
                <div className="mx-auto max-w-7xl space-y-6">

                    {/* HEADER */}

                    <div>
                        <p className="text-sm font-medium text-neutral-500">
                            Business overview
                        </p>

                        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                            Dashboard
                        </h1>

                        <p className="mt-2 text-sm text-neutral-400">
                            Monitor your sales, payments,
                            expenses and profit.
                        </p>
                    </div>

                    {/* DATE FILTER */}

                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                        <div className="mb-4">
                            <h2 className="text-base font-semibold">
                                Date Range
                            </h2>

                            <p className="mt-1 text-sm text-neutral-500">
                                View financial activity within
                                a specific period.
                            </p>
                        </div>

                        <form
                            onSubmit={handleFilter}
                            className="flex flex-col gap-4 lg:flex-row lg:items-end"
                        >
                            <div className="flex-1">
                                <label
                                    htmlFor="start_date"
                                    className="mb-2 block text-sm font-medium text-neutral-400"
                                >
                                    Start Date
                                </label>

                                <input
                                    id="start_date"
                                    type="date"
                                    value={startDate}
                                    onChange={(event) =>
                                        setStartDate(
                                            event.target.value,
                                        )
                                    }
                                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 outline-none transition focus:border-neutral-600"
                                />
                            </div>

                            <div className="flex-1">
                                <label
                                    htmlFor="end_date"
                                    className="mb-2 block text-sm font-medium text-neutral-400"
                                >
                                    End Date
                                </label>

                                <input
                                    id="end_date"
                                    type="date"
                                    value={endDate}
                                    onChange={(event) =>
                                        setEndDate(
                                            event.target.value,
                                        )
                                    }
                                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 outline-none transition focus:border-neutral-600"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        invalidDateRange
                                    }
                                    className="rounded-xl bg-neutral-100 px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Loading...'
                                        : 'Apply'}
                                </button>

                                <button
                                    type="button"
                                    onClick={clearFilter}
                                    disabled={processing}
                                    className="rounded-xl border border-neutral-800 bg-neutral-950 px-5 py-3 text-sm font-semibold text-neutral-300 transition hover:bg-neutral-800 disabled:opacity-50"
                                >
                                    Clear
                                </button>
                            </div>
                        </form>

                        {invalidDateRange && (
                            <p className="mt-3 text-sm text-red-400">
                                End date must be after or equal
                                to the start date.
                            </p>
                        )}

                        {(startDate || endDate) &&
                            !invalidDateRange && (
                                <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
                                    <p className="text-xs text-neutral-500">
                                        Active date range
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-neutral-200">
                                        {startDate
                                            ? formatDate(
                                                  startDate,
                                              )
                                            : 'All time'}{' '}
                                        →{' '}
                                        {endDate
                                            ? formatDate(
                                                  endDate,
                                              )
                                            : 'Today'}
                                    </p>
                                </div>
                            )}
                    </div>

                    {/* SUMMARY */}

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                        <StatCard
                            label="Total Sales"
                            value={formatMoney(
                                data.totalSales,
                            )}
                            description="Sales in selected period"
                        />

                        <StatCard
                            label="Collected"
                            value={formatMoney(
                                data.collected,
                            )}
                            description="Payments received"
                        />

                        <StatCard
                            label="Outstanding"
                            value={formatMoney(
                                data.outstanding,
                            )}
                            description="Still to be collected"
                        />

                        <StatCard
                            label="Expenses"
                            value={formatMoney(
                                data.expenses,
                            )}
                            description="Expenses in selected period"
                        />

                        <StatCard
                            label="Profit"
                            value={formatMoney(
                                data.profit,
                            )}
                            description="Sales minus expenses"
                        />
                    </div>

                    {/* DAILY BREAKDOWN */}

                    {data.dailyBreakdown.length > 0 && (
                        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
                            <div className="border-b border-neutral-800 p-5">
                                <h2 className="text-base font-semibold">
                                    Daily Breakdown
                                </h2>

                                <p className="mt-1 text-sm text-neutral-500">
                                    Financial activity for each
                                    day in the selected period.
                                </p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[650px] text-left text-sm">
                                    <thead className="border-b border-neutral-800">
                                        <tr>
                                            <th className="px-5 py-4 font-medium text-neutral-500">
                                                Date
                                            </th>

                                            <th className="px-5 py-4 text-right font-medium text-neutral-500">
                                                Income
                                            </th>

                                            <th className="px-5 py-4 text-right font-medium text-neutral-500">
                                                Expenses
                                            </th>

                                            <th className="px-5 py-4 text-right font-medium text-neutral-500">
                                                Net
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-neutral-800">
                                        {data.dailyBreakdown.map(
                                            (day) => (
                                                <tr
                                                    key={
                                                        day.date
                                                    }
                                                    className="transition hover:bg-neutral-800/30"
                                                >
                                                    <td className="px-5 py-4 text-neutral-300">
                                                        {formatDate(
                                                            day.date,
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4 text-right font-medium text-emerald-400">
                                                        +
                                                        {formatMoney(
                                                            day.sales,
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4 text-right font-medium text-red-400">
                                                        -
                                                        {formatMoney(
                                                            day.expenses,
                                                        )}
                                                    </td>

                                                    <td
                                                        className={`px-5 py-4 text-right font-semibold ${
                                                            day.net >=
                                                            0
                                                                ? 'text-emerald-400'
                                                                : 'text-red-400'
                                                        }`}
                                                    >
                                                        {day.net >=
                                                        0
                                                            ? '+'
                                                            : '-'}
                                                        {formatMoney(
                                                            Math.abs(
                                                                day.net,
                                                            ),
                                                        )}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* PERIOD DETAILS */}

                    {data.dailyBreakdown.length > 0 && (
                        <div className="grid gap-6 lg:grid-cols-2">

                            {/* INCOME */}

                            <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
                                <div className="border-b border-neutral-800 p-5">
                                    <h2 className="text-base font-semibold">
                                        Income
                                    </h2>

                                    <p className="mt-1 text-sm text-neutral-500">
                                        Sales within the selected period.
                                    </p>
                                </div>

                                {data.periodSales.length ===
                                0 ? (
                                    <div className="p-8 text-center text-sm text-neutral-500">
                                        No income in this period.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-neutral-800">
                                        {data.periodSales.map(
                                            (sale) => (
                                                <Link
                                                    key={
                                                        sale.id
                                                    }
                                                    href={`/sales/${sale.id}`}
                                                    className="flex items-center justify-between gap-4 p-5 transition hover:bg-neutral-800/30"
                                                >
                                                    <div>
                                                        <p className="font-medium">
                                                            Sale #
                                                            {
                                                                sale.id
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-sm text-neutral-500">
                                                            {sale
                                                                .customer
                                                                ?.name ??
                                                                'No customer'}
                                                        </p>

                                                        <p className="mt-1 text-xs text-neutral-600">
                                                            {formatDate(
                                                                sale.sold_at,
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="font-semibold text-emerald-400">
                                                            +
                                                            {formatMoney(
                                                                sale.amount,
                                                            )}
                                                        </p>

                                                        <div className="mt-1">
                                                            <StatusBadge
                                                                status={
                                                                    sale.status
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </Link>
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* EXPENSES */}

                            <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
                                <div className="border-b border-neutral-800 p-5">
                                    <h2 className="text-base font-semibold">
                                        Expenses
                                    </h2>

                                    <p className="mt-1 text-sm text-neutral-500">
                                        Expenses within the selected period.
                                    </p>
                                </div>

                                {data.periodExpenses.length ===
                                0 ? (
                                    <div className="p-8 text-center text-sm text-neutral-500">
                                        No expenses in this period.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-neutral-800">
                                        {data.periodExpenses.map(
                                            (expense) => (
                                                <Link
                                                    key={
                                                        expense.id
                                                    }
                                                    href={`/expenses/${expense.id}/edit`}
                                                    className="flex items-center justify-between gap-4 p-5 transition hover:bg-neutral-800/30"
                                                >
                                                    <div>
                                                        <p className="font-medium">
                                                            {
                                                                expense.description
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-sm text-neutral-500">
                                                            {expense.category ??
                                                                'Uncategorized'}
                                                        </p>

                                                        <p className="mt-1 text-xs text-neutral-600">
                                                            {formatDate(
                                                                expense.expense_date,
                                                            )}
                                                        </p>
                                                    </div>

                                                    <p className="font-semibold text-red-400">
                                                        -
                                                        {formatMoney(
                                                            expense.amount,
                                                        )}
                                                    </p>
                                                </Link>
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* FINANCIAL OVERVIEW */}

                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 lg:col-span-2">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-base font-semibold">
                                        Financial overview
                                    </h2>

                                    <p className="mt-1 text-sm text-neutral-500">
                                        Sales and expenses over the last six months.
                                    </p>
                                </div>

                                <div className="flex items-center gap-4 text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-emerald-400" />

                                        <span className="text-neutral-500">
                                            Sales
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-red-400" />

                                        <span className="text-neutral-500">
                                            Expenses
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex h-64 items-end gap-4">
                                {data.monthlyOverview.map(
                                    (month) => {
                                        const salesHeight =
                                            (month.sales /
                                                maxValue) *
                                            100;

                                        const expensesHeight =
                                            (month.expenses /
                                                maxValue) *
                                            100;

                                        return (
                                            <div
                                                key={
                                                    month.label
                                                }
                                                className="flex h-full flex-1 flex-col justify-end gap-2"
                                            >
                                                <div className="flex h-full items-end justify-center gap-1">
                                                    <div
                                                        className="w-4 rounded-t bg-emerald-400/80 transition hover:bg-emerald-400"
                                                        style={{
                                                            height: `${Math.max(
                                                                salesHeight,
                                                                2,
                                                            )}%`,
                                                        }}
                                                        title={`${month.label} sales: ${formatMoney(
                                                            month.sales,
                                                        )}`}
                                                    />

                                                    <div
                                                        className="w-4 rounded-t bg-red-400/70 transition hover:bg-red-400"
                                                        style={{
                                                            height: `${Math.max(
                                                                expensesHeight,
                                                                2,
                                                            )}%`,
                                                        }}
                                                        title={`${month.label} expenses: ${formatMoney(
                                                            month.expenses,
                                                        )}`}
                                                    />
                                                </div>

                                                <span className="text-center text-xs text-neutral-500">
                                                    {
                                                        month.label
                                                    }
                                                </span>
                                            </div>
                                        );
                                    },
                                )}
                            </div>
                        </div>

                        {/* QUICK STATS */}

                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                            <h2 className="text-base font-semibold">
                                Quick stats
                            </h2>

                            <div className="mt-6 space-y-5">
                                <div>
                                    <p className="text-sm text-neutral-500">
                                        Sales
                                    </p>

                                    <p className="mt-1 text-2xl font-semibold">
                                        {
                                            data.salesCount
                                        }
                                    </p>
                                </div>

                                <div className="border-t border-neutral-800 pt-5">
                                    <p className="text-sm text-neutral-500">
                                        Customers
                                    </p>

                                    <p className="mt-1 text-2xl font-semibold">
                                        {
                                            data.customersCount
                                        }
                                    </p>
                                </div>

                                <div className="border-t border-neutral-800 pt-5">
                                    <p className="text-sm text-neutral-500">
                                        Outstanding
                                    </p>

                                    <p className="mt-1 text-2xl font-semibold text-amber-400">
                                        {formatMoney(
                                            data.outstanding,
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RECENT SALES / EXPENSES */}

                    <div className="grid gap-6 lg:grid-cols-2">

                        {/* RECENT SALES */}

                        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
                            <div className="flex items-center justify-between border-b border-neutral-800 p-5">
                                <div>
                                    <h2 className="text-base font-semibold">
                                        Recent Sales
                                    </h2>

                                    <p className="mt-1 text-sm text-neutral-500">
                                        Latest recorded sales.
                                    </p>
                                </div>

                                <Link
                                    href="/sales"
                                    className="text-sm text-neutral-400 transition hover:text-neutral-200"
                                >
                                    View all
                                </Link>
                            </div>

                            {data.recentSales.length ===
                            0 ? (
                                <div className="p-8 text-center text-sm text-neutral-500">
                                    No sales found for this period.
                                </div>
                            ) : (
                                <div className="divide-y divide-neutral-800">
                                    {data.recentSales.map(
                                        (sale) => (
                                            <Link
                                                key={
                                                    sale.id
                                                }
                                                href={`/sales/${sale.id}`}
                                                className="flex items-center justify-between gap-4 p-5 transition hover:bg-neutral-800/30"
                                            >
                                                <div>
                                                    <p className="font-medium">
                                                        Sale #
                                                        {
                                                            sale.id
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-sm text-neutral-500">
                                                        {sale
                                                            .customer
                                                            ?.name ??
                                                            'No customer'}
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    <p className="font-medium">
                                                        {formatMoney(
                                                            sale.amount,
                                                        )}
                                                    </p>

                                                    <div className="mt-1">
                                                        <StatusBadge
                                                            status={
                                                                sale.status
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </Link>
                                        ),
                                    )}
                                </div>
                            )}
                        </div>

                        {/* RECENT EXPENSES */}

                        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
                            <div className="flex items-center justify-between border-b border-neutral-800 p-5">
                                <div>
                                    <h2 className="text-base font-semibold">
                                        Recent Expenses
                                    </h2>

                                    <p className="mt-1 text-sm text-neutral-500">
                                        Latest recorded expenses.
                                    </p>
                                </div>

                                <Link
                                    href="/expenses"
                                    className="text-sm text-neutral-400 transition hover:text-neutral-200"
                                >
                                    View all
                                </Link>
                            </div>

                            {data.recentExpenses.length ===
                            0 ? (
                                <div className="p-8 text-center text-sm text-neutral-500">
                                    No expenses found for this period.
                                </div>
                            ) : (
                                <div className="divide-y divide-neutral-800">
                                    {data.recentExpenses.map(
                                        (expense) => (
                                            <Link
                                                key={
                                                    expense.id
                                                }
                                                href={`/expenses/${expense.id}/edit`}
                                                className="flex items-center justify-between gap-4 p-5 transition hover:bg-neutral-800/30"
                                            >
                                                <div>
                                                    <p className="font-medium">
                                                        {
                                                            expense.description
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-sm text-neutral-500">
                                                        {expense.category ??
                                                            'Uncategorized'}
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    <p className="font-medium text-red-400">
                                                        {formatMoney(
                                                            expense.amount,
                                                        )}
                                                    </p>

                                                    <p className="mt-1 text-xs text-neutral-500">
                                                        {formatDate(
                                                            expense.expense_date,
                                                        )}
                                                    </p>
                                                </div>
                                            </Link>
                                        ),
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}