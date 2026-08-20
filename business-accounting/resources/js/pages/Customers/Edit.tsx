import AppLayout from '@/layouts/app-layout';
import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

type Customer = {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
};

type Props = {
    customer: Customer;
};

export default function Edit({ customer }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: customer.name,
        email: customer.email ?? '',
        phone: customer.phone ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        put(`/customers/${customer.id}`);
    };

    return (
        <AppLayout>
            <div className="p-6">
                <h1 className="text-2xl font-bold">
                    Edit Customer #{customer.id}
                </h1>

                <form onSubmit={submit} className="mt-6 max-w-xl space-y-4">
                    <div>
                        <label>Name</label>

                        <input
                            type="text"
                            value={data.name}
                            onChange={(event) =>
                                setData('name', event.target.value)
                            }
                            className="mt-1 w-full rounded border p-2"
                        />

                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label>Email</label>

                        <input
                            type="email"
                            value={data.email}
                            onChange={(event) =>
                                setData('email', event.target.value)
                            }
                            className="mt-1 w-full rounded border p-2"
                        />

                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div>
                        <label>Phone</label>

                        <input
                            type="text"
                            value={data.phone}
                            onChange={(event) =>
                                setData('phone', event.target.value)
                            }
                            className="mt-1 w-full rounded border p-2"
                        />

                        {errors.phone && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.phone}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
                    >
                        {processing ? 'Updating...' : 'Update Customer'}
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}