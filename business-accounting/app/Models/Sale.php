<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sale extends Model
{
    protected $fillable = [
        'business_id',
        'customer_id',
        'external_id',
        'amount',
        'status_id',
        'sold_at',
    ];

    protected $casts = [
        'sold_at' => 'datetime',
        'amount' => 'decimal:2',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(
            Business::class
        );
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(
            Customer::class
        );
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(
            SaleStatus::class,
            'status_id'
        );
    }

    public function payments(): HasMany
    {
        return $this->hasMany(
            Payment::class
        );
    }
}