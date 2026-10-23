<?php

namespace Tests\Feature;

use App\Enums\AdminPermission;
use App\Mail\NewReservationAdminNotification;
use App\Mail\ReservationReceived;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ReservationTest extends TestCase
{
    use RefreshDatabase;

    public function test_reservation_form_can_be_submitted(): void
    {
        Mail::fake();

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
        Mail::assertSent(ReservationReceived::class, fn (ReservationReceived $mail) => $mail->hasTo('jean@example.com'));
    }

    public function test_authorized_active_admins_receive_new_reservation_notifications(): void
    {
        Mail::fake();
        $superAdmin = User::factory()->superAdmin()->create();
        $reservationManager = User::factory()->manager([AdminPermission::Reservations->value])->create();
        $menuManager = User::factory()->manager([AdminPermission::Menu->value])->create();
        $inactiveManager = User::factory()->manager([AdminPermission::Reservations->value])->create(['is_active' => false]);

        $this->post(route('reservation.store'), [
            'name' => 'Marie Martin',
            'email' => 'marie@example.com',
            'date' => now()->addDay()->format('Y-m-d'),
            'time' => '19:30',
            'guests' => 3,
        ])->assertRedirect(route('reservation'));

        Mail::assertSent(NewReservationAdminNotification::class, fn (NewReservationAdminNotification $mail) => $mail->hasTo($superAdmin->email));
        Mail::assertSent(NewReservationAdminNotification::class, fn (NewReservationAdminNotification $mail) => $mail->hasTo($reservationManager->email));
        Mail::assertNotSent(NewReservationAdminNotification::class, fn (NewReservationAdminNotification $mail) => $mail->hasTo($menuManager->email));
        Mail::assertNotSent(NewReservationAdminNotification::class, fn (NewReservationAdminNotification $mail) => $mail->hasTo($inactiveManager->email));
    }

    public function test_reservation_received_email_contains_the_submitted_details(): void
    {
        $reservation = Reservation::factory()->create([
            'name' => 'Jean Dupont',
            'date' => '2026-10-15',
            'time' => '20:00',
            'guests' => 4,
            'menu_choice' => Reservation::MENU_DISCOVERY,
            'allergies' => 'Noix, gluten',
            'message' => 'Anniversaire',
        ]);

        $mail = new ReservationReceived($reservation);

        $mail->assertSeeInHtml('Jean Dupont')
            ->assertSeeInHtml('15 octobre 2026')
            ->assertSeeInHtml('20:00')
            ->assertSeeInHtml('Menu Découverte')
            ->assertSeeInHtml('Noix, gluten')
            ->assertSeeInHtml('Anniversaire')
            ->assertSeeInHtml('en attente de confirmation');
    }

    public function test_admin_notification_contains_reservation_details_and_action_link(): void
    {
        $reservation = Reservation::factory()->create([
            'name' => 'Marie Martin',
            'date' => '2026-10-20',
            'time' => '19:30',
            'guests' => 3,
            'allergies' => 'Crustacés',
        ]);

        $mail = new NewReservationAdminNotification($reservation);

        $mail->assertSeeInHtml('Marie Martin')
            ->assertSeeInHtml('20 octobre 2026')
            ->assertSeeInHtml('19:30')
            ->assertSeeInHtml('Crustacés')
            ->assertSeeInHtml(route('admin.reservations.edit', $reservation));
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
