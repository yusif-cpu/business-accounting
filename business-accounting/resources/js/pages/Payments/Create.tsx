import AppLayout from '@/layouts/app-layout';
import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

type Sale = {
    id: number;
    amount: string;
};

type Props = {
    sale: Sale;
};

export default function Create({ sale }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        amount: '',
        method: 'cash',
        paid_at: new Date().toISOString().slice(0, 16),
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(`/sales/${sale.id}/payments`);
    };

    return (
        <AppLayout>
            <div className="p-6">
                <h1 className="text-2xl font-bold">
                    Add Payment to Sale #{sale.id}
                </h1>

                <p className="mt-2 text-gray-600">
                    Sale amount: ${sale.amount}
                </p>

                <form onSubmit={submit} className="mt-6 max-w-xl space-y-4">
                    <div>
                        <label>Amount</label>

                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
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
                        <label>Payment Method</label>

                        <select
                            value={data.method}
                            onChange={(event) =>
                                setData('method', event.target.value)
                            }
                            className="mt-1 w-full rounded border p-2"
                        >
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                            <option value="bank_transfer">
                                Bank Transfer
                            </option>
                        </select>

                        {errors.method && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.method}
                            </p>
                        )}
                    </div>

                    <div>
                        <label>Paid At</label>

                        <input
                            type="datetime-local"
                            value={data.paid_at}
                            onChange={(event) =>
                                setData('paid_at', event.target.value)
                            }
                            className="mt-1 w-full rounded border p-2"
                        />

                        {errors.paid_at && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.paid_at}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
                    >
                        {processing ? 'Adding...' : 'Add Payment'}
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
