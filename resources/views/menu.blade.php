@extends('layouts.app')

@section('title', $page['title'])
@section('meta_description', $page['meta'])

@php
    $visibleCategories = collect($categories)
        ->filter(fn ($label, $key) => $menuItems->get($key, collect())->isNotEmpty());
@endphp

@push('jsonld')
@php
    $breadcrumbSchema = [
        '@context' => 'https://schema.org',
        '@type' => 'BreadcrumbList',
        'itemListElement' => [
            [
                '@type' => 'ListItem',
                'position' => 1,
                'name' => 'Accueil',
                'item' => route('home'),
            ],
            [
                '@type' => 'ListItem',
                'position' => 2,
                'name' => $page['surtitle'],
                'item' => route($page['route']),
            ],
        ],
    ];

    $menuSchema = [
        '@context' => 'https://schema.org',
        '@type' => 'Menu',
        'name' => $page['title'],
        'url' => route($page['route']),
        'hasMenuSection' => $visibleCategories
            ->map(function ($label, $key) use ($menuItems) {
                $items = $menuItems->get($key, collect());

                return [
                    '@type' => 'MenuSection',
                    'name' => $label,
                    'hasMenuSection' => $items->groupBy('section')
                        ->map(function ($sectionItems, $section) {
                            return array_filter([
                                '@type' => 'MenuSection',
                                'name' => $section ?: null,
                                'hasMenuItem' => $sectionItems->map(fn ($item) => array_filter([
                                    '@type' => 'MenuItem',
                                    'name' => $item->name,
                                    'description' => $item->description,
                                    'offers' => ($item->price ?? $item->price_glass) !== null ? [
                                        '@type' => 'Offer',
                                        'price' => $item->price ?? $item->price_glass,
                                        'priceCurrency' => 'XOF',
                                    ] : null,
                                ]))->values()->all(),
                            ]);
                        })
                        ->values()
                        ->all(),
                ];
            })
            ->values()
            ->all(),
    ];
@endphp
<script type="application/ld+json">{!! json_encode($breadcrumbSchema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) !!}</script>
<script type="application/ld+json">{!! json_encode($menuSchema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) !!}</script>
@endpush

@section('content')
    <section class="page-hero page-hero-small" id="hero">
        <div class="hero-media">
            <x-picture src="{{ $page['image'] }}" alt="{{ $page['surtitle'] }} au restaurant Le Cercle" loading="eager" fetchpriority="high" sizes="100vw" />
            <div class="hero-overlay"></div>
        </div>
        <div class="hero-content">
            <p class="surtitle reveal">{{ $page['surtitle'] }}</p>
            <h1 class="hero-title reveal">{{ $page['h1'] }}</h1>
            <p class="hero-sub reveal">{{ $page['subtitle'] }}</p>
        </div>
    </section>

    <nav class="menu-nav menu-nav-switch" aria-label="Nos cartes">
        <ul>
            @foreach ($menuLinks as $key => $link)
                <li>
                    <a href="{{ $link['route'] }}" @if ($key === $menuKey) aria-current="page" class="is-active" @endif>
                        {{ $link['label'] }}@if ($link['note'])<small>{{ $link['note'] }}</small>@endif
                    </a>
                </li>
            @endforeach
        </ul>
    </nav>

    <nav class="menu-nav" aria-label="Rubriques de la carte">
        <ul>
            @foreach ($visibleCategories as $key => $label)
                <li><a href="#cat-{{ $key }}">{{ $label }}</a></li>
            @endforeach
        </ul>
    </nav>

    <section class="section menu" id="la-carte">
        <div class="container">
            <div class="menu-page-grid {{ $menuKey === 'boissons' ? 'menu-page-grid-wide' : '' }}">
                @foreach ($visibleCategories as $key => $categoryLabel)
                    <div class="menu-category reveal" id="cat-{{ $key }}">
                        <h3 class="menu-category-title">{{ $categoryLabel }}</h3>
                        @foreach ($menuItems->get($key, collect())->groupBy('section') as $section => $items)
                            <div class="menu-section">
                                @if ($section)
                                    <h4 class="menu-section-title">{{ $section }}</h4>
                                @endif
                                <div class="menu-items">
                                    @foreach ($items as $item)
                                        <div class="menu-item">
                                            <div class="menu-item-header">
                                                <h4 class="menu-item-name">{{ $item->name }}</h4>
                                                <span class="menu-item-price">{!! collect(explode(' · ', $item->formattedPrice()))->map(fn ($part) => '<span class="price-part">'.e($part).'</span>')->implode(' · ') !!}</span>
                                            </div>
                                            @if ($item->description)
                                                <p class="menu-item-desc">{{ $item->description }}</p>
                                            @endif
                                        </div>
                                    @endforeach
                                </div>
                            </div>
                        @endforeach
                    </div>
                @endforeach
            </div>

            <div class="menu-note">
                <h3 class="menu-note-title">Bon à savoir</h3>
                <p>{{ $page['note'] }}</p>
                <p>{{ config('site.opening_hours') }} — <a href="tel:{{ preg_replace('/\s+/', '', (string) config('site.phone')) }}">{{ config('site.phone') }}</a> — <a href="mailto:{{ config('site.contact_email') }}">{{ config('site.contact_email') }}</a></p>
            </div>

            <div class="section-foot reveal">
                <a href="{{ route('reservation') }}" class="btn btn-gold">Réserver une table</a>
                <a href="{{ route('home') }}" class="btn btn-ghost-dark">Retour à l'accueil</a>
            </div>
        </div>
    </section>
@endsection
