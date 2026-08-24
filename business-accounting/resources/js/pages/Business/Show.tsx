import { Link, router } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';

type Business = {
    id: number;
    business_name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    website: string | null;
    tax_id: string | null;
    currency: string;
    logo_url: string | null;
};

type Stats = {
    customers: number;
    sales: number;
    expenses: number;
    operations: number;
    categories: number;
};

type Props = {
    business: Business;
    stats: Stats;
};

export default function Show({
    business,
    stats,
}: Props) {
    const deleteBusiness = () => {
        if (
            !window.confirm(
                'Delete this business? This action cannot be undone.',
            )
        ) {
            return;
        }

        router.delete(
            `/businesses/${business.id}`,
        );
    };

    return (
        <AppLayout>
            <div className="bg-neutral-950 p-6 text-neutral-100">
                <div className="mx-auto max-w-5xl space-y-6">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                        <div>
                            <Link
                                href="/businesses"
                                className="text-sm text-neutral-500 transition hover:text-neutral-200"
                            >
                                ← Back to Business
                            </Link>

                            <p className="mt-5 text-sm font-medium text-neutral-500">
                                Business #
                                {
                                    business.id
                                }
                            </p>

                            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                                {
                                    business.business_name
                                }
                            </h1>
                        </div>

                        <div className="flex gap-3">

                            <Link
                                href={`/businesses/${business.id}/edit`}
                                className="rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-white"
                            >
                                Edit
                            </Link>

                            <button
                                type="button"
                                onClick={
                                    deleteBusiness
                                }
                                className="rounded-xl border border-red-900/60 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-950/30"
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                            <p className="text-sm text-neutral-500">
                                Customers
                            </p>

                            <p className="mt-2 text-2xl font-semibold">
                                {
                                    stats.customers
                                }
                            </p>
                        </div>

                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                            <p className="text-sm text-neutral-500">
                                Sales
                            </p>

                            <p className="mt-2 text-2xl font-semibold">
                                {
                                    stats.sales
                                }
                            </p>
                        </div>

                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                            <p className="text-sm text-neutral-500">
                                Expenses
                            </p>

                            <p className="mt-2 text-2xl font-semibold">
                                {
                                    stats.expenses
                                }
                            </p>
                        </div>

                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                            <p className="text-sm text-neutral-500">
                                Operations
                            </p>

                            <p className="mt-2 text-2xl font-semibold">
                                {
                                    stats.operations
                                }
                            </p>
                        </div>

                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                            <p className="text-sm text-neutral-500">
                                Categories
                            </p>

                            <p className="mt-2 text-2xl font-semibold">
                                {
                                    stats.categories
                                }
                            </p>
                        </div>

                    </div>

                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">

                        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">

                            {business.logo_url ? (
                                <div className="flex size-40 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
                                    <img
                                        src={
                                            business.logo_url
                                        }
                                        alt={
                                            business.business_name
                                        }
                                        className="size-full object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="flex size-40 shrink-0 items-center justify-center rounded-2xl border border-dashed border-neutral-700 bg-neutral-950 text-sm text-neutral-600">
                                    No Logo
                                </div>
                            )}

                            <div className="grid flex-1 gap-5 sm:grid-cols-2">

                                <div>
                                    <p className="text-xs text-neutral-500">
                                        Business Name
                                    </p>

                                    <p className="mt-1 text-sm text-neutral-200">
                                        {
                                            business.business_name
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-neutral-500">
                                        Currency
                                    </p>

                                    <p className="mt-1 text-sm text-neutral-200">
                                        {
                                            business.currency
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-neutral-500">
                                        Phone
                                    </p>

                                    <p className="mt-1 text-sm text-neutral-200">
                                        {
                                            business.phone ??
                                            '—'
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-neutral-500">
                                        Email
                                    </p>

                                    <p className="mt-1 text-sm text-neutral-200">
                                        {
                                            business.email ??
                                            '—'
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-neutral-500">
                                        Tax ID / VÖEN
                                    </p>

                                    <p className="mt-1 text-sm text-neutral-200">
                                        {
                                            business.tax_id ??
                                            '—'
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-neutral-500">
                                        Website / Domain
                                    </p>

                                    {business.website ? (
                                        <a
                                            href={
                                                business.website
                                            }
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-1 block truncate text-sm text-blue-400 hover:text-blue-300"
                                        >
                                            {
                                                business.website
                                            }
                                        </a>
                                    ) : (
                                        <p className="mt-1 text-sm text-neutral-200">
                                            —
                                        </p>
                                    )}
                                </div>

                                <div className="sm:col-span-2">
                                    <p className="text-xs text-neutral-500">
                                        Address
                                    </p>

                                    <p className="mt-1 whitespace-pre-line text-sm text-neutral-200">
                                        {
                                            business.address ??
                                            '—'
                                        }
                                    </p>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>
            </div>
        </AppLayout>
    );
}