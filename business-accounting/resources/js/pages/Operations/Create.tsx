import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import FormError from '@/components/form-error';
import AppLayout from '@/layouts/app-layout';
import {
    formatInputDate,
    parseInputDate,
} from '@/lib/formatters';

type Customer = {
    id: number;
    name: string;
};

type Category = {
    id: number;
    type: 'expense' | 'income';
    name: string;
};

type OperationFormData = {
    type: 'expense' | 'income';
    operation_date: string;
    currency: string;
    amount: string;
    category_id: string;
    customer_id: string;
    description: string;
    note: string;
};

type Props = {
    customers: Customer[];
    categories: Category[];
};

function createFormData(
    type: 'expense' | 'income',
): OperationFormData {
    return {
        type,
        operation_date: new Date()
            .toISOString()
            .slice(0, 10),
        currency: 'AZN',
        amount: '',
        category_id: '',
        customer_id: '',
        description: '',
        note: '',
    };
}

export default function Create({
    customers,
    categories,
}: Props) {
    const [type, setType] = useState<
        'expense' | 'income'
    >('expense');

    const [showCategoryModal, setShowCategoryModal] =
        useState(false);

    const [newCategoryName, setNewCategoryName] =
        useState('');

    const [categoryCreating, setCategoryCreating] =
        useState(false);

    const [categoryError, setCategoryError] =
        useState('');

    const [localCategories, setLocalCategories] =
        useState<Category[]>(categories);

    /*
     * EXPENSE FORM
     */
    const expenseForm = useForm<OperationFormData>(
        createFormData('expense'),
    );

    /*
     * INCOME FORM
     */
    const incomeForm = useForm<OperationFormData>(
        createFormData('income'),
    );

    /*
     * Current form məlumatları
     */
    const currentData =
        type === 'expense'
            ? expenseForm.data
            : incomeForm.data;

    const currentErrors =
        type === 'expense'
            ? expenseForm.errors
            : incomeForm.errors;

    const currentProcessing =
        type === 'expense'
            ? expenseForm.processing
            : incomeForm.processing;

    const currentSetData =
        type === 'expense'
            ? expenseForm.setData
            : incomeForm.setData;

    const filteredCategories =
        localCategories.filter(
            (category) => category.type === type,
        );

    /*
     * Expense / Income dəyişməsi
     *
     * Hər form öz məlumatını saxlayır.
     */
    const changeType = (
        newType: 'expense' | 'income',
    ) => {
        setType(newType);
    };

    /*
     * Date
     */
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

        currentSetData(
            'operation_date',
            parseInputDate(formatted),
        );
    };

    /*
     * Inline category yaratmaq
     */
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
                        type,
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

            currentSetData(
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

    /*
     * Expense submit
     */
    const submitExpense = () => {
        expenseForm.post('/operations', {
            transform: (formData) => ({
                ...formData,

                operation_date:
                    parseInputDate(
                        formatInputDate(
                            formData.operation_date,
                        ),
                    ),
            }),

            preserveState: true,
            preserveScroll: true,

            onSuccess: () => {
                expenseForm.reset();
            },
        });
    };

    /*
     * Income submit
     */
    const submitIncome = () => {
        incomeForm.post('/operations', {
            transform: (formData) => ({
                ...formData,

                operation_date:
                    parseInputDate(
                        formatInputDate(
                            formData.operation_date,
                        ),
                    ),
            }),

            preserveState: true,
            preserveScroll: true,

            onSuccess: () => {
                incomeForm.reset();
            },
        });
    };

    /*
     * Submit
     */
    const submit = () => {
        if (type === 'expense') {
            submitExpense();
        } else {
            submitIncome();
        }
    };

    return (
        <AppLayout>
            <div className="min-h-full bg-neutral-950 p-6 text-neutral-100">
                <div className="mx-auto max-w-7xl space-y-6">

                    {/* HEADER */}

                    <div>
                        <a
                            href="/operations"
                            className="inline-flex items-center text-sm text-neutral-500 transition hover:text-neutral-200"
                        >
                            ← Back to Operations
                        </a>

                        <div className="mt-5">
                            <p className="text-sm font-medium text-neutral-500">
                                Operations
                            </p>

                            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                                New Operation
                            </h1>

                            <p className="mt-2 text-sm text-neutral-400">
                                Record an income or expense.
                            </p>
                        </div>
                    </div>

                    {/* TYPE */}

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                changeType('expense')
                            }
                            className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                                type === 'expense'
                                    ? 'border-red-500/30 bg-red-500/10 text-red-400'
                                    : 'border-neutral-800 bg-neutral-900 text-neutral-500 hover:bg-neutral-800'
                            }`}
                        >
                            ↓ Expense
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                changeType('income')
                            }
                            className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                                type === 'income'
                                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                    : 'border-neutral-800 bg-neutral-900 text-neutral-500 hover:bg-neutral-800'
                            }`}
                        >
                            ↑ Income
                        </button>
                    </div>

                    {/* FORMS */}

                    <div className="grid gap-6 lg:grid-cols-2">

                        {/* BASIC INFORMATION */}

                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">

                            <div className="mb-6">
                                <h2 className="text-base font-semibold">
                                    Basic information
                                </h2>

                                <p className="mt-1 text-sm text-neutral-500">
                                    Main financial details for this operation.
                                </p>
                            </div>

                            <div className="space-y-5">

                                {/* DATE */}

                                <div className="grid gap-4 sm:grid-cols-2">

                                    <div>
                                        <label
                                            htmlFor="operation_date"
                                            className="text-sm font-medium text-neutral-300"
                                        >
                                            Date
                                        </label>

                                        <input
                                            id="operation_date"
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="DD/MM/YYYY"
                                            maxLength={10}
                                            value={formatInputDate(
                                                currentData.operation_date,
                                            )}
                                            onChange={(event) =>
                                                handleDateChange(
                                                    event.target
                                                        .value,
                                                )
                                            }
                                            className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 outline-none focus:border-neutral-600"
                                        />

                                        <FormError
                                            message={
                                                currentErrors.operation_date
                                            }
                                        />
                                    </div>

                                    {/* CURRENCY */}

                                    <div>
                                        <label
                                            htmlFor="currency"
                                            className="text-sm font-medium text-neutral-300"
                                        >
                                            Currency
                                        </label>

                                        <select
                                            id="currency"
                                            value={
                                                currentData.currency
                                            }
                                            onChange={(event) =>
                                                currentSetData(
                                                    'currency',
                                                    event.target
                                                        .value,
                                                )
                                            }
                                            className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 outline-none focus:border-neutral-600"
                                        >
                                            <option value="AZN">
                                                AZN (₼)
                                            </option>

                                            <option value="USD">
                                                USD ($)
                                            </option>

                                            <option value="EUR">
                                                EUR (€)
                                            </option>
                                        </select>

                                        <FormError
                                            message={
                                                currentErrors.currency
                                            }
                                        />
                                    </div>

                                </div>

                                {/* AMOUNT */}

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
                                        value={
                                            currentData.amount
                                        }
                                        onChange={(event) =>
                                            currentSetData(
                                                'amount',
                                                event.target
                                                    .value,
                                            )
                                        }
                                        placeholder="0.00"
                                        className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 outline-none focus:border-neutral-600"
                                    />

                                    <FormError
                                        message={
                                            currentErrors.amount
                                        }
                                    />
                                </div>

                                {/* CATEGORY */}

                                <div>
                                    <label
                                        htmlFor="category_id"
                                        className="text-sm font-medium text-neutral-300"
                                    >
                                        Category
                                    </label>

                                    <select
                                        id="category_id"
                                        value={
                                            currentData.category_id
                                        }
                                        onChange={(event) =>
                                            currentSetData(
                                                'category_id',
                                                event.target
                                                    .value,
                                            )
                                        }
                                        className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 outline-none focus:border-neutral-600"
                                    >
                                        <option value="">
                                            Select category...
                                        </option>

                                        {filteredCategories.map(
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
                                            currentErrors.category_id
                                        }
                                    />
                                </div>

                                {/* CUSTOMER */}

                                <div>
                                    <label
                                        htmlFor="customer_id"
                                        className="text-sm font-medium text-neutral-300"
                                    >
                                        Customer / Project
                                    </label>

                                    <select
                                        id="customer_id"
                                        value={
                                            currentData.customer_id
                                        }
                                        onChange={(event) =>
                                            currentSetData(
                                                'customer_id',
                                                event.target
                                                    .value,
                                            )
                                        }
                                        className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 outline-none focus:border-neutral-600"
                                    >
                                        <option value="">
                                            No customer
                                        </option>

                                        {customers.map(
                                            (customer) => (
                                                <option
                                                    key={
                                                        customer.id
                                                    }
                                                    value={
                                                        customer.id
                                                    }
                                                >
                                                    {
                                                        customer.name
                                                    }
                                                </option>
                                            ),
                                        )}
                                    </select>

                                    <FormError
                                        message={
                                            currentErrors.customer_id
                                        }
                                    />
                                </div>

                            </div>
                        </div>

                        {/* DESCRIPTION */}

                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">

                            <div className="mb-6">
                                <h2 className="text-base font-semibold">
                                    Description
                                </h2>

                                <p className="mt-1 text-sm text-neutral-500">
                                    Add context and notes for this operation.
                                </p>
                            </div>

                            <div className="space-y-5">

                                {/* DESCRIPTION */}

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
                                        value={
                                            currentData.description
                                        }
                                        onChange={(event) =>
                                            currentSetData(
                                                'description',
                                                event.target
                                                    .value,
                                            )
                                        }
                                        placeholder={
                                            type ===
                                            'expense'
                                                ? 'Office rent'
                                                : 'Website development'
                                        }
                                        className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 outline-none focus:border-neutral-600"
                                    />

                                    <FormError
                                        message={
                                            currentErrors.description
                                        }
                                    />
                                </div>

                                {/* NOTE */}

                                <div>
                                    <label
                                        htmlFor="note"
                                        className="text-sm font-medium text-neutral-300"
                                    >
                                        Note
                                    </label>

                                    <textarea
                                        id="note"
                                        rows={9}
                                        value={
                                            currentData.note
                                        }
                                        onChange={(event) =>
                                            currentSetData(
                                                'note',
                                                event.target
                                                    .value,
                                            )
                                        }
                                        placeholder="Additional notes..."
                                        className="mt-2 w-full resize-none rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 outline-none focus:border-neutral-600"
                                    />

                                    <FormError
                                        message={
                                            currentErrors.note
                                        }
                                    />
                                </div>

                                {/* BUTTONS */}

                                <div className="flex justify-end gap-3 border-t border-neutral-800 pt-5">

                                    <a
                                        href="/operations"
                                        className="rounded-xl border border-neutral-800 px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:bg-neutral-800"
                                    >
                                        Cancel
                                    </a>

                                    <button
                                        type="button"
                                        onClick={submit}
                                        disabled={
                                            currentProcessing
                                        }
                                        className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition ${
                                            type ===
                                            'expense'
                                                ? 'bg-red-500 hover:bg-red-400'
                                                : 'bg-emerald-500 hover:bg-emerald-400'
                                        } disabled:cursor-not-allowed disabled:opacity-50`}
                                    >
                                        {currentProcessing
                                            ? 'Saving...'
                                            : type ===
                                                'expense'
                                              ? 'Add Expense'
                                              : 'Add Income'}
                                    </button>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CATEGORY MODAL */}

            {showCategoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">

                    <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">

                        <h2 className="text-lg font-semibold">
                            Create new category
                        </h2>

                        <p className="mt-1 text-sm text-neutral-500">
                            Create a new {type} category.
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
                                        event.target
                                            .value,
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
                                className="rounded-xl border border-neutral-800 px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:bg-neutral-800"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={
                                    categoryCreating
                                }
                                onClick={createCategory}
                                className="rounded-xl bg-neutral-100 px-5 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-white disabled:opacity-50"
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