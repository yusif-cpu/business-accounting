import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

type FlashProps = {
    flash?: {
        success?: string;
        error?: string;
    };
};

export default function FlashMessages() {
    const { flash } = usePage<FlashProps>().props;

    const lastMessage = useRef<string | null>(null);

    useEffect(() => {
        const successMessage = flash?.success;
        const errorMessage = flash?.error;

        if (successMessage) {
            const key = `success:${successMessage}`;

            if (lastMessage.current !== key) {
                lastMessage.current = key;
                toast.success(successMessage);
            }
        }

        if (errorMessage) {
            const key = `error:${errorMessage}`;

            if (lastMessage.current !== key) {
                lastMessage.current = key;
                toast.error(errorMessage);
            }
        }
    }, [flash]);

    return null;
}