import AppLayout from '@/layouts/app-layout';
import { Link, useForm } from '@inertiajs/react';

type Customer = {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
};

type Payment = {
    id: number;
    amount: string;
    method: string;
    paid_at: string;
};

type Sale = {
    id: number;
    amount: string;
    status: string;
    sold_at: string;
    customer: Customer | null;
    payments: Payment[];
};

type Props = {
    sale: Sale;
};

export default function Show({ sale }: Props) {
    const { delete: destroy, processing } = useForm();

    const totalPaid = sale.payments.reduce(
        (total, payment) => total + Number(payment.amount),
        0,
    );

    const remaining = Number(sale.amount) - totalPaid;

    const handleDeletePayment = (paymentId: number) => {
        if (
            confirm(
                'Are you sure you want to delete this payment?',
            )
        ) {
            destroy(`/payments/${paymentId}`);
        }
    };

    return (
        <AppLayout>
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Sale #{sale.id}
                        </h1>

                        <p className="mt-1 text-gray-500">
                            Sale details and payment history
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Link
                            href={`/sales/${sale.id}/payments/create`}
                            className="rounded bg-green-600 px-4 py-2 text-white"
                        >
                            Add Payment
                        </Link>

                        <Link
                            href={`/sales/${sale.id}/edit`}
                            className="rounded bg-black px-4 py-2 text-white"
                        >
                            Edit
                        </Link>
                    </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border p-5">
                        <p className="text-sm text-gray-500">
                            Sale Amount
                        </p>

                        <p className="mt-2 text-2xl font-bold">
                            ${Number(sale.amount).toFixed(2)}
                        </p>
                    </div>

                    <div className="rounded-lg border p-5">
                        <p className="text-sm text-gray-500">
                            Paid
                        </p>

                        <p className="mt-2 text-2xl font-bold">
                            ${totalPaid.toFixed(2)}
                        </p>
                    </div>

                    <div className="rounded-lg border p-5">
                        <p className="text-sm text-gray-500">
                            Remaining
                        </p>

                        <p className="mt-2 text-2xl font-bold">
                            ${remaining.toFixed(2)}
                        </p>
                    </div>

                    <div className="rounded-lg border p-5">
                        <p className="text-sm text-gray-500">
                            Status
                        </p>

                        <p className="mt-2 text-2xl font-bold capitalize">
                            {sale.status}
                        </p>
                    </div>
                </div>

                <div className="mt-6 rounded-lg border p-5">
                    <h2 className="text-lg font-semibold">
                        Customer
                    </h2>

                    {sale.customer ? (
                        <div className="mt-3 space-y-1">
                            <p>{sale.customer.name}</p>

                            <p className="text-gray-500">
                                {sale.customer.email ?? 'No email'}
                            </p>

                            <p className="text-gray-500">
                                {sale.customer.phone ?? 'No phone'}
                            </p>
                        </div>
                    ) : (
                        <p className="mt-3 text-gray-500">
                            No customer assigned.
                        </p>
                    )}
                </div>

                <div className="mt-6 rounded-lg border">
                    <div className="border-b p-5">
                        <h2 className="text-lg font-semibold">
                            Payment History
                        </h2>
                    </div>

                    {sale.payments.length === 0 ? (
                        <p className="p-5 text-gray-500">
                            No payments found.
                        </p>
                    ) : (
                        <div className="divide-y">
                            {sale.payments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="flex items-center justify-between p-5"
                                >
                                    <div>
                                        <p className="font-medium capitalize">
                                            {payment.method}
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            {payment.paid_at}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <p className="font-semibold">
                                            $
                                            {Number(
                                                payment.amount,
                                            ).toFixed(2)}
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDeletePayment(
                                                    payment.id,
                                                )
                                            }
                                            disabled={processing}
                                            className="text-red-600 disabled:opacity-50"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
