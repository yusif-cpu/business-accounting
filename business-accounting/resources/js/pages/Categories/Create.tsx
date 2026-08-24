import { Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

type CategoryForm = {
    type: 'expense' | 'income';
    name: string;
};

type FormErrors = {
    type?: string;
    name?: string;
};

export default function Create() {
    const { data, setData, post, processing, errors } =
        useForm<CategoryForm>({
            type: 'expense',
            name: '',
        });

    const formErrors = errors as FormErrors;

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        post('/categories');
    };

    return (
        <AppLayout>
            <div className="bg-neutral-950 p-6 text-neutral-100">
                <div className="mx-auto max-w-3xl space-y-6">
                    <div>
                        <Link
                            href="/categories"
                            className="text-sm text-neutral-500 transition hover:text-neutral-300"
                        >
                            ← Back to categories
                        </Link>

                        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
                            Create Category
                        </h1>

                        <p className="mt-2 text-sm text-neutral-400">
                            Add a new income or expense category.
                        </p>
                    </div>

                    <form
                        onSubmit={submit}
                        className="space-y-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
                    >
                        <div>
                            <label
                                htmlFor="type"
                                className="mb-2 block text-sm font-medium text-neutral-300"
                            >
                                Type
                            </label>

                            <select
                                id="type"
                                value={data.type}
                                onChange={(event) =>
                                    setData(
                                        'type',
                                        event.target.value as
                                            | 'expense'
                                            | 'income',
                                    )
                                }
                                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 outline-none transition focus:border-neutral-500"
                            >
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>

                            {formErrors.type && (
                                <p className="mt-2 text-sm text-red-400">
                                    {formErrors.type}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="name"
                                className="mb-2 block text-sm font-medium text-neutral-300"
                            >
                                Name
                            </label>

                            <input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                                placeholder="e.g. Marketing / reklam"
                                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-600 focus:border-neutral-500"
                            />

                            {formErrors.name && (
                                <p className="mt-2 text-sm text-red-400">
                                    {formErrors.name}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 border-t border-neutral-800 pt-6">
                            <Link
                                href="/categories"
                                className="rounded-xl border border-neutral-700 px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:bg-neutral-800"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing
                                    ? 'Creating...'
                                    : 'Create Category'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}