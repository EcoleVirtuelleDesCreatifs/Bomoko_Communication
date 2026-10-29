<?php

use App\Models\MenuItem;
use Database\Seeders\MenuItemSeeder;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Insère les cartes « L’Esprit Terrasse » et « Vins & Boissons » si elles
     * ne sont pas déjà présentes (sans toucher aux éléments existants).
     */
    public function up(): void
    {
        $categories = array_keys(array_merge(
            MenuItem::categoriesForMenu(MenuItem::MENU_TAPAS),
            MenuItem::categoriesForMenu(MenuItem::MENU_BOISSONS),
        ));

        if (MenuItem::whereIn('category', $categories)->exists()) {
            return;
        }

        $sortOrder = (int) (MenuItem::max('sort_order') ?? 0);

        (new MenuItemSeeder)->seedFromDefinitions(
            require database_path('seeders/data/tapas_and_drinks.php'),
            $sortOrder
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $categories = array_keys(array_merge(
            MenuItem::categoriesForMenu(MenuItem::MENU_TAPAS),
            MenuItem::categoriesForMenu(MenuItem::MENU_BOISSONS),
        ));

        MenuItem::whereIn('category', $categories)->delete();
    }
};
