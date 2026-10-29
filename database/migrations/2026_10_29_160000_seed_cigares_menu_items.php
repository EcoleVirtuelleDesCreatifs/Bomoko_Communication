<?php

use App\Models\MenuItem;
use Database\Seeders\MenuItemSeeder;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Insère la carte « La Cave à Cigares » si elle n'est pas déjà présente
     * (sans toucher aux éléments existants).
     */
    public function up(): void
    {
        $categories = array_keys(MenuItem::categoriesForMenu(MenuItem::MENU_CIGARES));

        if (MenuItem::whereIn('category', $categories)->exists()) {
            return;
        }

        $sortOrder = (int) (MenuItem::max('sort_order') ?? 0);

        (new MenuItemSeeder)->seedFromDefinitions(
            require database_path('seeders/data/cigares.php'),
            $sortOrder
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        MenuItem::whereIn('category', array_keys(MenuItem::categoriesForMenu(MenuItem::MENU_CIGARES)))->delete();
    }
};
