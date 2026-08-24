import {
    Link,
    useForm,
} from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';

import FormError from '@/components/form-error';

type SaleStatus = {
    id: number;
    name: string;
    slug: string;
    is_default: boolean;
};

type Props = {
    status: SaleStatus;
};

export default function Edit({
    status,
}: Props) {
    const {
        data,
        setData,
        put,
        processing,
        errors,
    } = useForm({
        name: status.name,
    });

    const submit = (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        put(
            `/sale-statuses/${status.id}`
        );
    };

    return (
        <AppLayout>

            <div className="bg-neutral-950 p-6 text-neutral-100">

                <div className="mx-auto max-w-2xl space-y-6">

                    <div>

                        <Link
                            href="/sale-statuses"
                            className="text-sm text-neutral-500 hover:text-neutral-200"
                        >
                            ← Back to Sale Statuses
                        </Link>

                        <div className="mt-5">

                            <p className="text-sm font-medium text-neutral-500">
                                Sale Statuses
                            </p>

                            <h1 className="mt-1 text-2xl font-semibold">
                                Edit Status
                            </h1>

                            <p className="mt-2 text-sm text-neutral-400">
                                Update this sale status.
                            </p>

                        </div>

                    </div>

                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">

                        <form
                            onSubmit={submit}
                            className="space-y-6"
                        >

                            <div>

                                <label
                                    htmlFor="name"
                                    className="text-sm font-medium text-neutral-300"
                                >
                                    Status Name
                                </label>

                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(event) =>
                                        setData(
                                            'name',
                                            event.target.value
                                        )
                                    }
                                    className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-4 py-3 text-sm text-neutral-100 outline-none focus:border-neutral-600"
                                />

                                <FormError
                                    message={
                                        errors.name
                                    }
                                />

                            </div>

                            {status.is_default && (
                                <p className="text-xs text-neutral-500">
                                    This is a default status. It can be renamed, but it cannot be deleted.
                                </p>
                            )}

                            <div className="flex justify-end gap-3 border-t border-neutral-800 pt-5">

                                <Link
                                    href="/sale-statuses"
                                    className="rounded-xl border border-neutral-800 px-4 py-2.5 text-sm font-medium text-neutral-300 hover:bg-neutral-800"
                                >
                                    Cancel
                                </Link>

                                <button
                                    type="submit"
                                    disabled={
                                        processing
                                    }
                                    className="rounded-xl bg-neutral-100 px-5 py-2.5 text-sm font-semibold text-neutral-950 hover:bg-white disabled:opacity-50"
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