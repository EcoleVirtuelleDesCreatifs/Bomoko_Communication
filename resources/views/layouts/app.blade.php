<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- SEO -->
    <title>@yield('title', config('app.name'))</title>
    <meta name="description" content="@yield('meta_description', 'Le Cercle, restaurant bistronomique confidentiel aux Deux Plateaux Vallons, Abidjan. Cuisine française réinterprétée, villa élégante, jardin et piscine. Réservez votre table.')">
    <meta name="robots" content="@yield('robots', 'index, follow')">
    <meta name="author" content="Le Cercle">
    <meta name="geo.region" content="CI-AB">
    <meta name="geo.placename" content="Abidjan">
    <meta name="theme-color" content="#2b2118">
    <link rel="canonical" href="{{ url()->current() }}">
    <link rel="alternate" hreflang="fr" href="{{ url()->current() }}">
    <link rel="sitemap" type="application/xml" href="{{ route('sitemap') }}">
    @yield('head_extra')
    @stack('preload')

    <!-- Open Graph -->
    <meta property="og:site_name" content="Le Cercle">
    <meta property="og:type" content="@yield('og_type', 'website')">
    <meta property="og:title" content="@yield('og_title', 'Le Cercle — Restaurant Bistronomique, Abidjan')">
    <meta property="og:description" content="@yield('og_description', 'Une table. Une atmosphère. Un moment qui n\'appartient qu\'à vous.')">
    <meta property="og:image" content="@yield('og_image', asset('assets/images/slider/img_slider_1.jpg'))">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:locale" content="fr_CI">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="@yield('og_title', 'Le Cercle — Restaurant Bistronomique, Abidjan')">
    <meta name="twitter:description" content="@yield('og_description', 'Une table. Une atmosphère. Un moment qui n\'appartient qu\'à vous.')">
    <meta name="twitter:image" content="@yield('og_image', asset('assets/images/slider/img_slider_1.jpg'))">

    <!-- Favicon -->
    <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('favicon-32.png') }}">
    <link rel="icon" type="image/png" sizes="192x192" href="{{ asset('favicon-192.png') }}">
    <link rel="apple-touch-icon" href="{{ asset('apple-touch-icon.png') }}">
    <link rel="manifest" href="{{ asset('site.webmanifest') }}">
    <link rel="shortcut icon" href="{{ asset('favicon.ico') }}">

    <noscript><style>.reveal{opacity:1;transform:none}</style></noscript>
    @stack('jsonld')

    <!-- Fonts : Montserrat (brandbook) + signature manuscrite du logo -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;1,300&family=Pinyon+Script&display=swap" onload="this.rel='stylesheet'">
    <noscript><link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;1,300&family=Pinyon+Script&display=swap" rel="stylesheet"></noscript>

    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
    @stack('styles')
</head>

<body>
    @include('partials.header')

    <main>
        @yield('content')
    </main>

    @include('partials.footer')

    @unless (request()->routeIs('reservation'))
        <div class="mobile-cta">
            <a href="{{ route('reservation') }}" class="btn btn-gold">Réserver</a>
            <a href="tel:{{ preg_replace('/\s+/', '', (string) config('site.phone')) }}" class="btn btn-outline">Appeler</a>
        </div>
    @endunless

    <script src="{{ asset('js/main.js') }}" defer></script>
    @stack('scripts')
</body>

</html>
