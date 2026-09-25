@extends('layouts.app')

@section('title', 'Événements & Actualités — Le Cercle')
@section('meta_description', 'Découvrez les événements et actualités du Cercle : soirées, menus spéciaux, expériences gastronomiques aux Deux Plateaux Vallons, Abidjan.')
@section('og_type', 'website')

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
                'name' => 'Événements',
                'item' => route('events.index'),
            ],
        ],
    ];
@endphp
<script type="application/ld+json">{!! json_encode($breadcrumbSchema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) !!}</script>
@endpush

@section('content')
    <section class="page-hero page-hero-small" id="hero">
        <div class="hero-media">
            <x-picture src="section/booking.jpg" alt="Ambiance d'un événement au Cercle" loading="eager" fetchpriority="high" sizes="100vw" />
            <div class="hero-overlay"></div>
        </div>
        <div class="hero-content">
            <p class="surtitle reveal">Le Cercle</p>
            <h1 class="hero-title reveal">Événements & Actualités</h1>
            <p class="hero-sub reveal">Nos moments, nos inspirations, nos prochains rendez-vous.</p>
        </div>
    </section>

    <section class="section" id="events">
        <div class="container">
            <div class="events-grid">
                @forelse ($events as $event)
                    @include('events.partials.card', ['event' => $event, 'headingLevel' => 'h2'])
                @empty
                    <p class="text text-center">Aucun événement à afficher pour le moment.</p>
                @endforelse
            </div>

            <div class="pagination">
                {{ $events->links() }}
            </div>
        </div>
    </section>
@endsection
