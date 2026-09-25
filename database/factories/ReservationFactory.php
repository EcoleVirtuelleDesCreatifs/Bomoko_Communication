<?php

namespace Database\Factories;

use App\Models\Reservation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Reservation>
 */
class ReservationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'date' => fake()->dateTimeBetween('now', '+1 month')->format('Y-m-d'),
            'time' => fake()->time('H:i'),
            'guests' => fake()->numberBetween(1, 12),
            'message' => fake()->optional()->sentence(),
            'status' => fake()->randomElement([
                Reservation::STATUS_PENDING,
                Reservation::STATUS_CONFIRMED,
                Reservation::STATUS_CANCELLED,
            ]),
        ];
    }
}
