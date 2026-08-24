import {
    Link,
    router,
} from '@inertiajs/react';

import {
    useState,
} from 'react';

import DeleteConfirmation from '@/components/delete-confirmation';

import AppLayout from '@/layouts/app-layout';

type SaleStatus = {
    id: number;
    name: string;
    slug: string;
    is_default: boolean;
    sales_count: number;
};

type Props = {
    statuses: SaleStatus[];
};

export default function Index({
    statuses,
}: Props) {
    const [
        deleteId,
        setDeleteId,
    ] = useState<number | null>(null);

    const deleteStatus = () => {
        if (deleteId === null) {
            return;
        }

        router.delete(
            `/sale-statuses/${deleteId}`,
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

                <div className="mx-auto max-w-5xl space-y-6">

                    {/* HEADER */}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                        <div>

                            <Link
                                href="/sales"
                                className="text-sm text-neutral-500 transition hover:text-neutral-200"
                            >
                                ← Back to Sales
                            </Link>

                            <p className="mt-5 text-sm font-medium text-neutral-500">
                                Settings
                            </p>

                            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                                Sale Statuses
                            </h1>

                            <p className="mt-2 text-sm text-neutral-400">
                                Manage the statuses available for your sales.
                            </p>

                        </div>

                        <Link
                            href="/sale-statuses/create"
                            className="inline-flex items-center justify-center rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-white"
                        >
                            Create Status
                        </Link>

                    </div>

                    {/* STATUS LIST */}

                    <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">

                        {statuses.length === 0 ? (

                            <div className="p-10 text-center">

                                <p className="text-sm text-neutral-400">
                                    No sale statuses found.
                                </p>

                                <Link
                                    href="/sale-statuses/create"
                                    className="mt-4 inline-flex rounded-xl border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-300 transition hover:bg-neutral-800"
                                >
                                    Create your first status
                                </Link>

                            </div>

                        ) : (

                            <div className="divide-y divide-neutral-800">

                                {statuses.map(
                                    (status) => (
                                        <div
                                            key={
                                                status.id
                                            }
                                            className="flex flex-col gap-4 p-5 transition hover:bg-neutral-800/30 sm:flex-row sm:items-center sm:justify-between"
                                        >

                                            {/* STATUS INFO */}

                                            <div className="flex items-center gap-4">

                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 text-sm font-semibold text-neutral-400">
                                                    {status.name
                                                        .charAt(
                                                            0
                                                        )
                                                        .toUpperCase()}
                                                </div>

                                                <div>

                                                    <div className="flex items-center gap-2">

                                                        <p className="font-medium text-neutral-100">
                                                            {
                                                                status.name
                                                            }
                                                        </p>

                                                        {status.is_default && (
                                                            <span className="rounded-full border border-neutral-700 bg-neutral-800 px-2 py-0.5 text-[11px] font-medium text-neutral-400">
                                                                Default
                                                            </span>
                                                        )}

                                                    </div>

                                                    <p className="mt-1 text-xs text-neutral-500">
                                                        {
                                                            status.sales_count
                                                        }{' '}

                                                        {status.sales_count ===
                                                        1
                                                            ? 'sale'
                                                            : 'sales'}
                                                    </p>

                                                </div>

                                            </div>

                                            {/* ACTIONS */}

                                            <div className="flex items-center gap-4">

                                                <Link
                                                    href={`/sale-statuses/${status.id}/edit`}
                                                    className="text-sm text-blue-400 transition hover:text-blue-300"
                                                >
                                                    Edit
                                                </Link>

                                                {!status.is_default &&
                                                    status.sales_count ===
                                                        0 && (

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setDeleteId(
                                                                    status.id
                                                                )
                                                            }
                                                            className="text-sm text-red-400 transition hover:text-red-300"
                                                        >
                                                            Delete
                                                        </button>

                                                    )}

                                            </div>

                                        </div>
                                    )
                                )}

                            </div>

                        )}

                    </div>

                </div>

            </div>

            {/* DELETE CONFIRMATION */}

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
                title="Delete sale status?"
                description="This status will be permanently deleted. This action cannot be undone."
                onConfirm={
                    deleteStatus
                }
            />

        </AppLayout>
    );
}