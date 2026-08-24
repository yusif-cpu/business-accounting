import {
    Link,
    useForm,
} from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';

import {
    formatDate,
    formatMoney,
} from '@/lib/formatters';

type Customer = {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
};

type Payment = {
    id: number;
    amount: string;
    method: string;
    paid_at: string;
};

type SaleStatus = {
    id: number;
    name: string;
    slug: string;
    is_default: boolean;
};

type Sale = {
    id: number;
    amount: string;
    status: SaleStatus | null;
    sold_at: string;
    customer: Customer | null;
    payments: Payment[];
};

type Props = {
    sale: Sale;
};

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
            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',

        pending:
            'bg-amber-500/10 text-amber-400 border-amber-500/20',

        cancelled:
            'bg-red-500/10 text-red-400 border-red-500/20',
    };

    const slug =
        status?.slug ?? '';

    return (
        <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                styles[slug] ??
                'border-neutral-700 bg-neutral-800 text-neutral-300'
            }`}
        >
            {status?.name ??
                'No Status'}
        </span>
    );
}

export default function Show({
    sale,
}: Props) {
    const {
        delete: destroy,
        processing,
    } = useForm();

    const totalPaid =
        sale.payments.reduce(
            (
                total,
                payment
            ) =>
                total +
                Number(
                    payment.amount
                ),
            0
        );

    const remaining =
        Number(sale.amount) -
        totalPaid;

    const handleDeletePayment = (
        paymentId: number
    ) => {
        if (
            confirm(
                'Delete this payment?'
            )
        ) {
            destroy(
                `/payments/${paymentId}`
            );
        }
    };

    return (
        <AppLayout>

            <div className="bg-neutral-950 p-6 text-neutral-100">

                <div className="mx-auto max-w-7xl space-y-6">

                    {/* HEADER */}

                    <div>

                        <Link
                            href="/sales"
                            className="inline-flex items-center text-sm text-neutral-500 transition hover:text-neutral-200"
                        >
                            ← Back to Sales
                        </Link>

                        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                            <div>

                                <div className="flex flex-wrap items-center gap-3">

                                    <h1 className="text-2xl font-semibold tracking-tight">
                                        Sale #{sale.id}
                                    </h1>

                                    <StatusBadge
                                        status={
                                            sale.status
                                        }
                                    />

                                </div>

                                <p className="mt-2 text-sm text-neutral-500">
                                    Created on{' '}
                                    {formatDate(
                                        sale.sold_at
                                    )}
                                </p>

                            </div>

                            <div className="flex flex-wrap gap-3">

                                <Link
                                    href={`/sales/${sale.id}/payments/create`}
                                    className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm font-medium text-emerald-400 transition hover:bg-neutral-800"
                                >
                                    Add Payment
                                </Link>

                                <Link
                                    href={`/sales/${sale.id}/edit`}
                                    className="rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-white"
                                >
                                    Edit Sale
                                </Link>

                            </div>

                        </div>

                    </div>

                    {/* SUMMARY */}

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">

                            <p className="text-sm text-neutral-500">
                                Sale Amount
                            </p>

                            <p className="mt-2 text-2xl font-semibold">
                                {formatMoney(
                                    sale.amount
                                )}
                            </p>

                        </div>

                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">

                            <p className="text-sm text-neutral-500">
                                Paid
                            </p>

                            <p className="mt-2 text-2xl font-semibold text-emerald-400">
                                {formatMoney(
                                    totalPaid
                                )}
                            </p>

                        </div>

                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">

                            <p className="text-sm text-neutral-500">
                                Remaining
                            </p>

                            <p className="mt-2 text-2xl font-semibold text-amber-400">
                                {formatMoney(
                                    remaining
                                )}
                            </p>

                        </div>

                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">

                            <p className="text-sm text-neutral-500">
                                Payments
                            </p>

                            <p className="mt-2 text-2xl font-semibold">
                                {
                                    sale
                                        .payments
                                        .length
                                }
                            </p>

                        </div>

                    </div>

                    {/* CUSTOMER + PAYMENTS */}

                    <div className="grid gap-6 lg:grid-cols-3">

                        {/* CUSTOMER */}

                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">

                            <h2 className="font-semibold">
                                Customer
                            </h2>

                            {sale.customer ? (

                                <div className="mt-6">

                                    <div className="flex items-center gap-3">

                                        <div className="flex size-11 items-center justify-center rounded-full bg-neutral-800 text-sm font-semibold">

                                            {sale.customer.name
                                                .charAt(
                                                    0
                                                )
                                                .toUpperCase()}

                                        </div>

                                        <div>

                                            <p className="font-medium">
                                                {
                                                    sale
                                                        .customer
                                                        .name
                                                }
                                            </p>

                                            <p className="text-xs text-neutral-500">
                                                Customer #
                                                {
                                                    sale
                                                        .customer
                                                        .id
                                                }
                                            </p>

                                        </div>

                                    </div>

                                    <div className="mt-5 border-t border-neutral-800 pt-5 text-sm text-neutral-400">

                                        <p>
                                            {
                                                sale
                                                    .customer
                                                    .email ??
                                                'No email provided'
                                            }
                                        </p>

                                        <p className="mt-2">
                                            {
                                                sale
                                                    .customer
                                                    .phone ??
                                                'No phone provided'
                                            }
                                        </p>

                                    </div>

                                </div>

                            ) : (

                                <p className="mt-5 text-sm text-neutral-500">
                                    No customer assigned.
                                </p>

                            )}

                        </div>

                        {/* PAYMENT HISTORY */}

                        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 lg:col-span-2">

                            <div className="border-b border-neutral-800 p-6">

                                <h2 className="font-semibold">
                                    Payment History
                                </h2>

                                <p className="mt-1 text-sm text-neutral-500">
                                    All payments recorded for this sale.
                                </p>

                            </div>

                            {sale.payments.length ===
                            0 ? (

                                <div className="p-10 text-center">

                                    <p className="text-sm text-neutral-500">
                                        No payments recorded yet.
                                    </p>

                                    <Link
                                        href={`/sales/${sale.id}/payments/create`}
                                        className="mt-4 inline-flex rounded-xl border border-neutral-800 px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:bg-neutral-800"
                                    >
                                        Add Payment
                                    </Link>

                                </div>

                            ) : (

                                <div className="divide-y divide-neutral-800">

                                    {sale.payments.map(
                                        (
                                            payment
                                        ) => (

                                            <div
                                                key={
                                                    payment.id
                                                }
                                                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                                            >

                                                <div>

                                                    <p className="font-medium capitalize">

                                                        {payment.method.replace(
                                                            '_',
                                                            ' '
                                                        )}

                                                    </p>

                                                    <p className="mt-1 text-sm text-neutral-500">

                                                        {formatDate(
                                                            payment.paid_at
                                                        )}

                                                    </p>

                                                </div>

                                                <div className="flex items-center gap-5">

                                                    <p className="font-semibold text-emerald-400">

                                                        {formatMoney(
                                                            payment.amount
                                                        )}

                                                    </p>

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            processing
                                                        }
                                                        onClick={() =>
                                                            handleDeletePayment(
                                                                payment.id
                                                            )
                                                        }
                                                        className="text-sm text-red-400 transition hover:text-red-300 disabled:opacity-50"
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                            )}

                        </div>

                    </div>

                    {/* BACK */}

                    <div className="flex justify-start border-t border-neutral-800 pt-5">

                        <Link
                            href="/sales"
                            className="rounded-xl border border-neutral-800 px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:bg-neutral-800"
                        >
                            ← Back to Sales
                        </Link>

                    </div>

                </div>

            </div>

        </AppLayout>
    );
}