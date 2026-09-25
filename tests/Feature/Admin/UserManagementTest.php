<?php

namespace Tests\Feature\Admin;

use App\Enums\AdminPermission;
use App\Mail\AdminAccountCreated;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    private function superAdmin(): User
    {
        return User::factory()->superAdmin()->create();
    }

    public function test_super_admin_can_view_users_index(): void
    {
        $admin = $this->superAdmin();
        User::factory()->manager()->create(['name' => 'Gestionnaire Test']);

        $response = $this->actingAs($admin)->get(route('admin.users.index'));

        $response->assertOk()
            ->assertSee('Administrateurs')
            ->assertSee('Gestionnaire Test');
    }

    public function test_manager_cannot_access_users_management(): void
    {
        $manager = User::factory()->manager([AdminPermission::Menu->value])->create();

        $response = $this->actingAs($manager)->get(route('admin.users.index'));

        $response->assertForbidden();
    }

    public function test_super_admin_can_create_a_manager_with_permissions(): void
    {
        $admin = $this->superAdmin();

        $response = $this->actingAs($admin)->post(route('admin.users.store'), [
            'name' => 'Nouveau Gestionnaire',
            'email' => 'gestion@lecercle.ci',
            'role' => 'manager',
            'permissions' => [AdminPermission::Menu->value, AdminPermission::Events->value],
            'password' => 'motdepasse123',
            'password_confirmation' => 'motdepasse123',
            'is_active' => true,
        ]);

        $response->assertRedirect(route('admin.users.index'))
            ->assertSessionHas('success');

        $user = User::where('email', 'gestion@lecercle.ci')->firstOrFail();
        $this->assertTrue($user->isAdmin());
        $this->assertFalse($user->isSuperAdmin());
        $this->assertTrue($user->hasPermission(AdminPermission::Menu));
        $this->assertTrue($user->hasPermission(AdminPermission::Events));
        $this->assertFalse($user->hasPermission(AdminPermission::Reservations));
    }

    public function test_create_with_generate_password_and_send_credentials_sends_email(): void
    {
        Mail::fake();
        $admin = $this->superAdmin();

        $response = $this->actingAs($admin)->post(route('admin.users.store'), [
            'name' => 'Compte Généré',
            'email' => 'genere@lecercle.ci',
            'role' => 'manager',
            'permissions' => [AdminPermission::Reservations->value],
            'generate_password' => true,
            'send_credentials' => true,
            'is_active' => true,
        ]);

        $response->assertRedirect(route('admin.users.index'))
            ->assertSessionHas('success');

        Mail::assertSent(AdminAccountCreated::class, fn ($mail) => $mail->hasTo('genere@lecercle.ci'));
    }

    public function test_manager_without_menu_permission_gets_403_on_menu(): void
    {
        $manager = User::factory()->manager([AdminPermission::Events->value])->create();

        $response = $this->actingAs($manager)->get(route('admin.menu.index'));

        $response->assertForbidden();
    }

    public function test_manager_with_menu_permission_can_access_menu(): void
    {
        $manager = User::factory()->manager([AdminPermission::Menu->value])->create();

        $response = $this->actingAs($manager)->get(route('admin.menu.index'));

        $response->assertOk();
    }

    public function test_manager_with_events_only_sees_dashboard_without_menu_link(): void
    {
        $manager = User::factory()->manager([AdminPermission::Events->value])->create();

        $response = $this->actingAs($manager)->get(route('admin.dashboard'));

        $response->assertOk()
            ->assertDontSee(route('admin.menu.index'), false)
            ->assertSee(route('admin.events.index'), false);
    }

    public function test_user_cannot_delete_themselves(): void
    {
        $admin = $this->superAdmin();

        $response = $this->actingAs($admin)->delete(route('admin.users.destroy', $admin));

        $response->assertRedirect()
            ->assertSessionHasErrors('user');
        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_last_super_admin_cannot_be_demoted(): void
    {
        $admin = $this->superAdmin();

        $response = $this->actingAs($admin)->put(route('admin.users.update', $admin), [
            'name' => $admin->name,
            'email' => $admin->email,
            'role' => 'manager',
            'permissions' => [AdminPermission::Menu->value],
            'is_active' => true,
        ]);

        $response->assertSessionHasErrors('role');
        $this->assertTrue($admin->fresh()->isSuperAdmin());
    }

    public function test_inactive_user_cannot_login(): void
    {
        User::factory()->manager([AdminPermission::Menu->value])->create([
            'email' => 'inactif@lecercle.ci',
            'is_active' => false,
        ]);

        $response = $this->post(route('admin.login.store'), [
            'email' => 'inactif@lecercle.ci',
            'password' => 'password',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_active_admin_can_login_and_last_login_is_recorded(): void
    {
        $admin = User::factory()->superAdmin()->create([
            'email' => 'admin@lecercle.ci',
            'last_login_at' => null,
        ]);

        $response = $this->post(route('admin.login.store'), [
            'email' => 'admin@lecercle.ci',
            'password' => 'password',
        ]);

        $response->assertRedirect(route('admin.dashboard'));
        $this->assertNotNull($admin->fresh()->last_login_at);
    }

    public function test_password_change_fails_with_wrong_current_password(): void
    {
        $admin = $this->superAdmin();

        $response = $this->actingAs($admin)->put(route('admin.account.update'), [
            'name' => $admin->name,
            'password' => 'nouveaumotdepasse',
            'password_confirmation' => 'nouveaumotdepasse',
            'current_password' => 'mauvais',
        ]);

        $response->assertSessionHasErrors('current_password');
    }

    public function test_admin_can_change_password_via_account_page(): void
    {
        $admin = $this->superAdmin();

        $response = $this->actingAs($admin)->put(route('admin.account.update'), [
            'name' => 'Nouveau Nom',
            'password' => 'nouveaumotdepasse',
            'password_confirmation' => 'nouveaumotdepasse',
            'current_password' => 'password',
        ]);

        $response->assertRedirect(route('admin.account.edit'))
            ->assertSessionHas('success');

        $this->assertSame('Nouveau Nom', $admin->fresh()->name);
    }
}
