import { Form, Head } from '@inertiajs/react';

import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';

import register from '@/routes/register';

export default function Register() {
    return (
        <AuthLayout
            title="Create an account"
            description="Set up your business account to get started"
        >
            <Head title="Create account" />

            <Form
                {...register.store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="business_name">
                                    Business name
                                </Label>

                                <Input
                                    id="business_name"
                                    name="business_name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="organization"
                                    placeholder="My Business"
                                />

                                <InputError message={errors.business_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name">Your name</Label>

                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    tabIndex={2}
                                    autoComplete="name"
                                    placeholder="John Doe"
                                />

                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>

                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    tabIndex={3}
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                />

                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>

                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    placeholder="Create a password"
                                />

                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm password
                                </Label>

                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    required
                                    tabIndex={5}
                                    autoComplete="new-password"
                                    placeholder="Confirm your password"
                                />

                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={6}
                                disabled={processing}
                            >
                                {processing && <Spinner />}

                                {processing
                                    ? 'Creating account...'
                                    : 'Create account'}
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <TextLink href="/login" tabIndex={7}>
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
