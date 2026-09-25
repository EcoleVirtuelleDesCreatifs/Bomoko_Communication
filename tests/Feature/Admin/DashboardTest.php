<?php

namespace Tests\Feature\Admin;

use App\Enums\AdminPermission;
use App\Mail\ReservationConfirmed;
use App\Models\Event;
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
            ->assertSee('Bonjour', false)
            ->assertSee('Toutes les réservations', false);
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

    public function test_dashboard_kpis_reflect_reservations(): void
    {
        $admin = $this->adminUser();

        Reservation::factory()->create(['status' => Reservation::STATUS_CONFIRMED, 'date' => now()->toDateString(), 'guests' => 4]);
        Reservation::factory()->create(['status' => Reservation::STATUS_PENDING, 'date' => now()->addDay()->toDateString()]);
        Reservation::factory()->create(['status' => Reservation::STATUS_PENDING, 'date' => now()->subDay()->toDateString()]);
        Reservation::factory()->create(['status' => Reservation::STATUS_CONFIRMED, 'date' => now()->addDays(3)->toDateString()]);
        Reservation::factory()->create(['status' => Reservation::STATUS_CANCELLED, 'date' => now()->addDays(5)->toDateString()]);

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response->assertOk()
            ->assertSeeInOrder(['stat-value', '1', 'Aujourd', '4 couverts'], false)
            ->assertSeeInOrder(['stat-value', '1', 'À traiter'], false)
            ->assertSeeInOrder(['stat-value', '1', '7 prochains jours'], false)
            ->assertSeeInOrder(['stat-value', '5', 'Ce mois', '1 annulées'], false);
    }

    public function test_dashboard_filters_reservations_by_status(): void
    {
        $admin = $this->adminUser();

        Reservation::factory()->create(['name' => 'EnAttente Unique', 'status' => Reservation::STATUS_PENDING, 'date' => now()->addDay()->toDateString()]);
        Reservation::factory()->create(['name' => 'Confirmee Unique', 'status' => Reservation::STATUS_CONFIRMED, 'date' => now()->addDay()->toDateString()]);

        $response = $this->actingAs($admin)->get(route('admin.dashboard', ['status' => 'pending']));

        $response->assertOk()
            ->assertSee('EnAttente Unique')
            ->assertDontSee('Confirmee Unique');
    }

    public function test_dashboard_search_matches_name(): void
    {
        $admin = $this->adminUser();

        Reservation::factory()->create(['name' => 'Recherche Trouve', 'status' => Reservation::STATUS_CONFIRMED, 'date' => now()->addDay()->toDateString()]);
        Reservation::factory()->create(['name' => 'Autre Personne', 'status' => Reservation::STATUS_CONFIRMED, 'date' => now()->addDays(2)->toDateString()]);

        $response = $this->actingAs($admin)->get(route('admin.dashboard', ['q' => 'Recherche']));

        $response->assertOk()
            ->assertSee('Recherche Trouve')
            ->assertDontSee('Autre Personne');
    }

    public function test_status_patch_to_confirmed_sends_email(): void
    {
        Mail::fake();
        $admin = $this->adminUser();
        $reservation = Reservation::factory()->create(['status' => Reservation::STATUS_PENDING]);

        $response = $this->actingAs($admin)->patch(route('admin.reservations.status', $reservation), [
            'status' => Reservation::STATUS_CONFIRMED,
        ]);

        $response->assertRedirect(route('admin.dashboard'))
            ->assertSessionHas('success');

        $this->assertSame(Reservation::STATUS_CONFIRMED, $reservation->fresh()->status);
        Mail::assertSent(ReservationConfirmed::class, fn ($mail) => $mail->hasTo($reservation->email));
    }

    public function test_status_patch_with_invalid_status_fails(): void
    {
        $admin = $this->adminUser();
        $reservation = Reservation::factory()->create();

        $response = $this->actingAs($admin)->patch(route('admin.reservations.status', $reservation), [
            'status' => 'invalide',
        ]);

        $response->assertSessionHasErrors('status');
    }

    public function test_manager_without_reservations_permission_gets_403_on_status_patch(): void
    {
        $manager = User::factory()->manager([AdminPermission::Menu->value])->create();
        $reservation = Reservation::factory()->create(['status' => Reservation::STATUS_PENDING]);

        $response = $this->actingAs($manager)->patch(route('admin.reservations.status', $reservation), [
            'status' => Reservation::STATUS_CONFIRMED,
        ]);

        $response->assertForbidden();
    }

    public function test_manager_with_events_only_sees_events_widget_but_no_kpis(): void
    {
        $manager = User::factory()->manager([AdminPermission::Events->value])->create();
        Event::factory()->create(['is_published' => true, 'title' => 'Widget Événement']);

        $response = $this->actingAs($manager)->get(route('admin.dashboard'));

        $response->assertOk()
            ->assertDontSee('stat-card', false)
            ->assertSee('widget-card', false)
            ->assertSee('Widget Événement');
    }
}
