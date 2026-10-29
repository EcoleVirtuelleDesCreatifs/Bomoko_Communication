<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Debate extends Model
{
    protected $fillable = [
        'question', 'pour_text', 'pour_who', 'contre_text', 'contre_who',
        'votes_pour', 'votes_contre', 'start_date', 'end_date', 'is_current',
    ];

    protected $casts = ['is_current' => 'boolean', 'start_date' => 'date', 'end_date' => 'date'];

    public function scopeCurrent($query)
    {
        return $query->where('is_current', true);
    }
}
