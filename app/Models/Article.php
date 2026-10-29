<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    protected $fillable = [
        'slug', 'rubrique_slug', 'region_slug', 'country', 'title', 'chapo',
        'author_name', 'user_id', 'published_at', 'read_time', 'tags', 'body',
        'ph', 'img', 'image_path', 'icon', 'person', 'media_id', 'views', 'is_une',
        'status', 'meta_desc',
    ];

    protected $casts = [
        'tags' => 'array',
        'body' => 'array',
        'person' => 'array',
        'is_une' => 'boolean',
        'published_at' => 'datetime',
    ];

    public const STATUSES = ['publie', 'programme', 'relecture', 'brouillon', 'corbeille'];

    public function scopePublished($query)
    {
        return $query->where('status', 'publie')
            ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()));
    }

    public function rubrique()
    {
        return $this->belongsTo(Rubrique::class, 'rubrique_slug', 'slug');
    }

    public function region()
    {
        return $this->belongsTo(Region::class, 'region_slug', 'slug');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function toPublicArray(): array
    {
        return [
            'id' => $this->slug,
            'rub' => $this->rubrique_slug,
            'rub_label' => $this->rubrique?->label,
            'region' => $this->region_slug,
            'region_label' => $this->region?->label,
            'country' => $this->country,
            'title' => $this->title,
            'chapo' => $this->chapo,
            'author' => $this->author_name,
            'date' => optional($this->published_at)->toIso8601String(),
            'read' => $this->read_time,
            'tags' => $this->tags ?? [],
            'body' => $this->body ?? [],
            'ph' => $this->ph,
            'img' => $this->img,
            'src' => $this->image_path ? asset('storage/'.$this->image_path) : null,
            'icon' => $this->icon,
            'person' => $this->person,
            'views' => $this->views,
            'une' => $this->is_une,
            'url' => route('article.show', $this->slug),
        ];
    }
}
