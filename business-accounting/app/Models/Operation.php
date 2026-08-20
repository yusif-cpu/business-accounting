<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Operation extends Model
{
    protected $fillable = [
        'business_id',
        'customer_id',
        'type',
        'operation_date',
        'currency',
        'amount',
        'category',
        'description',
        'note',
    ];

    protected $casts = [
        'operation_date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}