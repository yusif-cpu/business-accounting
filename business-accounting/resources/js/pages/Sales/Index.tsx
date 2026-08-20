import AppLayout from '@/layouts/app-layout';
import { Link, useForm } from '@inertiajs/react';

type Sale = {
    id: number;
    amount: string;
    status: string;
    sold_at: string;
};

type Props = {
    sales: Sale[];
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
                    <h1 className="text-2xl font-bold">Sales</h1>

                    <Link
                        href="/sales/create"
                        className="rounded bg-black px-4 py-2 text-white"
                    >
                        Create Sale
                    </Link>
                </div>

                <div className="mt-6 space-y-3">
                    {sales.length === 0 ? (
                        <p className="text-gray-500">
                            No sales found.
                        </p>
                    ) : (
                        sales.map((sale) => (
                            <div
                                key={sale.id}
                                className="rounded-lg border p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold">
                                            Sale #{sale.id}
                                        </p>

                                        <p>Amount: {sale.amount}</p>
                                        <p>Status: {sale.status}</p>
                                        <p>Sold at: {sale.sold_at}</p>
                                    </div>

                                    <div className="flex items-center gap-3">
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
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
