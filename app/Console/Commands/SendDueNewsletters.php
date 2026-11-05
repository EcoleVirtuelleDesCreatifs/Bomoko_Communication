<?php

namespace App\Console\Commands;

use App\Mail\NewsletterEdition;
use App\Models\NewsletterCampaign;
use App\Models\Subscriber;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class SendDueNewsletters extends Command
{
    protected $signature = 'newsletter:send-due {--limit=100}';

    protected $description = 'Envoie les campagnes arrivées à échéance, sans réexpédier les destinataires traités';

    public function handle(): int
    {
        if (in_array(config('mail.default'), ['log', 'array'], true) && ! app()->environment('testing')) {
            $this->error('Un transport e-mail réel est nécessaire. Aucun message envoyé.');

            return self::FAILURE;
        }
        $limit = max(1, min(1000, (int) $this->option('limit')));
        $lock = Cache::lock('newsletter-dispatch', 600);
        if (! $lock->get()) {
            return self::SUCCESS;
        }
        try {
            $campaigns = NewsletterCampaign::whereIn('status', ['programmee', 'en_cours'])->where('scheduled_at', '<=', now())->orderBy('id')->limit(20)->get();
            foreach ($campaigns as $campaign) {
                DB::transaction(function () use ($campaign) {
                    $current = NewsletterCampaign::whereKey($campaign->id)->lockForUpdate()->firstOrFail();
                    if ($current->status !== 'programmee') {
                        return;
                    }
                    Subscriber::where('status', 'actif')->select('id')->chunkById(500, function ($subscribers) use ($campaign) {
                        DB::table('newsletter_deliveries')->insertOrIgnore($subscribers->map(fn ($s) => [
                            'campaign_id' => $campaign->id, 'subscriber_id' => $s->id, 'status' => 'pending',
                        ])->all());
                    });
                    $current->update(['status' => 'en_cours', 'recipients' => DB::table('newsletter_deliveries')->where('campaign_id', $campaign->id)->count()]);
                });
                $deliveries = DB::table('newsletter_deliveries')->where('campaign_id', $campaign->id)->where('status', 'pending')->orderBy('id')->limit($limit)->get();
                foreach ($deliveries as $delivery) {
                    $claimed = DB::table('newsletter_deliveries')->where('id', $delivery->id)->where('status', 'pending')->update(['status' => 'sending']);
                    if (! $claimed) {
                        continue;
                    }
                    $subscriber = Subscriber::whereKey($delivery->subscriber_id)->where('status', 'actif')->first();
                    $status = 'skipped';
                    if ($subscriber) {
                        try {
                            Mail::to($subscriber->email)->send(new NewsletterEdition($campaign, $subscriber->email));
                            $status = 'sent';
                        } catch (\Throwable $e) {
                            report($e);
                            $status = 'failed';
                        }
                    }
                    DB::table('newsletter_deliveries')->where('id', $delivery->id)->update(['status' => $status, 'sent_at' => $status === 'sent' ? now() : null]);
                    $limit--;
                }
                $counts = DB::table('newsletter_deliveries')->where('campaign_id', $campaign->id)->select('status')->selectRaw('COUNT(*) AS total')->groupBy('status')->pluck('total', 'status');
                $pending = ($counts['pending'] ?? 0) + ($counts['sending'] ?? 0);
                $campaign->update(['sent' => $counts['sent'] ?? 0, 'failed' => $counts['failed'] ?? 0,
                    'status' => $pending ? 'en_cours' : (($counts['failed'] ?? 0) ? 'echec' : 'envoyee')]);
                if ($limit <= 0) {
                    break;
                }
            }
        } finally {
            $lock->release();
        }

        return self::SUCCESS;
    }
}
