<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'nav' => fn () => [
                'rubriques' => \App\Models\Rubrique::where('in_menu', true)->orderBy('sort')->get(['slug', 'label', 'tagline']),
                'regions' => \App\Models\Region::orderBy('sort')->get(['slug', 'label']),
            ],
            'auth' => fn () => [
                'user' => $request->user()?->only('name', 'email', 'role'),
            ],
            'flash' => fn () => [
                'success' => $request->session()->get('success'),
                'newsletter' => $request->session()->get('newsletter'),
            ],
        ];
    }
}
