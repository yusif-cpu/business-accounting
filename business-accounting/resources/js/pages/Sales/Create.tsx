import {
    useForm,
} from '@inertiajs/react';

import {
    useState,
} from 'react';

import FormError from '@/components/form-error';
import CreateSaleStatusModal from '@/components/create-sale-status-modal';

import AppLayout from '@/layouts/app-layout';

type Customer = {
    id: number;
    name: string;
};

type SaleStatus = {
    id: number;
    name: string;
    slug: string;
    is_default: boolean;
};

type Props = {
    customers: Customer[];
    statuses: SaleStatus[];
};

export default function Create({
    customers,
    statuses: initialStatuses,
}: Props) {
    const [
        statuses,
        setStatuses,
    ] = useState<SaleStatus[]>(
        initialStatuses
    );

    const [
        showStatusModal,
        setShowStatusModal,
    ] = useState(false);

    const defaultStatus =
        initialStatuses.find(
            (status) =>
                status.is_default
        ) ??
        initialStatuses[0] ??
        null;

    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm({
        customer_id: '',
        amount: '',
        status_id:
            defaultStatus?.id.toString() ??
            '',
    });

    const submit = (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        post('/sales');
    };

    const handleStatusCreated = (
        status: SaleStatus
    ) => {
        setStatuses((current) => [
            ...current,
            status,
        ]);

        setData(
            'status_id',
            status.id.toString()
        );
    };

    return (
        <AppLayout>

            <div className="bg-neutral-950 p-6 text-neutral-100">

                <div className="mx-auto max-w-2xl space-y-6">

                    <div>

                        <a
                            href="/sales"
                            className="inline-flex items-center text-sm text-neutral-500 transition hover:text-neutral-200"
                        >
                            ← Back to Sales
                        </a>

                        <div className="mt-5">

                            <p className="text-sm font-medium text-neutral-500">
                                Sales
                            </p>

                            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                                Create Sale
                            </h1>

                            <p className="mt-2 text-sm text-neutral-400">
                                Record a new sale.
                            </p>

                        </div>

                    </div>

                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">

                        <form
                            onSubmit={submit}
                            className="space-y-6"
                        >

                            {/* CUSTOMER */}

                            <div>

                                <label
                                    htmlFor="customer_id"
                                    className="text-sm font-medium text-neutral-300"
                                >
                                    Customer
                                </label>

                                <select
                                    id="customer_id"
                                    value={data.customer_id}
                                    onChange={(event) =>
                                        setData(
                                            'customer_id',
                                            event.target.value
                                        )
                                    }
                                    className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 transition outline-none focus:border-neutral-600"
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
                                    value={data.amount}
                                    onChange={(event) =>
                                        setData(
                                            'amount',
                                            event.target.value
                                        )
                                    }
                                    placeholder="0.00"
                                    className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 transition outline-none focus:border-neutral-600"
                                />

                                <FormError
                                    message={
                                        errors.amount
                                    }
                                />

                            </div>

                            {/* STATUS */}

                            <div>

                                <div className="flex items-center justify-between">

                                    <label
                                        htmlFor="status_id"
                                        className="text-sm font-medium text-neutral-300"
                                    >
                                        Status
                                    </label>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowStatusModal(
                                                true
                                            )
                                        }
                                        className="text-xs font-medium text-blue-400 transition hover:text-blue-300"
                                    >
                                        + Create new status
                                    </button>

                                </div>

                                <select
                                    id="status_id"
                                    value={data.status_id}
                                    onChange={(event) =>
                                        setData(
                                            'status_id',
                                            event.target.value
                                        )
                                    }
                                    className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 transition outline-none focus:border-neutral-600"
                                >

                                    {statuses.length ===
                                    0 ? (
                                        <option value="">
                                            No statuses available
                                        </option>
                                    ) : (
                                        statuses.map(
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
                                        )
                                    )}

                                </select>

                                <FormError
                                    message={
                                        errors.status_id
                                    }
                                />

                            </div>

                            {/* BUTTONS */}

                            <div className="flex justify-end gap-3 border-t border-neutral-800 pt-5">

                                <a
                                    href="/sales"
                                    className="rounded-xl border border-neutral-800 px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:bg-neutral-800"
                                >
                                    Cancel
                                </a>

                                <button
                                    type="submit"
                                    disabled={
                                        processing
                                    }
                                    className="rounded-xl bg-neutral-100 px-5 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-white disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Creating...'
                                        : 'Create Sale'}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            </div>

            <CreateSaleStatusModal
                open={
                    showStatusModal
                }
                onClose={() =>
                    setShowStatusModal(false)
                }
                onCreated={
                    handleStatusCreated
                }
            />

        </AppLayout>
    );
}