@php
    use App\Support\ResponsiveImage;

    $homeUrl = route('home');
    $reservationUrl = config('site.reservation_url') ?: route('reservation');
    $logo240 = public_path('assets/images/optimized/logo/logo-240.png');
    $logoSrcset = file_exists($logo240)
        ? asset('assets/images/optimized/logo/logo-240.png') . ' 1x, ' . asset('assets/images/optimized/logo/logo-480.png') . ' 2x'
        : null;
    $logoDimensions = ResponsiveImage::dimensions('logo/logo.png');
@endphp

<!-- ============ HEADER ============ -->
<header class="site-header" id="siteHeader">
    <div class="header-inner">
        <a href="{{ $homeUrl }}#hero" class="brand" aria-label="Le Cercle — accueil">
            <img src="{{ $logoSrcset ? asset('assets/images/optimized/logo/logo-240.png') : asset('assets/images/logo/logo.png') }}" @if ($logoSrcset) srcset="{{ $logoSrcset }}" @endif @if ($logoDimensions) width="{{ $logoDimensions['width'] }}" height="{{ $logoDimensions['height'] }}" @endif alt="Le Cercle" class="brand-logo">
        </a>

        <nav class="main-nav" id="mainNav" aria-label="Navigation principale">
            <ul>
                <li><a href="{{ $homeUrl }}#la-carte">La Carte</a></li>
                <li><a href="{{ $homeUrl }}#espaces">Nos Espaces</a></li>
                <li><a href="{{ $homeUrl }}#galerie">Galerie</a></li>
                <li><a href="{{ $homeUrl }}#le-cercle">Le Cercle</a></li>
                <li><a href="{{ route('events.index') }}">Événements</a></li>
                <li><a href="{{ $homeUrl }}#contact">Contact</a></li>
            </ul>
        </nav>

        <div class="header-actions">
            <a href="{{ $reservationUrl }}" class="btn btn-outline btn-reserve">Réserver</a>
            <button class="nav-toggle" id="navToggle" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="mainNav">
                <span></span><span></span>
            </button>
        </div>
    </div>
</header>
