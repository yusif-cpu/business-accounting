import * as React from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';

import { cn } from '@/lib/utils';

function AlertDialog({
    ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
    return <AlertDialogPrimitive.Root {...props} />;
}

function AlertDialogTrigger({
    ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
    return <AlertDialogPrimitive.Trigger {...props} />;
}

function AlertDialogPortal({
    ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
    return <AlertDialogPrimitive.Portal {...props} />;
}

function AlertDialogOverlay({
    className,
    ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
    return (
        <AlertDialogPrimitive.Overlay
            className={cn(
                'fixed inset-0 z-50 bg-black/70 backdrop-blur-sm',
                'data-[state=open]:animate-in data-[state=closed]:animate-out',
                'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                className,
            )}
            {...props}
        />
    );
}

function AlertDialogContent({
    className,
    ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
    return (
        <AlertDialogPortal>
            <AlertDialogOverlay />

            <AlertDialogPrimitive.Content
                className={cn(
                    'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)]',
                    'max-w-lg -translate-x-1/2 -translate-y-1/2',
                    'rounded-2xl border border-neutral-800',
                    'bg-neutral-900 p-6 text-neutral-100 shadow-2xl',
                    'duration-200',
                    'data-[state=open]:animate-in',
                    'data-[state=closed]:animate-out',
                    'data-[state=closed]:fade-out-0',
                    'data-[state=open]:fade-in-0',
                    'data-[state=closed]:zoom-out-95',
                    'data-[state=open]:zoom-in-95',
                    className,
                )}
                {...props}
            />
        </AlertDialogPortal>
    );
}

function AlertDialogHeader({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            className={cn(
                'flex flex-col gap-2 text-left',
                className,
            )}
            {...props}
        />
    );
}

function AlertDialogFooter({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            className={cn(
                'mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end',
                className,
            )}
            {...props}
        />
    );
}

function AlertDialogTitle({
    className,
    ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
    return (
        <AlertDialogPrimitive.Title
            className={cn(
                'text-lg font-semibold text-neutral-100',
                className,
            )}
            {...props}
        />
    );
}

function AlertDialogDescription({
    className,
    ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
    return (
        <AlertDialogPrimitive.Description
            className={cn(
                'text-sm leading-6 text-neutral-400',
                className,
            )}
            {...props}
        />
    );
}

function AlertDialogAction({
    className,
    ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
    return (
        <AlertDialogPrimitive.Action
            className={cn(
                'inline-flex h-10 items-center justify-center rounded-xl px-4',
                'text-sm font-semibold transition',
                'bg-red-500 text-white hover:bg-red-400',
                'focus:outline-none focus:ring-2 focus:ring-red-500/50',
                'disabled:pointer-events-none disabled:opacity-50',
                className,
            )}
            {...props}
        />
    );
}

function AlertDialogCancel({
    className,
    ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
    return (
        <AlertDialogPrimitive.Cancel
            className={cn(
                'inline-flex h-10 items-center justify-center rounded-xl border',
                'border-neutral-800 bg-neutral-900 px-4',
                'text-sm font-medium text-neutral-300',
                'transition hover:bg-neutral-800 hover:text-neutral-100',
                'focus:outline-none focus:ring-2 focus:ring-neutral-700',
                className,
            )}
            {...props}
        />
    );
}

export {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogPortal,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
};