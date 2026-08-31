<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement(
            'ALTER TABLE payments CHANGE method payment_source VARCHAR(255) NULL'
        );
    }

    public function down(): void
    {
        DB::statement(
            'ALTER TABLE payments CHANGE payment_source method VARCHAR(255) NULL'
        );
    }
};
