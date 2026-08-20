import AppLayout from '@/layouts/app-layout';
import { Link, useForm } from '@inertiajs/react';
import { formatDate, formatMoney } from '@/lib/formatters';

type Sale = {
    id: number;
    amount: string;
    status: string;
    sold_at: string;
    payments_sum_amount: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type SalesPagination = {
    data: Sale[];
    links: PaginationLink[];
};

type Props = {
    sales: SalesPagination;
};

export default function Index({ sales }: Props) {
    const { delete: destroy, processing } = useForm();

    const handleDelete = (saleId: number) => {
        if (confirm('Are you sure you want to delete this sale?')) {
            destroy(`/sales/${saleId}`);
        }
    };

    return (
        <AppLayout>
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Sales</h1>

                        <p className="mt-1 text-gray-500">
                            Manage your business sales.
                        </p>
                    </div>

                    <Link
                        href="/sales/create"
                        className="rounded bg-black px-4 py-2 text-white"
                    >
                        Create Sale
                    </Link>
                </div>

                <div className="mt-6 space-y-3">
                    {sales.data.length === 0 ? (
                        <div className="rounded-lg border p-6">
                            <p className="text-gray-500">
                                No sales found.
                            </p>
                        </div>
                    ) : (
                        sales.data.map((sale) => {
                            const paid = Number(
                                sale.payments_sum_amount ?? 0,
                            );

                            const remaining =
                                Number(sale.amount) - paid;

                            return (
                                <div
                                    key={sale.id}
                                    className="rounded-lg border p-4"
                                >
                                    <div className="flex items-center justify-between gap-6">
                                        <div className="space-y-1">
                                            <p className="font-semibold">
                                                Sale #{sale.id}
                                            </p>

                                            <p>
                                                Sale Amount:{' '}
                                                {formatMoney(sale.amount)}
                                            </p>

                                            <p>
                                                Paid:{' '}
                                                {formatMoney(paid)}
                                            </p>

                                            <p>
                                                Remaining:{' '}
                                                {formatMoney(remaining)}
                                            </p>

                                            <p>
                                                Status:{' '}
                                                <span className="capitalize">
                                                    {sale.status}
                                                </span>
                                            </p>

                                            <p className="text-sm text-gray-500">
                                                Sold at:{' '}
                                                {formatDate(sale.sold_at)}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3">
                                            <Link
                                                href={`/sales/${sale.id}`}
                                                className="text-gray-700"
                                            >
                                                View
                                            </Link>

                                            <Link
                                                href={`/sales/${sale.id}/payments/create`}
                                                className="text-green-600"
                                            >
                                                Add Payment
                                            </Link>

                                            <Link
                                                href={`/sales/${sale.id}/edit`}
                                                className="text-blue-600"
                                            >
                                                Edit
                                            </Link>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDelete(sale.id)
                                                }
                                                disabled={processing}
                                                className="text-red-600 disabled:opacity-50"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {sales.links.length > 3 && (
                    <div className="mt-6 flex flex-wrap gap-2">
                        {sales.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url ?? '#'}
                                preserveScroll
                                className={`rounded border px-3 py-2 text-sm ${
                                    link.active
                                        ? 'bg-black text-white'
                                        : link.url
                                          ? 'bg-white text-gray-700'
                                          : 'cursor-not-allowed text-gray-400'
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
            </div>
        </AppLayout>
    );
}
