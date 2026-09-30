<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Administration') — Le Cercle</title>
    <meta name="robots" content="noindex, nofollow">
    <meta name="theme-color" content="#ffffff">
    <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('favicon-32.png') }}">
    <link rel="icon" type="image/png" sizes="192x192" href="{{ asset('favicon-192.png') }}">
    <link rel="apple-touch-icon" href="{{ asset('apple-touch-icon.png') }}">
    <link rel="shortcut icon" href="{{ asset('favicon.ico') }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Pinyon+Script&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
    @stack('styles')
</head>

<body class="admin-body admin">
    @auth
        <aside class="admin-sidebar" id="adminNav" aria-label="Navigation administration">
            <a href="{{ route('admin.dashboard') }}" class="admin-brand">
                <span class="admin-brand-mark">LC</span>
                <span>
                    <span class="brand-script">Le Cercle</span>
                    <span class="admin-brand-label">Administration</span>
                </span>
            </a>

            <nav class="admin-nav">
                <span class="admin-nav-heading">Principal</span>
                <ul>
                    <li><a href="{{ route('admin.dashboard') }}" class="{{ request()->routeIs('admin.dashboard') ? 'is-active' : '' }}"><span class="admin-nav-icon">⌂</span> Tableau de bord</a></li>
                    @can('manage-reservations')
                        <li>
                            <a href="{{ route('admin.reservations.index', ['status' => 'pending', 'period' => 'upcoming']) }}" class="{{ request()->routeIs('admin.reservations.*') ? 'is-active' : '' }}">
                                <span class="admin-nav-icon">▤</span>
                                <span class="admin-nav-label">Réservations</span>
                                @if ($pendingReservationsCount > 0)
                                    <span class="admin-nav-badge" aria-label="{{ $pendingReservationsCount }} réservations en attente">{{ $pendingReservationsCount > 99 ? '99+' : $pendingReservationsCount }}</span>
                                @endif
                            </a>
                        </li>
                    @endcan
                    @can('manage-menu')
                        <li><a href="{{ route('admin.menu.index') }}" class="{{ request()->routeIs('admin.menu.*') ? 'is-active' : '' }}"><span class="admin-nav-icon">≡</span> La Carte</a></li>
                    @endcan
                    @can('manage-events')
                        <li><a href="{{ route('admin.events.index') }}" class="{{ request()->routeIs('admin.events.*') ? 'is-active' : '' }}"><span class="admin-nav-icon">◇</span> Actualités</a></li>
                    @endcan
                    @can('manage-users')
                        <li><a href="{{ route('admin.users.index') }}" class="{{ request()->routeIs('admin.users.*') ? 'is-active' : '' }}"><span class="admin-nav-icon">◎</span> Administrateurs</a></li>
                    @endcan
                </ul>
                <span class="admin-nav-heading">Compte</span>
                <ul>
                    <li><a href="{{ route('admin.account.edit') }}" class="{{ request()->routeIs('admin.account.*') ? 'is-active' : '' }}"><span class="admin-nav-icon">○</span> Mon compte</a></li>
                    <li><a href="{{ route('home') }}" target="_blank"><span class="admin-nav-icon">↗</span> Voir le site</a></li>
                </ul>
            </nav>
        </aside>

        <header class="admin-header">
            <button type="button" id="adminNavToggle" class="admin-nav-toggle" aria-expanded="false" aria-controls="adminNav" aria-label="Ouvrir le menu">
                <span></span><span></span><span></span>
            </button>
            <div class="admin-header-search">
                <span>⌕</span>
                <input type="search" aria-label="Rechercher" placeholder="Rechercher...">
            </div>
            <button type="button" id="adminThemeToggle" class="admin-theme-toggle" aria-label="Activer le mode sombre">
                <span class="admin-theme-icon admin-theme-icon-light">☀</span>
                <span class="admin-theme-icon admin-theme-icon-dark">☾</span>
            </button>
            <div class="admin-user admin-user-header">
                <span class="admin-user-avatar">{{ Str::upper(Str::substr(auth()->user()->name, 0, 1)) }}</span>
                <span class="admin-user-copy">
                    <strong>{{ auth()->user()->name }}</strong>
                    <small>Administrateur</small>
                </span>
                <form method="POST" action="{{ route('admin.logout') }}" class="admin-logout">
                    @csrf
                    <button type="submit" class="admin-logout-button">Déconnexion</button>
                </form>
            </div>
        </header>
    @endauth

    <main class="admin-main">
        @yield('content')
    </main>

    <script src="{{ asset('js/main.js') }}" defer></script>
    @stack('scripts')
</body>

</html>
