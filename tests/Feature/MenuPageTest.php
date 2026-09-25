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
}
