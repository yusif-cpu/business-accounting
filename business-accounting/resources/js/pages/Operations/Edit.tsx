import AppLayout from '@/layouts/app-layout';
import FormError from '@/components/form-error';
import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

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
    customer_id: number | null;
    description: string;
    note: string | null;
};

type Props = {
    operation: Operation;
    customers: Customer[];
};

export default function Edit({
    operation,
    customers,
}: Props) {
    const {
        data,
        setData,
        put,
        processing,
        errors,
    } = useForm({
        type: operation.type,
        operation_date: operation.operation_date.slice(0, 10),
        currency: operation.currency,
        amount: operation.amount,
        category: operation.category ?? '',
        customer_id:
            operation.customer_id?.toString() ?? '',
        description: operation.description,
        note: operation.note ?? '',
    });

    const submit = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        put(`/operations/${operation.id}`);
    };

    const isIncome = data.type === 'income';

    return (
        <AppLayout>
            <div className="bg-neutral-950 p-6 text-neutral-100">
                <div className="mx-auto max-w-5xl space-y-6">
                    <div>
                        <Link
                            href={`/operations/${operation.id}`}
                            className="inline-flex items-center text-sm text-neutral-500 transition hover:text-neutral-200"
                        >
                            ← Back to Operation
                        </Link>

                        <div className="mt-5">
                            <p className="text-sm font-medium text-neutral-500">
                                Operations
                            </p>

                            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                                Edit Operation #{operation.id}
                            </h1>

                            <p className="mt-2 text-sm text-neutral-400">
                                Update the details of this operation.
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={submit}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    setData(
                                        'type',
                                        'expense',
                                    )
                                }
                                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                                    !isIncome
                                        ? 'border-red-500/30 bg-red-500/10 text-red-400'
                                        : 'border-neutral-800 bg-neutral-900 text-neutral-500 hover:bg-neutral-800'
                                }`}
                            >
                                ↓ Expense
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setData(
                                        'type',
                                        'income',
                                    )
                                }
                                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                                    isIncome
                                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                        : 'border-neutral-800 bg-neutral-900 text-neutral-500 hover:bg-neutral-800'
                                }`}
                            >
                                ↑ Income
                            </button>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                                <div className="mb-6">
                                    <h2 className="font-semibold">
                                        Basic information
                                    </h2>

                                    <p className="mt-1 text-sm text-neutral-500">
                                        Update the financial details.
                                    </p>
                                </div>

                                <div className="space-y-5">
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
                                                type="date"
                                                value={
                                                    data.operation_date
                                                }
                                                onChange={(event) =>
                                                    setData(
                                                        'operation_date',
                                                        event.target.value,
                                                    )
                                                }
                                                className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 outline-none transition focus:border-neutral-600"
                                            />

                                            <FormError
                                                message={
                                                    errors.operation_date
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="currency"
                                                className="text-sm font-medium text-neutral-300"
                                            >
                                                Currency
                                            </label>

                                            <select
                                                id="currency"
                                                value={data.currency}
                                                onChange={(event) =>
                                                    setData(
                                                        'currency',
                                                        event.target.value,
                                                    )
                                                }
                                                className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 outline-none transition focus:border-neutral-600"
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
                                        </div>
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

                                        <FormError
                                            message={errors.amount}
                                        />
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
                                            value={data.category}
                                            onChange={(event) =>
                                                setData(
                                                    'category',
                                                    event.target.value,
                                                )
                                            }
                                            className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 outline-none transition focus:border-neutral-600"
                                        />

                                        <FormError
                                            message={errors.category}
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
                                                    event.target.value,
                                                )
                                            }
                                            className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 outline-none transition focus:border-neutral-600"
                                        >
                                            <option value="">
                                                No customer
                                            </option>

                                            {customers.map((customer) => (
                                                <option
                                                    key={customer.id}
                                                    value={customer.id}
                                                >
                                                    {customer.name}
                                                </option>
                                            ))}
                                        </select>

                                        <FormError
                                            message={
                                                errors.customer_id
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                                <div className="mb-6">
                                    <h2 className="font-semibold">
                                        Description
                                    </h2>

                                    <p className="mt-1 text-sm text-neutral-500">
                                        Update the description and notes.
                                    </p>
                                </div>

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
                                            value={
                                                data.description
                                            }
                                            onChange={(event) =>
                                                setData(
                                                    'description',
                                                    event.target.value,
                                                )
                                            }
                                            className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 outline-none transition focus:border-neutral-600"
                                        />

                                        <FormError
                                            message={
                                                errors.description
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
                                            rows={10}
                                            value={data.note}
                                            onChange={(event) =>
                                                setData(
                                                    'note',
                                                    event.target.value,
                                                )
                                            }
                                            className="mt-2 w-full resize-none rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 outline-none transition focus:border-neutral-600"
                                        />

                                        <FormError
                                            message={errors.note}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between border-t border-neutral-800 pt-5">
                                        <Link
                                            href={`/operations/${operation.id}`}
                                            className="text-sm text-neutral-500 transition hover:text-neutral-200"
                                        >
                                            Cancel
                                        </Link>

                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition ${
                                                isIncome
                                                    ? 'bg-emerald-500 hover:bg-emerald-400'
                                                    : 'bg-red-500 hover:bg-red-400'
                                            } disabled:cursor-not-allowed disabled:opacity-50`}
                                        >
                                            {processing
                                                ? 'Saving...'
                                                : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}