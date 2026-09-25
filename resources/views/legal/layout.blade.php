@extends('layouts.app')

@push('jsonld')
@php
    $legalBreadcrumb = [
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
                'name' => trim($__env->yieldContent('legal_title')),
                'item' => url()->current(),
            ],
        ],
    ];
@endphp
<script type="application/ld+json">{!! json_encode($legalBreadcrumb, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) !!}</script>
@endpush

@section('content')
    <section class="page-hero page-hero-small" id="hero">
        <div class="hero-media">
            <x-picture src="section/menu4.jpg" alt="Le restaurant Le Cercle" loading="eager" fetchpriority="high" sizes="100vw" />
            <div class="hero-overlay"></div>
        </div>
        <div class="hero-content">
            <p class="surtitle">Le Cercle</p>
            <h1 class="hero-title">@yield('legal_title')</h1>
        </div>
    </section>

    <section class="section">
        <article class="legal-content container">
            <p class="legal-updated">Dernière mise à jour : 26 septembre 2026.</p>

            <nav class="legal-toc" aria-label="Sommaire">
                <ul>
                    @yield('legal_toc')
                </ul>
            </nav>

            @yield('legal_content')

            <p class="legal-next">
                @yield('legal_next')
            </p>
        </article>
    </section>
@endsection
