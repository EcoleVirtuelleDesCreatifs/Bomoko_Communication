<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\URL;

class TeamInvitation extends Mailable
{
    use Queueable, SerializesModels;

    public string $inviteUrl;

    public function __construct(public User $user)
    {
        $this->inviteUrl = URL::temporarySignedRoute(
            'admin.invitation.accept',
            now()->addHours(72),
            ['user' => $user->id]
        );
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Votre accès à l’administration d’Afriquinfos',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.team-invitation',
            with: ['user' => $this->user, 'inviteUrl' => $this->inviteUrl],
        );
    }
}
