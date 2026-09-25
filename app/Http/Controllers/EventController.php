<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\View\View;

class EventController extends Controller
{
    public function index(): View
    {
        $events = Event::published()
            ->latest('published_at')
            ->paginate(12);

        return view('events.index', compact('events'));
    }

    public function show(Event $event): View
    {
        if (! $event->is_published) {
            abort(404);
        }

        $event->load('images');

        $relatedEvents = Event::published()
            ->whereKeyNot($event->id)
            ->latest('published_at')
            ->take(3)
            ->get();

        return view('events.show', compact('event', 'relatedEvents'));
    }
}
