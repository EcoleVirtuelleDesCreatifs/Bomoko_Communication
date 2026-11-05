<?php

namespace Tests\Feature;

use App\Mail\NewsletterEdition;
use App\Models\Article;
use App\Models\Debate;
use App\Models\NewsletterCampaign;
use App\Models\Rubrique;
use App\Models\Subscriber;
use App\Models\User;
use App\Support\SiteAssets;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Tests\TestCase;

class EditorialServicesTest extends TestCase
{
    use RefreshDatabase;

    private function article(): Article
    {
        Rubrique::firstOrCreate(['slug' => 'culture'], ['label' => 'Culture']);

        return Article::create(['slug' => 'article-public', 'title' => 'Article public', 'rubrique_slug' => 'culture',
            'status' => 'publie', 'published_at' => now()->subHour(), 'body' => ['Texte original']]);
    }

    public function test_sitemap_is_paginated_and_does_not_omit_articles_after_5000(): void
    {
        $this->article();
        $rows = [];
        for ($i = 1; $i <= 5000; $i++) {
            $rows[] = ['slug' => 'archive-'.$i, 'title' => 'Archive '.$i,
                'rubrique_slug' => 'culture', 'status' => 'publie', 'published_at' => now()->subDay()];
        }
        foreach (array_chunk($rows, 500) as $chunk) {
            DB::table('articles')->insert($chunk);
        }
        $this->get('/sitemap.xml')->assertOk()->assertSee('sitemapindex', false)->assertSee('articles-2.xml', false)
            ->assertHeader('Cache-Control', 'max-age=300, must-revalidate, public, s-maxage=300');
        $this->get('/sitemaps/articles-2.xml')->assertOk()->assertSee('archive-5000', false)->assertDontSee('article-public', false);
        $this->get('/sitemaps/articles-0.xml')->assertNotFound();
        $this->get('/sitemaps/pages.xml')->assertOk()->assertSee('/rubrique/culture', false)->assertDontSee('rubrique.html', false);
        $robots = $this->get('/robots.txt')->assertOk()->getContent();
        $this->assertSame(1, substr_count($robots, 'User-agent: *'));
    }

    public function test_assets_require_the_correct_content_hash(): void
    {
        $url = SiteAssets::url('afriquinfos.css');
        $this->assertStringNotContainsString('?v=', $url);
        $this->get($url)->assertOk()->assertHeader('Content-Type', 'text/css; charset=utf-8');
        $this->get('/site-assets/'.str_repeat('0', 20).'/afriquinfos.css/content')->assertNotFound();
        $this->get('/site-assets/'.str_repeat('0', 20).'/unknown.css/content')->assertNotFound();
    }

    public function test_votes_are_unique_for_a_browser_and_closed_debates_reject_votes(): void
    {
        $debate = Debate::create(['question' => 'Question du débat', 'pour_text' => 'Pour', 'pour_who' => 'A',
            'contre_text' => 'Contre', 'contre_who' => 'B', 'start_date' => now()->subDay(), 'end_date' => now()->addDay()]);
        $this->withSession(['debate_voter' => (string) Str::uuid()]);
        $this->postJson('/debat/'.$debate->id.'/vote', ['side' => 'pour'])->assertOk()->assertJsonPath('recorded', true);
        $this->postJson('/debat/'.$debate->id.'/vote', ['side' => 'contre'])->assertOk()->assertJsonPath('recorded', false);
        $this->assertSame(1, $debate->fresh()->votes_pour);
        $this->assertSame(0, $debate->fresh()->votes_contre);
        $debate->update(['end_date' => now()->subDay()]);
        $this->postJson('/debat/'.$debate->id.'/vote', ['side' => 'pour'])->assertStatus(422);
    }

    public function test_private_articles_do_not_accept_comments(): void
    {
        $article = $this->article();
        $article->update(['status' => 'brouillon']);
        $this->post('/article/'.$article->slug.'/commentaire', ['author' => 'Lecteur', 'email' => 'reader@example.test', 'text' => 'Un commentaire complet'])->assertNotFound();
        $this->assertDatabaseCount('comments', 0);
    }

    public function test_ad_events_require_an_active_campaign_and_matching_slot(): void
    {
        $ad = ['id' => 'ad1', 'slot' => 'billboard', 'start' => now()->subDay()->toDateString(), 'end' => now()->addDay()->toDateString(), 'paused' => true];
        DB::table('admin_data')->insert(['key' => 'ads', 'value' => json_encode([$ad])]);
        $this->postJson('/ad-event', ['ad' => 'ad1', 'slot' => 'billboard', 'type' => 'imp'])->assertStatus(422);
        $ad['paused'] = false;
        DB::table('admin_data')->where('key', 'ads')->update(['value' => json_encode([$ad])]);
        $this->postJson('/ad-event', ['ad' => 'ad1', 'slot' => 'pave', 'type' => 'imp'])->assertStatus(422);
        $this->postJson('/ad-event', ['ad' => 'ad1', 'slot' => 'billboard', 'type' => 'imp'])->assertNoContent();
        $this->assertDatabaseHas('ad_metrics', ['ad_key' => 'ad1', 'impressions' => 1]);
    }

    public function test_newsletter_scheduling_is_idempotent_and_dispatch_does_not_resend(): void
    {
        Mail::fake();
        $article = $this->article();
        $admin = User::factory()->create(['role' => 'admin', 'status' => 'actif']);
        Subscriber::create(['email' => 'reader@example.test', 'status' => 'actif']);
        Subscriber::create(['email' => 'unsubscribed@example.test', 'status' => 'desinscrit']);
        $payload = ['client_key' => 'test-campaign', 'subject' => 'Le brief', 'intro' => 'Bonjour', 'articles' => [$article->slug], 'date' => now()->addHour()->toIso8601String()];
        $this->actingAs($admin)->postJson('/admin/api/newsletter/campaigns', $payload)->assertCreated();
        $this->postJson('/admin/api/newsletter/campaigns', $payload)->assertCreated();
        $this->assertDatabaseCount('newsletter_campaigns', 1);
        Mail::assertNothingSent();
        NewsletterCampaign::first()->update(['scheduled_at' => now()->subMinute()]);
        $this->artisan('newsletter:send-due')->assertSuccessful();
        $this->artisan('newsletter:send-due')->assertSuccessful();
        Mail::assertSentCount(1);
        Mail::assertSent(NewsletterEdition::class, fn ($mail) => $mail->hasTo('reader@example.test'));
        $this->assertDatabaseHas('newsletter_campaigns', ['status' => 'envoyee', 'sent' => 1, 'failed' => 0]);
    }

    public function test_newsletter_failures_are_recorded_without_automatic_resending(): void
    {
        $article = $this->article();
        $admin = User::factory()->create(['role' => 'admin', 'status' => 'actif']);
        Subscriber::create(['email' => 'reader@example.test', 'status' => 'actif']);
        NewsletterCampaign::create(['client_key' => 'failed-test', 'subject' => 'Édition', 'intro' => '',
            'article_ids' => [$article->id], 'scheduled_at' => now()->subMinute(), 'created_by' => $admin->id]);
        Mail::shouldReceive('to')->once()->andReturnSelf();
        Mail::shouldReceive('send')->once()->andThrow(new \RuntimeException('Transport indisponible'));
        $this->artisan('newsletter:send-due')->assertSuccessful();
        $this->artisan('newsletter:send-due')->assertSuccessful();
        $this->assertDatabaseHas('newsletter_campaigns', ['status' => 'echec', 'sent' => 0, 'failed' => 1]);
        $this->assertDatabaseHas('newsletter_deliveries', ['status' => 'failed']);
    }

    public function test_newsletter_template_renders_articles_and_unsubscribe_link(): void
    {
        $article = $this->article();
        $campaign = new NewsletterCampaign(['subject' => 'Édition test', 'intro' => '<script>test</script>', 'article_ids' => [$article->id]]);
        $html = (new NewsletterEdition($campaign, 'reader@example.test'))->render();
        $this->assertStringContainsString('Article public', $html);
        $this->assertStringContainsString('desinscription', $html);
        $this->assertStringNotContainsString('<script>test</script>', $html);
    }

    public function test_statistics_use_database_counts_not_demo_history_or_loaded_list(): void
    {
        $article = $this->article();
        $user = User::factory()->create(['name' => 'Ancien auteur', 'role' => 'admin', 'status' => 'actif']);
        $article->update(['user_id' => $user->id, 'author_name' => $user->name]);
        $user->update(['name' => 'Auteur renommé']);
        DB::table('admin_data')->insert(['key' => 'history', 'value' => json_encode(['counts' => ['Ancien auteur' => [99999]]])]);
        $state = $this->actingAs($user)->getJson('/admin/api/state')->assertOk()->json();
        $this->assertSame(1, $state['dashboardStats']['published']);
        $this->assertSame(1, array_sum(array_column($state['publicationStats'], 'count')));
        $this->assertSame('u'.$user->id, $state['publicationStats'][0]['member']);
        $this->get('/article/'.$article->slug)->assertOk();
        $this->assertDatabaseHas('article_daily_views', ['day' => now()->toDateString(), 'views' => 1]);
    }

    public function test_newsletter_test_is_restricted_to_editor_roles(): void
    {
        Mail::fake();
        $article = $this->article();
        $user = User::factory()->create(['role' => 'journaliste', 'status' => 'actif']);
        $data = ['subject' => 'Test', 'articles' => [$article->slug]];
        $this->actingAs($user)->postJson('/admin/api/newsletter/test', $data)->assertForbidden();
        Mail::assertNothingSent();
        $user->update(['role' => 'chef']);
        $this->postJson('/admin/api/newsletter/test', $data)->assertOk();
        Mail::assertSentCount(1);
    }
}
