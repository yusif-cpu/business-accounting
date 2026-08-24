<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SaleStatus extends Model
{
    protected $fillable = [
        'business_id',
        'name',
        'slug',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(
            Business::class
        );
    }

    public function sales(): HasMany
    {
        return $this->hasMany(
            Sale::class,
            'status_id'
        );
    }
}