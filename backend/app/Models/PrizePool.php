<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrizePool extends Model
{
    protected $table = 'prize_pool';

    protected $fillable = [
        'total_pool',
        'jackpot_pool',
        'four_match_pool',
        'three_match_pool',
    ];
}
