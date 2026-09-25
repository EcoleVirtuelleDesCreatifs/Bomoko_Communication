<?php

namespace Tests\Feature;

use App\Models\Event;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeoTest extends TestCase
{
    use RefreshDatabase;

    public function test_robots_txt_allows_crawlers_and_references_sitemap(): void
    {
        $response = $this->get('/robots.txt');

        $response->assertOk()
            ->assertSee('GPTBot', false)
            ->assertSee('Sitemap:', false)
            ->assertSee('Disallow: /admin/', false);
    }

    public function test_sitemap_xml_contains_public_pages_and_events(): void
    {
        $event = Event::factory()->create();

        $response = $this->get('/sitemap.xml');

        $response->assertOk();
        $this->assertStringContainsString('text/xml', $response->headers->get('Content-Type'));

        $response->assertSee(route('menu'), false)
            ->assertSee(route('events.show', $event), false);
    }

    public function test_llms_txt_describes_the_restaurant(): void
    {
        $response = $this->get('/llms.txt');

        $response->assertOk()
            ->assertSee('# Le Cercle', false)
            ->assertSee('Deux Plateaux Vallons', false);
    }

    public function test_home_contains_restaurant_json_ld(): void
    {
        $response = $this->get(route('home'));

        $response->assertOk()
            ->assertSee('application/ld+json', false)
            ->assertSee('"@type":"Restaurant"', false);
    }
}
