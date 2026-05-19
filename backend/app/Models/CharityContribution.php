<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CharityContribution extends Model
{
    protected $fillable = [
        'user_id',
        'charity_id',
        'subscription_id',
        'amount',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function charity()
    {
        return $this->belongsTo(Charity::class);
    }
}
