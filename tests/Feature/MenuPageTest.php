<?php

namespace Tests\Feature;

use App\Models\MenuItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MenuPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_menu_page_displays_active_items(): void
    {
        $item = MenuItem::factory()->create([
            'name' => 'Tartare de Bœuf',
            'category' => MenuItem::CATEGORY_STARTERS,
            'is_active' => true,
        ]);

        $response = $this->get(route('menu'));

        $response->assertOk()
            ->assertSee('La carte', false)
            ->assertSee($item->name, false);
    }

    public function test_menu_page_displays_price_note_when_price_is_null(): void
    {
        MenuItem::factory()->create([
            'name' => 'Pièce du boucher',
            'price' => null,
            'price_note' => 'Prix selon le poids',
            'category' => MenuItem::CATEGORY_MAINS,
            'is_active' => true,
        ]);

        $this->get(route('menu'))
            ->assertOk()
            ->assertSee('Prix selon le poids', false);
    }

    public function test_menu_page_displays_section_titles(): void
    {
        MenuItem::factory()->create([
            'name' => 'Carpaccio',
            'section' => 'Les carpaccios',
            'category' => MenuItem::CATEGORY_STARTERS,
            'is_active' => true,
        ]);

        $this->get(route('menu'))
            ->assertOk()
            ->assertSee('Les carpaccios', false);
    }

    public function test_menu_page_hides_inactive_items(): void
    {
        MenuItem::factory()->create([
            'name' => 'Plat invisible',
            'category' => MenuItem::CATEGORY_MAINS,
            'is_active' => false,
        ]);

        $response = $this->get(route('menu'));

        $response->assertOk()
            ->assertDontSee('Plat invisible', false);
    }

    public function test_main_menu_page_excludes_beverage_items(): void
    {
        MenuItem::factory()->create([
            'name' => 'Fondant au chocolat',
            'category' => MenuItem::CATEGORY_DESSERTS,
        ]);
        MenuItem::factory()->create([
            'name' => 'Glenmorangie Original 10 ans',
            'category' => MenuItem::CATEGORY_WHISKIES,
        ]);

        $this->get(route('menu'))
            ->assertOk()
            ->assertSee('Fondant au chocolat', false)
            ->assertDontSee('Glenmorangie', false);
    }

    public function test_tapas_page_displays_only_tapas_items(): void
    {
        MenuItem::factory()->create([
            'name' => 'Croustillants de mozzarella',
            'category' => MenuItem::CATEGORY_TAPAS,
        ]);
        MenuItem::factory()->create([
            'name' => 'Fondant au chocolat',
            'category' => MenuItem::CATEGORY_DESSERTS,
        ]);

        $this->get(route('menu.tapas'))
            ->assertOk()
            ->assertSee('La carte à tapas.')
            ->assertSee('En terrasse uniquement')
            ->assertSee('Croustillants de mozzarella', false)
            ->assertDontSee('Fondant au chocolat', false);
    }

    public function test_drinks_page_displays_only_beverage_items(): void
    {
        MenuItem::factory()->create([
            'name' => 'Glenmorangie Original 10 ans',
            'category' => MenuItem::CATEGORY_WHISKIES,
        ]);
        MenuItem::factory()->create([
            'name' => 'Fondant au chocolat',
            'category' => MenuItem::CATEGORY_DESSERTS,
        ]);

        $this->get(route('menu.drinks'))
            ->assertOk()
            ->assertSee('La carte des boissons.')
            ->assertSee('Glenmorangie Original 10 ans', false)
            ->assertDontSee('Fondant au chocolat', false);
    }

    public function test_cigares_page_displays_cigar_table(): void
    {
        MenuItem::factory()->create([
            'name' => 'H. Upmann — Coronas Major',
            'description' => 'Corona (AT) · Cuba',
            'category' => MenuItem::CATEGORY_CIGARES,
            'price' => 20000,
        ]);
        MenuItem::factory()->create([
            'name' => 'Fondant au chocolat',
            'category' => MenuItem::CATEGORY_DESSERTS,
        ]);

        $this->get(route('menu.cigares'))
            ->assertOk()
            ->assertSee('La cave à cigares.')
            ->assertSee('H. Upmann — Coronas Major', false)
            ->assertSee('Corona (AT) · Cuba', false)
            ->assertSee('20 000 FCFA')
            ->assertDontSee('Fondant au chocolat', false);
    }

    public function test_menu_pages_expose_the_four_menu_selector(): void
    {
        foreach (['menu', 'menu.tapas', 'menu.drinks', 'menu.cigares'] as $routeName) {
            $this->get(route($routeName))
                ->assertOk()
                ->assertSee('aria-current="page"', false)
                ->assertSee(route('menu'), false)
                ->assertSee(route('menu.tapas'), false)
                ->assertSee(route('menu.drinks'), false)
                ->assertSee(route('menu.cigares'), false);
        }
    }

    public function test_drinks_page_displays_bottle_and_glass_prices(): void
    {
        MenuItem::factory()->create([
            'name' => 'Château test',
            'category' => MenuItem::CATEGORY_RED_WINES,
            'price' => 80000,
            'price_glass' => 8000,
        ]);

        $this->get(route('menu.drinks'))
            ->assertOk()
            ->assertSeeInOrder(['Bouteille 80 000 FCFA', 'Verre 8 000 FCFA']);
    }

    public function test_drinks_page_displays_glass_only_price(): void
    {
        MenuItem::factory()->create([
            'name' => 'Verre test',
            'category' => MenuItem::CATEGORY_COCKTAILS,
            'price' => null,
            'price_glass' => 45000,
        ]);

        $this->get(route('menu.drinks'))
            ->assertOk()
            ->assertSee('Verre 45 000 FCFA', false);
    }
}
