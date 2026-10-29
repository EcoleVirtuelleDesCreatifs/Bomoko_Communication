<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Comment;
use App\Models\ContactMessage;
use App\Models\Debate;
use App\Models\Subscriber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class FormController extends Controller
{
    public const SUBJECTS = [
        'redaction' => 'Écrire à la rédaction',
        'publicite' => 'Publicité et kit média',
        'agenda' => 'Proposer un événement',
        'reponse' => 'Droit de réponse',
        'autre' => 'Autre demande',
    ];

    public function contact(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'email' => 'required|email:rfc,dns|max:160',
            'subject' => 'required|in:'.implode(',', array_keys(self::SUBJECTS)),
            'message' => 'required|string|min:20|max:5000',
            'consent' => 'accepted',
        ], [
            'name.required' => 'Indiquez votre nom.',
            'email.required' => 'Saisissez une adresse e-mail valide, par exemple nom@domaine.com.',
            'email.email' => 'Saisissez une adresse e-mail valide, par exemple nom@domaine.com.',
            'subject.required' => 'Choisissez l’objet de votre message.',
            'message.required' => 'Votre message doit contenir au moins 20 caractères.',
            'message.min' => 'Votre message doit contenir au moins 20 caractères.',
            'consent.accepted' => 'Cochez cette case pour envoyer votre message.',
        ]);

        ContactMessage::create($data);

        return back()->with('success', 'Message envoyé à « '.self::SUBJECTS[$data['subject']].' ». Nous vous répondrons à '.$data['email'].'.');
    }

    public function newsletter(Request $request)
    {
        $data = $request->validate(['email' => 'required|email|max:160']);

        $subscriber = Subscriber::updateOrCreate(
            ['email' => $data['email']],
            ['status' => 'actif']
        );

        if ($subscriber->wasRecentlyCreated || $subscriber->wasChanged('status')) {
            try {
                Mail::to($subscriber->email)->send(new \App\Mail\NewsletterWelcome($subscriber));
            } catch (\Throwable $e) {
                report($e);
            }
        }

        return back()->with('newsletter', 'Inscription confirmée : votre premier brief arrive demain matin.');
    }

    public function unsubscribe(Request $request)
    {
        $subscriber = Subscriber::where('email', $request->query('email'))->first();
        $subscriber?->update(['status' => 'desinscrit']);

        return response()->view('unsubscribed', ['email' => $request->query('email')]);
    }

    public function comment(Request $request, Article $article)
    {
        // Honeypot anti-spam : un humain ne remplit jamais ce champ
        if ($request->filled('website')) {
            return back();
        }

        $data = $request->validate([
            'author' => 'required|string|min:2|max:120',
            'email' => 'required|email:rfc|max:160',
            'text' => 'required|string|min:10|max:2000',
        ], [
            'author.required' => 'Indiquez votre nom ou pseudo.',
            'author.min' => 'Indiquez votre nom ou pseudo.',
            'email.required' => 'Saisissez une adresse e-mail valide.',
            'email.email' => 'Saisissez une adresse e-mail valide.',
            'text.required' => 'Votre commentaire doit contenir au moins 10 caractères.',
            'text.min' => 'Votre commentaire doit contenir au moins 10 caractères.',
        ]);

        $settings = json_decode(DB::table('admin_data')->where('key', 'settings')->value('value') ?? 'null', true);
        $moderation = $settings['moderation'] ?? true;

        $article->comments()->create($data + ['status' => $moderation ? 'attente' : 'approuve']);

        return back()->with('success', $moderation
            ? 'Commentaire envoyé : il apparaîtra après validation par la rédaction.'
            : 'Commentaire publié. Merci pour votre contribution !');
    }

    public function vote(Request $request, Debate $debate)
    {
        $data = $request->validate(['side' => 'required|in:pour,contre']);
        $debate->increment('votes_'.$data['side']);

        return response()->json([
            'pour' => $debate->votes_pour,
            'contre' => $debate->votes_contre,
        ]);
    }
}
