import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import FormError from '@/components/form-error';
import AppLayout from '@/layouts/app-layout';
import {
    formatInputDate,
    parseInputDate,
} from '@/lib/formatters';

type Category = {
    id: number;
    name: string;
    type: 'expense' | 'income';
};

type Props = {
    categories: Category[];
};

export default function Create({ categories }: Props) {
    const today = new Date().toISOString().slice(0, 10);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm({
        description: '',
        amount: '',
        category_id: '',
        expense_date: today,
    });

    const [dateInput, setDateInput] = useState(
        formatInputDate(today),
    );

    const [localCategories, setLocalCategories] =
        useState<Category[]>(categories);

    const [showCategoryModal, setShowCategoryModal] =
        useState(false);

    const [newCategoryName, setNewCategoryName] =
        useState('');

    const [categoryCreating, setCategoryCreating] =
        useState(false);

    const [categoryError, setCategoryError] =
        useState('');

    const expenseCategories = localCategories.filter(
        (category) => category.type === 'expense',
    );

    const handleDateChange = (value: string) => {
        const numbers = value
            .replace(/\D/g, '')
            .slice(0, 8);

        let formatted = numbers;

        if (numbers.length > 2) {
            formatted =
                numbers.slice(0, 2) +
                '/' +
                numbers.slice(2);
        }

        if (numbers.length > 4) {
            formatted =
                numbers.slice(0, 2) +
                '/' +
                numbers.slice(2, 4) +
                '/' +
                numbers.slice(4);
        }

        setDateInput(formatted);
    };

    const createCategory = async () => {
        const name = newCategoryName.trim();

        if (!name) {
            setCategoryError(
                'Category name is required.',
            );
            return;
        }

        setCategoryCreating(true);
        setCategoryError('');

        try {
            const token = document
                .querySelector(
                    'meta[name="csrf-token"]',
                )
                ?.getAttribute('content');

            const response = await fetch(
                '/categories/inline',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type':
                            'application/json',
                        Accept: 'application/json',
                        ...(token
                            ? {
                                  'X-CSRF-TOKEN':
                                      token,
                              }
                            : {}),
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify({
                        name,
                        type: 'expense',
                    }),
                },
            );

            const result = await response.json();

            if (!response.ok) {
                setCategoryError(
                    result.message ??
                        'Unable to create category.',
                );
                return;
            }

            const createdCategory =
                result.category as Category;

            setLocalCategories((current) => [
                ...current,
                createdCategory,
            ]);

            setData(
                'category_id',
                String(createdCategory.id),
            );

            setNewCategoryName('');
            setShowCategoryModal(false);
        } catch {
            setCategoryError(
                'Unable to create category.',
            );
        } finally {
            setCategoryCreating(false);
        }
    };

    const submit = (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        const expenseDate =
            parseInputDate(dateInput);

        post('/expenses', {
            transform: (formData) => ({
                ...formData,
                expense_date: expenseDate,
            }),

            onSuccess: () => {
                reset();

                const newToday = new Date()
                    .toISOString()
                    .slice(0, 10);

                setDateInput(
                    formatInputDate(newToday),
                );
            },
        });
    };

    return (
        <AppLayout>
            <div className="min-h-full bg-neutral-950 p-6 text-neutral-100">
                <div className="mx-auto max-w-4xl space-y-6">
                    <div>
                        <a
                            href="/expenses"
                            className="inline-flex items-center text-sm text-neutral-500 transition hover:text-neutral-200"
                        >
                            ← Back to Expenses
                        </a>

                        <div className="mt-5">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    Create Expense
                                </h1>

                                <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400">
                                    Expense
                                </span>
                            </div>

                            <p className="mt-2 text-sm text-neutral-400">
                                Record a new business expense.
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={submit}
                        className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900"
                    >
                        <div className="border-b border-neutral-800 px-6 py-5">
                            <h2 className="font-semibold">
                                Expense details
                            </h2>

                            <p className="mt-1 text-sm text-neutral-500">
                                Enter the information for this expense.
                            </p>
                        </div>

                        <div className="grid gap-6 p-6 lg:grid-cols-2">
                            <div className="space-y-5">
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
                                        placeholder="Office rent"
                                        className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-3 text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-neutral-600"
                                    />

                                    <FormError
                                        message={
                                            errors.description
                                        }
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="amount"
                                        className="text-sm font-medium text-neutral-300"
                                    >
                                        Amount
                                    </label>

                                    <div className="relative mt-2">
                                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-500">
                                            ₼
                                        </span>

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
                                            placeholder="0.00"
                                            className="w-full rounded-xl border border-neutral-800 bg-neutral-800 py-3 pl-9 pr-3 text-sm font-medium text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-neutral-600"
                                        />
                                    </div>

                                    <FormError
                                        message={
                                            errors.amount
                                        }
                                    />
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label
                                        htmlFor="category_id"
                                        className="text-sm font-medium text-neutral-300"
                                    >
                                        Category
                                    </label>

                                    <select
                                        id="category_id"
                                        value={data.category_id}
                                        onChange={(event) =>
                                            setData(
                                                'category_id',
                                                event.target.value,
                                            )
                                        }
                                        className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-3 text-sm text-neutral-100 outline-none focus:border-neutral-600"
                                    >
                                        <option value="">
                                            Select category...
                                        </option>

                                        {expenseCategories.map(
                                            (category) => (
                                                <option
                                                    key={
                                                        category.id
                                                    }
                                                    value={
                                                        category.id
                                                    }
                                                >
                                                    {
                                                        category.name
                                                    }
                                                </option>
                                            ),
                                        )}
                                    </select>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCategoryError(
                                                '',
                                            );
                                            setShowCategoryModal(
                                                true,
                                            );
                                        }}
                                        className="mt-2 text-sm font-medium text-blue-400 transition hover:text-blue-300"
                                    >
                                        + Create new category
                                    </button>

                                    <FormError
                                        message={
                                            errors.category_id
                                        }
                                    />
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
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="DD/MM/YYYY"
                                        maxLength={10}
                                        value={dateInput}
                                        onChange={(event) =>
                                            handleDateChange(
                                                event.target.value,
                                            )
                                        }
                                        className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-3 text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-neutral-600"
                                    />

                                    <FormError
                                        message={
                                            errors.expense_date
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-neutral-800 bg-neutral-950/40 px-6 py-5">
                            <div className="flex justify-end gap-3">
                                <a
                                    href="/expenses"
                                    className="rounded-xl border border-neutral-800 px-5 py-2.5 text-sm font-medium text-neutral-300 hover:bg-neutral-800"
                                >
                                    Cancel
                                </a>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Creating...'
                                        : 'Create Expense'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {showCategoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
                        <h2 className="text-lg font-semibold">
                            Create new category
                        </h2>

                        <p className="mt-1 text-sm text-neutral-500">
                            Create a new expense category.
                        </p>

                        <div className="mt-6">
                            <label
                                htmlFor="new_category_name"
                                className="text-sm font-medium text-neutral-300"
                            >
                                Category name
                            </label>

                            <input
                                id="new_category_name"
                                type="text"
                                autoFocus
                                value={newCategoryName}
                                onChange={(event) =>
                                    setNewCategoryName(
                                        event.target.value,
                                    )
                                }
                                onKeyDown={(event) => {
                                    if (
                                        event.key ===
                                        'Enter'
                                    ) {
                                        createCategory();
                                    }
                                }}
                                placeholder="e.g. Office Rent"
                                className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-3 text-sm text-neutral-100 outline-none focus:border-neutral-600"
                            />

                            {categoryError && (
                                <p className="mt-2 text-sm text-red-400">
                                    {categoryError}
                                </p>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCategoryModal(
                                        false,
                                    );
                                    setNewCategoryName('');
                                    setCategoryError('');
                                }}
                                className="rounded-xl border border-neutral-800 px-4 py-2.5 text-sm font-medium text-neutral-300 hover:bg-neutral-800"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={categoryCreating}
                                onClick={createCategory}
                                className="rounded-xl bg-neutral-100 px-5 py-2.5 text-sm font-semibold text-neutral-950 hover:bg-white disabled:opacity-50"
                            >
                                {categoryCreating
                                    ? 'Creating...'
                                    : 'Create Category'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}