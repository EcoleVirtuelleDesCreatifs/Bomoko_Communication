@extends('layouts.app')

@section('title', 'Réserver une table — Le Cercle')
@section('meta_description', 'Réservez votre table au Cercle, restaurant bistronomique aux Deux Plateaux Vallons, Abidjan.')

@section('content')
    <section class="page-hero" id="hero">
        <div class="hero-media">
            <x-picture src="section/booking.jpg" alt="Intérieur du restaurant Le Cercle" loading="eager" fetchpriority="high" sizes="100vw" />
            <div class="hero-overlay"></div>
        </div>
        <div class="hero-content">
            <p class="surtitle reveal">Réservation</p>
            <h1 class="hero-title reveal">Réservez votre table.</h1>
            <p class="hero-sub reveal">Laissez-nous préparer votre prochain moment au Cercle.</p>
        </div>
    </section>

    <section class="section booking-form" id="reservation">
        <div class="container form-container">
            @if (session('success'))
                <div class="alert alert-success alert-large" role="alert">
                    <span class="alert-icon" aria-hidden="true"></span>
                    <span>{{ session('success') }}</span>
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

            <form method="POST" action="{{ route('reservation.store') }}" class="reservation-form" novalidate>
                @csrf

                <div class="form-row">
                    <div class="form-group">
                        <label for="name">Nom complet</label>
                        <input type="text" id="name" name="name" value="{{ old('name') }}" required>
                    </div>

                    <div class="form-group">
                        <label for="email">Adresse e-mail</label>
                        <input type="email" id="email" name="email" value="{{ old('email') }}" required>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="phone">Téléphone</label>
                        <input type="tel" id="phone" name="phone" value="{{ old('phone') }}">
                    </div>

                    <div class="form-group">
                        <label for="guests">Nombre de couverts</label>
                        <input type="number" id="guests" name="guests" min="1" max="50" value="{{ old('guests', 2) }}" required>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="date">Date souhaitée</label>
                        <input type="date" id="date" name="date" value="{{ old('date') }}" required>
                    </div>

                    <div class="form-group">
                        <label for="time">Heure souhaitée</label>
                        <input type="time" id="time" name="time" value="{{ old('time') }}" required>
                    </div>
                </div>

                <fieldset class="form-group form-group-full">
                    <legend>Menu souhaité <span class="label-optional">(facultatif)</span></legend>
                    <div class="radio-group">
                        @foreach (App\Models\Reservation::menuChoices() as $value => $label)
                            <label class="radio-card">
                                <input type="radio" name="menu_choice" value="{{ $value }}" {{ old('menu_choice') === $value ? 'checked' : '' }}>
                                <span class="radio-label">{{ $label }}</span>
                            </label>
                        @endforeach
                    </div>
                    <p class="form-hint">
                        <a href="{{ route('menu') }}" class="link-arrow-inline">Consulter la carte et les prix</a>
                    </p>
                </fieldset>

                <div class="form-group form-group-full">
                    <label for="allergies">Allergies ou restrictions alimentaires <span class="label-optional">(facultatif)</span></label>
                    <textarea id="allergies" name="allergies" rows="3" placeholder="Précisez les informations utiles à la préparation de votre repas.">{{ old('allergies') }}</textarea>
                </div>

                <div class="form-group form-group-full">
                    <label for="message">Message ou demande particulière</label>
                    <textarea id="message" name="message" rows="4">{{ old('message') }}</textarea>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-gold">Envoyer la demande</button>
                    <p class="form-privacy">Les informations recueillies servent uniquement au traitement de votre réservation. <a href="{{ route('legal.privacy') }}">En savoir plus</a>.</p>
                    <a href="{{ route('home') }}" class="btn btn-ghost">Retour à l'accueil</a>
                </div>
            </form>
        </div>
    </section>
@endsection
