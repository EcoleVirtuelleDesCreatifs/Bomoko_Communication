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
                'opens' => '11:30',
                'closes' => '02:00',
            ],
            [
                '@type' => 'OpeningHoursSpecification',
                'dayOfWeek' => 'Saturday',
                'opens' => '18:00',
                'closes' => '02:00',
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
                <h2 class="title reveal">D'ici et d'ailleurs,<br>l'émotion commence dans l'assiette.</h2>
                <p class="text reveal">Saint-Jacques de Bretagne, saumon de Norvège, bœuf d'exception : les plus beaux
                    produits servent ici les grands classiques français, revisités aux saveurs du monde.</p>
                <p class="text reveal">Une cuisine précise, généreuse et sincère.</p>
                <a href="#menu" class="link-arrow reveal">Voir les plats</a>
            </div>
        </div>

        <div class="container">
            <div id="menu" class="menu-block">
                <div class="section-head reveal">
                    <p class="surtitle light">Notre Carte</p>
                    <h2 class="title">Les Signatures</h2>
                    <p class="text">Quelques assiettes qui racontent notre cuisine.</p>
                    <p class="text signature-intro">De la France à l'océan Indien, en passant par l'Afrique : chaque carte a ses
                        incontournables. Les nôtres disent la rigueur de la cuisine française, l'amour des beaux produits
                        et une curiosité qui voyage.</p>
                </div>

                <div class="signature-grid">
                    @foreach ([
                        ['Quenelles de poisson de nos côtes', 'La bouillabaisse marseillaise, revisitée en entrée : une gelée infusée au thym citronné, des croûtons croustillants, une rouille d\'anchois. Toute la profondeur du plat d\'origine, en quelques bouchées.'],
                        ['Saint-Jacques de Bretagne & caviar', 'Un carpaccio de noix de Saint-Jacques, l\'éclat iodé du caviar, le croquant des endives. La rencontre de deux produits d\'exception.'],
                        ['Royal curry de langoustes & gambas', 'Les épices et la douceur des îles de l\'océan Indien, un riz blanc à la coriandre, un chutney de tomates. Le voyage, sans quitter sa table.'],
                        ['Cigare au chocolat de Côte d\'Ivoire', 'Notre création autour d\'un cacao d\'exception. Une dernière note qui rappelle d\'où nous venons.'],
                    ] as [$name, $description])
                        <article class="signature-item reveal">
                            <h3 class="signature-name">{{ $name }}</h3>
                            <p class="signature-desc">{{ $description }}</p>
                        </article>
                    @endforeach
                </div>

                <div class="section-foot reveal">
                    <p class="text signature-outro">Et bien d'autres assiettes vous attendent : des classiques revisités du ndolé royal,
                        jusqu'aux plus belles pièces du boucher, venues des quatre coins du monde.</p>
                    <a href="{{ $menuUrl }}" class="link-arrow">Voir la carte complète</a>
                    <a href="{{ route('menu.tapas') }}" class="link-arrow">Tapas & planches</a>
                    <a href="{{ route('menu.drinks') }}" class="link-arrow">Carte des vins</a>
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
                <p class="text reveal">Un déjeuner au soleil, un verre au bord de l'eau, un dîner qui se prolonge :
                    Le Cercle se vit différemment selon l'heure et l'envie.</p>
            </div>

            <div class="espaces-grid espaces-grid-5">
                @foreach ([
                    ['section/res03.jpg', 'La salle Bistrot', 'Le cœur de la maison. Un cadre élégant et feutré, pour savourer toute la carte.', 'La salle Bistrot du restaurant Le Cercle'],
                    ['galerie/3.jpg', 'La pergola', 'Un coin privilégié, à l\'écart du tumulte. Les tapas et planches à partager en tête-à-tête, l\'intimité en plus, la magie en héritage.', 'La pergola du restaurant Le Cercle'],
                    ['section/res01.jpg', 'Au bord de la piscine', 'Un écrin de détente, pour prolonger l\'après-midi ou ouvrir la soirée, les pieds presque dans l\'eau.', 'La piscine du restaurant Le Cercle'],
                    ['section/res02.jpg', 'La scène en plein air', 'À la nuit tombée, la musique prend le relais. Des artistes choisis avec exigence se produisent en live, pour des soirées où l\'on dîne, l\'on écoute et l\'on se retrouve.', 'La scène en plein air du restaurant Le Cercle'],
                    ['galerie/8.jpg', 'Le Pavillon', 'Notre lieu d\'exception. Sous sa charpente de bois et son lustre de lumière, face au jardin, il accueille les dîners qui comptent : une célébration, un repas d\'affaires, une soirée entre proches. Un espace à part, pour des moments à leur image.', 'Le Pavillon du restaurant Le Cercle'],
                ] as [$image, $name, $description, $alt])
                    <a href="#galerie" class="espace reveal">
                        <figure>
                            <x-picture :src="$image" :alt="$alt" sizes="(max-width: 900px) 100vw, 40vw" />
                        </figure>
                        <div class="espace-caption">
                            <h3>{{ $name }}</h3>
                            <p>{{ $description }}</p>
                        </div>
                    </a>
                @endforeach
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
                <h2 class="title reveal">Un avant-goût.<br>Une seule envie : y être.</h2>
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
                <p class="text reveal">Au cœur des Deux Plateaux Vallons, Le Cercle cultive le plaisir de recevoir
                    et l'art de se retrouver : une table française ouverte sur le monde, un jardin, une scène sous
                    les étoiles, et ce sentiment rare d'être attendu.</p>
                <a href="#notre-histoire" class="link-arrow reveal">Notre histoire</a>
            </div>
            <figure class="intro-media reveal">
                <x-picture src="section/about.jpg" alt="Intérieur élégant du restaurant Le Cercle" sizes="(max-width: 900px) 100vw, 50vw" />
            </figure>
        </div>
    </section>

    <!-- ============ NOTRE HISTOIRE ============ -->
    <section class="section histoire" id="notre-histoire">
        <div class="container histoire-inner">
            <p class="surtitle reveal">Notre histoire</p>
            <h2 class="title reveal">Il y a des lieux qu'on traverse.<br><em>Et des lieux qui nous retiennent.</em></h2>
            <div class="histoire-text reveal">
                <p>Cette maison a déjà vécu. Elle a connu d'autres soirs, d'autres rires, un autre nom. Nous ne l'avons
                    pas effacée. Nous l'avons réveillée.</p>
                <p>Nous l'avons appelée Le Cercle.</p>
                <p>Parce que les plus beaux moments de la vie se passent rarement seuls. Ils se passent autour d'une
                    table, entre ceux qu'on aime, ceux qu'on célèbre, ceux qu'on rencontre pour la première fois et
                    qu'on reverra.</p>
                <p>Un cercle n'a pas de bout de table. Personne n'y est au fond, personne n'y est à part. Chacun y a
                    sa place.</p>
                <p>C'est cela que nous voulons offrir. Pas seulement un repas. Le sentiment d'être attendu, reconnu,
                    accueilli comme chez des amis qui auraient le goût des belles choses.</p>
                <p class="histoire-statement">Le plaisir de recevoir.<br>L'art de se retrouver.</p>
                <p class="histoire-signature">Bienvenue dans le Cercle.<br><span>Stéphanie &amp; toute l'équipe</span></p>
            </div>
        </div>
    </section>

    <!-- ============ SIGNATURE DU CHEF ============ -->
    <section class="section chef">
        <div class="container chef-grid">
            <div class="chef-text">
                <p class="surtitle reveal">L'Esprit du Chef</p>
                <h2 class="title reveal">Rien n'est laissé au hasard.<br>Tout est laissé au goût.</h2>
                <p class="text reveal">Respecter le produit.<br>Chercher l'équilibre juste.<br>Surprendre, sans jamais en faire trop.</p>
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
            <p class="text light reveal">La lumière décline sur le jardin.<br>Une table vous attend.<br>
                Un verre se remplit.<br>La musique commence.</p>
            <p class="experience-statement reveal">Et le reste peut attendre.</p>
        </div>
    </section>

    <!-- ============ VOS MOMENTS ============ -->
    <section class="section moments">
        <div class="container moments-inner">
            <p class="surtitle reveal">Vos Moments</p>
            <h2 class="title reveal">Il y a toujours une raison<br>de se retrouver.</h2>
            <p class="text reveal">Un anniversaire qu'on n'oubliera pas.<br>Un déjeuner qui scelle un accord.<br>
                Un dîner à deux, loin du monde.<br>Une soirée qui réunit tous ceux qu'on aime.</p>
            <p class="moments-statement reveal">Vous choisissez l'occasion. Nous en faisons un souvenir.</p>
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
                    <p>Lundi – Vendredi : 11h30 – 02h00<br>Samedi : 18h00 – 02h00<br>Dimanche : fermé</p>
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
