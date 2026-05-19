<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Winner extends Model
{
    protected $fillable = [
        'draw_id',
        'user_id',
        'prize_amount',
        'match_type',
        'proof_image',
        'verification_status',
        'payout_status',
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
