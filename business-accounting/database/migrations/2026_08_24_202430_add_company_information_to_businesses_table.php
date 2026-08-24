<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            $table->string('phone')
                ->nullable()
                ->after('business_name');

            $table->string('email')
                ->nullable()
                ->after('phone');

            $table->text('address')
                ->nullable()
                ->after('email');

            $table->string('website')
                ->nullable()
                ->after('address');

            $table->string('tax_id')
                ->nullable()
                ->after('website');

            $table->string('currency', 3)
                ->default('AZN')
                ->after('tax_id');

            $table->string('logo_path')
                ->nullable()
                ->after('currency');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            $table->dropColumn([
                'phone',
                'email',
                'address',
                'website',
                'tax_id',
                'currency',
                'logo_path',
            ]);
        });
    }
};