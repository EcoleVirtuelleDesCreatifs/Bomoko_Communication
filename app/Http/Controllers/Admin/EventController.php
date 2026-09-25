<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEventRequest;
use App\Models\Event;
use App\Models\EventImage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\View\View;

class EventController extends Controller
{
    public function index(): View
    {
        $events = Event::withCount('images')->latest()->paginate(15);

        return view('admin.events.index', compact('events'));
    }

    public function create(): View
    {
        return view('admin.events.form', ['event' => null]);
    }

    public function store(StoreEventRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['slug'] = $this->uniqueSlug($data['title']);
        $data['is_published'] = $request->boolean('is_published');
        $data['published_at'] = $data['is_published'] ? now() : null;

        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $request->file('cover_image')->store('events/covers', 'public');
        }

        $event = Event::create($data);
        $this->syncImages($event, $request);

        return redirect()->route('admin.events.index')->with('success', 'L’actualité a été publiée.');
    }

    public function edit(Event $event): View
    {
        $event->load('images');

        return view('admin.events.form', compact('event'));
    }

    public function update(StoreEventRequest $request, Event $event): RedirectResponse
    {
        $data = $request->validated();
        $data['is_published'] = $request->boolean('is_published');

        if (! $event->published_at && $data['is_published']) {
            $data['published_at'] = now();
        } elseif (! $data['is_published']) {
            $data['published_at'] = null;
        }

        if ($request->hasFile('cover_image')) {
            if ($event->cover_image) {
                Storage::disk('public')->delete($event->cover_image);
            }
            $data['cover_image'] = $request->file('cover_image')->store('events/covers', 'public');
        }

        $event->update($data);
        $this->syncImages($event, $request);

        return redirect()->route('admin.events.index')->with('success', 'L’actualité a été mise à jour.');
    }

    public function destroy(Event $event): RedirectResponse
    {
        if ($event->cover_image) {
            Storage::disk('public')->delete($event->cover_image);
        }

        foreach ($event->images as $image) {
            Storage::disk('public')->delete($image->path);
        }

        $event->delete();

        return redirect()->route('admin.events.index')->with('success', 'L’actualité a été supprimée.');
    }

    public function destroyImage(EventImage $image): RedirectResponse
    {
        Storage::disk('public')->delete($image->path);
        $image->delete();

        return back()->with('success', 'L’image a été supprimée.');
    }

    private function uniqueSlug(string $title, ?int $excludeId = null): string
    {
        $slug = Str::slug($title);
        $original = $slug;
        $counter = 1;

        while (Event::where('slug', $slug)->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))->exists()) {
            $slug = $original.'-'.$counter++;
        }

        return $slug;
    }

    private function syncImages(Event $event, StoreEventRequest $request): void
    {
        if ($request->hasFile('gallery')) {
            foreach ($request->file('gallery') as $index => $file) {
                $path = $file->store('events/gallery', 'public');
                $event->images()->create([
                    'path' => $path,
                    'caption' => $request->input("captions.$index") ?? null,
                    'sort_order' => $index * 10,
                ]);
            }
        }
    }
}
