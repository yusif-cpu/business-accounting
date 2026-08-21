import { useForm } from '@inertiajs/react';
import FormError from '@/components/form-error';
import AppLayout from '@/layouts/app-layout';

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

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post('/sales');
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
                        <form onSubmit={submit} className="space-y-6">
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
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 transition outline-none focus:border-neutral-600"
                                >
                                    <option value="">No customer</option>

                                    {customers.map((customer) => (
                                        <option
                                            key={customer.id}
                                            value={customer.id}
                                        >
                                            {customer.name}
                                        </option>
                                    ))}
                                </select>

                                <FormError message={errors.customer_id} />
                            </div>

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
                                        setData('amount', event.target.value)
                                    }
                                    placeholder="0.00"
                                    className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 transition outline-none focus:border-neutral-600"
                                />

                                <FormError message={errors.amount} />
                            </div>

                            <div className="flex justify-end gap-3 border-t border-neutral-800 pt-5">
                                <a
                                    href="/sales"
                                    className="rounded-xl border border-neutral-800 px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:bg-neutral-800"
                                >
                                    Cancel
                                </a>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-xl bg-neutral-100 px-5 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-white disabled:opacity-50"
                                >
                                    {processing ? 'Creating...' : 'Create Sale'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
