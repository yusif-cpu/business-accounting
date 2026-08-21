import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import DeleteConfirmation from '@/components/delete-confirmation';
import AppLayout from '@/layouts/app-layout';

type Customer = {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    customers: {
        data: Customer[];
        links: PaginationLink[];
    };
};

export default function Index({ customers }: Props) {
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { delete: destroy, processing } = useForm();

    const handleDelete = () => {
        if (deleteId === null) {
            return;
        }

        destroy(`/customers/${deleteId}`, {
            onSuccess: () => {
                setDeleteId(null);
            },
        });
    };

    return (
        <AppLayout>
            <div className="bg-neutral-950 p-6 text-neutral-100">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-neutral-500">
                                Customers
                            </p>

                            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                                Customers
                            </h1>

                            <p className="mt-2 text-sm text-neutral-400">
                                Manage your business customers and contact
                                information.
                            </p>
                        </div>

                        <Link
                            href="/customers/create"
                            className="inline-flex items-center justify-center rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-white"
                        >
                            Create Customer
                        </Link>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
                        {customers.data.length === 0 ? (
                            <div className="p-10 text-center">
                                <p className="text-sm text-neutral-400">
                                    No customers found.
                                </p>

                                <Link
                                    href="/customers/create"
                                    className="mt-4 inline-flex rounded-xl border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:bg-neutral-800"
                                >
                                    Create your first customer
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[800px] text-left text-sm">
                                        <thead className="border-b border-neutral-800">
                                            <tr>
                                                <th className="px-5 py-4 font-medium text-neutral-500">
                                                    Customer
                                                </th>
                                                <th className="px-5 py-4 font-medium text-neutral-500">
                                                    Email
                                                </th>
                                                <th className="px-5 py-4 font-medium text-neutral-500">
                                                    Phone
                                                </th>
                                                <th className="px-5 py-4 text-right font-medium text-neutral-500">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-neutral-800">
                                            {customers.data.map((customer) => (
                                                <tr
                                                    key={customer.id}
                                                    className="transition hover:bg-neutral-800/30"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-sm font-semibold text-neutral-300">
                                                                {customer.name
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </div>

                                                            <div>
                                                                <p className="font-medium text-neutral-100">
                                                                    {
                                                                        customer.name
                                                                    }
                                                                </p>

                                                                <p className="text-xs text-neutral-500">
                                                                    Customer #
                                                                    {
                                                                        customer.id
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4 text-neutral-300">
                                                        {customer.email ??
                                                            'Not provided'}
                                                    </td>

                                                    <td className="px-5 py-4 text-neutral-300">
                                                        {customer.phone ??
                                                            'Not provided'}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex justify-end gap-4">
                                                            <Link
                                                                href={`/customers/${customer.id}/edit`}
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
                                                                        customer.id,
                                                                    )
                                                                }
                                                                className="text-red-400 transition hover:text-red-300 disabled:opacity-50"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {customers.links.length > 3 && (
                                    <div className="flex flex-wrap gap-2 border-t border-neutral-800 p-4">
                                        {customers.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url ?? '#'}
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
                                        ))}
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
                title="Delete customer?"
                description="This customer will be permanently deleted. This action cannot be undone."
                onConfirm={handleDelete}
                processing={processing}
            />
        </AppLayout>
    );
}
