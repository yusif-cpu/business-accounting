import AppLayout from '@/layouts/app-layout';
import DeleteConfirmation from '@/components/delete-confirmation';
import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { formatDate, formatMoney } from '@/lib/formatters';

type Sale = {
    id: number;
    amount: string;
    status: string;
    sold_at: string;
    payments_sum_amount: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    sales: {
        data: Sale[];
        links: PaginationLink[];
    };
};

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

export default function Index({ sales }: Props) {
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { delete: destroy, processing } = useForm();

    const handleDelete = () => {
        if (deleteId === null) {
            return;
        }

        destroy(`/sales/${deleteId}`, {
            onSuccess: () => {
                setDeleteId(null);
            },
        });
    };

    return (
        <AppLayout>
            <div className="bg-neutral-950 p-6 text-neutral-100">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-neutral-500">
                                Sales
                            </p>

                            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                                Sales
                            </h1>

                            <p className="mt-2 text-sm text-neutral-400">
                                Manage sales, payments and outstanding
                                balances.
                            </p>
                        </div>

                        <Link
                            href="/sales/create"
                            className="inline-flex items-center justify-center rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-white"
                        >
                            Create Sale
                        </Link>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
                        {sales.data.length === 0 ? (
                            <div className="p-10 text-center">
                                <p className="text-sm text-neutral-400">
                                    No sales found.
                                </p>

                                <Link
                                    href="/sales/create"
                                    className="mt-4 inline-flex rounded-xl border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:bg-neutral-800"
                                >
                                    Create your first sale
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[900px] text-left text-sm">
                                        <thead className="border-b border-neutral-800">
                                            <tr>
                                                <th className="px-5 py-4 font-medium text-neutral-500">
                                                    Sale
                                                </th>
                                                <th className="px-5 py-4 font-medium text-neutral-500">
                                                    Amount
                                                </th>
                                                <th className="px-5 py-4 font-medium text-neutral-500">
                                                    Paid
                                                </th>
                                                <th className="px-5 py-4 font-medium text-neutral-500">
                                                    Remaining
                                                </th>
                                                <th className="px-5 py-4 font-medium text-neutral-500">
                                                    Status
                                                </th>
                                                <th className="px-5 py-4 font-medium text-neutral-500">
                                                    Date
                                                </th>
                                                <th className="px-5 py-4 text-right font-medium text-neutral-500">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-neutral-800">
                                            {sales.data.map((sale) => {
                                                const paid = Number(
                                                    sale.payments_sum_amount ??
                                                        0,
                                                );

                                                const remaining =
                                                    Number(sale.amount) -
                                                    paid;

                                                return (
                                                    <tr
                                                        key={sale.id}
                                                        className="transition hover:bg-neutral-800/30"
                                                    >
                                                        <td className="px-5 py-4">
                                                            <Link
                                                                href={`/sales/${sale.id}`}
                                                                className="font-medium text-neutral-100 transition hover:text-white"
                                                            >
                                                                Sale #{sale.id}
                                                            </Link>
                                                        </td>

                                                        <td className="px-5 py-4 text-neutral-200">
                                                            {formatMoney(
                                                                sale.amount,
                                                            )}
                                                        </td>

                                                        <td className="px-5 py-4 text-emerald-400">
                                                            {formatMoney(paid)}
                                                        </td>

                                                        <td className="px-5 py-4 text-neutral-300">
                                                            {formatMoney(
                                                                remaining,
                                                            )}
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <StatusBadge
                                                                status={
                                                                    sale.status
                                                                }
                                                            />
                                                        </td>

                                                        <td className="px-5 py-4 text-neutral-400">
                                                            {formatDate(
                                                                sale.sold_at,
                                                            )}
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <div className="flex justify-end gap-4">
                                                                <Link
                                                                    href={`/sales/${sale.id}`}
                                                                    className="text-neutral-300 transition hover:text-white"
                                                                >
                                                                    View
                                                                </Link>

                                                                <Link
                                                                    href={`/sales/${sale.id}/payments/create`}
                                                                    className="text-emerald-400 transition hover:text-emerald-300"
                                                                >
                                                                    Payment
                                                                </Link>

                                                                <Link
                                                                    href={`/sales/${sale.id}/edit`}
                                                                    className="text-blue-400 transition hover:text-blue-300"
                                                                >
                                                                    Edit
                                                                </Link>

                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                    onClick={() =>
                                                                        setDeleteId(
                                                                            sale.id,
                                                                        )
                                                                    }
                                                                    className="text-red-400 transition hover:text-red-300 disabled:opacity-50"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {sales.links.length > 3 && (
                                    <div className="flex flex-wrap gap-2 border-t border-neutral-800 p-4">
                                        {sales.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url ?? '#'}
                                                preserveScroll
                                                className={`rounded-lg border px-3 py-2 text-sm transition ${
                                                    link.active
                                                        ? 'border-neutral-600 bg-neutral-100 text-neutral-950'
                                                        : link.url
                                                          ? 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
                                                          : 'cursor-not-allowed border-neutral-900 text-neutral-600'
                                                }`}
                                            >
                                                <span
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <DeleteConfirmation
                open={deleteId !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteId(null);
                    }
                }}
                title="Delete sale?"
                description="This sale and its related payment records will be permanently deleted. This action cannot be undone."
                onConfirm={handleDelete}
                processing={processing}
            />
        </AppLayout>
    );
}