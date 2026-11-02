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
            'ads' => fn () => $this->activeAds(),
        ];
    }

    private function activeAds(): array
    {
        $ads = json_decode(\Illuminate\Support\Facades\DB::table('admin_data')->where('key', 'ads')->value('value') ?? '[]', true) ?: [];
        $today = now()->toDateString();

        return collect($ads)
            ->filter(fn ($a) => ! ($a['paused'] ?? false)
                && ($a['start'] ?? '') <= $today && ($a['end'] ?? '') >= $today)
            ->map(fn ($a) => [
                'slot' => $a['slot'] ?? '',
                'advertiser' => $a['advertiser'] ?? '',
                'name' => $a['name'] ?? '',
                'url' => $a['url'] ?? '',
                'visual' => $a['visual'] ?? '',
            ])->values()->all();
    }
}
