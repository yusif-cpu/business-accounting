import { Link, router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import DeleteConfirmation from '@/components/delete-confirmation';
import AppLayout from '@/layouts/app-layout';
import { formatDate, formatMoney } from '@/lib/formatters';

type Customer = {
    id: number;
    name: string;
};

type Category = {
    id: number;
    business_id?: number;
    type: 'expense' | 'income';
    name: string;
};

type Operation = {
    id: number;
    type: 'expense' | 'income';
    operation_date: string;
    currency: string;
    amount: string;
    category: Category | null;
    description: string;
    customer: Customer | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    operations: {
        data: Operation[];
        links: PaginationLink[];
    };

    summary: {
        income: number;
        expenses: number;
        balance: number;
        count: number;
    };

    categories: Category[];

    filters: {
        search: string;
        type: string;
        category_id: string;
        start_date: string;
        end_date: string;
    };
};

function SummaryCard({
    label,
    value,
    description,
    valueClass = 'text-neutral-100',
}: {
    label: string;
    value: string;
    description: string;
    valueClass?: string;
}) {
    return (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <p className="text-sm font-medium text-neutral-500">
                {label}
            </p>

            <p
                className={`mt-2 text-2xl font-semibold tracking-tight ${valueClass}`}
            >
                {value}
            </p>

            <p className="mt-2 text-xs text-neutral-500">
                {description}
            </p>
        </div>
    );
}

export default function Index({
    operations,
    summary,
    categories,
    filters,
}: Props) {
    const [deleteId, setDeleteId] = useState<number | null>(
        null,
    );

    const [search, setSearch] = useState(
        filters.search ?? '',
    );

    const [type, setType] = useState(
        filters.type ?? '',
    );

    const [categoryId, setCategoryId] = useState(
        filters.category_id ?? '',
    );

    const [startDate, setStartDate] = useState(
        filters.start_date ?? '',
    );

    const [endDate, setEndDate] = useState(
        filters.end_date ?? '',
    );

    const [processingFilter, setProcessingFilter] =
        useState(false);

    const { delete: destroy, processing } = useForm();

    const invalidDateRange =
        !!startDate &&
        !!endDate &&
        startDate > endDate;

    const handleFilter = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        if (invalidDateRange) {
            return;
        }

        setProcessingFilter(true);

        router.get(
            '/operations',
            {
                search: search || undefined,
                type: type || undefined,
                category_id:
                    categoryId || undefined,
                start_date:
                    startDate || undefined,
                end_date:
                    endDate || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => {
                    setProcessingFilter(false);
                },
            },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setType('');
        setCategoryId('');
        setStartDate('');
        setEndDate('');
        setProcessingFilter(true);

        router.get(
            '/operations',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => {
                    setProcessingFilter(false);
                },
            },
        );
    };

    const handleDelete = () => {
        if (deleteId === null) {
            return;
        }

        destroy(`/operations/${deleteId}`, {
            onSuccess: () => {
                setDeleteId(null);
            },
        });
    };

    return (
        <AppLayout>
            <div className="bg-neutral-950 p-6 text-neutral-100">
                <div className="mx-auto max-w-7xl space-y-6">

                    {/* HEADER */}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-neutral-500">
                                Operations
                            </p>

                            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                                Operations
                            </h1>

                            <p className="mt-2 text-sm text-neutral-400">
                                Track income and expenses in one journal.
                            </p>
                        </div>

                        <Link
                            href="/operations/create"
                            className="inline-flex items-center justify-center rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-white"
                        >
                            New Operation
                        </Link>
                    </div>

                    {/* FILTERS */}

                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                        <div className="mb-5">
                            <h2 className="text-base font-semibold">
                                Filters
                            </h2>

                            <p className="mt-1 text-sm text-neutral-500">
                                Search and filter your operations.
                            </p>
                        </div>

                        <form
                            onSubmit={handleFilter}
                            className="space-y-4"
                        >
                            <div>
                                <label
                                    htmlFor="search"
                                    className="mb-2 block text-sm font-medium text-neutral-400"
                                >
                                    Search
                                </label>

                                <input
                                    id="search"
                                    type="text"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Description, customer or category..."
                                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-600 focus:border-neutral-600"
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-4">

                                <div>
                                    <label
                                        htmlFor="type"
                                        className="mb-2 block text-sm font-medium text-neutral-400"
                                    >
                                        Type
                                    </label>

                                    <select
                                        id="type"
                                        value={type}
                                        onChange={(event) =>
                                            setType(
                                                event.target.value,
                                            )
                                        }
                                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 outline-none transition focus:border-neutral-600"
                                    >
                                        <option value="">
                                            All
                                        </option>

                                        <option value="income">
                                            Income
                                        </option>

                                        <option value="expense">
                                            Expense
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="category_id"
                                        className="mb-2 block text-sm font-medium text-neutral-400"
                                    >
                                        Category
                                    </label>

                                    <select
                                        id="category_id"
                                        value={categoryId}
                                        onChange={(event) =>
                                            setCategoryId(
                                                event.target.value,
                                            )
                                        }
                                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 outline-none transition focus:border-neutral-600"
                                    >
                                        <option value="">
                                            All categories
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
                                                    {category.name} (
                                                    {category.type})
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="start_date"
                                        className="mb-2 block text-sm font-medium text-neutral-400"
                                    >
                                        Start Date
                                    </label>

                                    <input
                                        id="start_date"
                                        type="date"
                                        value={startDate}
                                        onChange={(event) =>
                                            setStartDate(
                                                event.target.value,
                                            )
                                        }
                                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 outline-none transition focus:border-neutral-600"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="end_date"
                                        className="mb-2 block text-sm font-medium text-neutral-400"
                                    >
                                        End Date
                                    </label>

                                    <input
                                        id="end_date"
                                        type="date"
                                        value={endDate}
                                        onChange={(event) =>
                                            setEndDate(
                                                event.target.value,
                                            )
                                        }
                                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 outline-none transition focus:border-neutral-600"
                                    />
                                </div>
                            </div>

                            {invalidDateRange && (
                                <p className="text-sm text-red-400">
                                    End date must be after or
                                    equal to the start date.
                                </p>
                            )}

                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="submit"
                                    disabled={
                                        processingFilter ||
                                        invalidDateRange
                                    }
                                    className="rounded-xl bg-neutral-100 px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processingFilter
                                        ? 'Loading...'
                                        : 'Apply'}
                                </button>

                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    disabled={
                                        processingFilter
                                    }
                                    className="rounded-xl border border-neutral-800 bg-neutral-950 px-5 py-3 text-sm font-semibold text-neutral-300 transition hover:bg-neutral-800 disabled:opacity-50"
                                >
                                    Clear
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* SUMMARY */}

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <SummaryCard
                            label="Income"
                            value={formatMoney(
                                summary.income,
                            )}
                            description="Income in selected results"
                            valueClass="text-emerald-400"
                        />

                        <SummaryCard
                            label="Expenses"
                            value={formatMoney(
                                summary.expenses,
                            )}
                            description="Expenses in selected results"
                            valueClass="text-red-400"
                        />

                        <SummaryCard
                            label="Balance"
                            value={formatMoney(
                                summary.balance,
                            )}
                            description="Income minus expenses"
                            valueClass={
                                summary.balance >= 0
                                    ? 'text-emerald-400'
                                    : 'text-red-400'
                            }
                        />

                        <SummaryCard
                            label="Operations"
                            value={summary.count.toString()}
                            description="Matching operations"
                        />
                    </div>

                    {/* TABLE */}

                    <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
                        {operations.data.length === 0 ? (
                            <div className="p-10 text-center">
                                <p className="text-sm text-neutral-500">
                                    No operations found.
                                </p>

                                <Link
                                    href="/operations/create"
                                    className="mt-4 inline-flex rounded-xl border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:bg-neutral-800"
                                >
                                    Create your first operation
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[1050px] text-left text-sm">
                                        <thead className="border-b border-neutral-800">
                                            <tr>
                                                <th className="px-5 py-4 font-medium text-neutral-500">
                                                    Type
                                                </th>

                                                <th className="px-5 py-4 font-medium text-neutral-500">
                                                    Description
                                                </th>

                                                <th className="px-5 py-4 font-medium text-neutral-500">
                                                    Category
                                                </th>

                                                <th className="px-5 py-4 font-medium text-neutral-500">
                                                    Customer
                                                </th>

                                                <th className="px-5 py-4 font-medium text-neutral-500">
                                                    Amount
                                                </th>

                                                <th className="px-5 py-4 font-medium text-neutral-500">
                                                    Date
                                                </th>

                                                <th className="px-5 py-4 text-right font-medium text-neutral-500">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-neutral-800">
                                            {operations.data.map(
                                                (operation) => (
                                                    <tr
                                                        key={
                                                            operation.id
                                                        }
                                                        className="transition hover:bg-neutral-800/30"
                                                    >
                                                        <td className="px-5 py-4">
                                                            <span
                                                                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${
                                                                    operation.type ===
                                                                    'income'
                                                                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                                                                        : 'border-red-500/20 bg-red-500/10 text-red-400'
                                                                }`}
                                                            >
                                                                {
                                                                    operation.type
                                                                }
                                                            </span>
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <p className="font-medium text-neutral-100">
                                                                {
                                                                    operation.description
                                                                }
                                                            </p>

                                                            <p className="text-xs text-neutral-500">
                                                                Operation #
                                                                {
                                                                    operation.id
                                                                }
                                                            </p>
                                                        </td>

                                                        <td className="px-5 py-4 text-neutral-400">
                                                            {operation
                                                                .category
                                                                ?.name ??
                                                                '—'}
                                                        </td>

                                                        <td className="px-5 py-4 text-neutral-400">
                                                            {operation
                                                                .customer
                                                                ?.name ??
                                                                '—'}
                                                        </td>

                                                        <td
                                                            className={`px-5 py-4 font-semibold ${
                                                                operation.type ===
                                                                'income'
                                                                    ? 'text-emerald-400'
                                                                    : 'text-red-400'
                                                            }`}
                                                        >
                                                            {formatMoney(
                                                                operation.amount,
                                                            )}{' '}
                                                            {
                                                                operation.currency
                                                            }
                                                        </td>

                                                        <td className="px-5 py-4 text-neutral-400">
                                                            {formatDate(
                                                                operation.operation_date,
                                                                true,
                                                            )}
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <div className="flex justify-end gap-4">
                                                                <Link
                                                                    href={`/operations/${operation.id}`}
                                                                    className="text-neutral-300 transition hover:text-white"
                                                                >
                                                                    View
                                                                </Link>

                                                                <Link
                                                                    href={`/operations/${operation.id}/edit`}
                                                                    className="text-blue-400 transition hover:text-blue-300"
                                                                >
                                                                    Edit
                                                                </Link>

                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                    onClick={() =>
                                                                        setDeleteId(
                                                                            operation.id,
                                                                        )
                                                                    }
                                                                    className="text-red-400 transition hover:text-red-300 disabled:opacity-50"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* PAGINATION */}

                                {operations.links.length >
                                    3 && (
                                    <div className="flex flex-wrap gap-2 border-t border-neutral-800 p-4">
                                        {operations.links.map(
                                            (
                                                link,
                                                index,
                                            ) => (
                                                <Link
                                                    key={
                                                        index
                                                    }
                                                    href={
                                                        link.url ??
                                                        '#'
                                                    }
                                                    preserveScroll
                                                    className={`rounded-lg border px-3 py-2 text-sm transition ${
                                                        link.active
                                                            ? 'border-neutral-600 bg-neutral-100 text-neutral-950'
                                                            : link.url
                                                              ? 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
                                                              : 'cursor-not-allowed border-neutral-900 text-neutral-600'
                                                    }`}
                                                >
                                                    <span
                                                        dangerouslySetInnerHTML={{
                                                            __html: link.label,
                                                        }}
                                                    />
                                                </Link>
                                            ),
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <DeleteConfirmation
                open={
                    deleteId !== null
                }
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteId(null);
                    }
                }}
                title="Delete operation?"
                description="This operation will be permanently deleted. This action cannot be undone."
                onConfirm={
                    handleDelete
                }
                processing={
                    processing
                }
            />
        </AppLayout>
    );
}