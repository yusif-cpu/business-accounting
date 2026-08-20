import AppLayout from '@/layouts/app-layout';
import FormError from '@/components/form-error';
import { useForm } from '@inertiajs/react';

type Customer = {
    id: number;
    name: string;
};

type Sale = {
    id: number;
    customer_id: number | null;
    amount: string;
};

type Props = {
    sale: Sale;
    customers: Customer[];
};

export default function Edit({ sale, customers }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        customer_id: sale.customer_id?.toString() ?? '',
        amount: sale.amount,
    });

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        put(`/sales/${sale.id}`);
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
                                Sale #{sale.id}
                            </p>

                            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                                Edit Sale
                            </h1>

                            <p className="mt-2 text-sm text-neutral-400">
                                Update the sale details.
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
                                    className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 outline-none transition focus:border-neutral-600"
                                >
                                    <option value="">
                                        No customer
                                    </option>

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
                                    className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 outline-none transition focus:border-neutral-600"
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
                                    {processing
                                        ? 'Saving...'
                                        : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}