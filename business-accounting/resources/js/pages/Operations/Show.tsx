import AppLayout from '@/layouts/app-layout';
import { formatDate, formatMoney } from '@/lib/formatters';
import { Link } from '@inertiajs/react';

type Customer = {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
};

type Operation = {
    id: number;
    type: 'expense' | 'income';
    operation_date: string;
    currency: string;
    amount: string;
    category: string | null;
    description: string;
    note: string | null;
    customer: Customer | null;
};

type Props = {
    operation: Operation;
};

export default function Show({ operation }: Props) {
    const isIncome = operation.type === 'income';

    return (
        <AppLayout>
            <div className="bg-neutral-950 p-6 text-neutral-100">
                <div className="mx-auto max-w-5xl space-y-6">
                    <div>
                        <Link
                            href="/operations"
                            className="inline-flex items-center text-sm text-neutral-500 transition hover:text-neutral-200"
                        >
                            ← Back to Operations
                        </Link>

                        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-semibold tracking-tight">
                                        Operation #{operation.id}
                                    </h1>

                                    <span
                                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${
                                            isIncome
                                                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                                                : 'border-red-500/20 bg-red-500/10 text-red-400'
                                        }`}
                                    >
                                        {operation.type}
                                    </span>
                                </div>

                                <p className="mt-2 text-sm text-neutral-500">
                                    Recorded on{' '}
                                    {formatDate(
                                        operation.operation_date,
                                        true,
                                    )}
                                </p>
                            </div>

                            <Link
                                href={`/operations/${operation.id}/edit`}
                                className="inline-flex items-center justify-center rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-white"
                            >
                                Edit Operation
                            </Link>
                        </div>
                    </div>

                    <div
                        className={`rounded-2xl border p-6 ${
                            isIncome
                                ? 'border-emerald-500/20 bg-emerald-500/[0.05]'
                                : 'border-red-500/20 bg-red-500/[0.05]'
                        }`}
                    >
                        <p className="text-sm font-medium text-neutral-500">
                            {isIncome ? 'Income amount' : 'Expense amount'}
                        </p>

                        <div className="mt-3 flex flex-wrap items-end gap-3">
                            <p
                                className={`text-4xl font-semibold tracking-tight ${
                                    isIncome
                                        ? 'text-emerald-400'
                                        : 'text-red-400'
                                }`}
                            >
                                {formatMoney(operation.amount)}
                            </p>

                            <span className="pb-1 text-lg text-neutral-500">
                                {operation.currency}
                            </span>
                        </div>

                        <p className="mt-3 text-sm text-neutral-400">
                            {operation.description}
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                            <p className="text-sm text-neutral-500">
                                Date
                            </p>

                            <p className="mt-2 font-medium text-neutral-100">
                                {formatDate(
                                    operation.operation_date,
                                    true,
                                )}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                            <p className="text-sm text-neutral-500">
                                Category
                            </p>

                            <p className="mt-2 font-medium text-neutral-100">
                                {operation.category ?? 'No category'}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                            <p className="text-sm text-neutral-500">
                                Currency
                            </p>

                            <p className="mt-2 font-medium text-neutral-100">
                                {operation.currency}
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="font-semibold">
                                        Description
                                    </h2>

                                    <p className="mt-1 text-sm text-neutral-500">
                                        Details about this operation.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                                <p className="leading-7 text-neutral-300">
                                    {operation.description}
                                </p>
                            </div>

                            {operation.note && (
                                <div className="mt-5">
                                    <p className="text-sm font-medium text-neutral-400">
                                        Note
                                    </p>

                                    <div className="mt-2 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                                        <p className="whitespace-pre-wrap leading-7 text-neutral-400">
                                            {operation.note}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                            <div>
                                <h2 className="font-semibold">
                                    Customer / Project
                                </h2>

                                <p className="mt-1 text-sm text-neutral-500">
                                    Customer associated with this operation.
                                </p>
                            </div>

                            {operation.customer ? (
                                <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-950 p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-sm font-semibold text-neutral-200">
                                            {operation.customer.name
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>

                                        <div>
                                            <p className="font-medium text-neutral-100">
                                                {operation.customer.name}
                                            </p>

                                            <p className="mt-1 text-xs text-neutral-500">
                                                Customer #
                                                {operation.customer.id}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 space-y-2 border-t border-neutral-800 pt-4 text-sm text-neutral-400">
                                        <p>
                                            {operation.customer.email ??
                                                'No email provided'}
                                        </p>

                                        <p>
                                            {operation.customer.phone ??
                                                'No phone provided'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-6 rounded-xl border border-dashed border-neutral-800 p-6 text-center">
                                    <p className="text-sm text-neutral-500">
                                        No customer is associated with this
                                        operation.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end border-t border-neutral-800 pt-5">
                        <Link
                            href="/operations"
                            className="rounded-xl border border-neutral-800 px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:bg-neutral-800"
                        >
                            ← Back to Operations
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}