<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('operations', 'category_id')) {
            Schema::table('operations', function (Blueprint $table) {
                $table->foreignId('category_id')
                    ->nullable()
                    ->after('amount')
                    ->constrained('categories')
                    ->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('operations', 'category_id')) {
            Schema::table('operations', function (Blueprint $table) {
                $table->dropForeign(['category_id']);
                $table->dropColumn('category_id');
            });
        }
    }
};