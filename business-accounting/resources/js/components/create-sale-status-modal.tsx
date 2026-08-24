import {
    useState,
} from 'react';

type SaleStatus = {
    id: number;
    name: string;
    slug: string;
    is_default: boolean;
};

type Props = {
    open: boolean;
    onClose: () => void;
    onCreated: (
        status: SaleStatus
    ) => void;
};

export default function CreateSaleStatusModal({
    open,
    onClose,
    onCreated,
}: Props) {
    const [
        name,
        setName,
    ] = useState('');

    const [
        processing,
        setProcessing,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState('');

    if (!open) {
        return null;
    }

    const close = () => {
        if (processing) {
            return;
        }

        setName('');
        setError('');
        onClose();
    };

    const submit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!name.trim()) {
            setError(
                'Status name is required.'
            );

            return;
        }

        setProcessing(true);
        setError('');

        try {
            const token = document
                .querySelector(
                    'meta[name="csrf-token"]'
                )
                ?.getAttribute('content');

            const response = await fetch(
                '/sale-statuses/inline',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json',

                        'Accept':
                            'application/json',

                        'X-CSRF-TOKEN':
                            token ?? '',
                    },

                    body: JSON.stringify({
                        name:
                            name.trim(),
                    }),
                }
            );

            const result =
                await response.json();

            if (!response.ok) {
                if (
                    result.errors?.name
                ) {
                    setError(
                        result.errors.name[0]
                    );
                } else {
                    setError(
                        result.message ??
                            'Something went wrong.'
                    );
                }

                return;
            }

            onCreated(
                result.status
            );

            setName('');
            setError('');
            onClose();
        } catch {
            setError(
                'Something went wrong. Please try again.'
            );
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={close}
            />

            <div className="relative w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">

                <div className="mb-6 flex items-start justify-between">

                    <div>

                        <p className="text-sm font-medium text-neutral-500">
                            Sale Status
                        </p>

                        <h2 className="mt-1 text-xl font-semibold text-neutral-100">
                            Create Status
                        </h2>

                        <p className="mt-1 text-sm text-neutral-500">
                            Add a new status without leaving this page.
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={close}
                        disabled={processing}
                        className="text-xl text-neutral-500 transition hover:text-neutral-200 disabled:opacity-50"
                    >
                        ×
                    </button>

                </div>

                <form
                    onSubmit={submit}
                    className="space-y-5"
                >

                    <div>

                        <label
                            htmlFor="new-sale-status-name"
                            className="mb-2 block text-sm font-medium text-neutral-300"
                        >
                            Status Name
                        </label>

                        <input
                            id="new-sale-status-name"
                            type="text"
                            value={name}
                            onChange={(event) =>
                                setName(
                                    event.target.value
                                )
                            }
                            autoFocus
                            disabled={processing}
                            placeholder="e.g. Partially Paid"
                            className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-neutral-600 disabled:opacity-50"
                        />

                        {error && (
                            <p className="mt-2 text-sm text-red-400">
                                {error}
                            </p>
                        )}

                    </div>

                    <div className="flex justify-end gap-3 border-t border-neutral-800 pt-5">

                        <button
                            type="button"
                            onClick={close}
                            disabled={processing}
                            className="rounded-xl border border-neutral-800 px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:bg-neutral-800 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                processing ||
                                !name.trim()
                            }
                            className="rounded-xl bg-neutral-100 px-5 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing
                                ? 'Creating...'
                                : 'Create Status'}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}