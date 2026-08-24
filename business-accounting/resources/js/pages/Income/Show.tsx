import { Link } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';

import {
    formatDate,
    formatMoney,
} from '@/lib/formatters';

type Customer = {
    id: number;
    name: string;
};

type Category = {
    id: number;
    name: string;
};

type Income = {
    id: number;
    description: string;
    amount: string;
    currency: string;
    operation_date: string;
    note: string | null;
    customer: Customer | null;
    category: Category | null;
};

type Props = {
    income: Income;
};

function DetailRow({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="border-b border-neutral-800 py-5 last:border-b-0">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                {label}
            </p>

            <div className="mt-2 text-sm text-neutral-200">
                {children}
            </div>
        </div>
    );
}

export default function Show({
    income,
}: Props) {
    return (
        <AppLayout>
            <div className="min-h-full bg-neutral-950 p-6 text-neutral-100">
                <div className="mx-auto max-w-4xl space-y-6">

                    {/* HEADER */}

                    <div>
                        <Link
                            href="/income"
                            className="inline-flex items-center text-sm text-neutral-500 transition hover:text-neutral-200"
                        >
                            ← Back to Income
                        </Link>

                        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                            <div>

                                <div className="flex items-center gap-3">

                                    <h1 className="text-2xl font-semibold tracking-tight">
                                        Income Details
                                    </h1>

                                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                                        Income #{income.id}
                                    </span>

                                </div>

                                <p className="mt-2 text-sm text-neutral-400">
                                    View the complete details of this income.
                                </p>

                            </div>

                            <Link
                                href={`/income/${income.id}/edit`}
                                className="inline-flex items-center justify-center rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-white"
                            >
                                Edit Income
                            </Link>

                        </div>
                    </div>

                    {/* AMOUNT */}

                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">

                        <p className="text-sm font-medium text-emerald-400">
                            Income Amount
                        </p>

                        <p className="mt-2 text-4xl font-semibold tracking-tight text-emerald-400">
                            +
                            {formatMoney(
                                income.amount
                            )}{' '}
                            {income.currency}
                        </p>

                        <p className="mt-2 text-sm text-neutral-500">
                            {formatDate(
                                income.operation_date
                            )}
                        </p>

                    </div>

                    {/* DETAILS */}

                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900">

                        <div className="border-b border-neutral-800 px-6 py-5">

                            <h2 className="font-semibold">
                                Income information
                            </h2>

                            <p className="mt-1 text-sm text-neutral-500">
                                Complete information about this transaction.
                            </p>

                        </div>

                        <div className="px-6">

                            <DetailRow label="Description">
                                {income.description}
                            </DetailRow>

                            <DetailRow label="Category">
                                {income.category ? (
                                    <span className="inline-flex rounded-full border border-neutral-700 bg-neutral-800 px-3 py-1 text-xs font-medium text-neutral-300">
                                        {
                                            income
                                                .category
                                                .name
                                        }
                                    </span>
                                ) : (
                                    <span className="text-neutral-600">
                                        No category
                                    </span>
                                )}
                            </DetailRow>

                            <DetailRow label="Customer">
                                {income.customer ? (
                                    income.customer.name
                                ) : (
                                    <span className="text-neutral-600">
                                        No customer
                                    </span>
                                )}
                            </DetailRow>

                            <DetailRow label="Date">
                                {formatDate(
                                    income.operation_date
                                )}
                            </DetailRow>

                            <DetailRow label="Currency">
                                {income.currency}
                            </DetailRow>

                            <DetailRow label="Amount">
                                <span className="font-semibold text-emerald-400">
                                    +
                                    {formatMoney(
                                        income.amount
                                    )}{' '}
                                    {income.currency}
                                </span>
                            </DetailRow>

                            <DetailRow label="Note">
                                {income.note ? (
                                    <p className="whitespace-pre-wrap text-neutral-300">
                                        {income.note}
                                    </p>
                                ) : (
                                    <span className="text-neutral-600">
                                        No note
                                    </span>
                                )}
                            </DetailRow>

                        </div>
                    </div>

                    {/* FOOTER ACTIONS */}

                    <div className="flex justify-end gap-3">

                        <Link
                            href="/income"
                            className="rounded-xl border border-neutral-800 px-5 py-2.5 text-sm font-medium text-neutral-300 transition hover:bg-neutral-800"
                        >
                            Back
                        </Link>

                        <Link
                            href={`/income/${income.id}/edit`}
                            className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400"
                        >
                            Edit Income
                        </Link>

                    </div>

                </div>
            </div>
        </AppLayout>
    );
}