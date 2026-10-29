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
            'menus' => collect(MenuItem::menus())
                ->mapWithKeys(fn (string $label, string $menu) => [
                    $label => MenuItem::categoriesForMenu($menu),
                ]),

        ]);
    }

    public function create(): View
    {
        return view('admin.menu.form', [
            'item' => null,
            'menus' => MenuItem::menus(),
            'categoryGroups' => $this->categoryGroups(),
            'sections' => $this->existingSections(),
        ]);
    }

    public function store(StoreMenuItemRequest $request): RedirectResponse
    {
        MenuItem::create($request->validated());

        return redirect()->route('admin.menu.index')->with('success', 'L’élément a été ajouté.');
    }

    public function edit(MenuItem $menu): View
    {
        return view('admin.menu.form', [
            'item' => $menu,
            'menus' => MenuItem::menus(),
            'categoryGroups' => $this->categoryGroups(),
            'sections' => $this->existingSections(),
        ]);
    }

    public function update(StoreMenuItemRequest $request, MenuItem $menu): RedirectResponse
    {
        $menu->update($request->validated());

        return redirect()->route('admin.menu.index')->with('success', 'L’élément a été mis à jour.');
    }

    public function destroy(MenuItem $menu): RedirectResponse
    {
        $menu->delete();

        return redirect()->route('admin.menu.index')->with('success', 'L’élément a été supprimé.');
    }

    /**
     * @return array<string, array<string, string>>
     */
    private function categoryGroups(): array
    {
        return collect(MenuItem::menus())
            ->mapWithKeys(fn (string $label, string $menu) => [$menu => MenuItem::categoriesForMenu($menu)])
            ->all();
    }

    private function existingSections()
    {
        return MenuItem::query()->whereNotNull('section')->distinct()->orderBy('section')->pluck('section');
    }
}
