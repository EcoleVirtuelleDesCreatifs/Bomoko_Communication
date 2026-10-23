@extends('layouts.admin')

@section('title', 'Connexion')

@section('content')
    <section class="admin-login login-admin-page">
        <div class="login-admin-shell">
            <div class="login-admin-visual">
                <div class="login-admin-brand">
                    <img
                        src="{{ asset('assets/images/optimized/logo/logo-240.png') }}"
                        srcset="{{ asset('assets/images/optimized/logo/logo-240.png') }} 1x, {{ asset('assets/images/optimized/logo/logo-480.png') }} 2x"
                        alt="Le Cercle — Restaurant Bistronomique"
                        class="login-admin-logo"
                        width="240"
                        height="240"
                    >
                </div>
                <div class="login-admin-message">
                    <span>Espace privé</span>
                    <h1>Pilotez votre restaurant avec simplicité.</h1>
                    <p>Réservations, carte, actualités et équipe réunies dans un seul espace.</p>
                </div>
                <small>Administration Le Cercle</small>
            </div>

            <div class="login-admin-form-panel">
                <div class="login-admin-heading">
                    <span>Connexion sécurisée</span>
                    <h2>Bienvenue</h2>
                    <p>Identifiez-vous pour accéder à votre tableau de bord.</p>
                </div>

                @if ($errors->any())
                    <div class="alert alert-error" role="alert">
                        <ul>
                            @foreach ($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                <form method="POST" action="{{ route('admin.login.store') }}" class="admin-form login-admin-form" novalidate>
                    @csrf

                    <div class="form-group">
                        <label for="email">Adresse e-mail</label>
                        <input type="email" id="email" name="email" value="{{ old('email') }}" placeholder="info@cercle-abidjan.com" required autofocus>
                    </div>

                    <div class="form-group">
                        <label for="password">Mot de passe</label>
                        <input type="password" id="password" name="password" placeholder="Votre mot de passe" required>
                    </div>

                    <div class="form-group form-checkbox login-remember">
                        <label>
                            <input type="checkbox" name="remember" {{ old('remember') ? 'checked' : '' }}>
                            Se souvenir de moi
                        </label>
                    </div>

                    <button type="submit" class="login-admin-submit">Accéder à l’administration <span>→</span></button>
                </form>
            </div>
        </div>
    </section>
@endsection
