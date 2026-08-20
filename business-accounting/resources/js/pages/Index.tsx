import AppLayout from '@/layouts/app-layout';

type Sale = {
    id: number;
    amount: string;
    status: string;
    sold_at: string;
};

type Props = {
    sales: Sale[];
};

export default function Index({ sales }: Props) {
    return (
        <AppLayout>
            <div className="p-6">
                <h1 className="text-2xl font-bold">Sales</h1>

                <div className="mt-6 space-y-3">
                    {sales.map((sale) => (
                        <div
                            key={sale.id}
                            className="rounded-lg border p-4"
                        >
                            <p>Sale #{sale.id}</p>
                            <p>Amount: {sale.amount}</p>
                            <p>Status: {sale.status}</p>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}