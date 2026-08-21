import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    onConfirm: () => void;
    processing?: boolean;
};

export default function DeleteConfirmation({
    open,
    onOpenChange,
    title = 'Delete item?',
    description = 'This action cannot be undone. The selected item will be permanently deleted.',
    onConfirm,
    processing = false,
}: Props) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="border-neutral-800 bg-neutral-900 text-neutral-100">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-neutral-100">
                        {title}
                    </AlertDialogTitle>

                    <AlertDialogDescription className="text-neutral-400">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel className="border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100">
                        Cancel
                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={processing}
                        className="bg-red-500 text-white hover:bg-red-400"
                    >
                        {processing ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
