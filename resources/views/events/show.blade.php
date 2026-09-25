@extends('layouts.app')

@php
    $coverUrl = $event->cover_image ? asset('storage/' . $event->cover_image) : null;
    $metaDescription = Str::limit($event->summary ?: $event->content, 155);
    $pageTitle = Str::limit($event->title, 60) . ' — Le Cercle';
    $url = route('events.show', $event);
    $readingMinutes = max(1, (int) ceil(str_word_count(strip_tags((string) $event->content)) / 200));
@endphp

@section('title', $pageTitle)
@section('meta_description', $metaDescription)
@section('og_type', 'article')
@section('og_title', $pageTitle)
@section('og_description', $metaDescription)
@if ($coverUrl)
    @section('og_image', $coverUrl)
@endif

@section('head_extra')
    <meta property="article:published_time" content="{{ $event->published_at->toIso8601String() }}">
    <meta property="article:modified_time" content="{{ $event->updated_at->toIso8601String() }}">
@endsection

@push('jsonld')
    @php
        $eventImages = collect([$coverUrl])
            ->merge($event->images->map->url())
            ->filter()
            ->values()
            ->all();

        $eventSchema = [
            '@context' => 'https://schema.org',
            '@type' => 'Event',
            'name' => $event->title,
            'description' => $metaDescription,
            'url' => $url,
            'eventStatus' => 'https://schema.org/EventScheduled',
            'location' => [
                '@type' => 'Place',
                'name' => $event->location ?: 'Le Cercle',
                'address' => [
                    '@type' => 'PostalAddress',
                    'streetAddress' => config('site.address_line'),
                    'addressLocality' => 'Abidjan',
                    'addressCountry' => 'CI',
                ],
            ],
            'organizer' => [
                '@type' => 'Restaurant',
                'name' => 'Le Cercle',
                'url' => url('/'),
            ],
        ];

        if ($event->event_date) {
            $eventSchema['startDate'] = $event->event_date->toIso8601String();
        }

        if ($eventImages) {
            $eventSchema['image'] = $eventImages;
        }

        $articleSchema = array_filter([
            '@context' => 'https://schema.org',
            '@type' => 'NewsArticle',
            'headline' => Str::limit($event->title, 110),
            'description' => $metaDescription,
            'image' => $eventImages ?: null,
            'datePublished' => $event->published_at->toIso8601String(),
            'dateModified' => $event->updated_at->toIso8601String(),
            'author' => [
                '@type' => 'Organization',
                'name' => 'Le Cercle',
                'url' => url('/'),
            ],
            'publisher' => [
                '@type' => 'Organization',
                'name' => 'Le Cercle',
                'logo' => [
                    '@type' => 'ImageObject',
                    'url' => asset('assets/images/logo/logo.png'),
                ],
            ],
            'mainEntityOfPage' => $url,
        ]);

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
                [
                    '@type' => 'ListItem',
                    'position' => 3,
                    'name' => $event->title,
                    'item' => $url,
                ],
            ],
        ];
    @endphp
    <script type="application/ld+json">{!! json_encode($eventSchema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) !!}</script>
    <script type="application/ld+json">{!! json_encode($articleSchema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) !!}</script>
    <script type="application/ld+json">{!! json_encode($breadcrumbSchema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) !!}</script>
@endpush

@push('scripts')
    <script>
        document.querySelectorAll('.share-copy').forEach(function(button) {
            button.addEventListener('click', function() {
                navigator.clipboard.writeText(button.dataset.copy);
                button.textContent = 'Lien copié';
                setTimeout(function() {
                    button.textContent = 'Copier le lien';
                }, 2000);
            });
        });
    </script>
@endpush

@section('content')
    <section class="page-hero page-hero-small article-hero" id="hero">
        <div class="hero-media">
            @if ($coverUrl)
                <img src="{{ $coverUrl }}" alt="{{ $event->title }}" fetchpriority="high" decoding="async">
            @else
                <x-picture src="section/booking.jpg" alt="{{ $event->title }}" loading="eager" fetchpriority="high"
                    sizes="100vw" />
            @endif
            <div class="hero-overlay"></div>
        </div>
        <div class="hero-content">
            <p class="surtitle reveal">
                @if ($event->event_date)
                    <time
                        datetime="{{ $event->event_date->toIso8601String() }}">{{ $event->event_date->format('d/m/Y') }}</time>
                @else
                    Actualité
                @endif
            </p>
            <h1 class="hero-title article-title reveal">{{ $event->title }}</h1>
        </div>
    </section>

    <section class="section" id="event">
        <div class="container article-layout">
            <nav class="breadcrumb" aria-label="Fil d'Ariane">
                <ol>
                    <li><a href="{{ route('home') }}">Accueil</a></li>
                    <li><a href="{{ route('events.index') }}">Événements</a></li>
                    <li aria-current="page">{{ Str::limit($event->title, 60) }}</li>
                </ol>
            </nav>

            <article class="article">
                <header class="article-header">
                    @if ($event->summary)
                        <p class="article-lead">{{ $event->summary }}</p>
                    @endif

                    <div class="article-meta">
                        <span class="article-meta-item">
                            <span class="strip-label">Publié le</span>
                            <time
                                datetime="{{ $event->published_at->toIso8601String() }}">{{ $event->published_at->translatedFormat('d F Y') }}</time>
                        </span>
                        @if ($event->event_date)
                            <span class="article-meta-item">
                                <span class="strip-label">Date</span>
                                <time
                                    datetime="{{ $event->event_date->toIso8601String() }}">{{ $event->event_date->translatedFormat('l d F Y à H\hi') }}</time>
                            </span>
                        @endif
                        @if ($event->location)
                            <span class="article-meta-item">
                                <span class="strip-label">Lieu</span>
                                {{ $event->location }}
                            </span>
                        @endif
                        <span class="article-meta-item">
                            <span class="strip-label">Lecture</span>
                            {{ $readingMinutes }} min
                        </span>
                    </div>

                    <div class="article-share">
                        <span class="strip-label">Partager</span>
                        <a class="share-link" href="https://wa.me/?text={{ urlencode($event->title . ' ' . $url) }}"
                            target="_blank" rel="noopener">WhatsApp</a>
                        <a class="share-link" href="https://www.facebook.com/sharer/sharer.php?u={{ urlencode($url) }}"
                            target="_blank" rel="noopener">Facebook</a>
                        <a class="share-link"
                            href="https://twitter.com/intent/tweet?url={{ urlencode($url) }}&text={{ urlencode($event->title) }}"
                            target="_blank" rel="noopener">X</a>
                        <button type="button" class="share-link share-copy" data-copy="{{ $url }}">Copier le
                            lien</button>
                    </div>
                </header>

                <div class="article-body">
                    @foreach (preg_split('/\R{2,}/', trim((string) $event->content)) as $paragraph)
                        @if (trim($paragraph) !== '')
                            <p>{!! nl2br(e(trim($paragraph))) !!}</p>
                        @endif
                    @endforeach
                </div>
            </article>

            @if ($event->images->isNotEmpty())
                <section class="article-gallery" aria-label="Galerie photo">
                    <div class="section-head">
                        <p class="surtitle">En images</p>
                        <h2 class="title">La galerie de l'événement</h2>
                    </div>
                    <div class="event-gallery">
                        @foreach ($event->images as $image)
                            <figure class="{{ $loop->first ? 'g-wide' : '' }}">
                                <a href="{{ $image->url() }}" target="_blank" rel="noopener"
                                    aria-label="Agrandir la photo">
                                    <img src="{{ $image->url() }}"
                                        alt="{{ $image->caption ?: $event->title . ' — photo ' . $loop->iteration }}"
                                        loading="lazy" decoding="async">
                                </a>
                                @if ($image->caption)
                                    <figcaption>{{ $image->caption }}</figcaption>
                                @endif
                            </figure>
                        @endforeach
                    </div>
                </section>
            @endif

            <div class="section-foot reveal">
                <a href="{{ route('reservation') }}" class="btn btn-gold">Réserver une table</a>
                <a href="{{ route('events.index') }}" class="btn btn-ghost-dark">Tous les événements</a>
            </div>
        </div>
    </section>

    @if ($relatedEvents->isNotEmpty())
        <section class="section related-events">
            <div class="container">
                <div class="section-head reveal">
                    <p class="surtitle">À lire aussi</p>
                    <h2 class="title">D'autres actualités du Cercle.</h2>
                </div>
                <div class="events-grid">
                    @foreach ($relatedEvents as $relatedEvent)
                        @include('events.partials.card', [
                            'event' => $relatedEvent,
                            'headingLevel' => 'h3',
                        ])
                    @endforeach
                </div>
            </div>
        </section>
    @endif
@endsection
