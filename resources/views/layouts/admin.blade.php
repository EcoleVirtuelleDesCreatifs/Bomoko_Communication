<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Administration') — Le Cercle</title>
    <meta name="robots" content="noindex, nofollow">
    <meta name="theme-color" content="#2b2118">
    <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('favicon-32.png') }}">
    <link rel="icon" type="image/png" sizes="192x192" href="{{ asset('favicon-192.png') }}">
    <link rel="apple-touch-icon" href="{{ asset('apple-touch-icon.png') }}">
    <link rel="shortcut icon" href="{{ asset('favicon.ico') }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;1,300&family=Pinyon+Script&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
    @stack('styles')
</head>

<body class="admin-body admin">
    @auth
        <header class="admin-header">
            <div class="admin-header-inner">
                <a href="{{ route('admin.dashboard') }}" class="admin-brand">
                    <span class="brand-script">Le Cercle</span>
                    <span class="admin-brand-label">Administration</span>
                </a>

                <button type="button" id="adminNavToggle" class="admin-nav-toggle" aria-expanded="false" aria-controls="adminNav" aria-label="Ouvrir le menu">
                    <span></span><span></span><span></span>
                </button>

                <nav class="admin-nav" id="adminNav" aria-label="Navigation administration">
                    <ul>
                        <li><a href="{{ route('admin.dashboard') }}">Tableau de bord</a></li>
                        @can('manage-menu')
                            <li><a href="{{ route('admin.menu.index') }}">La Carte</a></li>
                        @endcan
                        @can('manage-events')
                            <li><a href="{{ route('admin.events.index') }}">Actualités</a></li>
                        @endcan
                        @can('manage-users')
                            <li><a href="{{ route('admin.users.index') }}">Administrateurs</a></li>
                        @endcan
                        <li><a href="{{ route('admin.account.edit') }}">Mon compte</a></li>
                        <li><a href="{{ route('home') }}" target="_blank">Voir le site</a></li>
                    </ul>
                    <div class="admin-user admin-user-nav">
                        <span class="admin-user-name">{{ auth()->user()->name }}</span>
                        <form method="POST" action="{{ route('admin.logout') }}" class="admin-logout">
                            @csrf
                            <button type="submit" class="btn btn-outline">Déconnexion</button>
                        </form>
                    </div>
                </nav>

                <div class="admin-user admin-user-header">
                    <span class="admin-user-name">{{ auth()->user()->name }}</span>
                    <form method="POST" action="{{ route('admin.logout') }}" class="admin-logout">
                        @csrf
                        <button type="submit" class="btn btn-outline">Déconnexion</button>
                    </form>
                </div>
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
