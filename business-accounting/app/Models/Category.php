<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Category extends Model
{
    protected $fillable = [
        'business_id',
        'type',
        'name',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }
}