<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->foreignId('status_id')
                ->nullable()
                ->after('status')
                ->constrained('sale_statuses')
                ->nullOnDelete();
        });

        $businessIds = DB::table('sales')
            ->select('business_id')
            ->distinct()
            ->pluck('business_id');

        foreach ($businessIds as $businessId) {
            $statuses = [
                [
                    'business_id' => $businessId,
                    'name' => 'Pending',
                    'slug' => 'pending',
                    'is_default' => true,
                ],
                [
                    'business_id' => $businessId,
                    'name' => 'Paid',
                    'slug' => 'paid',
                    'is_default' => false,
                ],
                [
                    'business_id' => $businessId,
                    'name' => 'Cancelled',
                    'slug' => 'cancelled',
                    'is_default' => false,
                ],
            ];

            foreach ($statuses as $status) {
                DB::table('sale_statuses')->updateOrInsert(
                    [
                        'business_id' => $status['business_id'],
                        'slug' => $status['slug'],
                    ],
                    [
                        'name' => $status['name'],
                        'is_default' => $status['is_default'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }

        DB::table('sales')
            ->orderBy('id')
            ->get()
            ->each(function ($sale) {
                $statusId = DB::table('sale_statuses')
                    ->where(
                        'business_id',
                        $sale->business_id
                    )
                    ->where(
                        'slug',
                        $sale->status ?: 'pending'
                    )
                    ->value('id');

                DB::table('sales')
                    ->where('id', $sale->id)
                    ->update([
                        'status_id' => $statusId,
                    ]);
            });

        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->string('status')
                ->default('pending')
                ->after('amount');
        });

        DB::table('sales')
            ->orderBy('id')
            ->get()
            ->each(function ($sale) {
                $slug = DB::table('sale_statuses')
                    ->where('id', $sale->status_id)
                    ->value('slug');

                DB::table('sales')
                    ->where('id', $sale->id)
                    ->update([
                        'status' => $slug ?? 'pending',
                    ]);
            });

        Schema::table('sales', function (Blueprint $table) {
            $table->dropForeign(['status_id']);
            $table->dropColumn('status_id');
        });
    }
};