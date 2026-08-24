import { useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

import FormError from '@/components/form-error';
import AppLayout from '@/layouts/app-layout';

import {
    formatInputDate,
    parseInputDate,
} from '@/lib/formatters';

type Category = {
    id: number;
    name: string;
    type: 'income';
};

type Customer = {
    id: number;
    name: string;
};

type Income = {
    id: number;
    description: string;
    amount: string;
    category_id: number | null;
    customer_id: number | null;
    operation_date: string;
    currency: string;
    note: string | null;
};

type Props = {
    income: Income;
    categories: Category[];
    customers: Customer[];
};

export default function Edit({
    income,
    categories,
    customers,
}: Props) {
    const {
        data,
        setData,
        put,
        processing,
        errors,
    } = useForm({
        type: 'income',
        operation_date:
            income.operation_date.slice(0, 10),
        currency: income.currency,
        amount: income.amount,
        category_id:
            income.category_id
                ? String(income.category_id)
                : '',
        customer_id:
            income.customer_id
                ? String(income.customer_id)
                : '',
        description: income.description,
        note: income.note ?? '',
    });

    const [dateInput, setDateInput] =
        useState(
            formatInputDate(
                income.operation_date
            )
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

    const submit = (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        put(
            `/income/${income.id}`,
            {
                transform: (formData) => ({
                    ...formData,
                    type: 'income',
                    operation_date:
                        parseInputDate(
                            dateInput
                        ),
                }),

                preserveScroll: true,
            }
        );
    };

    return (
        <AppLayout>
            <div className="min-h-full bg-neutral-950 p-6 text-neutral-100">
                <div className="mx-auto max-w-4xl space-y-6">

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
                                    Edit Income
                                </h1>

                                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                                    Income #{income.id}
                                </span>
                            </div>

                            <p className="mt-2 text-sm text-neutral-400">
                                Update the details of this income.
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={submit}
                        className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900"
                    >
                        <div className="border-b border-neutral-800 px-6 py-5">
                            <h2 className="font-semibold">
                                Income details
                            </h2>

                            <p className="mt-1 text-sm text-neutral-500">
                                Make changes to the income information.
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
                                        value={
                                            data.description
                                        }
                                        onChange={(event) =>
                                            setData(
                                                'description',
                                                event.target.value
                                            )
                                        }
                                        className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-3 text-sm text-neutral-100 outline-none focus:border-neutral-600"
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
                                            value={
                                                data.amount
                                            }
                                            onChange={(event) =>
                                                setData(
                                                    'amount',
                                                    event.target.value
                                                )
                                            }
                                            className="w-full rounded-xl border border-neutral-800 bg-neutral-800 py-3 pl-9 pr-3 text-sm font-medium text-neutral-100 outline-none focus:border-neutral-600"
                                        />
                                    </div>

                                    <FormError
                                        message={
                                            errors.amount
                                        }
                                    />
                                </div>

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
                                        onChange={(event) =>
                                            setData(
                                                'customer_id',
                                                event.target.value
                                            )
                                        }
                                        className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-3 text-sm text-neutral-100 outline-none focus:border-neutral-600"
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
                                        value={
                                            data.category_id
                                        }
                                        onChange={(event) =>
                                            setData(
                                                'category_id',
                                                event.target.value
                                            )
                                        }
                                        className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-3 text-sm text-neutral-100 outline-none focus:border-neutral-600"
                                    >
                                        <option value="">
                                            Select category...
                                        </option>

                                        {categories.map(
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
                                            )
                                        )}
                                    </select>

                                    <FormError
                                        message={
                                            errors.category_id
                                        }
                                    />
                                </div>

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
                                        value={dateInput}
                                        onChange={(event) =>
                                            handleDateChange(
                                                event.target.value
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
                                        value={data.note}
                                        onChange={(event) =>
                                            setData(
                                                'note',
                                                event.target.value
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

                        <div className="border-t border-neutral-800 bg-neutral-950/40 px-6 py-5">
                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">

                                <p className="text-xs text-neutral-600">
                                    Income #{income.id}
                                </p>

                                <div className="flex gap-3">
                                    <a
                                        href="/income"
                                        className="rounded-xl border border-neutral-800 px-5 py-2.5 text-sm font-medium text-neutral-300 transition hover:bg-neutral-800"
                                    >
                                        Cancel
                                    </a>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {processing
                                            ? 'Saving...'
                                            : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}