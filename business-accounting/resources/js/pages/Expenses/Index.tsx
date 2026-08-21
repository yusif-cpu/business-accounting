import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import DeleteConfirmation from '@/components/delete-confirmation';
import AppLayout from '@/layouts/app-layout';
import { formatDate, formatMoney } from '@/lib/formatters';

type Expense = {
    id: number;
    description: string;
    amount: string;
    category: string | null;
    expense_date: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    expenses: {
        data: Expense[];
        links: PaginationLink[];
    };
};

export default function Index({ expenses }: Props) {
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { delete: destroy, processing } = useForm();

    const handleDelete = () => {
        if (deleteId === null) {
            return;
        }

        destroy(`/expenses/${deleteId}`, {
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
                                Expenses
                            </p>

                            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                                Expenses
                            </h1>

                            <p className="mt-2 text-sm text-neutral-400">
                                Track your business expenses and spending.
                            </p>
                        </div>

                        <Link
                            href="/expenses/create"
                            className="inline-flex items-center justify-center rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-white"
                        >
                            Create Expense
                        </Link>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
                        {expenses.data.length === 0 ? (
                            <div className="p-10 text-center">
                                <p className="text-sm text-neutral-400">
                                    No expenses found.
                                </p>

                                <Link
                                    href="/expenses/create"
                                    className="mt-4 inline-flex rounded-xl border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:bg-neutral-800"
                                >
                                    Create your first expense
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[800px] text-left text-sm">
                                        <thead className="border-b border-neutral-800">
                                            <tr>
                                                <th className="px-5 py-4 font-medium text-neutral-500">
                                                    Description
                                                </th>
                                                <th className="px-5 py-4 font-medium text-neutral-500">
                                                    Category
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
                                            {expenses.data.map((expense) => (
                                                <tr
                                                    key={expense.id}
                                                    className="transition hover:bg-neutral-800/30"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div>
                                                            <p className="font-medium text-neutral-100">
                                                                {
                                                                    expense.description
                                                                }
                                                            </p>

                                                            <p className="text-xs text-neutral-500">
                                                                Expense #
                                                                {expense.id}
                                                            </p>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        {expense.category ? (
                                                            <span className="inline-flex rounded-full border border-neutral-700 bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-300">
                                                                {
                                                                    expense.category
                                                                }
                                                            </span>
                                                        ) : (
                                                            <span className="text-neutral-500">
                                                                Not provided
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4 font-semibold text-red-400">
                                                        {formatMoney(
                                                            expense.amount,
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4 text-neutral-400">
                                                        {formatDate(
                                                            expense.expense_date,
                                                            true,
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex justify-end gap-4">
                                                            <Link
                                                                href={`/expenses/${expense.id}/edit`}
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
                                                                        expense.id,
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

                                {expenses.links.length > 3 && (
                                    <div className="flex flex-wrap gap-2 border-t border-neutral-800 p-4">
                                        {expenses.links.map((link, index) => (
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
                title="Delete expense?"
                description="This expense will be permanently deleted. This action cannot be undone."
                onConfirm={handleDelete}
                processing={processing}
            />
        </AppLayout>
    );
}
