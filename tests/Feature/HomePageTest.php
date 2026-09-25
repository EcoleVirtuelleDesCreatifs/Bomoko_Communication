<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HomePageTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_page_renders_restaurant_content(): void
    {
        $response = $this->get(route('home'));

        $response->assertOk()
            ->assertSee('Entrez dans', false)
            ->assertSee('Menu du Restaurant', false)
            ->assertSee('id="la-carte"', false)
            ->assertSee('id="contact"', false)
            ->assertSee('id="reservation"', false)
            ->assertSee('Infos pratiques', false)
            ->assertSee(config('site.phone'), false)
            ->assertSee('<picture', false)
            ->assertSee('srcset', false)
            ->assertSee('.webp', false)
            ->assertSee('rel="preload"', false)
            ->assertSee('mobile-cta', false)
            ->assertSee('map-facade', false)
            ->assertDontSee('<iframe', false)
            ->assertDontSee('[RESERVATION_URL]', false);
    }

    public function test_home_sections_follow_the_client_journey_order(): void
    {
        $content = $this->get(route('home'))->getContent();

        $laCarte = strpos($content, 'id="la-carte"');
        $galerie = strpos($content, 'id="galerie"');
        $leCercle = strpos($content, 'id="le-cercle"');
        $contact = strpos($content, 'id="contact"');

        $this->assertNotFalse($laCarte);
        $this->assertNotFalse($galerie);
        $this->assertNotFalse($leCercle);
        $this->assertNotFalse($contact);

        $this->assertLessThan($galerie, $laCarte);
        $this->assertLessThan($leCercle, $galerie);
        $this->assertLessThan($contact, $leCercle);
    }

    public function test_reservation_route_displays_booking_form(): void
    {
        $response = $this->get(route('reservation'));

        $response->assertOk()
            ->assertSee('Réservez votre table', false)
            ->assertSee('Envoyer la demande', false);
    }
}
