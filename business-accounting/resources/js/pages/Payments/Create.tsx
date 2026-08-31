import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import FormError from '@/components/form-error';
import AppLayout from '@/layouts/app-layout';

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
        payment_source: 'cash',
        paid_at: new Date().toISOString().slice(0, 16),
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(`/sales/${sale.id}/payments`);
    };

    return (
        <AppLayout>
            <div className="min-h-full bg-neutral-950 p-6 text-neutral-100">
                <div className="mx-auto max-w-2xl">
                    <div className="mb-6">
                        <p className="text-sm font-medium text-neutral-500">
                            Sale #{sale.id}
                        </p>

                        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                            Add Payment
                        </h1>

                        <p className="mt-2 text-sm text-neutral-400">
                            Record a payment for this sale.
                        </p>
                    </div>

                    <div className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                        <p className="text-sm text-neutral-500">Sale Amount</p>

                        <p className="mt-1 text-2xl font-semibold text-neutral-100">
                            ${Number(sale.amount).toFixed(2)}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-xl shadow-black/10">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label
                                    htmlFor="amount"
                                    className="text-sm font-medium text-neutral-200"
                                >
                                    Payment Amount
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
                                    className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-neutral-100 transition outline-none placeholder:text-neutral-500 focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600"
                                    placeholder="0.00"
                                />

                                <FormError message={errors.amount} />
                            </div>

                            <div>
                                <label
                                    htmlFor="payment_source"
                                    className="text-sm font-medium text-neutral-200"
                                >
                                    Payment Source
                                </label>

                                <select
                                    id="payment_source"
                                    value={data.payment_source}
                                    onChange={(event) =>
                                        setData(
                                            'payment_source',
                                            event.target.value
                                        )
                                    }
                                    className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-neutral-100 transition outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600"
                                >
                                    <option value="cart2cart">
                                        Cart2Cart
                                    </option>
                                    <option value="cash">Cash</option>
                                    <option value="company_bank_account">
                                        Company bank account
                                    </option>
                                    <option value="deposit">Deposit</option>
                                </select>

                                <FormError
                                    message={errors.payment_source}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="paid_at"
                                    className="text-sm font-medium text-neutral-200"
                                >
                                    Paid At
                                </label>

                                <input
                                    id="paid_at"
                                    type="datetime-local"
                                    value={data.paid_at}
                                    onChange={(event) =>
                                        setData('paid_at', event.target.value)
                                    }
                                    className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-neutral-100 transition outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600"
                                />

                                <FormError message={errors.paid_at} />
                            </div>

                            <div className="flex justify-end gap-3 border-t border-neutral-800 pt-5">
                                <button
                                    type="button"
                                    onClick={() => window.history.back()}
                                    className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:bg-neutral-800"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing ? 'Adding...' : 'Add Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
