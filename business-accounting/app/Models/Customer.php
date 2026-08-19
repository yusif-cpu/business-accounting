<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    protected $fillable = [
        'business_id',
        'name',
        'email',
        'phone'
    ];

    public function business(): belongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }
}
