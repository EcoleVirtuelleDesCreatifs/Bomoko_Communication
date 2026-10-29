<?php

namespace Tests\Feature;

use App\Models\MenuItem;
use Database\Seeders\MenuItemSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TapasAndDrinksSeederTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<string, array<string, list<array<int, mixed>>>>
     */
    private function definitions(): array
    {
        return require database_path('seeders/data/tapas_and_drinks.php');
    }

    private function definitionItemCount(): int
    {
        $count = 0;

        foreach ($this->definitions() as $sectionItems) {
            foreach ($sectionItems as $items) {
                $count += count($items);
            }
        }

        return $count;
    }

    public function test_data_file_contains_the_expected_number_of_items(): void
    {
        $this->assertSame(273, $this->definitionItemCount());
    }

    public function test_seeder_helper_inserts_all_definitions_with_glass_prices(): void
    {
        MenuItem::query()->delete();
        $sortOrder = 0;
        (new MenuItemSeeder)->seedFromDefinitions($this->definitions(), $sortOrder);

        $this->assertSame($this->definitionItemCount(), MenuItem::count());

        $item = MenuItem::whereNotNull('price_glass')->firstOrFail();
        $this->assertIsInt($item->price_glass);
    }

    public function test_data_migration_seeds_new_menus_without_touching_the_main_card(): void
    {
        // Simule une base de production déjà seedée avec la seule carte principale.
        MenuItem::query()->delete();
        MenuItem::factory()->create([
            'name' => 'Entrée existante',
            'category' => MenuItem::CATEGORY_STARTERS,
            'sort_order' => 10,
        ]);

        $carteItem = MenuItem::where('category', MenuItem::CATEGORY_STARTERS)->firstOrFail();
        $snapshot = $carteItem->only(['name', 'description', 'price', 'price_note', 'section', 'sort_order']);
        $carteCount = MenuItem::count();
        $maxSortOrder = (int) MenuItem::max('sort_order');

        $migration = require database_path('migrations/2026_10_29_115345_seed_tapas_and_drinks_menu_items.php');
        $migration->up();

        $this->assertSame($carteCount + $this->definitionItemCount(), MenuItem::count());
        $this->assertGreaterThan($maxSortOrder, MenuItem::where('category', MenuItem::CATEGORY_TAPAS)->min('sort_order'));
        $this->assertSame($snapshot, $carteItem->fresh()->only(array_keys($snapshot)));

        // Idempotent : ne duplique pas les nouvelles cartes si elles existent déjà.
        $migration->up();
        $this->assertSame($carteCount + $this->definitionItemCount(), MenuItem::count());
    }
}
