import AppLayout from '@/layouts/app-layout';
import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

type Customer = {
    id: number;
    name: string;
};

type Props = {
    customers: Customer[];
};

export default function Create({ customers }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        amount: '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post('/sales');
    };

    return (
        <AppLayout>
            <div className="p-6">
                <h1 className="text-2xl font-bold">Create Sale</h1>

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

                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
                    >
                        {processing ? 'Creating...' : 'Create Sale'}
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}

