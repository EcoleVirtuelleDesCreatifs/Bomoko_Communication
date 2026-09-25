<?php

namespace Tests\Feature\Admin;

use App\Mail\ReservationConfirmed;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    private function adminUser(): User
    {
        return User::factory()->admin()->create([
            'email' => 'admin@lecercle.ci',
        ]);
    }

    public function test_guest_is_redirected_from_dashboard_to_login(): void
    {
        $response = $this->get(route('admin.dashboard'));

        $response->assertRedirect(route('admin.login'));
    }

    public function test_non_admin_user_cannot_access_dashboard(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)->get(route('admin.dashboard'));

        $response->assertRedirect(route('admin.login'));
    }

    public function test_admin_can_view_dashboard_with_reservations(): void
    {
        $admin = $this->adminUser();
        Reservation::factory()->count(3)->create();

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response->assertOk()
            ->assertSee('Tableau de bord', false)
            ->assertSee('Réservations', false);
    }

    public function test_admin_can_edit_a_reservation(): void
    {
        $admin = $this->adminUser();
        $reservation = Reservation::factory()->create([
            'name' => 'Jean Dupont',
            'guests' => 2,
        ]);

        $response = $this->actingAs($admin)->put(route('admin.reservations.update', $reservation), [
            'name' => 'Marie Martin',
            'email' => $reservation->email,
            'phone' => $reservation->phone,
            'date' => $reservation->date->format('Y-m-d'),
            'time' => $reservation->time,
            'guests' => 6,
            'status' => Reservation::STATUS_PENDING,
        ]);

        $response->assertRedirect(route('admin.dashboard'))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('reservations', [
            'id' => $reservation->id,
            'name' => 'Marie Martin',
            'guests' => 6,
        ]);
    }

    public function test_confirmation_email_is_sent_when_status_becomes_confirmed(): void
    {
        Mail::fake();
        $admin = $this->adminUser();
        $reservation = Reservation::factory()->create(['status' => Reservation::STATUS_PENDING]);

        $response = $this->actingAs($admin)->put(route('admin.reservations.update', $reservation), [
            'name' => $reservation->name,
            'email' => $reservation->email,
            'phone' => $reservation->phone,
            'date' => $reservation->date->format('Y-m-d'),
            'time' => $reservation->time,
            'guests' => $reservation->guests,
            'status' => Reservation::STATUS_CONFIRMED,
        ]);

        $response->assertRedirect(route('admin.dashboard'));
        Mail::assertSent(ReservationConfirmed::class, fn ($mail) => $mail->hasTo($reservation->email));
    }

    public function test_no_confirmation_email_is_sent_when_status_stays_pending(): void
    {
        Mail::fake();
        $admin = $this->adminUser();
        $reservation = Reservation::factory()->create(['status' => Reservation::STATUS_PENDING]);

        $this->actingAs($admin)->put(route('admin.reservations.update', $reservation), [
            'name' => 'Nouveau nom',
            'email' => $reservation->email,
            'phone' => $reservation->phone,
            'date' => $reservation->date->format('Y-m-d'),
            'time' => $reservation->time,
            'guests' => $reservation->guests,
            'status' => Reservation::STATUS_PENDING,
        ]);

        Mail::assertNothingSent();
    }

    public function test_admin_login_accepts_valid_credentials(): void
    {
        $this->adminUser();

        $response = $this->post(route('admin.login.store'), [
            'email' => 'admin@lecercle.ci',
            'password' => 'password',
        ]);

        $response->assertRedirect(route('admin.dashboard'));
        $this->assertAuthenticated();
    }

    public function test_admin_login_rejects_invalid_credentials(): void
    {
        $this->adminUser();

        $response = $this->post(route('admin.login.store'), [
            'email' => 'admin@lecercle.ci',
            'password' => 'wrong-password',
        ]);

        $response->assertRedirect()
            ->assertSessionHasErrors(['email']);
        $this->assertGuest();
    }
}
