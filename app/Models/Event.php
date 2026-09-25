<?php

namespace App\Models;

use Database\Factories\EventFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    /** @use HasFactory<EventFactory> */
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'summary',
        'content',
        'event_date',
        'location',
        'cover_image',
        'is_published',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'event_date' => 'datetime',
            'published_at' => 'datetime',
            'is_published' => 'boolean',
        ];
    }

    public function images()
    {
        return $this->hasMany(EventImage::class)->orderBy('sort_order');
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true)->whereNotNull('published_at');
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
