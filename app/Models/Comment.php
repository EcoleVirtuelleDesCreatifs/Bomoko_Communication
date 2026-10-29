<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    protected $fillable = ['article_id', 'author', 'email', 'text', 'status', 'reply'];

    public const STATUSES = ['attente', 'approuve', 'spam'];

    public function article()
    {
        return $this->belongsTo(Article::class);
    }
}
