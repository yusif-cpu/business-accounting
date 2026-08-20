import AppLayout from '@/layouts/app-layout';
import FormError from '@/components/form-error';
import { useForm } from '@inertiajs/react';

type Expense = {
    id: number;
    description: string;
    amount: string;
    category: string | null;
    expense_date: string;
};

type Props = {
    expense: Expense;
};

export default function Edit({ expense }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        description: expense.description,
        amount: expense.amount,
        category: expense.category ?? '',
        expense_date: expense.expense_date.slice(0, 10),
    });

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        put(`/expenses/${expense.id}`);
    };

    return (
        <AppLayout>
            <div className="bg-neutral-950 p-6 text-neutral-100">
                <div className="mx-auto max-w-2xl space-y-6">
                    <div>
                        <a
                            href="/expenses"
                            className="inline-flex items-center text-sm text-neutral-500 transition hover:text-neutral-200"
                        >
                            ← Back to Expenses
                        </a>

                        <div className="mt-5">
                            <p className="text-sm font-medium text-neutral-500">
                                Expense #{expense.id}
                            </p>

                            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                                Edit Expense
                            </h1>

                            <p className="mt-2 text-sm text-neutral-400">
                                Update the expense details.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label
                                    htmlFor="description"
                                    className="text-sm font-medium text-neutral-300"
                                >
                                    Description
                                </label>

                                <input
                                    id="description"
                                    type="text"
                                    value={data.description}
                                    onChange={(event) =>
                                        setData(
                                            'description',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 outline-none transition focus:border-neutral-600"
                                />

                                <FormError message={errors.description} />
                            </div>

                            <div>
                                <label
                                    htmlFor="amount"
                                    className="text-sm font-medium text-neutral-300"
                                >
                                    Amount
                                </label>

                                <input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={data.amount}
                                    onChange={(event) =>
                                        setData(
                                            'amount',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 outline-none transition focus:border-neutral-600"
                                />

                                <FormError message={errors.amount} />
                            </div>

                            <div>
                                <label
                                    htmlFor="category"
                                    className="text-sm font-medium text-neutral-300"
                                >
                                    Category
                                </label>

                                <input
                                    id="category"
                                    type="text"
                                    value={data.category}
                                    onChange={(event) =>
                                        setData(
                                            'category',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 outline-none transition focus:border-neutral-600"
                                />

                                <FormError message={errors.category} />
                            </div>

                            <div>
                                <label
                                    htmlFor="expense_date"
                                    className="text-sm font-medium text-neutral-300"
                                >
                                    Expense Date
                                </label>

                                <input
                                    id="expense_date"
                                    type="date"
                                    value={data.expense_date}
                                    onChange={(event) =>
                                        setData(
                                            'expense_date',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 outline-none transition focus:border-neutral-600"
                                />

                                <FormError
                                    message={errors.expense_date}
                                />
                            </div>

                            <div className="flex justify-end gap-3 border-t border-neutral-800 pt-5">
                                <a
                                    href="/expenses"
                                    className="rounded-xl border border-neutral-800 px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:bg-neutral-800"
                                >
                                    Cancel
                                </a>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-xl bg-neutral-100 px-5 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-white disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Saving...'
                                        : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}