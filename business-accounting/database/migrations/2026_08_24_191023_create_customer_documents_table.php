<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(
            'customer_documents',
            function (Blueprint $table) {
                $table->id();

                $table->foreignId(
                    'business_id'
                )
                    ->constrained()
                    ->cascadeOnDelete();

                $table->foreignId(
                    'customer_id'
                )
                    ->constrained()
                    ->cascadeOnDelete();

                $table->string(
                    'name'
                );

                $table->string(
                    'file_path'
                );

                $table->string(
                    'mime_type'
                );

                $table->unsignedBigInteger(
                    'file_size'
                );

                $table->timestamps();

                $table->index([
                    'business_id',
                    'customer_id',
                ]);
            }
        );
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'customer_documents'
        );
    }
};