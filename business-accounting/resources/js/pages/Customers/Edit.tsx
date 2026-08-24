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

type CustomerDocument = {
    id: number;
    name: string;
    file_path: string;
    mime_type: string;
    file_size: number;
    created_at: string;
};

type Customer = {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    documents: CustomerDocument[];
};

type Props = {
    customer: Customer;
};

function formatFileSize(
    bytes: number
): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(
            bytes / 1024
        ).toFixed(1)} KB`;
    }

    return `${(
        bytes /
        (1024 * 1024)
    ).toFixed(1)} MB`;
}

function formatDate(
    date: string
): string {
    const value =
        date.slice(0, 10);

    const [
        year,
        month,
        day,
    ] = value.split('-');

    if (
        !year ||
        !month ||
        !day
    ) {
        return date;
    }

    return `${day}/${month}/${year}`;
}

export default function Edit({
    customer,
}: Props) {
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
        _method: string;
    }>({
        name:
            customer.name,

        email:
            customer.email ??
            '',

        phone:
            customer.phone ??
            '',

        documents: [],

        _method:
            'PUT',
    });

    const [
        selectedFiles,
        setSelectedFiles,
    ] = useState<File[]>([]);

    const [
        deletingId,
        setDeletingId,
    ] = useState<number | null>(
        null
    );

    const handleFilesChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        const files =
            Array.from(
                event.target.files ??
                    []
            );

        setSelectedFiles(
            files
        );

        setData(
            'documents',
            files
        );
    };

    const removeSelectedFile = (
        index: number
    ) => {
        const files =
            selectedFiles.filter(
                (
                    _,
                    fileIndex
                ) =>
                    fileIndex !==
                    index
            );

        setSelectedFiles(
            files
        );

        setData(
            'documents',
            files
        );
    };

    const deleteDocument = (
        documentId: number
    ) => {
        if (
            !window.confirm(
                'Delete this document? This action cannot be undone.'
            )
        ) {
            return;
        }

        setDeletingId(
            documentId
        );

        fetch(
            `/customer-documents/${documentId}`,
            {
                method: 'DELETE',

                headers: {
                    'X-CSRF-TOKEN':
                        document
                            .querySelector(
                                'meta[name="csrf-token"]'
                            )
                            ?.getAttribute(
                                'content'
                            ) ??
                        '',

                    Accept:
                        'application/json',
                },
            }
        )
            .then(
                (
                    response
                ) => {
                    if (
                        !response.ok
                    ) {
                        throw new Error(
                            'Failed to delete document.'
                        );
                    }

                    window.location.reload();
                }
            )
            .catch(
                () => {
                    window.alert(
                        'Something went wrong while deleting the document.'
                    );
                }
            )
            .finally(
                () => {
                    setDeletingId(
                        null
                    );
                }
            );
    };

    const submit = (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        post(
            `/customers/${customer.id}`,
            {
                forceFormData:
                    true,

                preserveScroll:
                    true,

                onSuccess: () => {
                    setSelectedFiles(
                        []
                    );

                    const input =
                        document.getElementById(
                            'documents'
                        ) as HTMLInputElement | null;

                    if (input) {
                        input.value =
                            '';
                    }
                },
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
                                Customer #
                                {
                                    customer.id
                                }
                            </p>

                            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                                Edit Customer
                            </h1>

                            <p className="mt-2 text-sm text-neutral-400">
                                Update customer information and documents.
                            </p>

                        </div>

                    </div>

                    {/* FORM */}

                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">

                        <form
                            onSubmit={
                                submit
                            }
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

                            {/* EXISTING DOCUMENTS */}

                            <div className="border-t border-neutral-800 pt-6">

                                <div className="mb-4">

                                    <h2 className="text-sm font-semibold text-neutral-200">
                                        Existing Documents
                                    </h2>

                                    <p className="mt-1 text-xs text-neutral-500">
                                        Documents already attached to this customer.
                                    </p>

                                </div>

                                {customer.documents.length ===
                                0 ? (

                                    <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-950 p-6 text-center">

                                        <p className="text-sm text-neutral-500">
                                            No documents uploaded yet.
                                        </p>

                                    </div>

                                ) : (

                                    <div className="divide-y divide-neutral-800 overflow-hidden rounded-xl border border-neutral-800">

                                        {customer.documents.map(
                                            (
                                                document
                                            ) => (

                                                <div
                                                    key={
                                                        document.id
                                                    }
                                                    className="flex flex-col gap-3 bg-neutral-950 p-4 sm:flex-row sm:items-center sm:justify-between"
                                                >

                                                    <div className="flex min-w-0 items-center gap-3">

                                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-[10px] font-semibold uppercase text-neutral-500">
                                                            {document.mime_type ===
                                                            'application/pdf'
                                                                ? 'PDF'
                                                                : 'FILE'}
                                                        </div>

                                                        <div className="min-w-0">

                                                            <p className="truncate text-sm font-medium text-neutral-200">
                                                                {
                                                                    document.name
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-xs text-neutral-600">
                                                                {formatFileSize(
                                                                    document.file_size
                                                                )}
                                                                {' · '}
                                                                {formatDate(
                                                                    document.created_at
                                                                )}
                                                            </p>

                                                        </div>

                                                    </div>

                                                    <div className="flex shrink-0 items-center gap-4">

                                                        <a
                                                            href={`/customer-documents/${document.id}/download`}
                                                            className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
                                                        >
                                                            Download
                                                        </a>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                deleteDocument(
                                                                    document.id
                                                                )
                                                            }
                                                            disabled={
                                                                deletingId ===
                                                                document.id
                                                            }
                                                            className="text-sm font-medium text-red-400 transition hover:text-red-300 disabled:opacity-50"
                                                        >
                                                            {deletingId ===
                                                            document.id
                                                                ? 'Deleting...'
                                                                : 'Delete'}
                                                        </button>

                                                    </div>

                                                </div>
                                            )
                                        )}

                                    </div>

                                )}

                            </div>

                            {/* ADD DOCUMENTS */}

                            <div className="border-t border-neutral-800 pt-6">

                                <div className="mb-3">

                                    <h2 className="text-sm font-semibold text-neutral-200">
                                        Add Documents
                                    </h2>

                                    <p className="mt-1 text-xs text-neutral-500">
                                        Add new documents to this customer.
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

                                {selectedFiles.length >
                                    0 && (

                                    <div className="mt-4 space-y-2">

                                        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                                            New Documents
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
                                                            )}
                                                            {' KB'}
                                                        </p>

                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeSelectedFile(
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