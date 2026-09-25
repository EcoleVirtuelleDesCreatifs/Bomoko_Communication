<?php

namespace Tests\Feature\Admin;

use App\Models\MenuItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MenuItemTest extends TestCase
{
    use RefreshDatabase;

    private function adminUser(): User
    {
        return User::factory()->admin()->create();
    }

    public function test_admin_can_view_menu_items(): void
    {
        $admin = $this->adminUser();
        MenuItem::factory()->count(3)->create();

        $response = $this->actingAs($admin)->get(route('admin.menu.index'));

        $response->assertOk()
            ->assertSee('La Carte', false);
    }

    public function test_admin_can_create_a_menu_item(): void
    {
        $admin = $this->adminUser();

        $response = $this->actingAs($admin)->post(route('admin.menu.store'), [
            'name' => 'Carpaccio',
            'description' => 'Saumon, huile d’olive',
            'price' => 8500,
            'category' => MenuItem::CATEGORY_STARTERS,
            'sort_order' => 10,
            'is_active' => true,
        ]);

        $response->assertRedirect(route('admin.menu.index'))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('menu_items', [
            'name' => 'Carpaccio',
            'price' => 8500,
            'category' => MenuItem::CATEGORY_STARTERS,
        ]);
    }

    public function test_admin_can_create_a_menu_item_with_price_note_and_no_price(): void
    {
        $admin = $this->adminUser();

        $response = $this->actingAs($admin)->post(route('admin.menu.store'), [
            'name' => 'Homard entier',
            'description' => 'Selon arrivage',
            'price_note' => 'Prix selon le poids',
            'category' => MenuItem::CATEGORY_MAINS,
            'is_active' => true,
        ]);

        $response->assertRedirect(route('admin.menu.index'))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('menu_items', [
            'name' => 'Homard entier',
            'price' => null,
            'price_note' => 'Prix selon le poids',
        ]);
    }

    public function test_menu_item_requires_price_or_price_note(): void
    {
        $admin = $this->adminUser();

        $response = $this->actingAs($admin)->post(route('admin.menu.store'), [
            'name' => 'Plat sans prix',
            'category' => MenuItem::CATEGORY_MAINS,
        ]);

        $response->assertSessionHasErrors('price');
    }

    public function test_admin_can_update_a_menu_item(): void
    {
        $admin = $this->adminUser();
        $item = MenuItem::factory()->create();

        $response = $this->actingAs($admin)->put(route('admin.menu.update', $item), [
            'name' => 'Nom mis à jour',
            'description' => $item->description,
            'price' => 12000,
            'category' => MenuItem::CATEGORY_MAINS,
            'sort_order' => 5,
            'is_active' => true,
        ]);

        $response->assertRedirect(route('admin.menu.index'));

        $this->assertDatabaseHas('menu_items', [
            'id' => $item->id,
            'name' => 'Nom mis à jour',
            'price' => 12000,
        ]);
    }

    public function test_admin_can_delete_a_menu_item(): void
    {
        $admin = $this->adminUser();
        $item = MenuItem::factory()->create();

        $response = $this->actingAs($admin)->delete(route('admin.menu.destroy', $item));

        $response->assertRedirect(route('admin.menu.index'));
        $this->assertDatabaseMissing('menu_items', ['id' => $item->id]);
    }

    public function test_guest_cannot_access_menu_management(): void
    {
        $response = $this->get(route('admin.menu.index'));

        $response->assertRedirect(route('admin.login'));
    }
}
