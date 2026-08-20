import AppLayout from '@/layouts/app-layout';
import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        description: '',
        amount: '',
        category: '',
        expense_date: new Date().toISOString().slice(0, 10),
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post('/expenses');
    };

    return (
        <AppLayout>
            <div className="p-6">
                <h1 className="text-2xl font-bold">Create Expense</h1>

                <form onSubmit={submit} className="mt-6 max-w-xl space-y-4">
                    <div>
                        <label>Description</label>

                        <input
                            type="text"
                            value={data.description}
                            onChange={(event) =>
                                setData('description', event.target.value)
                            }
                            className="mt-1 w-full rounded border p-2"
                        />

                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.description}
                            </p>
                        )}
                    </div>

                    <div>
                        <label>Amount</label>

                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={data.amount}
                            onChange={(event) =>
                                setData('amount', event.target.value)
                            }
                            className="mt-1 w-full rounded border p-2"
                        />

                        {errors.amount && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.amount}
                            </p>
                        )}
                    </div>

                    <div>
                        <label>Category</label>

                        <input
                            type="text"
                            value={data.category}
                            onChange={(event) =>
                                setData('category', event.target.value)
                            }
                            placeholder="Rent, Advertising, Products..."
                            className="mt-1 w-full rounded border p-2"
                        />

                        {errors.category && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.category}
                            </p>
                        )}
                    </div>

                    <div>
                        <label>Expense Date</label>

                        <input
                            type="date"
                            value={data.expense_date}
                            onChange={(event) =>
                                setData('expense_date', event.target.value)
                            }
                            className="mt-1 w-full rounded border p-2"
                        />

                        {errors.expense_date && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.expense_date}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
                    >
                        {processing ? 'Creating...' : 'Create Expense'}
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
