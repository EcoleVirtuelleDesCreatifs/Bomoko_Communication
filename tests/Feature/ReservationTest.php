<?php

namespace Tests\Feature;

use App\Models\Reservation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReservationTest extends TestCase
{
    use RefreshDatabase;

    public function test_reservation_form_can_be_submitted(): void
    {
        $response = $this->post(route('reservation.store'), [
            'name' => 'Jean Dupont',
            'email' => 'jean@example.com',
            'phone' => '+225 01 23 45 67',
            'date' => now()->addDay()->format('Y-m-d'),
            'time' => '20:00',
            'guests' => 4,
            'menu_choice' => Reservation::MENU_DISCOVERY,
            'allergies' => 'Noix, gluten',
            'message' => 'Anniversaire',
        ]);

        $response->assertRedirect(route('reservation'))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('reservations', [
            'name' => 'Jean Dupont',
            'email' => 'jean@example.com',
            'guests' => 4,
            'menu_choice' => Reservation::MENU_DISCOVERY,
            'allergies' => 'Noix, gluten',
            'status' => Reservation::STATUS_PENDING,
        ]);
    }

    public function test_reservation_requires_required_fields(): void
    {
        $response = $this->post(route('reservation.store'), []);

        $response->assertSessionHasErrors(['name', 'email', 'date', 'time', 'guests']);
    }

    public function test_reservation_rejects_past_dates(): void
    {
        $response = $this->post(route('reservation.store'), [
            'name' => 'Jean Dupont',
            'email' => 'jean@example.com',
            'date' => now()->subDay()->format('Y-m-d'),
            'time' => '20:00',
            'guests' => 2,
        ]);

        $response->assertSessionHasErrors(['date']);
    }
}
