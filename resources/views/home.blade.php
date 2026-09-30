@extends('layouts.app')

@section('title', 'Le Cercle — Restaurant Bistronomique | Deux Plateaux Vallons, Abidjan')
@section('meta_description', 'Le Cercle, restaurant bistronomique confidentiel aux Deux Plateaux Vallons, Abidjan. Cuisine française réinterprétée, villa élégante, jardin et piscine. Réservez votre table.')
@section('og_type', 'website')

@push('jsonld')
@php
    $restaurantSchema = array_filter([
        '@context' => 'https://schema.org',
        '@type' => 'Restaurant',
        'name' => 'Le Cercle',
        'description' => 'Restaurant bistronomique confidentiel aux Deux Plateaux Vallons, Abidjan. Cuisine française réinterprétée, villa élégante, jardin et piscine.',
        'url' => url('/'),
        'telephone' => preg_replace('/\s+/', '', (string) config('site.phone')),
        'email' => config('site.contact_email'),
        'address' => [
            '@type' => 'PostalAddress',
            'streetAddress' => config('site.address_line'),
            'addressLocality' => 'Abidjan',
            'addressCountry' => 'CI',
        ],
        'servesCuisine' => ['Française', 'Bistronomie'],
        'priceRange' => '$$$',
        'image' => asset('assets/images/slider/img_slider_1.jpg'),
        'acceptsReservations' => route('reservation'),
        'hasMenu' => route('menu'),
        'openingHoursSpecification' => [
            [
                '@type' => 'OpeningHoursSpecification',
                'dayOfWeek' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                'opens' => '11:00',
                'closes' => '23:59',
            ],
            [
                '@type' => 'OpeningHoursSpecification',
                'dayOfWeek' => 'Saturday',
                'opens' => '18:00',
                'closes' => '23:59',
            ],
        ],
        'potentialAction' => [
            '@type' => 'ReserveAction',
            'target' => [
                '@type' => 'EntryPoint',
                'urlTemplate' => route('reservation'),
            ],
        ],
        'sameAs' => array_values(array_filter([
            config('site.instagram_url'),
            config('site.facebook_url'),
        ])),
    ]);
@endphp
<script type="application/ld+json">{!! json_encode($restaurantSchema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) !!}</script>
@endpush

@php
    $reservationUrl = config('site.reservation_url') ?: route('reservation');
    $menuUrl = config('site.menu_url') ?: route('menu');
    $galleryUrl = config('site.gallery_url') ?: route('gallery');
    $contactEmail = config('site.contact_email');
    $contactUrl = $contactEmail ? 'mailto:'.$contactEmail : $reservationUrl;
    $phone = config('site.phone');
    $phoneHref = 'tel:'.preg_replace('/\s+/', '', (string) $phone);
    $openingHours = config('site.opening_hours');
    $mapsUrl = 'https://www.google.com/maps/search/?api=1&query=' . urlencode('Le Cercle Rue J97 Ilot 2552 II Plateaux Vallons Abidjan');
    $mapsEmbedUrl = 'https://www.google.com/maps?q=' . urlencode('Le Cercle Rue J97 Ilot 2552 II Plateaux Vallons Abidjan') . '&output=embed';
    $instagramUrl = config('site.instagram_url');
    $facebookUrl = config('site.facebook_url');
@endphp

@push('preload')
<x-preload-image src="slider/img_slider_1.jpg" sizes="100vw" />
@endpush

@section('content')
    <!-- ============ HERO ============ -->
    <section class="hero" id="hero">
        <div class="hero-media">
            <x-picture src="slider/img_slider_1.jpg" alt="Salle du restaurant Le Cercle, ambiance feutrée" loading="eager" fetchpriority="high" sizes="100vw" />
            <div class="hero-overlay"></div>
        </div>
        <div class="hero-content">
            <p class="surtitle reveal">Restaurant Bistronomique · Abidjan</p>
            <h1 class="hero-title reveal">Entrez dans<br>le Cercle.</h1>
            <p class="hero-sub reveal">Une table. Une atmosphère.<br>Un moment qui n'appartient qu'à vous.</p>
            <div class="hero-cta reveal">
                <a href="{{ $reservationUrl }}" class="btn btn-gold">Réserver une table</a>
                <a href="#la-carte" class="btn btn-ghost">Voir la carte</a>
            </div>
        </div>
        <a href="#la-carte" class="scroll-hint" aria-label="Faire défiler">
            <span class="scroll-line"></span>
        </a>
    </section>

    <!-- ============ INFOS ESSENTIELLES ============ -->
    <section class="section-strip infos-strip" aria-label="Informations pratiques">
        <div class="infos-strip-item">
            <span class="strip-label">Adresse</span>
            <a href="{{ $mapsUrl }}" target="_blank" rel="noopener">{{ config('site.address_line') }}, Abidjan</a>
        </div>
        <div class="infos-strip-item">
            <span class="strip-label">Horaires</span>
            <span>{{ $openingHours }}</span>
        </div>
        <div class="infos-strip-item">
            <span class="strip-label">Téléphone</span>
            <a href="{{ $phoneHref }}">{{ $phone }}</a>
        </div>
    </section>

    <!-- ============ LA CARTE ============ -->
    <section class="section cuisine" id="la-carte">
        <div class="container cuisine-grid">
            <figure class="cuisine-media reveal">
                <x-picture src="section/menu4.jpg" alt="Assiette gastronomique dressée au restaurant Le Cercle" sizes="(max-width: 900px) 100vw, 50vw" />
            </figure>
            <div class="cuisine-text">
                <p class="surtitle reveal">La Cuisine</p>
                <h2 class="title reveal">L'émotion commence<br>dans l'assiette.</h2>
                <p class="text reveal">Des classiques français réinterprétés, des influences venues d'ailleurs
                    et des produits choisis avec exigence.</p>
                <p class="text reveal">Une cuisine précise, créative et sincère.</p>
                <a href="#menu" class="link-arrow reveal">Voir les plats</a>
            </div>
        </div>

        <div class="container">
            <div id="menu" class="menu-block">
                <div class="section-head reveal">
                    <p class="surtitle light">Notre Carte</p>
                    <h2 class="title">Menu du Restaurant</h2>
                    <p class="text">Une sélection de plats signatures qui racontent notre histoire culinaire.</p>
                </div>

                <div class="menu-grid">
                    @foreach (['starters' => 'Entrées', 'mains' => 'Plats Principaux', 'desserts' => 'Desserts'] as $key => $label)
                        <div class="menu-category reveal">
                            <h3 class="menu-category-title">{{ $label }}</h3>
                            <div class="menu-items">
                                @forelse ($menuItems->get($key, collect())->take(4) as $item)
                                    <div class="menu-item">
                                        <div class="menu-item-header">
                                            <h4 class="menu-item-name">{{ $item->name }}</h4>
                                            <span class="menu-item-price">{{ $item->formattedPrice() }}</span>
                                        </div>
                                        @if ($item->description)
                                            <p class="menu-item-desc">{{ $item->description }}</p>
                                        @endif
                                    </div>
                                @empty
                                    <p class="menu-item-desc">La carte sera bientôt mise à jour.</p>
                                @endforelse
                            </div>
                        </div>
                    @endforeach
                </div>

                <div class="section-foot reveal">
                    <a href="{{ $menuUrl }}" class="link-arrow">Voir la carte complète</a>
                </div>
            </div>
        </div>
    </section>

    <!-- ============ NOS ESPACES ============ -->
    <section class="section espaces" id="espaces">
        <div class="container">
            <div class="section-head">
                <p class="surtitle reveal">Nos Espaces</p>
                <h2 class="title reveal">À chaque moment,<br>son atmosphère.</h2>
                <p class="text reveal">À l'intérieur ou au jardin, autour de la piscine ou dans une atmosphère
                    plus intime, Le Cercle se découvre différemment au fil de vos envies.</p>
            </div>

            <div class="espaces-grid">
                <a href="#galerie" class="espace reveal">
                    <figure>
                        <x-picture src="section/res01.jpg" alt="La salle du restaurant Le Cercle" sizes="(max-width: 900px) 100vw, 33vw" />
                    </figure>
                    <div class="espace-caption">
                        <h3>La Salle</h3>
                        <p>Élégante &amp; intimiste.</p>
                    </div>
                </a>
                <a href="#galerie" class="espace reveal">
                    <figure>
                        <x-picture src="section/res02.jpg" alt="Le jardin du restaurant Le Cercle" sizes="(max-width: 900px) 100vw, 33vw" />
                    </figure>
                    <div class="espace-caption">
                        <h3>Le Jardin</h3>
                        <p>Respirer. Partager. Profiter.</p>
                    </div>
                </a>
                <a href="#galerie" class="espace reveal">
                    <figure>
                        <x-picture src="section/res03.jpg" alt="La piscine du restaurant Le Cercle" sizes="(max-width: 900px) 100vw, 33vw" />
                    </figure>
                    <div class="espace-caption">
                        <h3>La Piscine</h3>
                        <p>Une autre façon de vivre Le Cercle.</p>
                    </div>
                </a>
            </div>

            <div class="section-foot reveal">
                <a href="#galerie" class="link-arrow">Explorer les espaces</a>
            </div>
        </div>
    </section>

    <!-- ============ GALERIE ============ -->
    <section class="section galerie" id="galerie">
        <div class="container">
            <div class="section-head">
                <p class="surtitle reveal">Instants du Cercle</p>
                <h2 class="title reveal">Quelques images.<br>Une seule envie : y être.</h2>
            </div>
        </div>
        <div class="galerie-grid">
            <figure class="g-item g-large reveal"><x-picture src="slider/img_slider_2.jpg" alt="Ambiance du restaurant Le Cercle" sizes="(max-width: 900px) 100vw, 66vw" /></figure>
            <figure class="g-item g-tall reveal"><x-picture src="section/gallery-5.jpg" alt="Détail gastronomique" sizes="(max-width: 900px) 50vw, 33vw" /></figure>
            <figure class="g-item reveal"><x-picture src="section/gallery-1.jpg" alt="Assiette signature" sizes="(max-width: 900px) 50vw, 33vw" /></figure>
            <figure class="g-item g-tall reveal"><x-picture src="section/gallery-9.jpg" alt="Service en salle" sizes="(max-width: 900px) 50vw, 33vw" /></figure>
            <figure class="g-item reveal"><x-picture src="section/gallery-13.jpg" alt="Détail de table" sizes="(max-width: 900px) 50vw, 33vw" /></figure>
            <figure class="g-item g-large reveal"><x-picture src="section/video.jpg" alt="Le restaurant Le Cercle en soirée" sizes="(max-width: 900px) 100vw, 66vw" /></figure>
        </div>
        <div class="container section-foot reveal">
            <a href="{{ $galleryUrl }}" class="link-arrow">Découvrir la galerie</a>
        </div>
    </section>

    <!-- ============ INTRODUCTION — LE CERCLE ============ -->
    <section class="section intro" id="le-cercle">
        <div class="container intro-grid">
            <div class="intro-text">
                <p class="surtitle reveal">Le Cercle</p>
                <h2 class="title reveal">Certaines adresses<br>se découvrent.<br><em>D'autres se vivent.</em></h2>
                <p class="text reveal">Au cœur des Deux Plateaux Vallons, Le Cercle cultive l'art de recevoir
                    dans une atmosphère confidentielle, chaleureuse et raffinée.</p>
                <a href="#experience" class="link-arrow reveal">Notre histoire</a>
            </div>
            <figure class="intro-media reveal">
                <x-picture src="section/about.jpg" alt="Intérieur élégant du restaurant Le Cercle" sizes="(max-width: 900px) 100vw, 50vw" />
            </figure>
        </div>
    </section>

    <!-- ============ SIGNATURE DU CHEF ============ -->
    <section class="section chef">
        <div class="container chef-grid">
            <div class="chef-text">
                <p class="surtitle reveal">La Signature</p>
                <h2 class="title reveal">Derrière chaque assiette,<br>une intention.</h2>
                <p class="text reveal">Créer l'équilibre.<br>Révéler le produit.<br>Surprendre sans jamais en faire trop.</p>
                <a href="#la-carte" class="link-arrow reveal">Découvrir notre cuisine</a>
            </div>
            <figure class="chef-media reveal">
                <!-- [PHOTO_CHEF] : emplacement réservé au portrait du Chef -->
                <x-picture src="section/chef1.jpg" alt="Le Chef du restaurant Le Cercle en cuisine" sizes="(max-width: 900px) 100vw, 50vw" />
            </figure>
        </div>
    </section>

    <!-- ============ L'EXPÉRIENCE ============ -->
    <section class="section experience" id="experience">
        <div class="experience-media" aria-hidden="true">
            <x-picture src="slider/img_slider_3.jpg" alt="Atmosphère feutrée du restaurant Le Cercle" sizes="100vw" />
            <div class="experience-overlay"></div>
        </div>
        <div class="container experience-content">
            <p class="surtitle light reveal">L'Expérience</p>
            <h2 class="title light reveal">Ici, le temps<br>change de rythme.</h2>
            <p class="text light reveal">Une lumière douce.<br>Une table soigneusement dressée.<br>
                Un verre servi.<br>Une assiette qui arrive.</p>
            <p class="experience-statement reveal">Et le reste peut attendre.</p>
        </div>
    </section>

    <!-- ============ VOS MOMENTS ============ -->
    <section class="section moments">
        <div class="container moments-inner">
            <p class="surtitle reveal">Vos Moments</p>
            <h2 class="title reveal">Il y a toujours une raison<br>de se retrouver.</h2>
            <p class="text reveal">Un déjeuner d'affaires.<br>Un dîner à deux.<br>Une célébration.<br>
                Ou simplement l'envie de bien manger.</p>
            <p class="moments-statement reveal">Le Cercle s'occupe du reste.</p>
            <a href="{{ $reservationUrl }}" class="link-arrow reveal">Organiser votre moment</a>
        </div>
    </section>

    <!-- ============ ACTUALITÉS ============ -->
    @if ($latestEvents->isNotEmpty())
        <section class="section actualites" id="actualites">
            <div class="container">
                <div class="section-head reveal">
                    <p class="surtitle">Actualités</p>
                    <h2 class="title">Les dernières nouvelles<br>du Cercle.</h2>
                </div>

                <div class="events-grid">
                    @foreach ($latestEvents as $event)
                        @include('events.partials.card', ['event' => $event, 'headingLevel' => 'h3'])
                    @endforeach
                </div>

                <div class="section-foot reveal">
                    <a href="{{ route('events.index') }}" class="link-arrow">Toutes les actualités</a>
                </div>
            </div>
        </section>
    @endif

    <!-- ============ INFOS PRATIQUES & CONTACT ============ -->
    <section class="section infos" id="contact">
        <div class="container">
            <div class="section-head reveal">
                <p class="surtitle">Infos pratiques</p>
                <h2 class="title">Nous trouver.</h2>
            </div>

            <div class="infos-grid">
                <div class="info-card reveal">
                    <h3>Adresse</h3>
                    <p>{{ config('site.address_line') }}<br>{{ config('site.city') }}</p>
                    <a href="{{ $mapsUrl }}" target="_blank" rel="noopener" class="link-arrow">Itinéraire</a>
                </div>
                <div class="info-card reveal">
                    <h3>Horaires</h3>
                    <p>Lundi – Vendredi : à partir de 11h<br>Samedi : le soir uniquement<br>Dimanche : fermé</p>
                </div>
                <div class="info-card reveal">
                    <h3>Contact</h3>
                    <p>
                        <a href="{{ $phoneHref }}">{{ $phone }}</a>
                        @if ($contactEmail)
                            <br><a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a>
                        @endif
                    </p>
                    @if ($instagramUrl || $facebookUrl)
                        <p>
                            @if ($instagramUrl)
                                <a href="{{ $instagramUrl }}" class="link-arrow">Instagram</a>
                            @endif
                            @if ($instagramUrl && $facebookUrl)
                                &nbsp;·&nbsp;
                            @endif
                            @if ($facebookUrl)
                                <a href="{{ $facebookUrl }}" class="link-arrow">Facebook</a>
                            @endif
                        </p>
                    @endif
                </div>
            </div>

            <div class="map-facade" data-map-facade>
                <x-picture src="section/bg-location.jpg" alt="Plan d'accès au restaurant Le Cercle" sizes="100vw" class="map-facade-img" />
                <div class="map-facade-overlay">
                    <button type="button" class="btn btn-gold map-load" data-src="{{ $mapsEmbedUrl }}">Afficher le plan</button>
                    <a href="{{ $mapsUrl }}" target="_blank" rel="noopener" class="map-facade-link">Ouvrir dans Google Maps</a>
                </div>
            </div>
        </div>
    </section>

    <!-- ============ RÉSERVATION ============ -->
    <section class="section reservation" id="reservation">
        <div class="reservation-media" aria-hidden="true">
            <x-picture src="section/booking.jpg" alt="Table dressée au restaurant Le Cercle" sizes="100vw" />
            <div class="reservation-overlay"></div>
        </div>
        <div class="container reservation-content">
            <p class="surtitle light reveal">Votre table vous attend</p>
            <h2 class="title light reveal">Et si votre prochain<br>souvenir commençait ici&nbsp;?</h2>
            <p class="text light reveal">Déjeuner, dîner ou occasion particulière, laissez Le Cercle
                donner une autre saveur à votre moment.</p>
            <div class="reservation-cta reveal">
                <a href="{{ $reservationUrl }}" class="btn btn-gold">Réserver une table</a>
                <a href="{{ $contactUrl }}" class="btn btn-ghost">Nous contacter</a>
            </div>
        </div>
    </section>
@endsection
