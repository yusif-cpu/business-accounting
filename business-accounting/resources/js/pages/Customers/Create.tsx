import {
    useForm,
} from '@inertiajs/react';

import {
    ChangeEvent,
    FormEvent,
    useState,
} from 'react';

import FormError from '@/components/form-error';

import AppLayout from '@/layouts/app-layout';

export default function Create() {
    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm<{
        name: string;
        email: string;
        phone: string;
        documents: File[];
    }>({
        name: '',
        email: '',
        phone: '',
        documents: [],
    });

    const [
        selectedFiles,
        setSelectedFiles,
    ] = useState<File[]>([]);

    const handleFilesChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        const files = Array.from(
            event.target.files ?? []
        );

        setSelectedFiles(
            files
        );

        setData(
            'documents',
            files
        );
    };

    const removeFile = (
        index: number
    ) => {
        const files =
            selectedFiles.filter(
                (_, fileIndex) =>
                    fileIndex !== index
            );

        setSelectedFiles(
            files
        );

        setData(
            'documents',
            files
        );
    };

    const submit = (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        post(
            '/customers',
            {
                forceFormData: true,
            }
        );
    };

    return (
        <AppLayout>

            <div className="min-h-full bg-neutral-950 p-6 text-neutral-100">

                <div className="mx-auto max-w-2xl space-y-6">

                    {/* HEADER */}

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

                    {/* FORM */}

                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">

                        <form
                            onSubmit={submit}
                            className="space-y-6"
                        >

                            {/* NAME */}

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
                                    value={
                                        data.name
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setData(
                                            'name',
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="John Doe"
                                    disabled={
                                        processing
                                    }
                                    className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 transition outline-none focus:border-neutral-600 disabled:opacity-50"
                                />

                                <FormError
                                    message={
                                        errors.name
                                    }
                                />

                            </div>

                            {/* EMAIL */}

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
                                    value={
                                        data.email
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setData(
                                            'email',
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="john@example.com"
                                    disabled={
                                        processing
                                    }
                                    className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 transition outline-none focus:border-neutral-600 disabled:opacity-50"
                                />

                                <FormError
                                    message={
                                        errors.email
                                    }
                                />

                            </div>

                            {/* PHONE */}

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
                                    value={
                                        data.phone
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setData(
                                            'phone',
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="+994..."
                                    disabled={
                                        processing
                                    }
                                    className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 transition outline-none focus:border-neutral-600 disabled:opacity-50"
                                />

                                <FormError
                                    message={
                                        errors.phone
                                    }
                                />

                            </div>

                            {/* DOCUMENTS */}

                            <div className="border-t border-neutral-800 pt-6">

                                <div className="mb-3">

                                    <h2 className="text-sm font-semibold text-neutral-200">
                                        Documents
                                    </h2>

                                    <p className="mt-1 text-xs text-neutral-500">
                                        You can optionally attach documents to this customer.
                                    </p>

                                </div>

                                <label
                                    htmlFor="documents"
                                    className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-neutral-700 bg-neutral-950 px-6 py-8 text-center transition hover:border-neutral-600 hover:bg-neutral-800/50"
                                >

                                    <span className="text-sm font-medium text-neutral-300">
                                        Choose documents
                                    </span>

                                    <span className="mt-1 text-xs text-neutral-600">
                                        PDF, CSV, JPG or PNG · Maximum 10 MB each
                                    </span>

                                    <input
                                        id="documents"
                                        type="file"
                                        multiple
                                        accept=".pdf,.csv,.jpg,.jpeg,.png"
                                        onChange={
                                            handleFilesChange
                                        }
                                        disabled={
                                            processing
                                        }
                                        className="hidden"
                                    />

                                </label>

                                {errors.documents && (
                                    <p className="mt-2 text-sm text-red-400">
                                        {
                                            errors.documents
                                        }
                                    </p>
                                )}

                                {selectedFiles.length >
                                    0 && (

                                    <div className="mt-4 space-y-2">

                                        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                                            Selected Documents
                                        </p>

                                        {selectedFiles.map(
                                            (
                                                file,
                                                index
                                            ) => (

                                                <div
                                                    key={`${file.name}-${index}`}
                                                    className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3"
                                                >

                                                    <div className="min-w-0">

                                                        <p className="truncate text-sm text-neutral-200">
                                                            {
                                                                file.name
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-xs text-neutral-600">
                                                            {(
                                                                file.size /
                                                                1024
                                                            ).toFixed(
                                                                1
                                                            )}{' '}
                                                            KB
                                                        </p>

                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeFile(
                                                                index
                                                            )
                                                        }
                                                        disabled={
                                                            processing
                                                        }
                                                        className="ml-4 shrink-0 text-sm text-red-400 transition hover:text-red-300 disabled:opacity-50"
                                                    >
                                                        Remove
                                                    </button>

                                                </div>

                                            )
                                        )}

                                    </div>

                                )}

                                {errors[
                                    'documents.0'
                                ] && (
                                    <p className="mt-2 text-sm text-red-400">
                                        {
                                            errors[
                                                'documents.0'
                                            ]
                                        }
                                    </p>
                                )}

                            </div>

                            {/* ACTIONS */}

                            <div className="flex justify-end gap-3 border-t border-neutral-800 pt-5">

                                <a
                                    href="/customers"
                                    className="rounded-xl border border-neutral-800 px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:bg-neutral-800"
                                >
                                    Cancel
                                </a>

                                <button
                                    type="submit"
                                    disabled={
                                        processing
                                    }
                                    className="rounded-xl bg-neutral-100 px-5 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
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