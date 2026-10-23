@extends('layouts.admin')

@section('title', 'Réservations')

@section('content')
    <div class="admin-container reservations-page">
        <header class="admin-page-header reservations-hero">
            <div>
                <span class="dashboard-eyebrow">Centre opérationnel</span>
                <h1 class="admin-title">Réservations</h1>
                <p class="admin-subtitle">Anticipez chaque service, traitez les demandes et offrez un accueil parfaitement préparé.</p>
            </div>
            <div class="reservations-hero-focus">
                <span>Service du jour</span>
                <strong>{{ $stats['today_guests'] }}</strong>
                <small>couverts confirmés</small>
            </div>
        </header>

        @if (session('success'))
            <div class="alert alert-success" role="alert">{{ session('success') }}</div>
        @endif

        <div class="reservations-kpis">
            <a href="{{ route('admin.reservations.index', ['status' => 'pending', 'period' => 'upcoming']) }}" class="reservations-kpi is-warning">
                <span class="reservations-kpi-index">01</span>
                <div><strong>{{ $stats['pending'] }}</strong><span>À traiter</span><small>Demandes en attente</small></div>
            </a>
            <a href="{{ route('admin.reservations.index', ['status' => 'confirmed', 'period' => 'upcoming']) }}" class="reservations-kpi is-success">
                <span class="reservations-kpi-index">02</span>
                <div><strong>{{ $stats['today'] }}</strong><span>Aujourd’hui</span><small>{{ $stats['today_guests'] }} couverts</small></div>
            </a>
            <a href="{{ route('admin.reservations.index', ['status' => 'confirmed', 'period' => 'upcoming']) }}" class="reservations-kpi is-primary">
                <span class="reservations-kpi-index">03</span>
                <div><strong>{{ $stats['upcoming_week'] }}</strong><span>7 prochains jours</span><small>Confirmées</small></div>
            </a>
            <a href="{{ route('admin.reservations.index', ['period' => 'all']) }}" class="reservations-kpi is-purple">
                <span class="reservations-kpi-index">04</span>
                <div><strong>{{ $stats['month'] }}</strong><span>Ce mois</span><small>{{ $stats['month_cancelled'] }} annulées</small></div>
            </a>
        </div>

        <section class="reservations-control-panel">
            <div class="reservations-panel-heading">
                <div>
                    <span class="dashboard-section-kicker">Pilotage en temps réel</span>
                    <h2>Liste des réservations</h2>
                </div>
                <span>{{ $reservations->total() }} résultat{{ $reservations->total() > 1 ? 's' : '' }}</span>
            </div>

            <form method="GET" action="{{ route('admin.reservations.index') }}" class="reservations-filters">
                <div class="reservations-tabs">
                    <a href="{{ route('admin.reservations.index', array_filter(['period' => $filters['period'], 'q' => $filters['q']])) }}" class="{{ ! $filters['status'] ? 'is-active' : '' }}">Toutes <span>{{ array_sum($statusCounts) }}</span></a>
                    <a href="{{ route('admin.reservations.index', array_filter(['status' => 'pending', 'period' => $filters['period'], 'q' => $filters['q']])) }}" class="{{ $filters['status'] === 'pending' ? 'is-active' : '' }}">En attente <span>{{ $statusCounts['pending'] }}</span></a>
                    <a href="{{ route('admin.reservations.index', array_filter(['status' => 'confirmed', 'period' => $filters['period'], 'q' => $filters['q']])) }}" class="{{ $filters['status'] === 'confirmed' ? 'is-active' : '' }}">Confirmées <span>{{ $statusCounts['confirmed'] }}</span></a>
                    <a href="{{ route('admin.reservations.index', array_filter(['status' => 'cancelled', 'period' => $filters['period'], 'q' => $filters['q']])) }}" class="{{ $filters['status'] === 'cancelled' ? 'is-active' : '' }}">Annulées <span>{{ $statusCounts['cancelled'] }}</span></a>
                </div>
                <div class="reservations-filter-fields">
                    <select name="period" onchange="this.form.submit()">
                        <option value="upcoming" {{ $filters['period'] === 'upcoming' ? 'selected' : '' }}>À venir</option>
                        <option value="past" {{ $filters['period'] === 'past' ? 'selected' : '' }}>Passées</option>
                        <option value="all" {{ $filters['period'] === 'all' ? 'selected' : '' }}>Toutes les périodes</option>
                    </select>
                    <input type="search" name="q" value="{{ $filters['q'] }}" placeholder="Rechercher un client...">
                    @if ($filters['status'])
                        <input type="hidden" name="status" value="{{ $filters['status'] }}">
                    @endif
                    <button type="submit">Rechercher</button>
                </div>
            </form>

            <div class="reservations-grid">
                @forelse ($reservations as $reservation)
                    <article class="reservation-card status-{{ $reservation->status }}">
                        <header class="reservation-card-header">
                            <div class="reservation-date-block">
                                <strong>{{ $reservation->date->format('d') }}</strong>
                                <span>{{ $reservation->date->translatedFormat('M') }}</span>
                            </div>
                            <div class="reservation-time-block">
                                <strong>{{ \Carbon\Carbon::parse($reservation->time)->format('H:i') }}</strong>
                                <span>{{ $reservation->guests }} couvert{{ $reservation->guests > 1 ? 's' : '' }}</span>
                            </div>
                            <span class="status-badge status-{{ $reservation->status }}">
                                {{ match($reservation->status) { 'pending' => 'En attente', 'confirmed' => 'Confirmée', 'cancelled' => 'Annulée', default => $reservation->status } }}
                            </span>
                        </header>

                        <div class="reservation-card-body">
                            <h3>{{ $reservation->name }}</h3>
                            <div class="reservation-contact">
                                <a href="mailto:{{ $reservation->email }}">{{ $reservation->email }}</a>
                                @if ($reservation->phone)<a href="tel:{{ $reservation->phone }}">{{ $reservation->phone }}</a>@endif
                            </div>
                            @if ($reservation->menu_choice)<span class="reservation-menu">{{ $reservation->menuChoiceLabel() }}</span>@endif
                            @if ($reservation->allergies)<p class="reservation-alert">Allergies : {{ Str::limit($reservation->allergies, 80) }}</p>@endif
                            @if ($reservation->message)<p class="reservation-message">{{ Str::limit($reservation->message, 110) }}</p>@endif
                        </div>

                        <footer class="reservation-card-actions">
                            @if ($reservation->status === 'pending')
                                <form method="POST" action="{{ route('admin.reservations.status', $reservation) }}" data-reservation-confirm>
                                    @csrf @method('PATCH')
                                    <input type="hidden" name="status" value="confirmed">
                                    <button type="submit" class="reservation-confirm" data-loading-text="Confirmation…">Confirmer</button>
                                </form>
                            @endif
                            <a href="{{ route('admin.reservations.edit', $reservation) }}">Voir et modifier <span>→</span></a>
                        </footer>
                    </article>
                @empty
                    <div class="reservations-empty">
                        <span>Aucun résultat</span>
                        <h3>Aucune réservation ne correspond à ces critères.</h3>
                        <a href="{{ route('admin.reservations.index') }}">Réinitialiser les filtres</a>
                    </div>
                @endforelse
            </div>

            <div class="pagination reservations-pagination">{{ $reservations->links() }}</div>
        </section>
    </div>
@endsection
