<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Expense extends Model
{
    protected $fillable = [
        'business_id',
        'description',
        'amount',
        'category',
        'expense_date'
    ];

    protected $casts = [
        'expense_date' => 'date',
        'amount' => 'decimal:2'
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }
}
