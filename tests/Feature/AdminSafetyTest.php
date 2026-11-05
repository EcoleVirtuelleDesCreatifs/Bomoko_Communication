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

    public function test_authenticated_admin_never_initially_displays_the_login_form(): void
    {
        $user = User::factory()->create(['role' => 'admin', 'status' => 'actif']);
        $response = $this->actingAs($user)->get('/admin')->assertOk();
        $response->assertSee('id="login" hidden', false);
        $response->assertSee('id="adminLoading"', false);
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
