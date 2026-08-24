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

type Customer = {
    id: number;
    name: string;
};

type Props = {
    categories: Category[];
    customers: Customer[];
};

export default function Create({
    categories,
    customers,
}: Props) {
    const today = new Date()
        .toISOString()
        .slice(0, 10);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm({
        type: 'income',
        operation_date: today,
        currency: 'AZN',
        amount: '',
        category_id: '',
        customer_id: '',
        description: '',
        note: '',
    });

    const [dateInput, setDateInput] =
        useState(
            formatInputDate(today)
        );

    const [localCategories, setLocalCategories] =
        useState<Category[]>(
            categories
        );

    const [showCategoryModal, setShowCategoryModal] =
        useState(false);

    const [newCategoryName, setNewCategoryName] =
        useState('');

    const [categoryCreating, setCategoryCreating] =
        useState(false);

    const [categoryError, setCategoryError] =
        useState('');

    const incomeCategories =
        localCategories.filter(
            (category) =>
                category.type === 'income'
        );

    const handleDateChange = (
        value: string
    ) => {
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
        const name =
            newCategoryName.trim();

        if (!name) {
            setCategoryError(
                'Category name is required.'
            );

            return;
        }

        setCategoryCreating(true);
        setCategoryError('');

        try {
            const token =
                document
                    .querySelector(
                        'meta[name="csrf-token"]'
                    )
                    ?.getAttribute(
                        'content'
                    );

            const response =
                await fetch(
                    '/categories/inline',
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json',

                            Accept:
                                'application/json',

                            ...(token
                                ? {
                                      'X-CSRF-TOKEN':
                                          token,
                                  }
                                : {}),
                        },

                        credentials:
                            'same-origin',

                        body: JSON.stringify({
                            name,
                            type: 'income',
                        }),
                    }
                );

            const result =
                await response.json();

            if (!response.ok) {
                setCategoryError(
                    result.message ??
                        'Unable to create category.'
                );

                return;
            }

            const createdCategory =
                result.category as Category;

            setLocalCategories(
                (current) => [
                    ...current,
                    createdCategory,
                ]
            );

            setData(
                'category_id',
                String(
                    createdCategory.id
                )
            );

            setNewCategoryName('');

            setShowCategoryModal(false);
        } catch {
            setCategoryError(
                'Unable to create category.'
            );
        } finally {
            setCategoryCreating(false);
        }
    };

    const submit = (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        const operationDate =
            parseInputDate(dateInput);

        post('/income', {
            transform: (formData) => ({
                ...formData,

                type: 'income',

                currency: 'AZN',

                operation_date:
                    operationDate,
            }),

            onSuccess: () => {
                reset();

                const newToday =
                    new Date()
                        .toISOString()
                        .slice(0, 10);

                setDateInput(
                    formatInputDate(
                        newToday
                    )
                );
            },
        });
    };

    return (
        <AppLayout>
            <div className="min-h-full bg-neutral-950 p-6 text-neutral-100">
                <div className="mx-auto max-w-4xl space-y-6">

                    {/* HEADER */}

                    <div>
                        <a
                            href="/income"
                            className="inline-flex items-center text-sm text-neutral-500 transition hover:text-neutral-200"
                        >
                            ← Back to Income
                        </a>

                        <div className="mt-5">
                            <div className="flex items-center gap-3">

                                <h1 className="text-2xl font-semibold tracking-tight">
                                    Create Income
                                </h1>

                                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                                    Income
                                </span>

                            </div>

                            <p className="mt-2 text-sm text-neutral-400">
                                Record a new business income.
                            </p>
                        </div>
                    </div>

                    {/* FORM */}

                    <form
                        onSubmit={submit}
                        className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900"
                    >

                        <div className="border-b border-neutral-800 px-6 py-5">

                            <h2 className="font-semibold">
                                Income details
                            </h2>

                            <p className="mt-1 text-sm text-neutral-500">
                                Enter the information for this income.
                            </p>

                        </div>

                        <div className="grid gap-6 p-6 lg:grid-cols-2">

                            {/* LEFT */}

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
                                            data.description
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setData(
                                                'description',
                                                event.target
                                                    .value
                                            )
                                        }
                                        placeholder="Service payment"
                                        className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-3 text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-neutral-600"
                                    />

                                    <FormError
                                        message={
                                            errors.description
                                        }
                                    />
                                </div>

                                {/* AMOUNT */}

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
                                            value={
                                                data.amount
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setData(
                                                    'amount',
                                                    event.target
                                                        .value
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
                                            data.customer_id
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setData(
                                                'customer_id',
                                                event.target
                                                    .value
                                            )
                                        }
                                        className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-3 text-sm text-neutral-100 outline-none focus:border-neutral-600"
                                    >
                                        <option value="">
                                            No customer
                                        </option>

                                        {customers.map(
                                            (
                                                customer
                                            ) => (
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
                                            )
                                        )}
                                    </select>

                                    <FormError
                                        message={
                                            errors.customer_id
                                        }
                                    />
                                </div>

                            </div>

                            {/* RIGHT */}

                            <div className="space-y-5">

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
                                            data.category_id
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setData(
                                                'category_id',
                                                event.target
                                                    .value
                                            )
                                        }
                                        className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-3 text-sm text-neutral-100 outline-none focus:border-neutral-600"
                                    >

                                        <option value="">
                                            Select category...
                                        </option>

                                        {incomeCategories.map(
                                            (
                                                category
                                            ) => (
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
                                            )
                                        )}

                                    </select>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCategoryError(
                                                ''
                                            );

                                            setShowCategoryModal(
                                                true
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

                                {/* DATE */}

                                <div>
                                    <label
                                        htmlFor="operation_date"
                                        className="text-sm font-medium text-neutral-300"
                                    >
                                        Income Date
                                    </label>

                                    <input
                                        id="operation_date"
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="DD/MM/YYYY"
                                        maxLength={10}
                                        value={
                                            dateInput
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleDateChange(
                                                event.target
                                                    .value
                                            )
                                        }
                                        className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-3 text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-neutral-600"
                                    />

                                    <FormError
                                        message={
                                            errors.operation_date
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
                                        rows={4}
                                        value={
                                            data.note
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setData(
                                                'note',
                                                event.target
                                                    .value
                                            )
                                        }
                                        placeholder="Additional notes..."
                                        className="mt-2 w-full resize-none rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-3 text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-neutral-600"
                                    />

                                    <FormError
                                        message={
                                            errors.note
                                        }
                                    />
                                </div>

                            </div>

                        </div>

                        {/* FOOTER */}

                        <div className="border-t border-neutral-800 bg-neutral-950/40 px-6 py-5">

                            <div className="flex justify-end gap-3">

                                <a
                                    href="/income"
                                    className="rounded-xl border border-neutral-800 px-5 py-2.5 text-sm font-medium text-neutral-300 hover:bg-neutral-800"
                                >
                                    Cancel
                                </a>

                                <button
                                    type="submit"
                                    disabled={
                                        processing
                                    }
                                    className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Creating...'
                                        : 'Create Income'}
                                </button>

                            </div>

                        </div>

                    </form>
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
                            Create a new income category.
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
                                value={
                                    newCategoryName
                                }
                                onChange={(
                                    event
                                ) =>
                                    setNewCategoryName(
                                        event.target
                                            .value
                                    )
                                }
                                onKeyDown={(
                                    event
                                ) => {
                                    if (
                                        event.key ===
                                        'Enter'
                                    ) {
                                        createCategory();
                                    }
                                }}
                                placeholder="e.g. Services"
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
                                        false
                                    );

                                    setNewCategoryName(
                                        ''
                                    );

                                    setCategoryError(
                                        ''
                                    );
                                }}
                                className="rounded-xl border border-neutral-800 px-4 py-2.5 text-sm font-medium text-neutral-300 hover:bg-neutral-800"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={
                                    categoryCreating
                                }
                                onClick={
                                    createCategory
                                }
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