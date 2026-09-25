@extends('layouts.admin')

@section('title', 'Mon compte')

@section('content')
    <div class="admin-container admin-container-narrow">
        <div class="admin-page-header">
            <div>
                <h1 class="admin-title">Mon compte</h1>
                <p class="admin-subtitle">{{ $user->email }} — {{ $user->role->label() }}</p>
            </div>
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

        <form method="POST" action="{{ route('admin.account.update') }}" class="admin-card-form">
            @csrf
            @method('PUT')

            <div class="form-group">
                <label for="name">Nom</label>
                <input type="text" id="name" name="name" value="{{ old('name', $user->name) }}" required>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="password">Nouveau mot de passe <span class="row-meta">— laisser vide pour ne pas changer</span></label>
                    <input type="password" id="password" name="password" autocomplete="new-password">
                </div>
                <div class="form-group">
                    <label for="password_confirmation">Confirmation</label>
                    <input type="password" id="password_confirmation" name="password_confirmation" autocomplete="new-password">
                </div>
            </div>

            <div class="form-group">
                <label for="current_password">Mot de passe actuel <span class="row-meta">— requis pour changer de mot de passe</span></label>
                <input type="password" id="current_password" name="current_password" autocomplete="current-password">
            </div>

            <div class="form-actions form-actions-left">
                <button type="submit" class="btn btn-gold">Enregistrer</button>
                <a href="{{ route('admin.dashboard') }}" class="btn btn-ghost-dark">Retour</a>
            </div>
        </form>
    </div>
@endsection
