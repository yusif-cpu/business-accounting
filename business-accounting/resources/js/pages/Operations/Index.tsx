import AppLayout from '@/layouts/app-layout';
import DeleteConfirmation from '@/components/delete-confirmation';
import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { formatDate, formatMoney } from '@/lib/formatters';

type Customer = {
    id: number;
    name: string;
};

type Operation = {
    id: number;
    type: 'expense' | 'income';
    operation_date: string;
    currency: string;
    amount: string;
    category: string | null;
    description: string;
    customer: Customer | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    operations: {
        data: Operation[];
        links: PaginationLink[];
    };
};

export default function Index({ operations }: Props) {
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { delete: destroy, processing } = useForm();

    const handleDelete = () => {
        if (deleteId === null) {
            return;
        }

        destroy(`/operations/${deleteId}`, {
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
                                Operations
                            </p>

                            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                                Operations
                            </h1>

                            <p className="mt-2 text-sm text-neutral-400">
                                Track income and expenses in one journal.
                            </p>
                        </div>

                        <Link
                            href="/operations/create"
                            className="inline-flex items-center justify-center rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-white"
                        >
                            New Operation
                        </Link>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
                        {operations.data.length === 0 ? (
                            <div className="p-10 text-center">
                                <p className="text-sm text-neutral-500">
                                    No operations found.
                                </p>

                                <Link
                                    href="/operations/create"
                                    className="mt-4 inline-flex rounded-xl border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:bg-neutral-800"
                                >
                                    Create your first operation
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[1050px] text-left text-sm">
                                        <thead className="border-b border-neutral-800">
                                            <tr>
                                                <th className="px-5 py-4 font-medium text-neutral-500">
                                                    Type
                                                </th>

                                                <th className="px-5 py-4 font-medium text-neutral-500">
                                                    Description
                                                </th>

                                                <th className="px-5 py-4 font-medium text-neutral-500">
                                                    Category
                                                </th>

                                                <th className="px-5 py-4 font-medium text-neutral-500">
                                                    Customer
                                                </th>

                                                <th className="px-5 py-4 font-medium text-neutral-500">
                                                    Amount
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
                                            {operations.data.map((operation) => (
                                                <tr
                                                    key={operation.id}
                                                    className="transition hover:bg-neutral-800/30"
                                                >
                                                    <td className="px-5 py-4">
                                                        <span
                                                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${
                                                                operation.type ===
                                                                'income'
                                                                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                                                                    : 'border-red-500/20 bg-red-500/10 text-red-400'
                                                            }`}
                                                        >
                                                            {operation.type}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <p className="font-medium text-neutral-100">
                                                            {operation.description}
                                                        </p>

                                                        <p className="text-xs text-neutral-500">
                                                            Operation #
                                                            {operation.id}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4 text-neutral-400">
                                                        {operation.category ??
                                                            '—'}
                                                    </td>

                                                    <td className="px-5 py-4 text-neutral-400">
                                                        {operation.customer
                                                            ?.name ?? '—'}
                                                    </td>

                                                    <td
                                                        className={`px-5 py-4 font-semibold ${
                                                            operation.type ===
                                                            'income'
                                                                ? 'text-emerald-400'
                                                                : 'text-red-400'
                                                        }`}
                                                    >
                                                        {formatMoney(
                                                            operation.amount,
                                                        )}{' '}
                                                        {operation.currency}
                                                    </td>

                                                    <td className="px-5 py-4 text-neutral-400">
                                                        {formatDate(
                                                            operation.operation_date,
                                                            true,
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex justify-end gap-4">
                                                            <Link
                                                                href={`/operations/${operation.id}`}
                                                                className="text-neutral-300 transition hover:text-white"
                                                            >
                                                                View
                                                            </Link>

                                                            <Link
                                                                href={`/operations/${operation.id}/edit`}
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
                                                                        operation.id,
                                                                    )
                                                                }
                                                                className="text-red-400 transition hover:text-red-300 disabled:opacity-50"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {operations.links.length > 3 && (
                                    <div className="flex flex-wrap gap-2 border-t border-neutral-800 p-4">
                                        {operations.links.map((link, index) => (
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
                title="Delete operation?"
                description="This operation will be permanently deleted. This action cannot be undone."
                onConfirm={handleDelete}
                processing={processing}
            />
        </AppLayout>
    );
}