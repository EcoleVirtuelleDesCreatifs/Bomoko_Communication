<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['client_key', 'subject', 'intro', 'article_ids', 'scheduled_at', 'status', 'recipients', 'sent', 'failed', 'created_by'])]
class NewsletterCampaign extends Model
{
    protected function casts(): array
    {
        return ['article_ids' => 'array', 'scheduled_at' => 'datetime'];
    }
}
