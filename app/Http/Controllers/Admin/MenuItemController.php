<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMenuItemRequest;
use App\Models\MenuItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class MenuItemController extends Controller
{
    public function index(): View
    {
        $items = MenuItem::orderBy('category')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->groupBy('category');

        return view('admin.menu.index', [
            'groupedItems' => $items,
            'categories' => MenuItem::categories(),
        ]);
    }

    public function create(): View
    {
        return view('admin.menu.form', [
            'item' => null,
            'categories' => MenuItem::categories(),
            'sections' => $this->existingSections(),
        ]);
    }

    public function store(StoreMenuItemRequest $request): RedirectResponse
    {
        MenuItem::create($request->validated());

        return redirect()->route('admin.menu.index')->with('success', 'Le plat a été ajouté.');
    }

    public function edit(MenuItem $menu): View
    {
        return view('admin.menu.form', [
            'item' => $menu,
            'categories' => MenuItem::categories(),
            'sections' => $this->existingSections(),
        ]);
    }

    public function update(StoreMenuItemRequest $request, MenuItem $menu): RedirectResponse
    {
        $menu->update($request->validated());

        return redirect()->route('admin.menu.index')->with('success', 'Le plat a été mis à jour.');
    }

    public function destroy(MenuItem $menu): RedirectResponse
    {
        $menu->delete();

        return redirect()->route('admin.menu.index')->with('success', 'Le plat a été supprimé.');
    }

    private function existingSections()
    {
        return MenuItem::query()->whereNotNull('section')->distinct()->orderBy('section')->pluck('section');
    }
}
