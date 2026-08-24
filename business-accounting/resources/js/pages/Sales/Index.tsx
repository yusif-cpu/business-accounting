import {
    Link,
    router,
    useForm,
} from '@inertiajs/react';

import {
    FormEvent,
    useState,
} from 'react';

import DeleteConfirmation from '@/components/delete-confirmation';

import AppLayout from '@/layouts/app-layout';

import {
    formatDate,
    formatMoney,
} from '@/lib/formatters';

type Customer = {
    id: number;
    name: string;
};

type SaleStatus = {
    id: number;
    name: string;
    slug: string;
};

type Sale = {
    id: number;
    amount: string;
    status: SaleStatus | null;
    sold_at: string;
    payments_sum_amount: string | null;
    customer: Customer | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    sales: {
        data: Sale[];
        links: PaginationLink[];
    };

    summary: {
        totalSales: number;
        collected: number;
        outstanding: number;
        salesCount: number;
    };

    customers?: Customer[];

    statuses?: SaleStatus[];

    filters?: {
        search?: string;
        customer_id?: string;
        status_id?: string;
        start_date?: string;
        end_date?: string;
    };
};

function StatusBadge({
    status,
}: {
    status: SaleStatus | null;
}) {
    return (
        <span className="inline-flex rounded-full border border-neutral-700 bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-300">
            {status?.name ?? 'Unknown'}
        </span>
    );
}

function SummaryCard({
    label,
    value,
    description,
    valueClassName = 'text-neutral-100',
}: {
    label: string;
    value: string;
    description: string;
    valueClassName?: string;
}) {
    return (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">

            <p className="text-sm font-medium text-neutral-500">
                {label}
            </p>

            <p
                className={`mt-2 text-2xl font-semibold tracking-tight ${valueClassName}`}
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
    sales,
    summary,
    customers = [],
    statuses = [],
    filters = {},
}: Props) {
    const [
        deleteId,
        setDeleteId,
    ] = useState<number | null>(null);

    const [
        search,
        setSearch,
    ] = useState(
        filters.search ?? ''
    );

    const [
        customerId,
        setCustomerId,
    ] = useState(
        filters.customer_id ?? ''
    );

    const [
        statusId,
        setStatusId,
    ] = useState(
        filters.status_id ?? ''
    );

    const [
        startDate,
        setStartDate,
    ] = useState(
        filters.start_date ?? ''
    );

    const [
        endDate,
        setEndDate,
    ] = useState(
        filters.end_date ?? ''
    );

    const [
        processingFilter,
        setProcessingFilter,
    ] = useState(false);

    const {
        delete: destroy,
        processing,
    } = useForm();

    const invalidDateRange =
        !!startDate &&
        !!endDate &&
        startDate > endDate;

    const handleFilter = (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (invalidDateRange) {
            return;
        }

        setProcessingFilter(true);

        router.get(
            '/sales',
            {
                search:
                    search || undefined,

                customer_id:
                    customerId || undefined,

                status_id:
                    statusId || undefined,

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
            }
        );
    };

    const clearFilters = () => {
        setSearch('');
        setCustomerId('');
        setStatusId('');
        setStartDate('');
        setEndDate('');

        setProcessingFilter(true);

        router.get(
            '/sales',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,

                onFinish: () => {
                    setProcessingFilter(false);
                },
            }
        );
    };

    const handleDelete = () => {
        if (deleteId === null) {
            return;
        }

        destroy(
            `/sales/${deleteId}`,
            {
                onSuccess: () => {
                    setDeleteId(null);
                },
            }
        );
    };

    return (
        <AppLayout>

            <div className="bg-neutral-950 p-6 text-neutral-100">

                <div className="mx-auto max-w-7xl space-y-6">

                    {/* HEADER */}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                        <div>

                            <p className="text-sm font-medium text-neutral-500">
                                Sales
                            </p>

                            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                                Sales
                            </h1>

                            <p className="mt-2 text-sm text-neutral-400">
                                Manage sales, payments and outstanding balances.
                            </p>

                        </div>

                        <Link
                            href="/sales/create"
                            className="inline-flex items-center justify-center rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-white"
                        >
                            Create Sale
                        </Link>

                    </div>

                    {/* FILTERS */}

                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">

                        <div className="mb-5">

                            <h2 className="text-base font-semibold">
                                Filters
                            </h2>

                            <p className="mt-1 text-sm text-neutral-500">
                                Search and filter your sales.
                            </p>

                        </div>

                        <form
                            onSubmit={handleFilter}
                            className="space-y-4"
                        >

                            {/* SEARCH */}

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
                                            event.target.value
                                        )
                                    }
                                    placeholder="Sale ID or customer name..."
                                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-600 focus:border-neutral-600"
                                />

                            </div>

                            {/* FILTER ROW */}

                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                                {/* CUSTOMER */}

                                <div>

                                    <label
                                        htmlFor="customer_id"
                                        className="mb-2 block text-sm font-medium text-neutral-400"
                                    >
                                        Customer
                                    </label>

                                    <select
                                        id="customer_id"
                                        value={customerId}
                                        onChange={(event) =>
                                            setCustomerId(
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 outline-none focus:border-neutral-600"
                                    >

                                        <option value="">
                                            All Customers
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

                                </div>

                                {/* STATUS */}

                                <div>

                                    <label
                                        htmlFor="status_id"
                                        className="mb-2 block text-sm font-medium text-neutral-400"
                                    >
                                        Status
                                    </label>

                                    <select
                                        id="status_id"
                                        value={statusId}
                                        onChange={(event) =>
                                            setStatusId(
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 outline-none focus:border-neutral-600"
                                    >

                                        <option value="">
                                            All Statuses
                                        </option>

                                        {statuses.map(
                                            (status) => (
                                                <option
                                                    key={
                                                        status.id
                                                    }
                                                    value={
                                                        status.id
                                                    }
                                                >
                                                    {
                                                        status.name
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                                {/* START DATE */}

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
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 outline-none focus:border-neutral-600"
                                    />

                                </div>

                                {/* END DATE */}

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
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 outline-none focus:border-neutral-600"
                                    />

                                </div>

                            </div>

                            {/* DATE ERROR */}

                            {invalidDateRange && (
                                <p className="text-sm text-red-400">
                                    End date must be after or equal to the start date.
                                </p>
                            )}

                            {/* BUTTONS */}

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
                                    onClick={
                                        clearFilters
                                    }
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

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        <SummaryCard
                            label="Total Sales"
                            value={formatMoney(
                                summary.totalSales
                            )}
                            description="Sales matching your filters"
                        />

                        <SummaryCard
                            label="Collected"
                            value={formatMoney(
                                summary.collected
                            )}
                            description="Payments received"
                            valueClassName="text-emerald-400"
                        />

                        <SummaryCard
                            label="Outstanding"
                            value={formatMoney(
                                summary.outstanding
                            )}
                            description="Remaining amount"
                            valueClassName="text-amber-400"
                        />

                        <SummaryCard
                            label="Sales Count"
                            value={String(
                                summary.salesCount
                            )}
                            description="Matching sales"
                        />

                    </div>

                    {/* SALES TABLE */}

                    <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">

                        {sales.data.length === 0 ? (

                            <div className="p-10 text-center">

                                <p className="text-sm text-neutral-400">
                                    No sales found.
                                </p>

                                <Link
                                    href="/sales/create"
                                    className="mt-4 inline-flex rounded-xl border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:bg-neutral-800"
                                >
                                    Create your first sale
                                </Link>

                            </div>

                        ) : (

                            <>

                                <div className="overflow-x-auto">

                                    <table className="w-full min-w-[1100px] text-left text-sm">

                                        <thead className="border-b border-neutral-800">

                                            <tr>

                                                <th className="px-5 py-4 font-medium text-neutral-500">
                                                    Sale
                                                </th>

                                                <th className="px-5 py-4 font-medium text-neutral-500">
                                                    Customer
                                                </th>

                                                <th className="px-5 py-4 font-medium text-neutral-500">
                                                    Amount
                                                </th>

                                                <th className="px-5 py-4 font-medium text-neutral-500">
                                                    Paid
                                                </th>

                                                <th className="px-5 py-4 font-medium text-neutral-500">
                                                    Remaining
                                                </th>

                                                <th className="px-5 py-4 font-medium text-neutral-500">
                                                    Status
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

                                            {sales.data.map(
                                                (sale) => {

                                                    const paid =
                                                        Number(
                                                            sale.payments_sum_amount ??
                                                                0
                                                        );

                                                    const remaining =
                                                        Number(
                                                            sale.amount
                                                        ) -
                                                        paid;

                                                    return (
                                                        <tr
                                                            key={
                                                                sale.id
                                                            }
                                                            className="transition hover:bg-neutral-800/30"
                                                        >

                                                            <td className="px-5 py-4">

                                                                <Link
                                                                    href={`/sales/${sale.id}`}
                                                                    className="font-medium text-neutral-100 transition hover:text-white"
                                                                >
                                                                    Sale #
                                                                    {
                                                                        sale.id
                                                                    }
                                                                </Link>

                                                            </td>

                                                            <td className="px-5 py-4 text-neutral-400">

                                                                {sale
                                                                    .customer
                                                                    ?.name ??
                                                                    'No customer'}

                                                            </td>

                                                            <td className="px-5 py-4 text-neutral-200">

                                                                {formatMoney(
                                                                    sale.amount
                                                                )}

                                                            </td>

                                                            <td className="px-5 py-4 text-emerald-400">

                                                                {formatMoney(
                                                                    paid
                                                                )}

                                                            </td>

                                                            <td className="px-5 py-4 text-neutral-300">

                                                                {formatMoney(
                                                                    remaining
                                                                )}

                                                            </td>

                                                            <td className="px-5 py-4">

                                                                <StatusBadge
                                                                    status={
                                                                        sale.status
                                                                    }
                                                                />

                                                            </td>

                                                            <td className="px-5 py-4 text-neutral-400">

                                                                {formatDate(
                                                                    sale.sold_at
                                                                )}

                                                            </td>

                                                            <td className="px-5 py-4">

                                                                <div className="flex justify-end gap-4">

                                                                    <Link
                                                                        href={`/sales/${sale.id}`}
                                                                        className="text-neutral-300 transition hover:text-white"
                                                                    >
                                                                        View
                                                                    </Link>

                                                                    <Link
                                                                        href={`/sales/${sale.id}/payments/create`}
                                                                        className="text-emerald-400 transition hover:text-emerald-300"
                                                                    >
                                                                        Payment
                                                                    </Link>

                                                                    <Link
                                                                        href={`/sales/${sale.id}/edit`}
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
                                                                                sale.id
                                                                            )
                                                                        }
                                                                        className="text-red-400 transition hover:text-red-300 disabled:opacity-50"
                                                                    >
                                                                        Delete
                                                                    </button>

                                                                </div>

                                                            </td>

                                                        </tr>
                                                    );
                                                }
                                            )}

                                        </tbody>

                                    </table>

                                </div>

                                {sales.links.length > 3 && (

                                    <div className="flex flex-wrap gap-2 border-t border-neutral-800 p-4">

                                        {sales.links.map(
                                            (
                                                link,
                                                index
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
                                                            __html:
                                                                link.label,
                                                        }}
                                                    />
                                                </Link>

                                            )
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
                onOpenChange={(
                    open
                ) => {
                    if (!open) {
                        setDeleteId(null);
                    }
                }}
                title="Delete sale?"
                description="This sale and its related payment records will be permanently deleted. This action cannot be undone."
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