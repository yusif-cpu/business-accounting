import { Link } from '@inertiajs/react';

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

type Props = {
    business: Business;
};

export default function Index({
    business,
}: Props) {
    return (
        <AppLayout>
            <div className="bg-neutral-950 p-6 text-neutral-100">
                <div className="mx-auto max-w-5xl space-y-6">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-neutral-500">
                                Business
                            </p>

                            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                                Company Information
                            </h1>

                            <p className="mt-2 text-sm text-neutral-400">
                                Manage your company information and
                                business details.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Link
                                href={`/businesses/${business.id}`}
                                className="rounded-xl border border-neutral-800 px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:bg-neutral-800"
                            >
                                View
                            </Link>

                            <Link
                                href={`/businesses/${business.id}/edit`}
                                className="rounded-xl border border-neutral-800 px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:bg-neutral-800"
                            >
                                Edit
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">

                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

                            {business.logo_url ? (
                                <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
                                    <img
                                        src={business.logo_url}
                                        alt={business.business_name}
                                        className="size-full object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="flex size-28 shrink-0 items-center justify-center rounded-2xl border border-dashed border-neutral-700 bg-neutral-950 text-xs text-neutral-600">
                                    No Logo
                                </div>
                            )}

                            <div>
                                <h2 className="text-xl font-semibold">
                                    {business.business_name}
                                </h2>

                                <p className="mt-1 text-sm text-neutral-500">
                                    Business #{business.id}
                                </p>

                                {business.website && (
                                    <a
                                        href={business.website}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-3 inline-block text-sm text-blue-400 transition hover:text-blue-300"
                                    >
                                        {business.website}
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 grid gap-4 sm:grid-cols-2">

                            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                                <p className="text-xs text-neutral-500">
                                    Phone
                                </p>

                                <p className="mt-1 text-sm text-neutral-200">
                                    {business.phone ?? '—'}
                                </p>
                            </div>

                            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                                <p className="text-xs text-neutral-500">
                                    Email
                                </p>

                                <p className="mt-1 text-sm text-neutral-200">
                                    {business.email ?? '—'}
                                </p>
                            </div>

                            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                                <p className="text-xs text-neutral-500">
                                    Tax ID / VÖEN
                                </p>

                                <p className="mt-1 text-sm text-neutral-200">
                                    {business.tax_id ?? '—'}
                                </p>
                            </div>

                            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                                <p className="text-xs text-neutral-500">
                                    Currency
                                </p>

                                <p className="mt-1 text-sm font-medium text-neutral-200">
                                    {business.currency}
                                </p>
                            </div>

                            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 sm:col-span-2">
                                <p className="text-xs text-neutral-500">
                                    Address
                                </p>

                                <p className="mt-1 whitespace-pre-line text-sm text-neutral-200">
                                    {business.address ?? '—'}
                                </p>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}