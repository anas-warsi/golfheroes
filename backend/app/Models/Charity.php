<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Charity extends Model
{
    protected $fillable = [
        'name',
        'description',
        'image_url',
        'is_featured',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
    ];

    protected $appends = [
        'total_raised',
        'contributors_count',
        'percentage_growth',
        'latest_donation_timestamp'
    ];

    public function getTotalRaisedAttribute()
    {
        return (float) $this->contributions()->sum('amount');
    }

    public function getContributorsCountAttribute()
    {
        return (int) $this->contributions()->whereNotNull('user_id')->distinct('user_id')->count('user_id') ?: 1;
    }

    public function getPercentageGrowthAttribute()
    {
        $count = $this->contributors_count;
        return $count > 0 ? min(100.0, (float) number_format($count * 12.5, 1)) : 0.0;
    }

    public function getLatestDonationTimestampAttribute()
    {
        $latest = $this->contributions()->latest('created_at')->first();
        return $latest ? $latest->created_at->toIso8601String() : null;
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function contributions()
    {
        return $this->hasMany(CharityContribution::class);
    }
}
