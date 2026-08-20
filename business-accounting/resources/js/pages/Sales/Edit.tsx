import AppLayout from '@/layouts/app-layout';
import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

type Customer = {
    id: number;
    name: string;
};

type Sale = {
    id: number;
    customer_id: number | null;
    amount: string;
    status: string;
};

type Props = {
    sale: Sale;
    customers: Customer[];
};

export default function Edit({ sale, customers }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        customer_id: sale.customer_id?.toString() ?? '',
        amount: sale.amount,
        status: sale.status,
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        put(`/sales/${sale.id}`);
    };

    return (
        <AppLayout>
            <div className="p-6">
                <h1 className="text-2xl font-bold">
                    Edit Sale #{sale.id}
                </h1>

                <form onSubmit={submit} className="mt-6 space-y-4">
                    <div>
                        <label>Customer</label>

                        <select
                            value={data.customer_id}
                            onChange={(event) =>
                                setData('customer_id', event.target.value)
                            }
                            className="mt-1 w-full rounded border p-2"
                        >
                            <option value="">Select customer</option>

                            {customers.map((customer) => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.name}
                                </option>
                            ))}
                        </select>

                        {errors.customer_id && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.customer_id}
                            </p>
                        )}
                    </div>

                    <div>
                        <label>Amount</label>

                        <input
                            type="number"
                            step="0.01"
                            value={data.amount}
                            onChange={(event) =>
                                setData('amount', event.target.value)
                            }
                            className="mt-1 w-full rounded border p-2"
                        />

                        {errors.amount && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.amount}
                            </p>
                        )}
                    </div>

                    <div>
                        <label>Status</label>

                        <select
                            value={data.status}
                            onChange={(event) =>
                                setData('status', event.target.value)
                            }
                            className="mt-1 w-full rounded border p-2"
                        >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        {errors.status && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.status}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
                    >
                        {processing ? 'Updating...' : 'Update Sale'}
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
