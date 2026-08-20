import AppLayout from '@/layouts/app-layout';
import { formatDate, formatMoney } from '@/lib/formatters';
import { Link } from '@inertiajs/react';

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
};

type Props = {
    data: DashboardData;
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

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    return (
        <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${
                styles[status] ??
                'bg-neutral-800 text-neutral-300 border-neutral-700'
            }`}
        >
            {status}
        </span>
    );
}

export default function Dashboard({ data }: Props) {
    const maxValue = Math.max(
        ...data.monthlyOverview.flatMap((month) => [
            month.sales,
            month.expenses,
        ]),
        1,
    );

    return (
        <AppLayout>
            <div className="bg-neutral-950 p-6 text-neutral-100">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div>
                        <p className="text-sm font-medium text-neutral-500">
                            Business overview
                        </p>

                        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                            Dashboard
                        </h1>

                        <p className="mt-2 text-sm text-neutral-400">
                            Monitor your sales, payments, expenses and profit.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                        <StatCard
                            label="Total Sales"
                            value={formatMoney(data.totalSales)}
                            description="Non-cancelled sales"
                        />

                        <StatCard
                            label="Collected"
                            value={formatMoney(data.collected)}
                            description="Payments received"
                        />

                        <StatCard
                            label="Outstanding"
                            value={formatMoney(data.outstanding)}
                            description="Still to be collected"
                        />

                        <StatCard
                            label="Expenses"
                            value={formatMoney(data.expenses)}
                            description="Recorded expenses"
                        />

                        <StatCard
                            label="Profit"
                            value={formatMoney(data.profit)}
                            description="Collected minus expenses"
                        />
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 lg:col-span-2">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-base font-semibold">
                                        Financial overview
                                    </h2>

                                    <p className="mt-1 text-sm text-neutral-500">
                                        Sales and expenses over the last six
                                        months.
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
                                {data.monthlyOverview.map((month) => {
                                    const salesHeight =
                                        (month.sales / maxValue) * 100;

                                    const expensesHeight =
                                        (month.expenses / maxValue) * 100;

                                    return (
                                        <div
                                            key={month.label}
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
                                                {month.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

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
                                        {data.salesCount}
                                    </p>
                                </div>

                                <div className="border-t border-neutral-800 pt-5">
                                    <p className="text-sm text-neutral-500">
                                        Customers
                                    </p>

                                    <p className="mt-1 text-2xl font-semibold">
                                        {data.customersCount}
                                    </p>
                                </div>

                                <div className="border-t border-neutral-800 pt-5">
                                    <p className="text-sm text-neutral-500">
                                        Outstanding
                                    </p>

                                    <p className="mt-1 text-2xl font-semibold text-amber-400">
                                        {formatMoney(data.outstanding)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
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

                            {data.recentSales.length === 0 ? (
                                <div className="p-8 text-center text-sm text-neutral-500">
                                    No sales yet.
                                </div>
                            ) : (
                                <div className="divide-y divide-neutral-800">
                                    {data.recentSales.map((sale) => (
                                        <Link
                                            key={sale.id}
                                            href={`/sales/${sale.id}`}
                                            className="flex items-center justify-between gap-4 p-5 transition hover:bg-neutral-800/30"
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    Sale #{sale.id}
                                                </p>

                                                <p className="mt-1 text-sm text-neutral-500">
                                                    {sale.customer?.name ??
                                                        'No customer'}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <p className="font-medium">
                                                    {formatMoney(sale.amount)}
                                                </p>

                                                <div className="mt-1">
                                                    <StatusBadge
                                                        status={sale.status}
                                                    />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

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

                            {data.recentExpenses.length === 0 ? (
                                <div className="p-8 text-center text-sm text-neutral-500">
                                    No expenses yet.
                                </div>
                            ) : (
                                <div className="divide-y divide-neutral-800">
                                    {data.recentExpenses.map((expense) => (
                                        <Link
                                            key={expense.id}
                                            href={`/expenses/${expense.id}/edit`}
                                            className="flex items-center justify-between gap-4 p-5 transition hover:bg-neutral-800/30"
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    {expense.description}
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
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}