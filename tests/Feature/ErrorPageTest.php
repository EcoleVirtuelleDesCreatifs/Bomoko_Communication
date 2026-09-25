<?php

namespace Tests\Feature;

use App\Models\Event;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class ErrorPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_unknown_url_renders_custom_404(): void
    {
        $response = $this->get('/url-inexistante');

        $response->assertStatus(404)
            ->assertSee('404', false)
            ->assertSee('Retour à l\'accueil', false)
            ->assertSee('noindex', false)
            ->assertSee('error-page', false);
    }

    public function test_unknown_event_slug_returns_custom_404(): void
    {
        $this->get('/evenements/slug-inexistant')
            ->assertStatus(404)
            ->assertSee('error-page', false);
    }

    public function test_unpublished_event_returns_404(): void
    {
        $event = Event::factory()->create([
            'is_published' => false,
            'published_at' => null,
        ]);

        $this->get(route('events.show', $event))->assertNotFound();
    }

    public function test_419_page_renders_expired_session(): void
    {
        Route::get('/_test-419', fn () => abort(419));

        $this->get('/_test-419')
            ->assertStatus(419)
            ->assertSee('Session expirée', false);
    }

    public function test_403_page_renders_access_denied(): void
    {
        Route::get('/_test-403', fn () => abort(403));

        $this->get('/_test-403')
            ->assertStatus(403)
            ->assertSee('Accès refusé', false);
    }

    public function test_429_page_renders_too_many_requests(): void
    {
        Route::get('/_test-429', fn () => abort(429));

        $this->get('/_test-429')
            ->assertStatus(429)
            ->assertSee('Trop de requêtes', false);
    }

    public function test_503_page_renders_maintenance(): void
    {
        Route::get('/_test-503', fn () => abort(503));

        $this->get('/_test-503')
            ->assertStatus(503)
            ->assertSee('maintenance', false);
    }

    public function test_500_page_renders_in_debug_off(): void
    {
        config(['app.debug' => false]);
        Route::get('/_test-500', function (): void {
            throw new \RuntimeException('boom');
        });

        $this->get('/_test-500')
            ->assertStatus(500)
            ->assertSee('Erreur', false);
    }
}
