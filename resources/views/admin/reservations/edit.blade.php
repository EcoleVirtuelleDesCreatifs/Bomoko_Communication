@extends('layouts.admin')

@section('title', 'Modifier la réservation')

@section('content')
    <div class="admin-container admin-container-narrow">
        <div class="admin-page-header">
            <div>
                <h1 class="admin-title">Modifier la réservation</h1>
                <p class="admin-subtitle">Client : {{ $reservation->name }}</p>
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

        <form method="POST" action="{{ route('admin.reservations.update', $reservation) }}" class="admin-card-form">
            @csrf
            @method('PUT')

            <div class="form-row">
                <div class="form-group">
                    <label for="name">Nom complet</label>
                    <input type="text" id="name" name="name" value="{{ old('name', $reservation->name) }}" required>
                </div>
                <div class="form-group">
                    <label for="email">E-mail</label>
                    <input type="email" id="email" name="email" value="{{ old('email', $reservation->email) }}" required>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="phone">Téléphone</label>
                    <input type="tel" id="phone" name="phone" value="{{ old('phone', $reservation->phone) }}">
                </div>
                <div class="form-group">
                    <label for="guests">Couverts</label>
                    <input type="number" id="guests" name="guests" min="1" max="50" value="{{ old('guests', $reservation->guests) }}" required>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="date">Date</label>
                    <input type="date" id="date" name="date" value="{{ old('date', $reservation->date->format('Y-m-d')) }}" required>
                </div>
                <div class="form-group">
                    <label for="time">Heure</label>
                    <input type="time" id="time" name="time" value="{{ old('time', \Carbon\Carbon::parse($reservation->time)->format('H:i')) }}" required>
                </div>
            </div>

            <div class="form-group">
                <label for="menu_choice">Menu choisi</label>
                <select id="menu_choice" name="menu_choice">
                    <option value="" {{ old('menu_choice', $reservation->menu_choice) === null ? 'selected' : '' }}>—</option>
                    @foreach (App\Models\Reservation::menuChoices() as $value => $label)
                        <option value="{{ $value }}" {{ old('menu_choice', $reservation->menu_choice) === $value ? 'selected' : '' }}>{{ $label }}</option>
                    @endforeach
                </select>
            </div>

            <div class="form-group">
                <label for="allergies">Allergies / Restrictions</label>
                <textarea id="allergies" name="allergies" rows="3">{{ old('allergies', $reservation->allergies) }}</textarea>
            </div>

            <div class="form-group">
                <label for="status">Statut</label>
                <select id="status" name="status" required>
                    <option value="pending" {{ old('status', $reservation->status) === 'pending' ? 'selected' : '' }}>En attente</option>
                    <option value="confirmed" {{ old('status', $reservation->status) === 'confirmed' ? 'selected' : '' }}>Confirmée</option>
                    <option value="cancelled" {{ old('status', $reservation->status) === 'cancelled' ? 'selected' : '' }}>Annulée</option>
                </select>
                <p class="form-hint">Passer en « Confirmée » enverra un e-mail de confirmation au client.</p>
            </div>

            <div class="form-group">
                <label for="message">Message / Demandes particulières</label>
                <textarea id="message" name="message" rows="4">{{ old('message', $reservation->message) }}</textarea>
            </div>

            <div class="form-actions form-actions-left">
                <button type="submit" class="btn btn-gold">Enregistrer les modifications</button>
                <a href="{{ route('admin.dashboard') }}" class="btn btn-ghost-dark">Annuler</a>
            </div>
        </form>
    </div>
@endsection
