<?php

namespace Tests\Feature;

use App\Models\Event;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EventPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_events_index_shows_published_events(): void
    {
        $published = Event::factory()->create(['title' => 'Soirée jazz au Cercle']);

        $response = $this->get(route('events.index'));

        $response->assertOk()
            ->assertSee('Soirée jazz au Cercle', false);
    }

    public function test_events_index_hides_unpublished_events(): void
    {
        Event::factory()->create([
            'title' => 'Événement confidentiel',
            'is_published' => false,
            'published_at' => null,
        ]);

        $response = $this->get(route('events.index'));

        $response->assertOk()
            ->assertDontSee('Événement confidentiel', false);
    }

    public function test_event_show_renders_published_event(): void
    {
        $event = Event::factory()->create(['title' => 'Dîner de gala']);

        $response = $this->get(route('events.show', $event));

        $response->assertOk()
            ->assertSee('Dîner de gala', false);
    }

    public function test_event_show_returns_404_for_draft(): void
    {
        $event = Event::factory()->create([
            'is_published' => false,
            'published_at' => null,
        ]);

        $this->get(route('events.show', $event))->assertNotFound();
    }

    public function test_event_show_contains_event_json_ld(): void
    {
        $event = Event::factory()->create();

        $response = $this->get(route('events.show', $event));

        $response->assertOk()
            ->assertSee('application/ld+json', false)
            ->assertSee('"@type":"Event"', false)
            ->assertSee('"@type":"BreadcrumbList"', false)
            ->assertSee('"@type":"NewsArticle"', false);
    }

    public function test_event_show_displays_meta_and_share(): void
    {
        $event = Event::factory()->create();

        $this->get(route('events.show', $event))
            ->assertOk()
            ->assertSee('Publié le', false)
            ->assertSee('Partager', false)
            ->assertSee('article-meta', false)
            ->assertSee('article-lead', false);
    }

    public function test_event_show_lists_related_events(): void
    {
        $event = Event::factory()->create(['title' => 'Événement principal']);
        Event::factory()->create(['title' => 'Soirée jazz au jardin']);
        Event::factory()->create(['title' => 'Dégustation de vins']);

        $this->get(route('events.show', $event))
            ->assertOk()
            ->assertSee('À lire aussi', false)
            ->assertSee('Soirée jazz au jardin', false)
            ->assertSee('Dégustation de vins', false);
    }

    public function test_event_show_handles_single_paragraph_content(): void
    {
        $event = Event::factory()->create(['content' => 'Un seul paragraphe.']);

        $this->get(route('events.show', $event))
            ->assertOk()
            ->assertSee('Un seul paragraphe.', false);
    }
}
