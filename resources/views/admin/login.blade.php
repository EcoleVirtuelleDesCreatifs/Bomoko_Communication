@extends('layouts.admin')

@section('title', 'Connexion')

@section('content')
    <section class="admin-login">
        <div class="admin-login-box">
            <span class="brand-script">Le Cercle</span>
            <h1>Administration</h1>

            @if ($errors->any())
                <div class="alert alert-error" role="alert">
                    <ul>
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <form method="POST" action="{{ route('admin.login.store') }}" class="admin-form" novalidate>
                @csrf

                <div class="form-group">
                    <label for="email">Adresse e-mail</label>
                    <input type="email" id="email" name="email" value="{{ old('email') }}" required autofocus>
                </div>

                <div class="form-group">
                    <label for="password">Mot de passe</label>
                    <input type="password" id="password" name="password" required>
                </div>

                <div class="form-group form-checkbox">
                    <label>
                        <input type="checkbox" name="remember" {{ old('remember') ? 'checked' : '' }}>
                        Se souvenir de moi
                    </label>
                </div>

                <button type="submit" class="btn btn-gold btn-full">Se connecter</button>
            </form>
        </div>
    </section>
@endsection
