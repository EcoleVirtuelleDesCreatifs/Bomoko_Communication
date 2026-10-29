<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = ['slug', 'start_date', 'end_date', 'title', 'city', 'country', 'cat', 'desc'];

    protected $casts = ['start_date' => 'date', 'end_date' => 'date'];

    public function scopeUpcoming($query)
    {
        return $query->whereRaw('COALESCE(end_date, start_date) >= ?', [now()->toDateString()])
            ->orderBy('start_date');
    }
}
