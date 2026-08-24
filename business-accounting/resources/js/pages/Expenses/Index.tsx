import { Link, router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import DeleteConfirmation from '@/components/delete-confirmation';
import AppLayout from '@/layouts/app-layout';
import { formatDate, formatMoney } from '@/lib/formatters';

type Category = {
    id: number;
    name: string;
};

type Expense = {
    id: number;
    description: string;
    amount: string;
    category: Category | null;
    expense_date: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    expenses: {
        data: Expense[];
        links: PaginationLink[];
    };

    summary: {
        total: number;
        count: number;
    };

    categories: Category[];

    filters: {
        search: string;
        category_id: string;
        start_date: string;
        end_date: string;
    };
};

function SummaryCard({
    label,
    value,
    description,
}: {
    label: string;
    value: string;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <p className="text-sm font-medium text-neutral-500">
                {label}
            </p>

            <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-100">
                {value}
            </p>

            <p className="mt-2 text-xs text-neutral-500">
                {description}
            </p>
        </div>
    );
}

export default function Index({
    expenses,
    summary,
    categories,
    filters,
}: Props) {
    const [deleteId, setDeleteId] =
        useState<number | null>(null);

    const [search, setSearch] = useState(
        filters.search ?? '',
    );

    const [categoryId, setCategoryId] =
        useState(filters.category_id ?? '');

    const [startDate, setStartDate] = useState(
        filters.start_date ?? '',
    );

    const [endDate, setEndDate] = useState(
        filters.end_date ?? '',
    );

    const [processingFilter, setProcessingFilter] =
        useState(false);

    const {
        delete: destroy,
        processing,
    } = useForm();

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
            '/expenses',
            {
                search: search || undefined,
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
        setCategoryId('');
        setStartDate('');
        setEndDate('');
        setProcessingFilter(true);

        router.get(
            '/expenses',
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

        destroy(`/expenses/${deleteId}`, {
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
                                Finance
                            </p>

                            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                                Expenses
                            </h1>

                            <p className="mt-2 text-sm text-neutral-400">
                                Manage and analyze your business expenses.
                            </p>
                        </div>

                        <Link
                            href="/expenses/create"
                            className="inline-flex items-center justify-center rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-white"
                        >
                            Create Expense
                        </Link>
                    </div>

                    {/* FILTERS */}

                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                        <div className="mb-5">
                            <h2 className="text-base font-semibold">
                                Filters
                            </h2>

                            <p className="mt-1 text-sm text-neutral-500">
                                Search and filter your expenses.
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
                                    placeholder="Description or category..."
                                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-600 focus:border-neutral-600"
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
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
                                            All Categories
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
                                    End date must be after or equal
                                    to the start date.
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

                    <div className="grid gap-4 sm:grid-cols-2">
                        <SummaryCard
                            label="Total Expenses"
                            value={formatMoney(
                                summary.total,
                            )}
                            description="Expenses matching your filters"
                        />

                        <SummaryCard
                            label="Expenses"
                            value={summary.count.toString()}
                            description="Matching expense records"
                        />
                    </div>

                    {/* TABLE */}

                    <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
                        {expenses.data.length === 0 ? (
                            <div className="p-10 text-center">
                                <p className="text-sm text-neutral-400">
                                    No expenses found.
                                </p>

                                <Link
                                    href="/expenses/create"
                                    className="mt-4 inline-flex rounded-xl border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:bg-neutral-800"
                                >
                                    Create your first expense
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[850px] text-left text-sm">
                                        <thead className="border-b border-neutral-800">
                                            <tr>
                                                <th className="px-5 py-4 font-medium text-neutral-500">
                                                    Description
                                                </th>

                                                <th className="px-5 py-4 font-medium text-neutral-500">
                                                    Category
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
                                            {expenses.data.map(
                                                (expense) => (
                                                    <tr
                                                        key={
                                                            expense.id
                                                        }
                                                        className="transition hover:bg-neutral-800/30"
                                                    >
                                                        <td className="px-5 py-4">
                                                            <p className="font-medium text-neutral-100">
                                                                {
                                                                    expense.description
                                                                }
                                                            </p>

                                                            <p className="text-xs text-neutral-500">
                                                                Expense #
                                                                {
                                                                    expense.id
                                                                }
                                                            </p>
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            {expense.category ? (
                                                                <span className="inline-flex rounded-full border border-neutral-700 bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-300">
                                                                    {
                                                                        expense
                                                                            .category
                                                                            .name
                                                                    }
                                                                </span>
                                                            ) : (
                                                                <span className="text-neutral-600">
                                                                    No category
                                                                </span>
                                                            )}
                                                        </td>

                                                        <td className="px-5 py-4 font-medium text-red-400">
                                                            -
                                                            {formatMoney(
                                                                expense.amount,
                                                            )}
                                                        </td>

                                                        <td className="px-5 py-4 text-neutral-400">
                                                            {formatDate(
                                                                expense.expense_date,
                                                            )}
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <div className="flex justify-end gap-4">
                                                                <Link
                                                                    href={`/expenses/${expense.id}/edit`}
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
                                                                            expense.id,
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

                                {expenses.links.length > 3 && (
                                    <div className="flex flex-wrap gap-2 border-t border-neutral-800 p-4">
                                        {expenses.links.map(
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
                open={deleteId !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteId(null);
                    }
                }}
                title="Delete expense?"
                description="This expense will be permanently deleted. This action cannot be undone."
                onConfirm={handleDelete}
                processing={processing}
            />
        </AppLayout>
    );
}