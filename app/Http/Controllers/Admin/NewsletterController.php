<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\NewsletterEdition;
use App\Models\Article;
use App\Models\NewsletterCampaign;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class NewsletterController extends Controller
{
    private function authorizeEditor(Request $request): void
    {
        abort_unless(in_array($request->user()->role, ['admin', 'chef'], true), 403);
    }

    public function index(Request $request)
    {
        $this->authorizeEditor($request);

        return response()->json($this->items());
    }

    public function items(): array
    {
        return NewsletterCampaign::orderByDesc('id')->limit(100)->get()->map(fn ($c) => [
            'id' => 'campaign-'.$c->id, 'subject' => $c->subject, 'date' => $c->scheduled_at->toIso8601String(),
            'status' => $c->status, 'recipients' => $c->recipients, 'sent' => $c->sent, 'failed' => $c->failed,
        ])->all();
    }

    public function store(Request $request)
    {
        $this->authorizeEditor($request);
        $data = $this->validateEdition($request);
        $request->validate(['client_key' => 'required|string|max:64', 'date' => 'required|date|after:now']);
        DB::transaction(function () use ($request, $data) {
            $campaign = NewsletterCampaign::firstOrCreate(['client_key' => $request->input('client_key')], [
                'subject' => $data['subject'], 'intro' => $data['intro'] ?? '', 'article_ids' => $data['ids'],
                'scheduled_at' => Carbon::parse($request->input('date'))->timezone(config('app.timezone')), 'created_by' => $request->user()->id,
            ]);
            abort_if(! $campaign->wasRecentlyCreated && ($campaign->subject !== $data['subject']
                || $campaign->intro !== ($data['intro'] ?? '') || $campaign->article_ids !== $data['ids']
                || $campaign->scheduled_at->timestamp !== Carbon::parse($request->input('date'))->timestamp), 409,
                'Cette demande a déjà été enregistrée avec un autre contenu. Rouvrez le formulaire.');
            if ($campaign->wasRecentlyCreated) {
                DB::table('admin_audit_events')->insert([
                    'user_id' => $request->user()->id, 'who' => $request->user()->name,
                    'action' => 'Newsletter « '.$campaign->subject.' » — programmation confirmée pour '.$campaign->scheduled_at->toIso8601String(), 'created_at' => now(),
                ]);
            }
        });

        return response()->json(['ok' => true, 'campaigns' => $this->items()], 201);
    }

    public function test(Request $request)
    {
        $this->authorizeEditor($request);
        abort_if(in_array(config('mail.default'), ['log', 'array'], true) && ! app()->environment('testing'), 422,
            'Configurez un transport e-mail réel avant de tester.');
        $data = $this->validateEdition($request);
        $campaign = new NewsletterCampaign(['subject' => $data['subject'], 'intro' => $data['intro'] ?? '', 'article_ids' => $data['ids']]);
        try {
            Mail::to($request->user()->email)->send(new NewsletterEdition($campaign, $request->user()->email));
        } catch (\Throwable $e) {
            report($e);

            return response()->json(['ok' => false, 'error' => 'Le transport e-mail a refusé le test. Consultez les logs serveur.'], 502);
        }

        return response()->json(['ok' => true, 'message' => 'Message de test accepté par le transport e-mail.']);
    }

    private function validateEdition(Request $request): array
    {
        $data = $request->validate(['subject' => 'required|string|max:255', 'intro' => 'nullable|string|max:10000',
            'articles' => 'required|array|min:1|max:20', 'articles.*' => 'required|string|distinct']);
        $data['ids'] = Article::published()->whereIn('slug', $data['articles'])->pluck('id')->all();
        abort_unless(count($data['ids']) === count($data['articles']), 422, 'Tous les articles doivent être publiés.');

        return $data;
    }
}
