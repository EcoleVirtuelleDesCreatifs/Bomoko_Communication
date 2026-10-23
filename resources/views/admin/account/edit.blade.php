@extends('layouts.admin')

@section('title', 'Mon compte')

@section('content')
    <div class="admin-container account-admin-page">
        <header class="admin-page-header account-admin-hero">
            <div class="account-admin-hero-copy">
                <span class="dashboard-eyebrow">Espace personnel</span>
                <h1 class="admin-title">Mon compte</h1>
                <p class="admin-subtitle">Gérez vos informations personnelles et protégez l’accès à votre espace d’administration.</p>
            </div>
            <span class="account-admin-secure"><span></span> Session sécurisée</span>
        </header>

        @if (session('success'))
            <div class="alert alert-success" role="alert">
                {{ session('success') }}
            </div>
        @endif

        @if ($errors->any())
            <div class="alert alert-error" role="alert">
                <ul>
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <div class="account-admin-layout">
            <aside class="account-profile-card">
                <div class="account-profile-cover"></div>
                <div class="account-profile-content">
                    <div class="account-profile-avatar">{{ Str::upper(Str::substr($user->name, 0, 1)) }}</div>
                    <h2>{{ $user->name }}</h2>
                    <a href="mailto:{{ $user->email }}">{{ $user->email }}</a>
                    <span class="role-badge {{ $user->isSuperAdmin() ? 'role-super' : 'role-manager' }}">{{ $user->role->label() }}</span>

                    <div class="account-profile-details">
                        <div>
                            <span>État du compte</span>
                            <strong class="account-state-active">Actif</strong>
                        </div>
                        <div>
                            <span>Dernière connexion</span>
                            <strong>{{ $user->last_login_at?->format('d/m/Y H:i') ?? 'Première connexion' }}</strong>
                        </div>
                    </div>
                </div>
            </aside>

            <form method="POST" action="{{ route('admin.account.update') }}" class="account-admin-form">
                @csrf
                @method('PUT')

                <section class="account-form-section">
                    <header class="account-section-header">
                        <span class="account-section-number">01</span>
                        <div>
                            <h2>Informations personnelles</h2>
                            <p>Mettez à jour le nom affiché dans l’administration.</p>
                        </div>
                    </header>

                    <div class="account-field-grid">
                        <div class="form-group">
                            <label for="name">Nom complet</label>
                            <input type="text" id="name" name="name" value="{{ old('name', $user->name) }}" required>
                        </div>
                        <div class="form-group account-readonly-field">
                            <label for="account_email">Adresse e-mail</label>
                            <input type="email" id="account_email" value="{{ $user->email }}" readonly>
                            <span>L’adresse e-mail est liée à votre compte.</span>
                        </div>
                    </div>
                </section>

                <section class="account-form-section account-security-section">
                    <header class="account-section-header">
                        <span class="account-section-number">02</span>
                        <div>
                            <h2>Sécurité du compte</h2>
                            <p>Laissez ces champs vides si vous ne souhaitez pas changer votre mot de passe.</p>
                        </div>
                    </header>

                    <div class="account-field-grid">
                        <div class="form-group">
                            <label for="password">Nouveau mot de passe</label>
                            <input type="password" id="password" name="password" autocomplete="new-password" placeholder="Nouveau mot de passe">
                        </div>
                        <div class="form-group">
                            <label for="password_confirmation">Confirmation</label>
                            <input type="password" id="password_confirmation" name="password_confirmation" autocomplete="new-password" placeholder="Confirmez le mot de passe">
                        </div>
                    </div>

                    <div class="form-group account-current-password">
                        <label for="current_password">Mot de passe actuel</label>
                        <input type="password" id="current_password" name="current_password" autocomplete="current-password" placeholder="Requis pour valider un nouveau mot de passe">
                        <span>Cette vérification protège votre compte contre les modifications non autorisées.</span>
                    </div>
                </section>

                <footer class="account-form-actions">
                    <a href="{{ route('admin.dashboard') }}" class="account-back-link">← Retour au tableau de bord</a>
                    <button type="submit" class="account-save-button">Enregistrer les modifications <span>→</span></button>
                </footer>
            </form>
        </div>
    </div>
@endsection
