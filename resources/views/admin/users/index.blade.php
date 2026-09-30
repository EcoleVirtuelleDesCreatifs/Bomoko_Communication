@extends('layouts.admin')

@section('title', 'Administrateurs')

@section('content')
    @php
        $currentUsers = $users->getCollection();
        $activeCount = $currentUsers->where('is_active', true)->count();
        $inactiveCount = $currentUsers->count() - $activeCount;
        $superAdminCount = $currentUsers->filter(fn ($user) => $user->isSuperAdmin())->count();
    @endphp

    <div class="admin-container users-admin-page">
        <header class="admin-page-header users-admin-hero">
            <div class="users-admin-hero-copy">
                <span class="dashboard-eyebrow">Gestion des accès</span>
                <h1 class="admin-title">Administrateurs</h1>
                <p class="admin-subtitle">Constituez votre équipe, attribuez les bons accès et gardez le contrôle sur votre back-office.</p>
            </div>
            <a href="{{ route('admin.users.create') }}" class="users-admin-create"><span>+</span> Ajouter un administrateur</a>
        </header>

        <div class="users-admin-stats">
            <article class="users-admin-stat users-admin-stat-primary">
                <span class="users-admin-stat-icon">01</span>
                <div><strong>{{ $users->total() }}</strong><span>Comptes administrateurs</span></div>
            </article>
            <article class="users-admin-stat users-admin-stat-success">
                <span class="users-admin-stat-icon">02</span>
                <div><strong>{{ $activeCount }}</strong><span>Comptes actifs</span></div>
            </article>
            <article class="users-admin-stat users-admin-stat-warning">
                <span class="users-admin-stat-icon">03</span>
                <div><strong>{{ $inactiveCount }}</strong><span>Accès désactivés</span></div>
            </article>
            <article class="users-admin-stat users-admin-stat-purple">
                <span class="users-admin-stat-icon">04</span>
                <div><strong>{{ $superAdminCount }}</strong><span>Super administrateurs</span></div>
            </article>
        </div>

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

        <div class="users-admin-toolbar">
            <div>
                <span class="dashboard-section-kicker">Votre équipe</span>
                <h2>Comptes et permissions</h2>
            </div>
            <p>{{ $activeCount }} membre{{ $activeCount > 1 ? 's' : '' }} avec un accès actif</p>
        </div>

        @if ($users->isEmpty())
            <div class="admin-empty users-admin-empty">
                <span>Aucun compte secondaire</span>
                <h2>Invitez votre équipe</h2>
                <p>Créez des accès dédiés et attribuez à chacun uniquement les permissions dont il a besoin.</p>
                <a href="{{ route('admin.users.create') }}" class="users-admin-create"><span>+</span> Ajouter un administrateur</a>
            </div>
        @else
            <div class="users-admin-grid">
                @foreach ($users as $user)
                    <article class="users-admin-card {{ ! $user->is_active ? 'is-inactive' : '' }}">
                        <header class="users-admin-card-header">
                            <div class="users-admin-avatar">{{ Str::upper(Str::substr($user->name, 0, 1)) }}</div>
                            <div class="users-admin-identity">
                                <div class="users-admin-name-line">
                                    <h2>{{ $user->name }}</h2>
                                    @if ($user->id === auth()->id())
                                        <span class="users-admin-you">Vous</span>
                                    @endif
                                </div>
                                <a href="mailto:{{ $user->email }}">{{ $user->email }}</a>
                            </div>
                            <span class="users-admin-state {{ $user->is_active ? 'is-active' : 'is-inactive' }}">
                                {{ $user->is_active ? 'Actif' : 'Désactivé' }}
                            </span>
                        </header>

                        <div class="users-admin-card-body">
                            <div class="users-admin-role-line">
                                <span class="role-badge {{ $user->isSuperAdmin() ? 'role-super' : 'role-manager' }}">
                                    {{ $user->role->label() }}
                                </span>
                                <span class="users-admin-login">
                                    Dernière connexion : {{ $user->last_login_at?->format('d/m/Y H:i') ?? 'Jamais' }}
                                </span>
                            </div>

                            <div class="users-admin-permissions">
                                <span class="users-admin-label">Droits accordés</span>
                                <div class="users-admin-permission-list">
                                    @if ($user->isSuperAdmin())
                                        <span>Tous les droits</span>
                                    @elseif ($user->permissions)
                                        @foreach (collect($user->permissions)->map(fn ($permission) => \App\Enums\AdminPermission::from($permission)->label()) as $permission)
                                            <span>{{ $permission }}</span>
                                        @endforeach
                                    @else
                                        <span class="is-empty">Aucun droit spécifique</span>
                                    @endif
                                </div>
                            </div>
                        </div>

                        <footer class="users-admin-actions">
                            <a href="{{ route('admin.users.edit', $user) }}" class="users-admin-edit">Modifier le compte <span>→</span></a>
                            @if ($user->id !== auth()->id())
                                <form method="POST" action="{{ route('admin.users.destroy', $user) }}" onsubmit="return confirm('Supprimer le compte de {{ $user->name }} ?')">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="users-admin-delete">Supprimer</button>
                                </form>
                            @endif
                        </footer>
                    </article>
                @endforeach
            </div>

            <div class="pagination users-admin-pagination">
                {{ $users->links() }}
            </div>
        @endif
    </div>
@endsection
