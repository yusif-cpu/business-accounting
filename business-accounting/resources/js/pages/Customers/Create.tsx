import AppLayout from '@/layouts/app-layout';
import FormError from '@/components/form-error';
import { useForm } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
    });

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post('/customers');
    };

    return (
        <AppLayout>
            <div className="bg-neutral-950 p-6 text-neutral-100">
                <div className="mx-auto max-w-2xl space-y-6">
                    <div>
                        <a
                            href="/customers"
                            className="inline-flex items-center text-sm text-neutral-500 transition hover:text-neutral-200"
                        >
                            ← Back to Customers
                        </a>

                        <div className="mt-5">
                            <p className="text-sm font-medium text-neutral-500">
                                Customers
                            </p>

                            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                                Create Customer
                            </h1>

                            <p className="mt-2 text-sm text-neutral-400">
                                Add a new customer to your business.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label
                                    htmlFor="name"
                                    className="text-sm font-medium text-neutral-300"
                                >
                                    Name
                                </label>

                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(event) =>
                                        setData('name', event.target.value)
                                    }
                                    placeholder="John Doe"
                                    className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 outline-none transition focus:border-neutral-600"
                                />

                                <FormError message={errors.name} />
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="text-sm font-medium text-neutral-300"
                                >
                                    Email
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(event) =>
                                        setData('email', event.target.value)
                                    }
                                    placeholder="john@example.com"
                                    className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 outline-none transition focus:border-neutral-600"
                                />

                                <FormError message={errors.email} />
                            </div>

                            <div>
                                <label
                                    htmlFor="phone"
                                    className="text-sm font-medium text-neutral-300"
                                >
                                    Phone
                                </label>

                                <input
                                    id="phone"
                                    type="text"
                                    value={data.phone}
                                    onChange={(event) =>
                                        setData('phone', event.target.value)
                                    }
                                    placeholder="+994..."
                                    className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 outline-none transition focus:border-neutral-600"
                                />

                                <FormError message={errors.phone} />
                            </div>

                            <div className="flex justify-end gap-3 border-t border-neutral-800 pt-5">
                                <a
                                    href="/customers"
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
                                        ? 'Creating...'
                                        : 'Create Customer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}