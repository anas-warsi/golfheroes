<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Draw extends Model
{
    protected $fillable = [
        'draw_date',
        'numbers',
        'status',
        'jackpot_amount',
        'jackpot_rollover',
    ];

    protected $casts = [
        'draw_date' => 'date',
        'numbers' => 'array',
        'jackpot_rollover' => 'boolean',
    ];

    public function entries()
    {
        return $this->hasMany(DrawEntry::class);
    }

    public function winners()
    {
        return $this->hasMany(Winner::class);
    }
}
