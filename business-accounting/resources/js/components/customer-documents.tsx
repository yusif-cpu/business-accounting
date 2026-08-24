import {
    router,
    useForm,
} from '@inertiajs/react';

import {
    ChangeEvent,
    FormEvent,
    useState,
} from 'react';

type CustomerDocument = {
    id: number;
    name: string;
    file_path: string;
    mime_type: string;
    file_size: number;
    created_at: string;
};

type Props = {
    customerId: number;
    documents: CustomerDocument[];
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

function isImage(
    document: CustomerDocument
): boolean {
    return [
        'image/jpeg',
        'image/png',
        'image/jpg',
    ].includes(
        document.mime_type
    );
}

function isPdf(
    document: CustomerDocument
): boolean {
    return (
        document.mime_type ===
        'application/pdf'
    );
}

function isCsv(
    document: CustomerDocument
): boolean {
    return (
        document.mime_type ===
            'text/csv' ||
        document.name
            .toLowerCase()
            .endsWith('.csv')
    );
}

export default function CustomerDocuments({
    customerId,
    documents,
}: Props) {
    const [
        selectedFile,
        setSelectedFile,
    ] = useState<File | null>(null);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm<{
        customer_id: number;
        document: File | null;
    }>({
        customer_id:
            customerId,

        document:
            null,
    });

    const [
        previewDocument,
        setPreviewDocument,
    ] =
        useState<CustomerDocument | null>(
            null
        );

    const [
        deletingId,
        setDeletingId,
    ] =
        useState<number | null>(
            null
        );

    const [
        csvRows,
        setCsvRows,
    ] = useState<string[][]>([]);

    const [
        csvLoading,
        setCsvLoading,
    ] = useState(false);

    const handleFileChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        const file =
            event.target.files?.[0] ??
            null;

        setSelectedFile(
            file
        );

        setData(
            'document',
            file
        );
    };

    const closePreview = () => {
        setPreviewDocument(
            null
        );

        setCsvRows([]);

        setCsvLoading(
            false
        );
    };

    const parseCsv = (
        text: string
    ): string[][] => {
        const rows: string[][] =
            [];

        let row: string[] = [];
        let value = '';
        let insideQuotes =
            false;

        for (
            let i = 0;
            i < text.length;
            i++
        ) {
            const char =
                text[i];

            const nextChar =
                text[i + 1];

            if (
                char === '"' &&
                insideQuotes &&
                nextChar === '"'
            ) {
                value += '"';

                i++;

                continue;
            }

            if (
                char === '"'
            ) {
                insideQuotes =
                    !insideQuotes;

                continue;
            }

            if (
                char === ',' &&
                !insideQuotes
            ) {
                row.push(
                    value
                );

                value = '';

                continue;
            }

            if (
                (char === '\n' ||
                    char === '\r') &&
                !insideQuotes
            ) {
                if (
                    char === '\r' &&
                    nextChar === '\n'
                ) {
                    i++;
                }

                row.push(
                    value
                );

                if (
                    row.some(
                        (cell) =>
                            cell.trim() !==
                            ''
                    )
                ) {
                    rows.push(
                        row
                    );
                }

                row = [];

                value = '';

                continue;
            }

            value += char;
        }

        if (
            value !== '' ||
            row.length > 0
        ) {
            row.push(
                value
            );

            if (
                row.some(
                    (cell) =>
                        cell.trim() !==
                        ''
                )
            ) {
                rows.push(
                    row
                );
            }
        }

        return rows;
    };

    const openPreview = async (
        document: CustomerDocument
    ) => {
        setPreviewDocument(
            document
        );

        if (
            !isCsv(document)
        ) {
            return;
        }

        setCsvLoading(
            true
        );

        try {
            const response =
                await fetch(
                    `/customer-documents/${document.id}/preview`
                );

            if (
                !response.ok
            ) {
                throw new Error(
                    'Failed to load CSV.'
                );
            }

            const text =
                await response.text();

            setCsvRows(
                parseCsv(text)
            );
        } catch {
            setCsvRows(
                []
            );
        } finally {
            setCsvLoading(
                false
            );
        }
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

        router.delete(
            `/customer-documents/${documentId}`,
            {
                preserveScroll:
                    true,

                onFinish: () => {
                    setDeletingId(
                        null
                    );
                },
            }
        );
    };

    const submit = (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!data.document) {
            return;
        }

        post(
            '/customer-documents',
            {
                forceFormData:
                    true,

                preserveScroll:
                    true,

                onSuccess: () => {
                    reset(
                        'document'
                    );

                    setSelectedFile(
                        null
                    );

                    const input =
                        document.getElementById(
                            'customer-document'
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
        <>
            <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">

                <div className="border-b border-neutral-800 px-6 py-5">

                    <div>

                        <h2 className="font-semibold text-neutral-100">
                            Documents
                        </h2>

                        <p className="mt-1 text-sm text-neutral-500">
                            Store and preview documents related to this customer.
                        </p>

                    </div>

                </div>

                <div className="border-b border-neutral-800 p-6">

                    <form
                        onSubmit={
                            submit
                        }
                        className="flex flex-col gap-4 sm:flex-row sm:items-end"
                    >

                        <div className="min-w-0 flex-1">

                            <label
                                htmlFor="customer-document"
                                className="mb-2 block text-sm font-medium text-neutral-300"
                            >
                                Upload Document
                            </label>

                            <input
                                id="customer-document"
                                type="file"
                                accept=".pdf,.csv,.jpg,.jpeg,.png"
                                onChange={
                                    handleFileChange
                                }
                                disabled={
                                    processing
                                }
                                className="block w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-300 file:mr-4 file:rounded-lg file:border-0 file:bg-neutral-800 file:px-3 file:py-2 file:text-sm file:font-medium file:text-neutral-200 hover:file:bg-neutral-700 disabled:opacity-50"
                            />

                            <p className="mt-2 text-xs text-neutral-600">
                                PDF, CSV, JPG or PNG. Maximum 10 MB.
                            </p>

                            {selectedFile && (
                                <p className="mt-2 text-xs text-neutral-400">
                                    Selected:{' '}
                                    {
                                        selectedFile.name
                                    }
                                </p>
                            )}

                            {errors.document && (
                                <p className="mt-2 text-sm text-red-400">
                                    {
                                        errors.document
                                    }
                                </p>
                            )}

                        </div>

                        <button
                            type="submit"
                            disabled={
                                processing ||
                                !selectedFile
                            }
                            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-neutral-100 px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing
                                ? 'Uploading...'
                                : 'Upload'}
                        </button>

                    </form>

                </div>

                {documents.length ===
                0 ? (

                    <div className="p-10 text-center">

                        <p className="text-sm text-neutral-500">
                            No documents uploaded yet.
                        </p>

                    </div>

                ) : (

                    <div className="divide-y divide-neutral-800">

                        {documents.map(
                            (
                                document
                            ) => (

                                <div
                                    key={
                                        document.id
                                    }
                                    className="flex flex-col gap-4 p-5 transition hover:bg-neutral-800/30 sm:flex-row sm:items-center sm:justify-between"
                                >

                                    <div className="flex min-w-0 items-center gap-4">

                                        {isImage(
                                            document
                                        ) ? (

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openPreview(
                                                        document
                                                    )
                                                }
                                                className="size-14 shrink-0 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 transition hover:border-neutral-600"
                                            >

                                                <img
                                                    src={`/customer-documents/${document.id}/preview`}
                                                    alt={
                                                        document.name
                                                    }
                                                    className="size-full object-cover"
                                                />

                                            </button>

                                        ) : (

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openPreview(
                                                        document
                                                    )
                                                }
                                                className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 text-[11px] font-semibold uppercase text-neutral-500 transition hover:border-neutral-600 hover:text-neutral-300"
                                            >
                                                {isPdf(
                                                    document
                                                )
                                                    ? 'PDF'
                                                    : 'CSV'}
                                            </button>

                                        )}

                                        <div className="min-w-0">

                                            <p className="truncate text-sm font-medium text-neutral-200">
                                                {
                                                    document.name
                                                }
                                            </p>

                                            <p className="mt-1 text-xs text-neutral-500">
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

                                        <button
                                            type="button"
                                            onClick={() =>
                                                openPreview(
                                                    document
                                                )
                                            }
                                            className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
                                        >
                                            Preview
                                        </button>

                                        <a
                                            href={`/customer-documents/${document.id}/download`}
                                            className="text-sm font-medium text-neutral-400 transition hover:text-neutral-200"
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

            {previewDocument && (

                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">

                    <div
                        className="absolute inset-0"
                        onClick={
                            closePreview
                        }
                    />

                    <div className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl">

                        <div className="flex shrink-0 items-center justify-between border-b border-neutral-800 px-5 py-4">

                            <div className="min-w-0">

                                <p className="truncate text-sm font-semibold text-neutral-200">
                                    {
                                        previewDocument.name
                                    }
                                </p>

                                <p className="mt-1 text-xs text-neutral-500">
                                    {formatFileSize(
                                        previewDocument.file_size
                                    )}
                                </p>

                            </div>

                            <div className="ml-4 flex items-center gap-4">

                                <a
                                    href={`/customer-documents/${previewDocument.id}/download`}
                                    className="text-sm font-medium text-neutral-400 transition hover:text-neutral-100"
                                >
                                    Download
                                </a>

                                <button
                                    type="button"
                                    onClick={
                                        closePreview
                                    }
                                    className="flex size-8 items-center justify-center rounded-lg text-xl text-neutral-500 transition hover:bg-neutral-800 hover:text-neutral-100"
                                >
                                    ×
                                </button>

                            </div>

                        </div>

                        {isImage(
                            previewDocument
                        ) && (

                            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-black p-6">

                                <img
                                    src={`/customer-documents/${previewDocument.id}/preview`}
                                    alt={
                                        previewDocument.name
                                    }
                                    className="max-h-[78vh] max-w-full rounded-lg object-contain shadow-2xl"
                                />

                            </div>

                        )}

                        {isPdf(
                            previewDocument
                        ) && (

                            <div className="min-h-0 flex-1 bg-neutral-800">

                                <iframe
                                    src={`/customer-documents/${previewDocument.id}/preview`}
                                    title={
                                        previewDocument.name
                                    }
                                    className="h-[78vh] w-full border-0"
                                />

                            </div>

                        )}

                        {isCsv(
                            previewDocument
                        ) && (

                            <div className="min-h-0 flex-1 overflow-auto p-5">

                                {csvLoading ? (

                                    <div className="flex min-h-[300px] items-center justify-center">

                                        <p className="text-sm text-neutral-500">
                                            Loading CSV...
                                        </p>

                                    </div>

                                ) : csvRows.length ===
                                  0 ? (

                                    <div className="flex min-h-[300px] items-center justify-center">

                                        <p className="text-sm text-neutral-500">
                                            This CSV file is empty.
                                        </p>

                                    </div>

                                ) : (

                                    <div className="overflow-auto rounded-xl border border-neutral-800">

                                        <table className="min-w-full text-left text-sm">

                                            <tbody>

                                                {csvRows.map(
                                                    (
                                                        row,
                                                        rowIndex
                                                    ) => (

                                                        <tr
                                                            key={
                                                                rowIndex
                                                            }
                                                            className="border-b border-neutral-800 last:border-b-0"
                                                        >

                                                            {row.map(
                                                                (
                                                                    cell,
                                                                    cellIndex
                                                                ) => {

                                                                    const Cell =
                                                                        rowIndex ===
                                                                        0
                                                                            ? 'th'
                                                                            : 'td';

                                                                    return (
                                                                        <Cell
                                                                            key={`${rowIndex}-${cellIndex}`}
                                                                            className={`whitespace-nowrap px-4 py-3 ${
                                                                                rowIndex ===
                                                                                0
                                                                                    ? 'bg-neutral-900 font-semibold text-neutral-200'
                                                                                    : 'text-neutral-400'
                                                                            }`}
                                                                        >
                                                                            {
                                                                                cell
                                                                            }
                                                                        </Cell>
                                                                    );
                                                                }
                                                            )}

                                                        </tr>
                                                    )
                                                )}

                                            </tbody>

                                        </table>

                                    </div>

                                )}

                            </div>

                        )}

                    </div>

                </div>

            )}

        </>
    );
}