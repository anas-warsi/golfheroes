<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DrawEntry extends Model
{
    protected $fillable = [
        'draw_id',
        'user_id',
        'matched_numbers',
        'prize_tier',
        'prize_amount',
    ];

    public function draw()
    {
        return $this->belongsTo(Draw::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
