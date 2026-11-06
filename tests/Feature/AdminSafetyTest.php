<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\Rubrique;
use App\Models\Subscriber;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AdminSafetyTest extends TestCase
{
    use RefreshDatabase;

    public function test_international_category_is_available_to_journalists_and_can_classify_articles(): void
    {
        $original = $this->articleFixture();
        $before = $original->fresh()->getRawOriginal();
        $user = User::factory()->create(['role' => 'journaliste', 'status' => 'actif']);
        $state = $this->actingAs($user)->getJson('/admin/api/state')->assertOk()->json();
        $rubrique = collect($state['rubriques'])->firstWhere('id', 'international');
        $this->assertNotNull($rubrique);
        $this->assertSame('International / Reste du monde', $rubrique['label']);
        $this->assertFalse($rubrique['menu']);
        $this->postJson('/admin/api/state', ['protocol' => 2, 'revisions' => [], 'articles' => [[
            'id' => 'actualite-internationale', 'title' => 'Actualité internationale de la rédaction',
            'rub' => 'international', 'region' => null, 'country' => 'France', 'status' => 'brouillon',
            'body' => ['Texte international'], 'date' => now()->toIso8601String(),
        ]]])->assertOk();
        $article = Article::where('slug', 'actualite-internationale')->firstOrFail();
        $this->assertSame('international', $article->rubrique_slug);
        $this->assertNull($article->region_slug);
        $this->assertSame($user->id, $article->user_id);
        $this->assertSame('International / Reste du monde', $article->toPublicArray()['rub_label']);
        $this->assertSame($before, $original->fresh()->getRawOriginal());
        $chief = User::factory()->create(['role' => 'chef', 'status' => 'actif']);
        $item = collect($this->actingAs($chief)->getJson('/admin/api/state')->assertOk()->json('articles'))->firstWhere('id', $article->slug);
        $item['baseUpdated'] = $item['updated'];
        $item['status'] = 'publie';
        $this->postJson('/admin/api/state', ['protocol' => 2, 'revisions' => [], 'articles' => [$item]])->assertOk();
        $this->get('/rubrique/international')->assertOk()->assertSee($article->slug, false);
    }

    public function test_international_category_migration_preserves_existing_classification_and_content(): void
    {
        $article = $this->articleFixture();
        Rubrique::where('slug', 'international')->update(['label' => 'International personnalisé', 'in_menu' => true, 'sort' => 42]);
        $categories = DB::table('rubriques')->orderBy('slug')->get()->toJson();
        $before = $article->fresh()->getRawOriginal();
        $migration = require database_path('migrations/2026_11_06_000001_add_international_rubrique.php');
        $migration->up();
        $migration->up();
        $migration->down();
        $this->assertSame($categories, DB::table('rubriques')->orderBy('slug')->get()->toJson());
        $this->assertSame($before, $article->fresh()->getRawOriginal());
    }

    public function test_authenticated_admin_never_initially_displays_the_login_form(): void
    {
        $user = User::factory()->create(['role' => 'admin', 'status' => 'actif']);
        $response = $this->actingAs($user)->get('/admin')->assertOk();
        $response->assertSee('id="login" hidden', false);
        $response->assertSee('id="adminLoading"', false);
        $response->assertSee('id="toast" role="status" aria-live="polite" aria-atomic="true" hidden', false);
        $response->assertSee('[hidden] { display: none !important; }', false);
    }

    public function test_old_clients_cannot_submit_a_global_snapshot(): void
    {
        $user = User::factory()->create(['role' => 'admin', 'status' => 'actif']);
        $this->actingAs($user)->postJson('/admin/api/state', ['articles' => []])->assertStatus(409);
        $this->assertDatabaseHas('users', ['id' => $user->id]);
    }

    public function test_a_journalist_cannot_change_team_members(): void
    {
        $user = User::factory()->create(['role' => 'journaliste', 'status' => 'actif']);
        $this->actingAs($user)->postJson('/admin/api/state', [
            'protocol' => 2, 'users' => [], 'revisions' => [],
        ])->assertForbidden();
    }

    private function articleFixture(): Article
    {
        Rubrique::create(['slug' => 'culture', 'label' => 'Culture']);

        return Article::create(['slug' => 'article-test', 'title' => 'Article original',
            'rubrique_slug' => 'culture', 'status' => 'publie', 'views' => 75, 'body' => ['Texte conservé'],
            'published_at' => now()->subDay(), 'updated_at' => now()->subMinute()]);
    }

    public function test_article_save_is_confirmed_audited_and_preserves_views_and_body(): void
    {
        $user = User::factory()->create(['role' => 'admin', 'status' => 'actif']);
        $article = $this->articleFixture();
        $state = $this->actingAs($user)->getJson('/admin/api/state')->assertOk()->json();
        $item = $state['articles'][0];
        $item['baseUpdated'] = $item['updated'];
        $item['title'] = 'Titre modifié explicitement';
        $item['views'] = 0;
        $this->postJson('/admin/api/state', ['protocol' => 2, 'articles' => [$item], 'revisions' => []])
            ->assertOk()->assertJsonPath('ok', true)->assertJsonCount(1, 'articles');
        $this->assertSame(75, $article->fresh()->views);
        $this->assertSame(['Texte conservé'], $article->fresh()->body);
        $this->assertDatabaseCount('admin_audit_events', 1);
        $item['title'] = 'Ancien onglet';
        $this->postJson('/admin/api/state', ['protocol' => 2, 'articles' => [$item], 'revisions' => []])->assertStatus(409);
        $this->assertSame('Titre modifié explicitement', $article->fresh()->title);
    }

    public function test_editor_html_and_media_survive_save_admin_reload_and_public_rendering(): void
    {
        $user = User::factory()->create(['role' => 'admin', 'status' => 'actif']);
        $article = $this->articleFixture();
        $state = $this->actingAs($user)->getJson('/admin/api/state')->assertOk()->json();
        $item = $state['articles'][0];
        $item['baseUpdated'] = $item['updated'];
        $item['body'] = ['<div><p align="center">Premier<br><em>Suite</em></p><h2>Intertitre</h2><ol start="3"><li>Un</li><li>Deux</li></ol><figure><img data-mid="m123" alt="Photo"><figcaption>Légende</figcaption></figure><p>Fin</p></div>'];
        $this->postJson('/admin/api/state', [
            'protocol' => 2, 'articles' => [$item], 'revisions' => $state['revisions'],
            'medias' => [['id' => 'm123', 'data' => 'https://example.test/storage/medias/photo.jpg'], ['id' => 'external', 'data' => 'https://example.test/external.jpg']],
        ])->assertOk();
        $stored = $article->fresh()->body[0];
        foreach (['<br', '<em>Suite</em>', '<h2>Intertitre</h2>', '<ol start="3">', '<figcaption>Légende</figcaption>', 'align="center"', '/storage/medias/photo.jpg'] as $markup) {
            $this->assertStringContainsString($markup, $stored);
        }
        $this->assertStringNotContainsString('data-mid', $stored);
        $this->assertStringNotContainsString('base64', $stored);
        $this->assertSame($stored, $article->fresh()->toPublicArray()['body'][0]);
        $this->assertSame([$stored], $this->getJson('/admin/api/article/'.$article->slug)->assertOk()->json('body'));
        $this->assertSame(75, $article->fresh()->views);
    }

    public function test_concurrent_media_additions_do_not_block_a_journalist_article(): void
    {
        $user = User::factory()->create(['role' => 'journaliste', 'status' => 'actif']);
        $article = $this->articleFixture();
        $article->update(['user_id' => $user->id, 'author_name' => $user->name, 'status' => 'brouillon']);
        $state = $this->actingAs($user)->getJson('/admin/api/state')->assertOk()->json();
        $first = ['id' => 'first', 'data' => 'https://example.test/storage/first.jpg'];
        $second = ['id' => 'second', 'data' => 'https://example.test/storage/second.jpg'];
        $this->postJson('/admin/api/state', ['protocol' => 2, 'revisions' => $state['revisions'], 'medias' => [$first], 'mediaSync' => 'delta', 'mediaBase' => ['first' => null], 'mediaDeleted' => []])->assertOk();
        $this->postJson('/admin/api/state', ['protocol' => 2, 'revisions' => $state['revisions'], 'medias' => [$second]])->assertStatus(409);
        $item = $state['articles'][0];
        $item['baseUpdated'] = $item['updated'];
        $item['status'] = 'relecture';
        $item['mediaId'] = 'second';
        $this->postJson('/admin/api/state', ['protocol' => 2, 'revisions' => $state['revisions'], 'articles' => [$item], 'medias' => [$second], 'mediaSync' => 'delta', 'mediaBase' => ['second' => null], 'mediaDeleted' => []])
            ->assertOk()->assertJsonCount(2, 'resources.medias');
        $this->assertSame('relecture', $article->fresh()->status);
        $this->assertSame('second.jpg', $article->fresh()->image_path);
    }

    public function test_media_deltas_reject_conflicting_edits_and_preserve_unrelated_images(): void
    {
        $user = User::factory()->create(['role' => 'admin', 'status' => 'actif']);
        $this->actingAs($user);
        $original = ['id' => 'first', 'data' => 'https://example.test/first.jpg', 'name' => 'Original'];
        $other = ['id' => 'second', 'data' => 'https://example.test/second.jpg'];
        $hidden = ['id' => 'hidden', 'data' => 'ancienne légende non affichée'];
        DB::table('admin_data')->insert(['key' => 'medias', 'value' => json_encode([$original, $other, $hidden]), 'updated_at' => now()]);
        $changed = [...$original, 'name' => 'Version récente'];
        $payload = ['protocol' => 2, 'revisions' => [], 'mediaSync' => 'delta', 'medias' => [$changed], 'mediaBase' => ['first' => $original], 'mediaDeleted' => []];
        $this->postJson('/admin/api/state', $payload)->assertOk()->assertJsonCount(2, 'resources.medias');
        $payload['medias'][0]['name'] = 'Ancien onglet';
        $this->postJson('/admin/api/state', $payload)->assertStatus(409);
        $payload['medias'] = [];
        $payload['mediaDeleted'] = ['first'];
        $this->postJson('/admin/api/state', $payload)->assertStatus(409);
        $payload['mediaBase']['first'] = $changed;
        $this->postJson('/admin/api/state', $payload)->assertOk()->assertJsonCount(1, 'resources.medias')->assertJsonPath('resources.medias.0.id', 'second');
        $this->assertSame([$other, $hidden], json_decode(DB::table('admin_data')->where('key', 'medias')->value('value'), true));
        $payload['medias'] = [$other];
        $payload['mediaBase'] = [];
        $payload['mediaDeleted'] = [];
        $this->postJson('/admin/api/state', $payload)->assertStatus(422);
    }

    public function test_unrelated_sections_are_not_deleted_when_saving_an_article(): void
    {
        $user = User::factory()->create(['role' => 'admin', 'status' => 'actif']);
        $this->articleFixture();
        Subscriber::create(['email' => 'reader@example.test', 'status' => 'actif']);
        $state = $this->actingAs($user)->getJson('/admin/api/state')->assertOk()->json();
        $item = $state['articles'][0];
        $item['baseUpdated'] = $item['updated'];
        $this->postJson('/admin/api/state', ['protocol' => 2, 'articles' => [$item], 'revisions' => []])->assertOk();
        $this->assertDatabaseCount('subscribers', 1);
        $this->assertDatabaseCount('users', 1);
    }

    public function test_conflicting_flash_snapshot_is_rejected_without_reactivating_it(): void
    {
        $user = User::factory()->create(['role' => 'admin', 'status' => 'actif']);
        $state = $this->actingAs($user)->getJson('/admin/api/state')->assertOk()->json();
        DB::table('admin_data')->insert(['key' => 'flash', 'value' => '[{"id":"f1","active":false,"text":"Info"}]']);
        $this->postJson('/admin/api/state', ['protocol' => 2, 'flash' => [['id' => 'f1', 'active' => true, 'text' => 'Info']],
            'revisions' => ['flash' => $state['revisions']['flash']]])->assertStatus(409);
        $this->assertFalse(json_decode(DB::table('admin_data')->where('key', 'flash')->value('value'), true)[0]['active']);
    }

    public function test_contributor_scheduling_is_rejected_without_creating_a_false_saved_article(): void
    {
        Rubrique::create(['slug' => 'culture', 'label' => 'Culture']);
        $user = User::factory()->create(['role' => 'contributeur', 'status' => 'actif']);
        $this->actingAs($user)->postJson('/admin/api/state', [
            'protocol' => 2, 'revisions' => [], 'articles' => [[
                'id' => 'programmation-refusee', 'title' => 'Article à faire valider', 'rub' => 'culture',
                'status' => 'programme', 'date' => now()->addHour()->toIso8601String(), 'body' => ['Texte du journaliste'],
            ]],
        ])->assertForbidden();
        $this->assertDatabaseMissing('articles', ['slug' => 'programmation-refusee']);
    }

    public function test_journalist_can_create_an_owned_schedule_but_cannot_publish_immediately_or_backdate_it(): void
    {
        $this->freezeTime();
        Rubrique::create(['slug' => 'culture', 'label' => 'Culture']);
        $user = User::factory()->create(['role' => 'journaliste', 'status' => 'actif']);
        $other = User::factory()->create(['role' => 'journaliste', 'status' => 'actif']);
        $item = ['id' => 'programme-journaliste', 'title' => 'Article programmé par son auteur', 'rub' => 'culture',
            'status' => 'programme', 'date' => now()->addHour()->toIso8601String(), 'body' => ['Texte conservé'],
            'author' => $other->name, 'userId' => 'u'.$other->id];
        $this->actingAs($user)->postJson('/admin/api/state', ['protocol' => 2, 'revisions' => [], 'articles' => [$item]])->assertOk();
        $article = Article::where('slug', $item['id'])->firstOrFail();
        $this->assertSame($user->id, $article->user_id);
        $this->assertSame($user->name, $article->author_name);
        foreach ([null, now()->subMinute()->toIso8601String()] as $date) {
            $item['id'] = 'date-invalide';
            $item['date'] = $date;
            $this->postJson('/admin/api/state', ['protocol' => 2, 'revisions' => [], 'articles' => [$item]])->assertStatus(422);
        }
        $item['id'] = 'publication-immediate';
        $item['status'] = 'publie';
        $this->postJson('/admin/api/state', ['protocol' => 2, 'revisions' => [], 'articles' => [$item]])->assertForbidden();
        $this->assertDatabaseCount('articles', 1);
        $this->actingAs($other)->postJson('/admin/api/state', ['protocol' => 2, 'revisions' => [], 'articles' => [[
            ...$item, 'id' => $article->slug, 'status' => 'programme', 'date' => now()->addHour()->toIso8601String(),
            'baseUpdated' => $article->updated_at->toIso8601String(),
        ]]])->assertForbidden();
    }

    public function test_journalist_schedule_stays_owned_and_public_after_the_deadline_and_can_be_edited(): void
    {
        $this->freezeTime();
        $user = User::factory()->create(['role' => 'journaliste', 'status' => 'actif']);
        $article = $this->articleFixture();
        $article->update(['user_id' => $user->id, 'author_name' => $user->name, 'status' => 'brouillon']);
        $due = now()->addMinutes(2)->startOfSecond();
        $item = $this->actingAs($user)->getJson('/admin/api/state')->assertOk()->json('articles.0');
        $item['baseUpdated'] = $item['updated'];
        $item['status'] = 'programme';
        $item['date'] = $due->copy()->setTimezone('+02:00')->toIso8601String();
        $this->postJson('/admin/api/state', ['protocol' => 2, 'revisions' => [], 'articles' => [$item]])->assertOk();
        $this->assertTrue($due->equalTo($article->fresh()->published_at));
        $this->get('/article/'.$article->slug)->assertNotFound();
        $this->travelTo($due);
        $this->get('/article/'.$article->slug)->assertOk();
        $this->get('/')->assertOk()->assertSee($article->slug, false);
        $this->get('/rubrique/culture')->assertOk()->assertSee($article->slug, false);
        $this->get('/recherche?q=Article')->assertOk()->assertSee($article->slug, false);
        $this->getJson('/admin/api/articles')->assertOk()->assertJsonPath('0.id', $article->slug);
        $item = $this->getJson('/admin/api/state')->assertOk()->json('articles.0');
        $item['baseUpdated'] = $item['updated'];
        $item['title'] = 'Titre corrigé après la publication automatique';
        $this->postJson('/admin/api/state', ['protocol' => 2, 'revisions' => [], 'articles' => [$item]])->assertOk();
        $this->assertTrue(Article::published()->whereKey($article->id)->exists());
        $this->assertSame(['Texte conservé'], $article->fresh()->body);
        $this->assertSame($user->id, $article->fresh()->user_id);
        $item['baseUpdated'] = $article->fresh()->updated_at->toIso8601String();
        $item['date'] = $due->copy()->subDay()->toIso8601String();
        $this->postJson('/admin/api/state', ['protocol' => 2, 'revisions' => [], 'articles' => [$item]])->assertStatus(422);
    }

    public function test_approved_schedule_remains_in_journalist_admin_and_goes_public_at_the_exact_due_time(): void
    {
        $this->freezeTime();
        $journalist = User::factory()->create(['role' => 'journaliste', 'status' => 'actif']);
        $chief = User::factory()->create(['role' => 'chef', 'status' => 'actif']);
        $article = $this->articleFixture();
        $article->update(['user_id' => $journalist->id, 'author_name' => $journalist->name, 'status' => 'relecture']);
        $due = now()->addMinutes(5)->startOfSecond();
        $item = $this->actingAs($chief)->getJson('/admin/api/state')->assertOk()->json('articles.0');
        $item['baseUpdated'] = $item['updated'];
        $item['status'] = 'programme';
        $item['date'] = $due->toIso8601String();
        $this->postJson('/admin/api/state', ['protocol' => 2, 'revisions' => [], 'articles' => [$item]])->assertOk();
        $this->actingAs($journalist)->getJson('/admin/api/articles')->assertOk()->assertJsonPath('0.id', $article->slug);
        $this->get('/article/'.$article->slug)->assertNotFound();
        $this->travelTo($due);
        $this->get('/article/'.$article->slug)->assertOk();
        $this->getJson('/admin/api/articles')->assertOk()->assertJsonPath('0.id', $article->slug);
        $this->assertSame('programme', $article->fresh()->status);
        $this->assertSame(['Texte conservé'], $article->fresh()->body);
        $this->assertSame($journalist->id, $article->fresh()->user_id);
    }

    public function test_scheduled_article_is_visible_when_due_without_database_rewrite(): void
    {
        $article = $this->articleFixture();
        $article->update(['status' => 'programme', 'published_at' => now()->subMinute()]);
        $this->assertTrue(Article::published()->whereKey($article->id)->exists());
        $this->assertSame('programme', $article->fresh()->status);
        $article->update(['published_at' => now()->addDay()]);
        $this->assertFalse(Article::published()->whereKey($article->id)->exists());
    }

    public function test_journalists_only_receive_their_articles_and_not_private_admin_data(): void
    {
        $user = User::factory()->create(['role' => 'journaliste', 'status' => 'actif']);
        $article = $this->articleFixture();
        $article->update(['user_id' => $user->id, 'author_name' => $user->name]);
        Article::create(['slug' => 'autre-article', 'title' => 'Autre auteur', 'rubrique_slug' => 'culture', 'status' => 'brouillon']);
        $state = $this->actingAs($user)->getJson('/admin/api/state')->assertOk()->json();
        $this->assertCount(1, $state['articles']);
        $this->assertSame([], $state['sessions']);
        $this->assertSame([], $state['subscribers']);
        $item = $state['articles'][0];
        $item['baseUpdated'] = $item['updated'];
        $this->postJson('/admin/api/state', ['protocol' => 2, 'articles' => [$item], 'revisions' => []])->assertForbidden();
        $item['status'] = 'relecture';
        $this->postJson('/admin/api/state', ['protocol' => 2, 'articles' => [$item], 'revisions' => []])->assertOk();
    }

    public function test_user_removal_is_refused_and_account_is_preserved(): void
    {
        $user = User::factory()->create(['role' => 'admin', 'status' => 'actif']);
        $other = User::factory()->create(['role' => 'journaliste', 'status' => 'actif']);
        $state = $this->actingAs($user)->getJson('/admin/api/state')->assertOk()->json();
        $this->postJson('/admin/api/state', ['protocol' => 2, 'users' => [$state['users'][0]],
            'revisions' => ['users' => $state['revisions']['users']]])->assertStatus(422);
        $this->assertDatabaseHas('users', ['id' => $other->id]);
    }

    public function test_team_counts_are_by_identity_and_logins_are_not_limited_to_300_events(): void
    {
        $user = User::factory()->create(['name' => 'Ancien nom', 'role' => 'admin', 'status' => 'actif']);
        $article = $this->articleFixture();
        $article->update(['user_id' => $user->id, 'author_name' => 'Ancien nom', 'published_at' => now()]);
        $user->update(['name' => 'Nouveau nom']);
        $events = array_fill(0, 305, ['user_id' => $user->id, 'event' => 'connexion', 'created_at' => now()]);
        DB::table('user_events')->insert($events);
        $state = $this->actingAs($user)->getJson('/admin/api/state')->assertOk()->json();
        $this->assertSame(1, $state['teamStats']['u'.$user->id]['total']);
        $this->assertSame(1, $state['teamStats']['u'.$user->id]['today']);
        $this->assertSame(305, $state['teamStats']['u'.$user->id]['logins']);
        $this->assertSame('Ancien nom', $article->fresh()->author_name);
    }

    public function test_admin_and_public_share_preserved_formatting_without_rewriting_legacy_html(): void
    {
        $user = User::factory()->create(['role' => 'admin', 'status' => 'actif']);
        $article = $this->articleFixture();
        $html = "<p style=\"text-align:justify\"><span style=\"white-space:pre-wrap;font-weight:700\">Premier\n\nSecond</span></p>";
        $article->update(['body' => [$html]]);
        $before = $article->fresh()->getRawOriginal();
        $body = $this->actingAs($user)->getJson('/admin/api/article/'.$article->slug)->assertOk()->json('body');
        $this->assertSame($article->fresh()->toPublicArray()['body'], $body);
        $this->assertSame(2, substr_count($body[0], '<br'));
        $this->assertStringContainsString('<strong>', $body[0]);
        $this->assertStringContainsString('align="justify"', $body[0]);
        $this->assertStringNotContainsString('style=', $body[0]);
        $this->assertSame($before, $article->fresh()->getRawOriginal());
    }

    public function test_public_rendering_does_not_modify_stored_html_or_editorial_timestamp(): void
    {
        $article = $this->articleFixture();
        $html = '<p style="font-family:Georgia">Texte à conserver</p><script>alert(1)</script>';
        $article->update(['body' => [$html]]);
        $before = $article->fresh()->updated_at->toIso8601String();
        $this->get('/article/article-test')->assertOk();
        $this->assertSame([$html], $article->fresh()->body);
        $this->assertSame($before, $article->fresh()->updated_at->toIso8601String());
        $this->assertStringNotContainsString('<script', $article->toPublicArray()['body'][0]);
    }

    public function test_redirect_chains_resolve_to_published_article(): void
    {
        $this->articleFixture();
        DB::table('slug_redirects')->insert([
            ['old_slug' => 'ancienne-url', 'new_slug' => 'intermediaire'],
            ['old_slug' => 'intermediaire', 'new_slug' => 'article-test'],
        ]);
        $this->get('/article/ancienne-url')->assertStatus(301)->assertRedirect('/article/article-test');
    }

    public function test_inactive_accounts_cannot_open_admin(): void
    {
        $user = User::factory()->create(['role' => 'admin', 'status' => 'invite']);
        $this->actingAs($user)->get('/admin')->assertForbidden();
    }
}
