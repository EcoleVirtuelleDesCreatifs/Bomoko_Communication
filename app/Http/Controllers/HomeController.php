<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\View\View;

class HomeController extends Controller
{
    public function __invoke(): View
    {
        $latestEvents = Event::published()
            ->latest('published_at')
            ->take(3)
            ->get();

        return view('home', [
            'latestEvents' => $latestEvents,
        ]);
    }
}
