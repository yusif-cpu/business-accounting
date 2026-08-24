import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import DeleteConfirmation from '@/components/delete-confirmation';
import AppLayout from '@/layouts/app-layout';

type Category = {
    id: number;
    type: 'expense' | 'income';
    name: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    categories: {
        data: Category[];
        links: PaginationLink[];
    };
};

export default function Index({ categories }: Props) {
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { delete: destroy, processing } = useForm();

    const handleDelete = () => {
        if (deleteId === null) {
            return;
        }

        destroy(`/categories/${deleteId}`, {
            onSuccess: () => {
                setDeleteId(null);
            },
        });
    };

    return (
        <AppLayout>
            <div className="bg-neutral-950 p-6 text-neutral-100">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-neutral-500">
                                Finance
                            </p>

                            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                                Categories
                            </h1>

                            <p className="mt-2 text-sm text-neutral-400">
                                Manage your income and expense categories.
                            </p>
                        </div>

                        <Link
                            href="/categories/create"
                            className="inline-flex items-center justify-center rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-white"
                        >
                            Create Category
                        </Link>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
                        {categories.data.length === 0 ? (
                            <div className="p-10 text-center">
                                <p className="text-sm text-neutral-400">
                                    No categories found.
                                </p>

                                <Link
                                    href="/categories/create"
                                    className="mt-4 inline-flex rounded-xl border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:bg-neutral-800"
                                >
                                    Create your first category
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[700px] text-left text-sm">
                                        <thead className="border-b border-neutral-800">
                                            <tr>
                                                <th className="px-5 py-4 font-medium text-neutral-500">
                                                    Name
                                                </th>

                                                <th className="px-5 py-4 font-medium text-neutral-500">
                                                    Type
                                                </th>

                                                <th className="px-5 py-4 text-right font-medium text-neutral-500">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-neutral-800">
                                            {categories.data.map((category) => (
                                                <tr
                                                    key={category.id}
                                                    className="transition hover:bg-neutral-800/30"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div>
                                                            <p className="font-medium text-neutral-100">
                                                                {category.name}
                                                            </p>

                                                            <p className="text-xs text-neutral-500">
                                                                Category #
                                                                {category.id}
                                                            </p>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span
                                                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                                                                category.type ===
                                                                'expense'
                                                                    ? 'border-red-900/50 bg-red-950/40 text-red-400'
                                                                    : 'border-green-900/50 bg-green-950/40 text-green-400'
                                                            }`}
                                                        >
                                                            {category.type ===
                                                            'expense'
                                                                ? 'Expense'
                                                                : 'Income'}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex justify-end gap-4">
                                                            <Link
                                                                href={`/categories/${category.id}/edit`}
                                                                className="text-blue-400 transition hover:text-blue-300"
                                                            >
                                                                Edit
                                                            </Link>

                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    processing
                                                                }
                                                                onClick={() =>
                                                                    setDeleteId(
                                                                        category.id,
                                                                    )
                                                                }
                                                                className="text-red-400 transition hover:text-red-300 disabled:opacity-50"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {categories.links.length > 3 && (
                                    <div className="flex flex-wrap gap-2 border-t border-neutral-800 p-4">
                                        {categories.links.map(
                                            (link, index) => (
                                                <Link
                                                    key={index}
                                                    href={link.url ?? '#'}
                                                    preserveScroll
                                                    className={`rounded-lg border px-3 py-2 text-sm transition ${
                                                        link.active
                                                            ? 'border-neutral-600 bg-neutral-100 text-neutral-950'
                                                            : link.url
                                                              ? 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
                                                              : 'cursor-not-allowed border-neutral-900 text-neutral-600'
                                                    }`}
                                                >
                                                    <span
                                                        dangerouslySetInnerHTML={{
                                                            __html: link.label,
                                                        }}
                                                    />
                                                </Link>
                                            ),
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <DeleteConfirmation
                open={deleteId !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteId(null);
                    }
                }}
                title="Delete category?"
                description="This category will be permanently deleted. This action cannot be undone."
                onConfirm={handleDelete}
                processing={processing}
            />
        </AppLayout>
    );
}