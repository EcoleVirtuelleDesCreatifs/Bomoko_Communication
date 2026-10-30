<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MenuPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_menu_routes_redirect_to_the_digital_menu(): void
    {
        foreach (['menu', 'menu.tapas', 'menu.drinks', 'menu.cigares'] as $routeName) {
            $this->get(route($routeName))
                ->assertRedirect(url('/carte/'));
        }
    }

    public function test_site_links_point_to_the_digital_menu(): void
    {
        $this->get(route('home'))
            ->assertOk()
            ->assertSee(url('/carte/'), false);

        $this->get(route('reservation'))
            ->assertOk()
            ->assertSee(url('/carte/'), false);
    }
}
