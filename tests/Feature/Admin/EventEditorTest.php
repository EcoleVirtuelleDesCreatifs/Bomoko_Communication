<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EventEditorTest extends TestCase
{
    use RefreshDatabase;

    private function adminUser(): User
    {
        return User::factory()->admin()->create([
            'email' => 'admin@lecercle.ci',
        ]);
    }

    public function test_admin_can_see_rich_editor_on_event_create(): void
    {
        $admin = $this->adminUser();

        $response = $this->actingAs($admin)->get(route('admin.events.create'));

        $response->assertOk()
            ->assertSee('rich-editor', false)
            ->assertSee('contenteditable', false)
            ->assertSee('data-rich-editor', false)
            ->assertSee('data-command="bold"', false)
            ->assertSee('data-command="createLink"', false);
    }

    public function test_admin_can_store_event_with_html_content(): void
    {
        $admin = $this->adminUser();

        $response = $this->actingAs($admin)->post(route('admin.events.store'), [
            'title' => 'Soirée dégustation',
            'summary' => 'Une soirée unique.',
            'content' => '<p>Contenu <strong>enrichi</strong>.</p>',
            'event_date' => now()->addWeek()->format('Y-m-d\TH:i'),
            'location' => 'Le Cercle',
            'is_published' => true,
        ]);

        $response->assertRedirect(route('admin.events.index'));
        $this->assertDatabaseHas('events', [
            'title' => 'Soirée dégustation',
            'content' => '<p>Contenu <strong>enrichi</strong>.</p>',
        ]);
    }
}
