import {
    Link,
    useForm,
} from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';

import FormError from '@/components/form-error';

export default function Create() {
    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm({
        name: '',
    });

    const submit = (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        post('/sale-statuses');
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
                                Create Status
                            </h1>

                            <p className="mt-2 text-sm text-neutral-400">
                                Add a new status that can be used for sales.
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
                                    placeholder="e.g. Partially Paid"
                                    className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-4 py-3 text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-neutral-600"
                                />

                                <FormError
                                    message={
                                        errors.name
                                    }
                                />

                            </div>

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
                                        ? 'Creating...'
                                        : 'Create Status'}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            </div>

        </AppLayout>
    );
}