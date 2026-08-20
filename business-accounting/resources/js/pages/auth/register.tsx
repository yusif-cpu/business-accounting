import AuthLayout from '@/layouts/auth-layout';
import register from '@/routes/register';
import { Form, Head } from '@inertiajs/react';

export default function Register() {
    return (
        <AuthLayout
            title="Create an account"
            description="Enter your details below to create your account"
        >
            <Head title="Register" />

            <Form
                {...register.store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <label htmlFor="business_name">
                                    Business Name
                                </label>

                                <input
                                    id="business_name"
                                    name="business_name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    placeholder="My Business"
                                />

                                {errors.business_name && (
                                    <p className="text-sm text-red-600">
                                        {errors.business_name}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="name">Name</label>

                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    tabIndex={2}
                                    placeholder="Your name"
                                />

                                {errors.name && (
                                    <p className="text-sm text-red-600">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="email">
                                    Email address
                                </label>

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    tabIndex={3}
                                    placeholder="email@example.com"
                                />

                                {errors.email && (
                                    <p className="text-sm text-red-600">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="password">
                                    Password
                                </label>

                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    tabIndex={4}
                                />

                                {errors.password && (
                                    <p className="text-sm text-red-600">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="password_confirmation">
                                    Confirm password
                                </label>

                                <input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type="password"
                                    required
                                    tabIndex={5}
                                />

                                {errors.password_confirmation && (
                                    <p className="text-sm text-red-600">
                                        {errors.password_confirmation}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                tabIndex={6}
                                disabled={processing}
                            >
                                {processing
                                    ? 'Creating account...'
                                    : 'Create account'}
                            </button>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
