import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

type Category = {
    id: number;
    name: string;
    type: 'income' | 'expense';
};

type Operation = {
    id: number;
    type: 'income' | 'expense';
    operation_date: string;
    currency: string;
    amount: string;
    description: string;
    note: string | null;
    category: Category | null;
};

type Customer = {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    operations: Operation[];
};

type Props = {
    customer: Customer;
    totalIncome: number | string;
    totalExpenses: number | string;
    balance: number | string;
};

function formatDate(date: string) {
    const value = date.slice(0, 10);

    const [year, month, day] = value.split('-');

    if (!year || !month || !day) {
        return date;
    }

    return `${day}/${month}/${year}`;
}

function formatAmount(
    amount: number | string,
    currency = 'AZN',
) {
    return `${Number(amount).toFixed(2)} ${currency}`;
}

export default function Show({
    customer,
    totalIncome,
    totalExpenses,
    balance,
}: Props) {
    return (
        <AppLayout>
            <div className="min-h-full bg-neutral-950 p-6 text-neutral-100">
                <div className="mx-auto max-w-7xl space-y-6">

                    {/* HEADER */}

                    <div>
                        <Link
                            href="/customers"
                            className="inline-flex items-center text-sm text-neutral-500 transition hover:text-neutral-200"
                        >
                            ← Back to Customers
                        </Link>

                        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-neutral-800 text-xl font-semibold text-neutral-300">
                                    {customer.name
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-neutral-500">
                                        Customer #{customer.id}
                                    </p>

                                    <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                                        {customer.name}
                                    </h1>

                                    <p className="mt-1 text-sm text-neutral-500">
                                        Customer overview
                                    </p>
                                </div>
                            </div>

                            <Link
                                href={`/customers/${customer.id}/edit`}
                                className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-neutral-200 transition hover:bg-neutral-800"
                            >
                                Edit Customer
                            </Link>
                        </div>
                    </div>

                    {/* CUSTOMER INFO */}

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                                Email
                            </p>

                            <p className="mt-2 truncate text-sm font-medium text-neutral-200">
                                {customer.email ??
                                    'Not provided'}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                                Phone
                            </p>

                            <p className="mt-2 text-sm font-medium text-neutral-200">
                                {customer.phone ??
                                    'Not provided'}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                                Operations
                            </p>

                            <p className="mt-2 text-2xl font-semibold text-neutral-100">
                                {customer.operations.length}
                            </p>
                        </div>
                    </div>

                    {/* FINANCIAL SUMMARY */}

                    <div>
                        <div className="mb-4">
                            <h2 className="text-base font-semibold">
                                Financial summary
                            </h2>

                            <p className="mt-1 text-sm text-neutral-500">
                                Overview of this customer's financial activity.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            {/* INCOME */}

                            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                                <p className="text-sm font-medium text-neutral-400">
                                    Total Income
                                </p>

                                <p className="mt-3 text-2xl font-semibold text-emerald-400">
                                    +₼
                                    {Number(
                                        totalIncome,
                                    ).toFixed(2)}
                                </p>
                            </div>

                            {/* EXPENSES */}

                            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
                                <p className="text-sm font-medium text-neutral-400">
                                    Total Expenses
                                </p>

                                <p className="mt-3 text-2xl font-semibold text-red-400">
                                    -₼
                                    {Number(
                                        totalExpenses,
                                    ).toFixed(2)}
                                </p>
                            </div>

                            {/* BALANCE */}

                            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                                <p className="text-sm font-medium text-neutral-400">
                                    Balance
                                </p>

                                <p
                                    className={`mt-3 text-2xl font-semibold ${
                                        Number(balance) >=
                                        0
                                            ? 'text-emerald-400'
                                            : 'text-red-400'
                                    }`}
                                >
                                    {Number(balance) >=
                                    0
                                        ? '+'
                                        : '-'}
                                    ₼
                                    {Math.abs(
                                        Number(balance),
                                    ).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* OPERATIONS */}

                    <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
                        <div className="border-b border-neutral-800 px-6 py-5">
                            <h2 className="font-semibold">
                                Operations
                            </h2>

                            <p className="mt-1 text-sm text-neutral-500">
                                Financial operations associated with this customer.
                            </p>
                        </div>

                        {customer.operations.length ===
                        0 ? (
                            <div className="p-10 text-center">
                                <p className="text-sm text-neutral-500">
                                    No operations found for this customer.
                                </p>

                                <Link
                                    href="/operations/create"
                                    className="mt-4 inline-flex rounded-xl border border-neutral-800 px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:bg-neutral-800"
                                >
                                    Create Operation
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[850px] text-left text-sm">
                                    <thead className="border-b border-neutral-800">
                                        <tr>
                                            <th className="px-6 py-4 font-medium text-neutral-500">
                                                Date
                                            </th>

                                            <th className="px-6 py-4 font-medium text-neutral-500">
                                                Type
                                            </th>

                                            <th className="px-6 py-4 font-medium text-neutral-500">
                                                Category
                                            </th>

                                            <th className="px-6 py-4 font-medium text-neutral-500">
                                                Description
                                            </th>

                                            <th className="px-6 py-4 text-right font-medium text-neutral-500">
                                                Amount
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-neutral-800">
                                        {customer.operations.map(
                                            (
                                                operation,
                                            ) => (
                                                <tr
                                                    key={
                                                        operation.id
                                                    }
                                                    className="transition hover:bg-neutral-800/30"
                                                >
                                                    <td className="px-6 py-4 text-neutral-300">
                                                        {formatDate(
                                                            operation.operation_date,
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                                operation.type ===
                                                                'income'
                                                                    ? 'bg-emerald-500/10 text-emerald-400'
                                                                    : 'bg-red-500/10 text-red-400'
                                                            }`}
                                                        >
                                                            {operation.type ===
                                                            'income'
                                                                ? 'Income'
                                                                : 'Expense'}
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-4 text-neutral-300">
                                                        {operation
                                                            .category
                                                            ?.name ??
                                                            'No category'}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="font-medium text-neutral-200">
                                                                {
                                                                    operation.description
                                                                }
                                                            </p>

                                                            {operation.note && (
                                                                <p className="mt-1 max-w-sm truncate text-xs text-neutral-500">
                                                                    {
                                                                        operation.note
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td
                                                        className={`px-6 py-4 text-right font-semibold ${
                                                            operation.type ===
                                                            'income'
                                                                ? 'text-emerald-400'
                                                                : 'text-red-400'
                                                        }`}
                                                    >
                                                        {operation.type ===
                                                        'income'
                                                            ? '+'
                                                            : '-'}
                                                        {formatAmount(
                                                            operation.amount,
                                                            operation.currency,
                                                        )}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}