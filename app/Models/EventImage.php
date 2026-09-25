<?php

namespace App\Models;

use Database\Factories\EventImageFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventImage extends Model
{
    /** @use HasFactory<EventImageFactory> */
    use HasFactory;

    protected $fillable = [
        'event_id',
        'path',
        'caption',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function url(): string
    {
        return asset('storage/'.$this->path);
    }
}
