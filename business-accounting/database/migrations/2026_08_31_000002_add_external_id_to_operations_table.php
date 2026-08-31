<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('operations', function (Blueprint $table) {
            $table->string('external_id')
                ->nullable()
                ->after('business_id');

            $table->unique(
                ['business_id', 'external_id'],
                'operations_business_id_external_id_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::table('operations', function (Blueprint $table) {
            $table->dropUnique(
                'operations_business_id_external_id_unique'
            );

            $table->dropColumn('external_id');
        });
    }
};
