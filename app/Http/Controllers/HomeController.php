<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\MenuItem;
use Illuminate\View\View;

class HomeController extends Controller
{
    public function __invoke(): View
    {
        $menuItems = MenuItem::where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->groupBy('category');

        $latestEvents = Event::published()
            ->latest('published_at')
            ->take(3)
            ->get();

        return view('home', [
            'menuItems' => $menuItems,
            'menuCategories' => MenuItem::categories(),
            'latestEvents' => $latestEvents,
        ]);
    }
}
