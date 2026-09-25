<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use Illuminate\View\View;

class MenuController extends Controller
{
    public function __invoke(): View
    {
        $items = MenuItem::where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->groupBy('category');

        return view('menu', [
            'menuItems' => $items,
            'categories' => MenuItem::categories(),
        ]);
    }
}
