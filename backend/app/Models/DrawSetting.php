<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DrawSetting extends Model
{
    protected $table = 'draw_settings';

    protected $fillable = [
        'next_draw_date',
    ];
}
