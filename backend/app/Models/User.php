<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected static function booted(): void
    {
        static::created(function ($user) {
            \DB::table('profiles')->updateOrInsert(
                ['id' => $user->id],
                [
                    'full_name' => $user->name,
                    'email' => $user->email,
                    'selected_charity' => $user->charity ? $user->charity->name : null,
                    'subscription_status' => $user->subscription_status,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        });

        static::updated(function ($user) {
            // Reload charity relationship to get charity name if charity_id changes
            $user->load('charity');
            \DB::table('profiles')->updateOrInsert(
                ['id' => $user->id],
                [
                    'full_name' => $user->name,
                    'email' => $user->email,
                    'selected_charity' => $user->charity ? $user->charity->name : null,
                    'subscription_status' => $user->subscription_status,
                    'updated_at' => now(),
                ]
            );
        });

        static::deleted(function ($user) {
            \DB::table('profiles')->where('id', $user->id)->delete();
        });
    }

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'subscription_status',
        'subscription_plan',
        'subscription_renewal_date',
        'charity_id',
        'charity_percentage',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'subscription_renewal_date' => 'date',
        ];
    }

    public function scores()
    {
        return $this->hasMany(Score::class)->orderBy('date', 'desc');
    }

    public function charity()
    {
        return $this->belongsTo(Charity::class);
    }

    public function contributions()
    {
        return $this->hasMany(CharityContribution::class);
    }

    public function drawEntries()
    {
        return $this->hasMany(DrawEntry::class);
    }

    public function winnings()
    {
        return $this->hasMany(Winner::class);
    }
}
