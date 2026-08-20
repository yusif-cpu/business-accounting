import AppLayout from '@/layouts/app-layout';
import { Link, useForm } from '@inertiajs/react';
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

type ExpensesPagination = {
    data: Expense[];
    links: PaginationLink[];
};

type Props = {
    expenses: ExpensesPagination;
};

export default function Index({ expenses }: Props) {
    const { delete: destroy, processing } = useForm();

    const handleDelete = (expenseId: number) => {
        if (confirm('Are you sure you want to delete this expense?')) {
            destroy(`/expenses/${expenseId}`);
        }
    };

    return (
        <AppLayout>
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Expenses</h1>

                        <p className="mt-1 text-gray-500">
                            Manage your business expenses.
                        </p>
                    </div>

                    <Link
                        href="/expenses/create"
                        className="rounded bg-black px-4 py-2 text-white"
                    >
                        Create Expense
                    </Link>
                </div>

                <div className="mt-6 space-y-3">
                    {expenses.data.length === 0 ? (
                        <div className="rounded-lg border p-6">
                            <p className="text-gray-500">
                                No expenses found.
                            </p>
                        </div>
                    ) : (
                        expenses.data.map((expense) => (
                            <div
                                key={expense.id}
                                className="rounded-lg border p-4"
                            >
                                <div className="flex items-center justify-between gap-6">
                                    <div className="space-y-1">
                                        <p className="font-semibold">
                                            {expense.description}
                                        </p>

                                        <p>
                                            Amount:{' '}
                                            {formatMoney(expense.amount)}
                                        </p>

                                        <p>
                                            Category:{' '}
                                            {expense.category ??
                                                'Not provided'}
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            Date:{' '}
                                            {formatDate(
                                                expense.expense_date,
                                            )}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Link
                                            href={`/expenses/${expense.id}/edit`}
                                            className="text-blue-600"
                                        >
                                            Edit
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(expense.id)
                                            }
                                            disabled={processing}
                                            className="text-red-600 disabled:opacity-50"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {expenses.links.length > 3 && (
                    <div className="mt-6 flex flex-wrap gap-2">
                        {expenses.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url ?? '#'}
                                preserveScroll
                                className={`rounded border px-3 py-2 text-sm ${
                                    link.active
                                        ? 'bg-black text-white'
                                        : link.url
                                          ? 'bg-white text-gray-700'
                                          : 'cursor-not-allowed text-gray-400'
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
            </div>
        </AppLayout>
    );
}
