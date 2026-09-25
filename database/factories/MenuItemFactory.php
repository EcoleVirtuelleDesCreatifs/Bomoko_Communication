<?php

namespace Database\Factories;

use App\Models\MenuItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MenuItem>
 */
class MenuItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'price' => fake()->numberBetween(2500, 15000),
            'price_note' => null,
            'section' => null,
            'category' => fake()->randomElement([
                MenuItem::CATEGORY_STARTERS,
                MenuItem::CATEGORY_MAINS,
                MenuItem::CATEGORY_DESSERTS,
                MenuItem::CATEGORY_DRINKS,
            ]),
            'sort_order' => fake()->numberBetween(0, 100),
            'is_active' => true,
        ];
    }
}
