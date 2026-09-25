@extends('layouts.admin')

@section('title', $user ? 'Modifier un administrateur' : 'Ajouter un administrateur')

@section('content')
    <div class="admin-container admin-container-narrow">
        <div class="admin-page-header">
            <div>
                <h1 class="admin-title">{{ $user ? 'Modifier un administrateur' : 'Ajouter un administrateur' }}</h1>
            </div>
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

        <form method="POST" action="{{ $user ? route('admin.users.update', $user) : route('admin.users.store') }}" class="admin-card-form">
            @csrf
            @if ($user)
                @method('PUT')
            @endif

            <div class="form-row">
                <div class="form-group">
                    <label for="name">Nom</label>
                    <input type="text" id="name" name="name" value="{{ old('name', $user?->name) }}" required>
                </div>
                <div class="form-group">
                    <label for="email">Adresse e-mail</label>
                    <input type="email" id="email" name="email" value="{{ old('email', $user?->email) }}" required>
                </div>
            </div>

            <div class="form-group">
                <label for="role">Rôle</label>
                <select id="role" name="role" required>
                    @foreach ($roles as $role)
                        <option value="{{ $role->value }}" {{ old('role', $user?->role?->value ?? \App\Enums\UserRole::Manager->value) === $role->value ? 'selected' : '' }}>
                            {{ $role->label() }}
                        </option>
                    @endforeach
                </select>
                <p class="row-meta">Un super administrateur a tous les droits, y compris la gestion des administrateurs.</p>
            </div>

            <div class="form-group">
                <label>Droits d’accès <span class="row-meta">— ignorés pour un super administrateur</span></label>
                <div class="perm-grid">
                    @foreach ($permissions as $permission)
                        <label class="perm-card">
                            <input type="checkbox" name="permissions[]" value="{{ $permission->value }}"
                                {{ in_array($permission->value, old('permissions', $user?->permissions ?? []), true) ? 'checked' : '' }}>
                            <span class="perm-label">{{ $permission->label() }}</span>
                            <span class="perm-desc">{{ $permission->description() }}</span>
                        </label>
                    @endforeach
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="password">Mot de passe @if ($user)<span class="row-meta">— laisser vide pour ne pas changer</span>@endif</label>
                    <input type="password" id="password" name="password" {{ $user ? '' : '' }} autocomplete="new-password">
                </div>
                <div class="form-group">
                    <label for="password_confirmation">Confirmation</label>
                    <input type="password" id="password_confirmation" name="password_confirmation" autocomplete="new-password">
                </div>
            </div>

            @unless ($user)
                <div class="form-group form-checkbox">
                    <label>
                        <input type="checkbox" name="generate_password" value="1" {{ old('generate_password') ? 'checked' : '' }}>
                        Générer un mot de passe automatiquement
                    </label>
                </div>
                <div class="form-group form-checkbox">
                    <label>
                        <input type="checkbox" name="send_credentials" value="1" {{ old('send_credentials') ? 'checked' : '' }}>
                        Envoyer les identifiants par e-mail
                    </label>
                </div>
            @endunless

            <div class="form-group form-checkbox">
                <label>
                    <input type="checkbox" name="is_active" value="1" {{ old('is_active', $user?->is_active ?? true) ? 'checked' : '' }}>
                    Compte actif
                </label>
            </div>

            <div class="form-actions form-actions-left">
                <button type="submit" class="btn btn-gold">{{ $user ? 'Enregistrer' : 'Créer le compte' }}</button>
                <a href="{{ route('admin.users.index') }}" class="btn btn-ghost-dark">Annuler</a>
            </div>
        </form>
    </div>
@endsection
