import { FormEvent } from 'react';
import { router } from '@inertiajs/react';

import FormError from '@/components/form-error';
import AppLayout from '@/layouts/app-layout';

type Business = {
    id: number;
    business_name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    website: string | null;
    tax_id: string | null;
    currency: string;
    logo_url: string | null;
};

type Props = {
    business: Business;
};

export default function Edit({
    business,
}: Props) {
    const submit = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        const form = event.currentTarget;

        const formData = new FormData(form);

        /*
         * Laravel method spoofing.
         *
         * We intentionally send POST with
         * _method=PUT because the request may
         * contain a file upload.
         */
        formData.append('_method', 'PUT');

        router.post(
            `/businesses/${business.id}`,
            formData,
            {
                forceFormData: true,
                preserveScroll: true,
            },
        );
    };

    const removeLogo = () => {
        if (
            !window.confirm(
                'Remove the business logo?',
            )
        ) {
            return;
        }

        router.delete(
            `/businesses/${business.id}/logo`,
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout>
            <div className="bg-neutral-950 p-6 text-neutral-100">
                <div className="mx-auto max-w-3xl space-y-6">

                    {/* Header */}

                    <div>
                        <a
                            href={`/businesses/${business.id}`}
                            className="inline-flex items-center text-sm text-neutral-500 transition hover:text-neutral-200"
                        >
                            ← Back to Business
                        </a>

                        <div className="mt-5">
                            <p className="text-sm font-medium text-neutral-500">
                                Business #{business.id}
                            </p>

                            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                                Edit Company Information
                            </h1>

                            <p className="mt-2 text-sm text-neutral-400">
                                Update your business information and branding.
                            </p>
                        </div>
                    </div>

                    {/* Form */}

                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                        <form
                            onSubmit={submit}
                            className="space-y-6"
                        >

                            {/* Business Name */}

                            <div>
                                <label
                                    htmlFor="business_name"
                                    className="text-sm font-medium text-neutral-300"
                                >
                                    Business Name
                                </label>

                                <input
                                    id="business_name"
                                    name="business_name"
                                    type="text"
                                    defaultValue={
                                        business.business_name
                                    }
                                    placeholder="My Business"
                                    className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 outline-none transition focus:border-neutral-600"
                                />

                                <FormError
                                    message={
                                        undefined
                                    }
                                />
                            </div>

                            {/* Phone + Email */}

                            <div className="grid gap-6 md:grid-cols-2">

                                <div>
                                    <label
                                        htmlFor="phone"
                                        className="text-sm font-medium text-neutral-300"
                                    >
                                        Phone
                                    </label>

                                    <input
                                        id="phone"
                                        name="phone"
                                        type="text"
                                        defaultValue={
                                            business.phone ?? ''
                                        }
                                        placeholder="+994..."
                                        className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 outline-none transition focus:border-neutral-600"
                                    />

                                    <FormError
                                        message={
                                            undefined
                                        }
                                    />
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
                                        name="email"
                                        type="email"
                                        defaultValue={
                                            business.email ?? ''
                                        }
                                        placeholder="business@example.com"
                                        className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 outline-none transition focus:border-neutral-600"
                                    />

                                    <FormError
                                        message={
                                            undefined
                                        }
                                    />
                                </div>

                            </div>

                            {/* Address */}

                            <div>
                                <label
                                    htmlFor="address"
                                    className="text-sm font-medium text-neutral-300"
                                >
                                    Address
                                </label>

                                <textarea
                                    id="address"
                                    name="address"
                                    rows={3}
                                    defaultValue={
                                        business.address ?? ''
                                    }
                                    placeholder="Business address"
                                    className="mt-2 w-full resize-none rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 outline-none transition focus:border-neutral-600"
                                />

                                <FormError
                                    message={
                                        undefined
                                    }
                                />
                            </div>

                            {/* Website + Tax ID */}

                            <div className="grid gap-6 md:grid-cols-2">

                                <div>
                                    <label
                                        htmlFor="website"
                                        className="text-sm font-medium text-neutral-300"
                                    >
                                        Website / Domain
                                    </label>

                                    <input
                                        id="website"
                                        name="website"
                                        type="url"
                                        defaultValue={
                                            business.website ?? ''
                                        }
                                        placeholder="https://example.com"
                                        className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 outline-none transition focus:border-neutral-600"
                                    />

                                    <FormError
                                        message={
                                            undefined
                                        }
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="tax_id"
                                        className="text-sm font-medium text-neutral-300"
                                    >
                                        Tax ID / VÖEN
                                    </label>

                                    <input
                                        id="tax_id"
                                        name="tax_id"
                                        type="text"
                                        defaultValue={
                                            business.tax_id ?? ''
                                        }
                                        placeholder="1234567891"
                                        className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 outline-none transition focus:border-neutral-600"
                                    />

                                    <FormError
                                        message={
                                            undefined
                                        }
                                    />
                                </div>

                            </div>

                            {/* Currency */}

                            <div>
                                <label
                                    htmlFor="currency"
                                    className="text-sm font-medium text-neutral-300"
                                >
                                    Default Currency
                                </label>

                                <select
                                    id="currency"
                                    name="currency"
                                    defaultValue={
                                        business.currency ?? 'AZN'
                                    }
                                    className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 outline-none transition focus:border-neutral-600"
                                >
                                    <option value="AZN">
                                        AZN — Azerbaijani Manat
                                    </option>

                                    <option value="USD">
                                        USD — US Dollar
                                    </option>

                                    <option value="EUR">
                                        EUR — Euro
                                    </option>

                                    <option value="GBP">
                                        GBP — British Pound
                                    </option>
                                </select>

                                <FormError
                                    message={
                                        undefined
                                    }
                                />
                            </div>

                            {/* Logo */}

                            <div className="border-t border-neutral-800 pt-6">

                                <div>
                                    <h2 className="text-sm font-medium text-neutral-300">
                                        Business Logo
                                    </h2>

                                    <p className="mt-1 text-xs text-neutral-500">
                                        JPG, PNG or WebP.
                                        Maximum 2 MB.
                                    </p>
                                </div>

                                <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center">

                                    {business.logo_url ? (
                                        <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
                                            <img
                                                src={
                                                    business.logo_url
                                                }
                                                alt={
                                                    business.business_name
                                                }
                                                className="size-full object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex size-28 shrink-0 items-center justify-center rounded-2xl border border-dashed border-neutral-700 bg-neutral-950 text-xs text-neutral-600">
                                            No Logo
                                        </div>
                                    )}

                                    <div className="flex flex-1 flex-col gap-3">

                                        <input
                                            id="logo"
                                            name="logo"
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.webp"
                                            className="block w-full rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-300 file:mr-4 file:rounded-lg file:border-0 file:bg-neutral-700 file:px-3 file:py-2 file:text-xs file:font-medium file:text-neutral-200 hover:file:bg-neutral-600"
                                        />

                                        {business.logo_url && (
                                            <button
                                                type="button"
                                                onClick={
                                                    removeLogo
                                                }
                                                className="self-start text-sm font-medium text-red-400 transition hover:text-red-300"
                                            >
                                                Remove Logo
                                            </button>
                                        )}

                                    </div>

                                </div>
                            </div>

                            {/* Actions */}

                            <div className="flex justify-between border-t border-neutral-800 pt-5">

                                <a
                                    href={`/businesses/${business.id}`}
                                    className="rounded-xl border border-neutral-800 px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:bg-neutral-800"
                                >
                                    Cancel
                                </a>

                                <button
                                    type="submit"
                                    className="rounded-xl bg-neutral-100 px-5 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-white"
                                >
                                    Save Changes
                                </button>

                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}