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

function createFormData(type: 'expense' | 'income'): OperationFormData {
    return {
        type,
        operation_date: new Date().toISOString().slice(0, 10),
        currency: 'AZN',
        amount: '',
        category_id: '',
        customer_id: '',
        description: '',
        note: '',
    };
}

export default function Create({ customers, categories }: Props) {
    const [type, setType] = useState<'expense' | 'income'>('expense');

    const expenseForm = useForm<OperationFormData>(
        createFormData('expense'),
    );

    const incomeForm = useForm<OperationFormData>(
        createFormData('income'),
    );

    const activeForm = type === 'expense' ? expenseForm : incomeForm;

    const filteredCategories = categories.filter(
        (category) => category.type === type,
    );

    const submit = () => {
        activeForm
            .transform((data) => ({
                ...data,
                operation_date: parseInputDate(
                    formatInputDate(data.operation_date),
                ),
            }))
            .post('/operations', {
                preserveState: true,
                preserveScroll: true,

                onSuccess: () => {
                    activeForm.reset();
                },
            });
    };

    const changeType = (newType: 'expense' | 'income') => {
        setType(newType);
    };

    return (
        <AppLayout>
            <div className="bg-neutral-950 p-6 text-neutral-100">
                <div className="mx-auto max-w-7xl space-y-6">
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

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => changeType('expense')}
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
                            onClick={() => changeType('income')}
                            className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                                type === 'income'
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
                                <h2 className="text-base font-semibold">
                                    Basic information
                                </h2>

                                <p className="mt-1 text-sm text-neutral-500">
                                    Main financial details for this operation.
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
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="DD/MM/YYYY"
                                            maxLength={10}
                                            value={formatInputDate(
                                                activeForm.data.operation_date,
                                            )}
                                            onChange={(event) => {
                                                const numbers =
                                                    event.target.value
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

                                                activeForm.setData(
                                                    'operation_date',
                                                    parseInputDate(formatted),
                                                );
                                            }}
                                            className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 transition outline-none focus:border-neutral-600"
                                        />

                                        <FormError
                                            message={
                                                activeForm.errors
                                                    .operation_date
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
                                            value={activeForm.data.currency}
                                            onChange={(event) =>
                                                activeForm.setData(
                                                    'currency',
                                                    event.target.value,
                                                )
                                            }
                                            className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 transition outline-none focus:border-neutral-600"
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
                                                activeForm.errors.currency
                                            }
                                        />
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
                                        value={activeForm.data.amount}
                                        onChange={(event) =>
                                            activeForm.setData(
                                                'amount',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="0.00"
                                        className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 transition outline-none focus:border-neutral-600"
                                    />

                                    <FormError
                                        message={activeForm.errors.amount}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="category_id"
                                        className="text-sm font-medium text-neutral-300"
                                    >
                                        Category
                                    </label>

                                    <select
                                        id="category_id"
                                        value={activeForm.data.category_id}
                                        onChange={(event) =>
                                            activeForm.setData(
                                                'category_id',
                                                event.target.value,
                                            )
                                        }
                                        className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 transition outline-none focus:border-neutral-600"
                                    >
                                        <option value="">
                                            Select category...
                                        </option>

                                        {filteredCategories.map((category) => (
                                            <option
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>

                                    <FormError
                                        message={
                                            activeForm.errors.category_id
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
                                        value={activeForm.data.customer_id}
                                        onChange={(event) =>
                                            activeForm.setData(
                                                'customer_id',
                                                event.target.value,
                                            )
                                        }
                                        className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 transition outline-none focus:border-neutral-600"
                                    >
                                        <option value="">No customer</option>

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
                                            activeForm.errors.customer_id
                                        }
                                    />
                                </div>
                            </div>
                        </div>

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
                                        value={activeForm.data.description}
                                        onChange={(event) =>
                                            activeForm.setData(
                                                'description',
                                                event.target.value,
                                            )
                                        }
                                        placeholder={
                                            type === 'expense'
                                                ? 'Office rent'
                                                : 'Website development'
                                        }
                                        className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 transition outline-none focus:border-neutral-600"
                                    />

                                    <FormError
                                        message={
                                            activeForm.errors.description
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
                                        rows={9}
                                        value={activeForm.data.note}
                                        onChange={(event) =>
                                            activeForm.setData(
                                                'note',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Additional notes..."
                                        className="mt-2 w-full resize-none rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 transition outline-none focus:border-neutral-600"
                                    />

                                    <FormError
                                        message={activeForm.errors.note}
                                    />
                                </div>

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
                                        disabled={activeForm.processing}
                                        className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition ${
                                            type === 'expense'
                                                ? 'bg-red-500 hover:bg-red-400'
                                                : 'bg-emerald-500 hover:bg-emerald-400'
                                        } disabled:cursor-not-allowed disabled:opacity-50`}
                                    >
                                        {activeForm.processing
                                            ? 'Saving...'
                                            : type === 'expense'
                                              ? 'Add Expense'
                                              : 'Add Income'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}