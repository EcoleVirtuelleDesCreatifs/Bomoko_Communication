<?php

namespace Tests\Feature\Admin;

use App\Models\Event;
use App\Models\EventImage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class EventTest extends TestCase
{
    use RefreshDatabase;

    private function adminUser(): User
    {
        return User::factory()->admin()->create();
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $response = $this->get(route('admin.events.index'));

        $response->assertRedirect(route('admin.login'));
    }

    public function test_admin_can_list_events(): void
    {
        $admin = $this->adminUser();
        Event::factory()->create(['title' => 'Brunch dominical']);

        $response = $this->actingAs($admin)->get(route('admin.events.index'));

        $response->assertOk()
            ->assertSee('Brunch dominical', false);
    }

    public function test_admin_can_create_event_with_cover_and_gallery(): void
    {
        Storage::fake('public');
        $admin = $this->adminUser();

        $response = $this->actingAs($admin)->post(route('admin.events.store'), [
            'title' => 'Nouvelle soirée',
            'summary' => 'Une soirée exceptionnelle',
            'content' => 'Contenu complet',
            'event_date' => '2026-12-24T20:00',
            'location' => 'Le Cercle',
            'cover_image' => UploadedFile::fake()->image('cover.jpg'),
            'gallery' => [
                UploadedFile::fake()->image('g1.jpg'),
                UploadedFile::fake()->image('g2.jpg'),
            ],
            'is_published' => true,
        ]);

        $response->assertRedirect(route('admin.events.index'))
            ->assertSessionHas('success');

        $event = Event::where('title', 'Nouvelle soirée')->firstOrFail();

        $this->assertTrue($event->is_published);
        $this->assertNotNull($event->cover_image);
        $this->assertCount(2, $event->images);

        Storage::disk('public')->assertExists($event->cover_image);
        foreach ($event->images as $image) {
            Storage::disk('public')->assertExists($image->path);
        }
    }

    public function test_admin_can_update_event(): void
    {
        $admin = $this->adminUser();
        $event = Event::factory()->create();

        $response = $this->actingAs($admin)->put(route('admin.events.update', $event), [
            'title' => 'Titre mis à jour',
            'summary' => $event->summary,
            'content' => $event->content,
            'location' => 'Le Jardin',
            'is_published' => true,
        ]);

        $response->assertRedirect(route('admin.events.index'));

        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'title' => 'Titre mis à jour',
            'location' => 'Le Jardin',
        ]);
    }

    public function test_admin_can_delete_event(): void
    {
        $admin = $this->adminUser();
        $event = Event::factory()->create();

        $response = $this->actingAs($admin)->delete(route('admin.events.destroy', $event));

        $response->assertRedirect(route('admin.events.index'));
        $this->assertDatabaseMissing('events', ['id' => $event->id]);
    }

    public function test_admin_can_delete_event_image(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('events/gallery/photo.jpg', 'fake');

        $admin = $this->adminUser();
        $image = EventImage::factory()->create(['path' => 'events/gallery/photo.jpg']);

        $response = $this->actingAs($admin)->delete(route('admin.event-images.destroy', $image));

        $response->assertRedirect();
        $this->assertDatabaseMissing('event_images', ['id' => $image->id]);
        Storage::disk('public')->assertMissing('events/gallery/photo.jpg');
    }
}
