import AppLayout from '@/layouts/app-layout';
import { Link, useForm } from '@inertiajs/react';

type Customer = {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
};

type Props = {
    customers: Customer[];
};

export default function Index({ customers }: Props) {
    const { delete: destroy, processing } = useForm();

    const handleDelete = (customerId: number) => {
        if (confirm('Are you sure you want to delete this customer?')) {
            destroy(`/customers/${customerId}`);
        }
    };

    return (
        <AppLayout>
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Customers</h1>

                    <Link
                        href="/customers/create"
                        className="rounded bg-black px-4 py-2 text-white"
                    >
                        Create Customer
                    </Link>
                </div>

                <div className="mt-6 space-y-3">
                    {customers.length === 0 ? (
                        <p className="text-gray-500">
                            No customers found.
                        </p>
                    ) : (
                        customers.map((customer) => (
                            <div
                                key={customer.id}
                                className="rounded-lg border p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold">
                                            {customer.name}
                                        </p>

                                        <p>
                                            Email:{' '}
                                            {customer.email ?? 'Not provided'}
                                        </p>

                                        <p>
                                            Phone:{' '}
                                            {customer.phone ?? 'Not provided'}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Link
                                            href={`/customers/${customer.id}/edit`}
                                            className="text-blue-600"
                                        >
                                            Edit
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(customer.id)
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
