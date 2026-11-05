<?php

namespace App\Mail;

use App\Models\Article;
use App\Models\NewsletterCampaign;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Support\Facades\URL;

class NewsletterEdition extends Mailable
{
    public function __construct(public NewsletterCampaign $campaign, public string $recipient) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->campaign->subject);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.newsletter-edition', with: [
            'articles' => Article::published()->whereIn('id', $this->campaign->article_ids)->get(['slug', 'title', 'chapo']),
            'unsubscribeUrl' => URL::signedRoute('unsubscribe', ['email' => $this->recipient]),
        ]);
    }
}
