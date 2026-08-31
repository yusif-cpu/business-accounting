<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->foreignId('business_id')
                ->nullable()
                ->after('id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('external_id')
                ->nullable()
                ->after('business_id');
        });

        DB::statement(
            'UPDATE payments INNER JOIN sales ON payments.sale_id = sales.id SET payments.business_id = sales.business_id'
        );

        Schema::table('payments', function (Blueprint $table) {
            $table->unique(
                ['business_id', 'external_id'],
                'payments_business_id_external_id_unique'
            );
        });

        DB::statement('ALTER TABLE payments MODIFY method VARCHAR(255) NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE payments MODIFY method VARCHAR(255) NOT NULL');

        Schema::table('payments', function (Blueprint $table) {
            $table->dropUnique(
                'payments_business_id_external_id_unique'
            );
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('business_id');
            $table->dropColumn('external_id');
        });
    }
};
