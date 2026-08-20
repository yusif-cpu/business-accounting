import AppLayout from '@/layouts/app-layout';
import { formatMoney } from '@/lib/formatters';

type DashboardData = {
    totalSales: number;
    collected: number;
    outstanding: number;
    expenses: number;
    profit: number;
    salesCount: number;
    customersCount: number;
};

type Props = {
    data: DashboardData;
};

export default function Dashboard({ data }: Props) {
    return (
        <AppLayout>
            <div className="p-6">
                <div>
                    <h1 className="text-2xl font-bold">
                        Dashboard
                    </h1>

                    <p className="mt-1 text-gray-500">
                        Overview of your business finances.
                    </p>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <div className="rounded-lg border p-5">
                        <p className="text-sm text-gray-500">
                            Total Sales
                        </p>

                        <p className="mt-2 text-2xl font-bold">
                            {formatMoney(data.totalSales)}
                        </p>
                    </div>

                    <div className="rounded-lg border p-5">
                        <p className="text-sm text-gray-500">
                            Collected
                        </p>

                        <p className="mt-2 text-2xl font-bold">
                            {formatMoney(data.collected)}
                        </p>
                    </div>

                    <div className="rounded-lg border p-5">
                        <p className="text-sm text-gray-500">
                            Outstanding
                        </p>

                        <p className="mt-2 text-2xl font-bold">
                            {formatMoney(data.outstanding)}
                        </p>
                    </div>

                    <div className="rounded-lg border p-5">
                        <p className="text-sm text-gray-500">
                            Expenses
                        </p>

                        <p className="mt-2 text-2xl font-bold">
                            {formatMoney(data.expenses)}
                        </p>
                    </div>

                    <div className="rounded-lg border p-5">
                        <p className="text-sm text-gray-500">
                            Profit
                        </p>

                        <p className="mt-2 text-2xl font-bold">
                            {formatMoney(data.profit)}
                        </p>
                    </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border p-5">
                        <p className="text-sm text-gray-500">
                            Sales Count
                        </p>

                        <p className="mt-2 text-2xl font-bold">
                            {data.salesCount}
                        </p>
                    </div>

                    <div className="rounded-lg border p-5">
                        <p className="text-sm text-gray-500">
                            Customers
                        </p>

                        <p className="mt-2 text-2xl font-bold">
                            {data.customersCount}
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
