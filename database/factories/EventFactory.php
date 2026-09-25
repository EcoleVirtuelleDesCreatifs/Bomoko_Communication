<?php

namespace Database\Factories;

use App\Models\Event;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Event>
 */
class EventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->sentence(4, true);

        return [
            'title' => $title,
            'slug' => str($title)->slug()->value(),
            'summary' => fake()->paragraph(2),
            'content' => fake()->paragraphs(5, true),
            'event_date' => fake()->dateTimeBetween('now', '+6 months'),
            'location' => 'Le Cercle — Deux Plateaux Vallons',
            'cover_image' => null,
            'is_published' => true,
            'published_at' => now(),
        ];
    }
}
