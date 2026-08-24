import {
    Link,
    router,
} from '@inertiajs/react';

import {
    FormEvent,
    useState,
} from 'react';

import AppLayout from '@/layouts/app-layout';

import {
    formatDate,
    formatMoney,
} from '@/lib/formatters';

type SaleStatus = {
    id: number;
    name: string;
    slug: string;
    is_default: boolean;
};

type MonthlyOverview = {
    label: string;
    sales: number;
    income: number;
    expenses: number;
    net: number;
};

type Sale = {
    id: number;
    amount: string;
    sold_at: string;

    customer: {
        id: number;
        name: string;
    } | null;

    status: SaleStatus | null;
};

type Income = {
    id: number;
    amount: string;
    description: string;
    note: string | null;
    currency: string;
    operation_date: string;

    customer: {
        id: number;
        name: string;
    } | null;

    category: {
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

type DashboardData = {
    totalSales: number;
    totalIncome: number;
    collected: number;
    outstanding: number;
    expenses: number;
    netBalance: number;
    profit: number;

    salesCount: number;
    incomeCount: number;
    customersCount: number;

    monthlyOverview: MonthlyOverview[];

    recentSales: Sale[];
    recentIncome: Income[];
    recentExpenses: Expense[];
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
    status: SaleStatus | null;
}) {
    const styles: Record<
        string,
        string
    > = {
        paid:
            'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',

        pending:
            'border-amber-500/20 bg-amber-500/10 text-amber-400',

        cancelled:
            'border-red-500/20 bg-red-500/10 text-red-400',
    };

    return (
        <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                styles[
                    status?.slug ?? ''
                ] ??
                'border-neutral-700 bg-neutral-800 text-neutral-300'
            }`}
        >
            {status?.name ??
                'No Status'}
        </span>
    );
}

export default function Dashboard({
    data,
    filters,
}: Props) {
    const [
        startDate,
        setStartDate,
    ] = useState(
        filters.start_date ?? '',
    );

    const [
        endDate,
        setEndDate,
    ] = useState(
        filters.end_date ?? '',
    );

    const [
        processing,
        setProcessing,
    ] = useState(false);

    const invalidDateRange =
        !!startDate &&
        !!endDate &&
        startDate > endDate;

    const maxValue = Math.max(
        ...data.monthlyOverview.flatMap(
            (month) => [
                month.sales,
                month.income,
                month.expenses,
            ],
        ),
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
                            Monitor your sales, income,
                            expenses and financial balance.
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
                            onSubmit={
                                handleFilter
                            }
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
                                    value={
                                        startDate
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setStartDate(
                                            event
                                                .target
                                                .value,
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
                                    value={
                                        endDate
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setEndDate(
                                            event
                                                .target
                                                .value,
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
                                    onClick={
                                        clearFilter
                                    }
                                    disabled={
                                        processing
                                    }
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


                        {(startDate ||
                            endDate) &&
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
                                            : 'All time'}

                                        {' → '}

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

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">

                        <StatCard
                            label="Sales"
                            value={formatMoney(
                                data.totalSales,
                            )}
                            description="Total sales"
                        />

                        <StatCard
                            label="Income"
                            value={formatMoney(
                                data.totalIncome,
                            )}
                            description="Other income"
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
                            description="Business expenses"
                        />

                        <StatCard
                            label="Net Balance"
                            value={formatMoney(
                                data.netBalance,
                            )}
                            description="Collected + income − expenses"
                        />

                    </div>


                    {/* FINANCIAL OVERVIEW */}

                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                            <div>

                                <h2 className="text-base font-semibold">
                                    Financial Overview
                                </h2>

                                <p className="mt-1 text-sm text-neutral-500">
                                    Sales, income and expenses
                                    over the last six months.
                                </p>

                            </div>


                            <div className="flex flex-wrap gap-4 text-xs">

                                <div className="flex items-center gap-2">

                                    <span className="size-2 rounded-full bg-emerald-400" />

                                    <span className="text-neutral-500">
                                        Sales
                                    </span>

                                </div>


                                <div className="flex items-center gap-2">

                                    <span className="size-2 rounded-full bg-cyan-400" />

                                    <span className="text-neutral-500">
                                        Income
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
                                (
                                    month,
                                ) => {

                                    const salesHeight =
                                        (month.sales /
                                            maxValue) *
                                        100;

                                    const incomeHeight =
                                        (month.income /
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
                                                    className="w-3 rounded-t bg-emerald-400/80 transition hover:bg-emerald-400"
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
                                                    className="w-3 rounded-t bg-cyan-400/80 transition hover:bg-cyan-400"
                                                    style={{
                                                        height: `${Math.max(
                                                            incomeHeight,
                                                            2,
                                                        )}%`,
                                                    }}
                                                    title={`${month.label} income: ${formatMoney(
                                                        month.income,
                                                    )}`}
                                                />

                                                <div
                                                    className="w-3 rounded-t bg-red-400/70 transition hover:bg-red-400"
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

                    <div className="grid gap-6 sm:grid-cols-3">

                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">

                            <p className="text-sm text-neutral-500">
                                Sales
                            </p>

                            <p className="mt-2 text-2xl font-semibold">
                                {
                                    data.salesCount
                                }
                            </p>

                            <p className="mt-1 text-xs text-neutral-600">
                                Sales records
                            </p>

                        </div>


                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">

                            <p className="text-sm text-neutral-500">
                                Income
                            </p>

                            <p className="mt-2 text-2xl font-semibold">
                                {
                                    data.incomeCount
                                }
                            </p>

                            <p className="mt-1 text-xs text-neutral-600">
                                Income operations
                            </p>

                        </div>


                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">

                            <p className="text-sm text-neutral-500">
                                Customers
                            </p>

                            <p className="mt-2 text-2xl font-semibold">
                                {
                                    data.customersCount
                                }
                            </p>

                            <p className="mt-1 text-xs text-neutral-600">
                                Total customers
                            </p>

                        </div>

                    </div>


                    {/* RECENT ACTIVITY */}

                    <div className="grid gap-6 lg:grid-cols-3">

                        {/* RECENT SALES */}

                        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">

                            <div className="flex items-center justify-between border-b border-neutral-800 p-5">

                                <div>

                                    <h2 className="text-base font-semibold">
                                        Recent Sales
                                    </h2>

                                    <p className="mt-1 text-sm text-neutral-500">
                                        Latest sales.
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
                                    No sales found.
                                </div>

                            ) : (

                                <div className="divide-y divide-neutral-800">

                                    {data.recentSales.map(
                                        (
                                            sale,
                                        ) => (

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


                        {/* RECENT INCOME */}

                        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">

                            <div className="flex items-center justify-between border-b border-neutral-800 p-5">

                                <div>

                                    <h2 className="text-base font-semibold">
                                        Recent Income
                                    </h2>

                                    <p className="mt-1 text-sm text-neutral-500">
                                        Latest income operations.
                                    </p>

                                </div>


                                <Link
                                    href="/income"
                                    className="text-sm text-neutral-400 transition hover:text-neutral-200"
                                >
                                    View all
                                </Link>

                            </div>


                            {data.recentIncome.length ===
                            0 ? (

                                <div className="p-8 text-center text-sm text-neutral-500">
                                    No income found.
                                </div>

                            ) : (

                                <div className="divide-y divide-neutral-800">

                                    {data.recentIncome.map(
                                        (
                                            income,
                                        ) => (

                                            <Link
                                                key={
                                                    income.id
                                                }
                                                href={`/income/${income.id}`}
                                                className="flex items-center justify-between gap-4 p-5 transition hover:bg-neutral-800/30"
                                            >

                                                <div>

                                                    <p className="font-medium">
                                                        {
                                                            income.description
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-sm text-neutral-500">
                                                        {income
                                                            .category
                                                            ?.name ??
                                                            'Uncategorized'}
                                                    </p>

                                                    <p className="mt-1 text-xs text-neutral-600">
                                                        {formatDate(
                                                            income.operation_date,
                                                        )}
                                                    </p>

                                                </div>


                                                <p className="font-semibold text-cyan-400">
                                                    +
                                                    {formatMoney(
                                                        income.amount,
                                                    )}
                                                </p>

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
                                        Latest expenses.
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
                                    No expenses found.
                                </div>

                            ) : (

                                <div className="divide-y divide-neutral-800">

                                    {data.recentExpenses.map(
                                        (
                                            expense,
                                        ) => (

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

                </div>

            </div>

        </AppLayout>
    );
}