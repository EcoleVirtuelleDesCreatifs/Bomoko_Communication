@extends('layouts.admin')

@section('title', 'Administrateurs')

@section('content')
    <div class="admin-container">
        <header class="admin-page-header">
            <div>
                <h1 class="admin-title">Administrateurs</h1>
                <p class="admin-subtitle">Gérez les comptes et les droits d’accès au back-office.</p>
            </div>
            <a href="{{ route('admin.users.create') }}" class="btn btn-gold">Ajouter un administrateur</a>
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

        <section class="admin-section">
            <div class="table-wrapper">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>E-mail</th>
                            <th>Rôle</th>
                            <th>Droits</th>
                            <th>Statut</th>
                            <th>Dernière connexion</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse ($users as $user)
                            <tr>
                                <td>
                                    <strong>{{ $user->name }}</strong>
                                    @if ($user->id === auth()->id())
                                        <span class="row-meta">(vous)</span>
                                    @endif
                                </td>
                                <td><a href="mailto:{{ $user->email }}">{{ $user->email }}</a></td>
                                <td>
                                    <span class="role-badge {{ $user->isSuperAdmin() ? 'role-super' : 'role-manager' }}">
                                        {{ $user->role->label() }}
                                    </span>
                                </td>
                                <td>
                                    @if ($user->isSuperAdmin())
                                        <span class="row-meta">Tous les droits</span>
                                    @elseif ($user->permissions)
                                        {{ collect($user->permissions)->map(fn ($p) => \App\Enums\AdminPermission::from($p)->label())->implode(' · ') }}
                                    @else
                                        <span class="row-meta">Aucun</span>
                                    @endif
                                </td>
                                <td>
                                    <span class="status-badge {{ $user->is_active ? 'status-confirmed' : 'status-cancelled' }}">
                                        {{ $user->is_active ? 'Actif' : 'Désactivé' }}
                                    </span>
                                </td>
                                <td>
                                    {{ $user->last_login_at?->format('d/m/Y H:i') ?? '—' }}
                                </td>
                                <td>
                                    <div class="row-actions">
                                        <a href="{{ route('admin.users.edit', $user) }}" class="btn btn-small btn-edit">Modifier</a>
                                        @if ($user->id !== auth()->id())
                                            <form method="POST" action="{{ route('admin.users.destroy', $user) }}" onsubmit="return confirm('Supprimer le compte de {{ $user->name }} ?')">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit" class="btn btn-small btn-delete">Supprimer</button>
                                            </form>
                                        @endif
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="cell-empty">Aucun administrateur.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <div class="pagination">
                {{ $users->links() }}
            </div>
        </section>
    </div>
@endsection
