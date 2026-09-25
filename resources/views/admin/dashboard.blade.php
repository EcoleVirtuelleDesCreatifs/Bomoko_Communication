@extends('layouts.admin')

@section('title', 'Tableau de bord')

@section('content')
    <div class="admin-container">
        <header class="admin-page-header">
            <div>
                <h1 class="admin-title">Bonjour {{ Str::of(auth()->user()->name)->before(' ') }}</h1>
                <p class="admin-subtitle">{{ now()->translatedFormat('l j F Y') }}</p>
                @if ($canReservations && $stats['pending'] > 0)
                    <a href="#a-traiter" class="pill-alert">{{ $stats['pending'] }} réservation{{ $stats['pending'] > 1 ? 's' : '' }} à traiter</a>
                @endif
            </div>
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

        @can('manage-reservations')
            <div class="stats-grid">
                <a href="{{ route('admin.dashboard', ['status' => 'confirmed', 'period' => 'upcoming']) }}" class="stat-card">
                    <span class="stat-value">{{ $stats['today'] }}</span>
                    <span class="stat-label">Aujourd'hui</span>
                    <span class="stat-sub">{{ $stats['today_guests'] }} couverts</span>
                </a>
                <a href="{{ route('admin.dashboard', ['status' => 'pending', 'period' => 'upcoming']) }}" class="stat-card {{ $stats['pending'] > 0 ? 'stat-card-alert' : '' }}">
                    <span class="stat-value">{{ $stats['pending'] }}</span>
                    <span class="stat-label">À traiter</span>
                </a>
                <a href="{{ route('admin.dashboard', ['status' => 'confirmed', 'period' => 'upcoming']) }}" class="stat-card">
                    <span class="stat-value">{{ $stats['upcoming_week'] }}</span>
                    <span class="stat-label">7 prochains jours</span>
                </a>
                <a href="{{ route('admin.dashboard', ['period' => 'all']) }}" class="stat-card">
                    <span class="stat-value">{{ $stats['month'] }}</span>
                    <span class="stat-label">Ce mois</span>
                    <span class="stat-sub">{{ $stats['month_cancelled'] }} annulées</span>
                </a>
            </div>

            <section class="admin-section" id="a-traiter">
                <div class="admin-section-header">
                    <h2 class="admin-section-title">À traiter</h2>
                </div>

                @if ($todo->isEmpty())
                    <p class="cell-empty dashboard-ok">Tout est à jour — aucune réservation en attente.</p>
                @else
                    <div class="todo-grid">
                        @foreach ($todo as $reservation)
                            <article class="todo-card">
                                <strong class="todo-name">{{ $reservation->name }}</strong>
                                <span class="todo-when">
                                    {{ $reservation->date->translatedFormat('D d/m') }} · {{ \Carbon\Carbon::parse($reservation->time)->format('H:i') }}
                                </span>
                                <p class="todo-meta">
                                    {{ $reservation->guests }} couverts
                                    @if ($reservation->menu_choice)
                                        · {{ $reservation->menuChoiceLabel() }}
                                    @endif
                                </p>
                                @if ($reservation->allergies)
                                    <p class="todo-note todo-allergies">⚠ {{ Str::limit($reservation->allergies, 60) }}</p>
                                @endif
                                @if ($reservation->message)
                                    <p class="todo-note">{{ Str::limit($reservation->message, 60) }}</p>
                                @endif
                                @if ($reservation->phone)
                                    <a href="tel:{{ $reservation->phone }}" class="todo-phone">☎ {{ $reservation->phone }}</a>
                                @endif
                                <div class="todo-actions">
                                    <form method="POST" action="{{ route('admin.reservations.status', $reservation) }}">
                                        @csrf
                                        @method('PATCH')
                                        <input type="hidden" name="status" value="confirmed">
                                        <button type="submit" class="btn btn-small btn-gold">Confirmer</button>
                                    </form>
                                    <form method="POST" action="{{ route('admin.reservations.status', $reservation) }}">
                                        @csrf
                                        @method('PATCH')
                                        <input type="hidden" name="status" value="cancelled">
                                        <button type="submit" class="btn btn-small btn-ghost-dark">Annuler</button>
                                    </form>
                                    <a href="{{ route('admin.reservations.edit', $reservation) }}" class="todo-edit">Modifier</a>
                                </div>
                            </article>
                        @endforeach
                    </div>
                @endif
            </section>

            <section class="admin-section">
                <div class="admin-section-header">
                    <h2 class="admin-section-title">Service du jour</h2>
                </div>

                @php
                    $lunch = $todayService->filter(fn ($r) => \Carbon\Carbon::parse($r->time)->hour < 16);
                    $dinner = $todayService->filter(fn ($r) => \Carbon\Carbon::parse($r->time)->hour >= 16);
                @endphp

                @if ($todayService->isEmpty())
                    <p class="cell-empty">Aucune réservation confirmée aujourd'hui.</p>
                @else
                    @foreach ([['Déjeuner', $lunch], ['Dîner', $dinner]] as [$serviceLabel, $serviceReservations])
                        @if ($serviceReservations->isNotEmpty())
                            <h3 class="service-title">{{ $serviceLabel }} · {{ $serviceReservations->sum('guests') }} couverts</h3>
                            <ul class="service-list">
                                @foreach ($serviceReservations as $reservation)
                                    <li class="service-row">
                                        <span class="service-time">{{ \Carbon\Carbon::parse($reservation->time)->format('H:i') }}</span>
                                        <span class="service-name">
                                            <strong>{{ $reservation->name }}</strong>
                                            @if ($reservation->allergies)
                                                <span class="todo-note todo-allergies">⚠ {{ Str::limit($reservation->allergies, 60) }}</span>
                                            @endif
                                        </span>
                                        <span class="service-guests">{{ $reservation->guests }} couverts</span>
                                        <span class="service-contact">
                                            @if ($reservation->phone)
                                                <a href="tel:{{ $reservation->phone }}">{{ $reservation->phone }}</a>
                                            @endif
                                        </span>
                                    </li>
                                @endforeach
                            </ul>
                        @endif
                    @endforeach
                @endif
            </section>

            <section class="admin-section">
                <div class="admin-section-header">
                    <h2 class="admin-section-title">Toutes les réservations</h2>
                </div>

                <form method="GET" action="{{ route('admin.dashboard') }}" class="filter-bar">
                    <div class="filter-tabs">
                        <a href="{{ route('admin.dashboard', array_filter(['period' => $filters['period'], 'q' => $filters['q']])) }}"
                           class="filter-tab {{ ! $filters['status'] ? 'is-active' : '' }}">
                            Toutes ({{ array_sum($statusCounts) }})
                        </a>
                        <a href="{{ route('admin.dashboard', array_filter(['status' => 'pending', 'period' => $filters['period'], 'q' => $filters['q']])) }}"
                           class="filter-tab {{ $filters['status'] === 'pending' ? 'is-active' : '' }}">
                            En attente ({{ $statusCounts['pending'] }})
                        </a>
                        <a href="{{ route('admin.dashboard', array_filter(['status' => 'confirmed', 'period' => $filters['period'], 'q' => $filters['q']])) }}"
                           class="filter-tab {{ $filters['status'] === 'confirmed' ? 'is-active' : '' }}">
                            Confirmées ({{ $statusCounts['confirmed'] }})
                        </a>
                        <a href="{{ route('admin.dashboard', array_filter(['status' => 'cancelled', 'period' => $filters['period'], 'q' => $filters['q']])) }}"
                           class="filter-tab {{ $filters['status'] === 'cancelled' ? 'is-active' : '' }}">
                            Annulées ({{ $statusCounts['cancelled'] }})
                        </a>
                    </div>
                    <div class="filter-controls">
                        <select name="period" onchange="this.form.submit()">
                            <option value="upcoming" {{ $filters['period'] === 'upcoming' ? 'selected' : '' }}>À venir</option>
                            <option value="past" {{ $filters['period'] === 'past' ? 'selected' : '' }}>Passées</option>
                            <option value="all" {{ $filters['period'] === 'all' ? 'selected' : '' }}>Toutes périodes</option>
                        </select>
                        <input type="search" name="q" value="{{ $filters['q'] }}" placeholder="Nom, e-mail, téléphone…">
                        @if ($filters['status'])
                            <input type="hidden" name="status" value="{{ $filters['status'] }}">
                        @endif
                        @if ($filters['status'] || $filters['q'] || $filters['period'] !== 'upcoming')
                            <a href="{{ route('admin.dashboard') }}" class="filter-reset">Réinitialiser</a>
                        @endif
                    </div>
                </form>

                <div class="table-wrapper">
                    <table class="admin-table admin-table-reservations admin-table-responsive">
                        <thead>
                            <tr>
                                <th>Client</th>
                                <th>Contact</th>
                                <th>Jour / Heure</th>
                                <th>Couverts</th>
                                <th>Demandes</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($reservations as $reservation)
                                <tr>
                                    <td data-label="Client">
                                        <strong>{{ $reservation->name }}</strong>
                                        <span class="row-meta">{{ $reservation->created_at->format('d/m/Y H:i') }}</span>
                                    </td>
                                    <td data-label="Contact" class="cell-contact">
                                        <a href="mailto:{{ $reservation->email }}">{{ $reservation->email }}</a>
                                        @if ($reservation->phone)
                                            <br><a href="tel:{{ $reservation->phone }}">{{ $reservation->phone }}</a>
                                        @endif
                                    </td>
                                    <td data-label="Jour / Heure">
                                        <span class="row-highlight">{{ $reservation->date->format('d/m/Y') }}</span>
                                        <span class="row-meta">à {{ \Carbon\Carbon::parse($reservation->time)->format('H:i') }}</span>
                                    </td>
                                    <td data-label="Couverts">{{ $reservation->guests }}</td>
                                    <td data-label="Demandes" class="cell-message">
                                        @if ($reservation->allergies)
                                            <span class="status-badge status-pending" title="{{ $reservation->allergies }}">⚠ allergies</span>
                                        @endif
                                        {{ Str::limit($reservation->message, 40) }}
                                        @if ($reservation->menu_choice)
                                            <span class="row-meta">{{ $reservation->menuChoiceLabel() }}</span>
                                        @endif
                                    </td>
                                    <td data-label="Statut">
                                        <span class="status-badge status-{{ $reservation->status }}">
                                            {{ match($reservation->status) {
                                                'pending' => 'En attente',
                                                'confirmed' => 'Confirmée',
                                                'cancelled' => 'Annulée',
                                                default => $reservation->status,
                                            } }}
                                        </span>
                                    </td>
                                    <td data-label="Actions">
                                        <div class="row-actions">
                                            <a href="{{ route('admin.reservations.edit', $reservation) }}" class="btn btn-small btn-edit">Modifier</a>
                                        </div>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="7" class="cell-empty">Aucune réservation ne correspond à ces critères.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

                <div class="pagination">
                    {{ $reservations->links() }}
                </div>
            </section>
        @endcan

        @if ($menuStats || $eventStats || $userStats)
            <div class="widget-grid">
                @if ($menuStats)
                    <section class="widget-card">
                        <h3 class="widget-title">La Carte</h3>
                        <p class="widget-stat">{{ $menuStats['active'] }} <span>plats actifs</span></p>
                        <p class="widget-meta">{{ $menuStats['inactive'] }} inactifs</p>
                        <ul class="widget-list">
                            @foreach ($menuStats['categories'] as $category => $count)
                                <li>{{ ucfirst($category) }} : {{ $count }}</li>
                            @endforeach
                        </ul>
                        <a href="{{ route('admin.menu.index') }}" class="widget-link">Gérer</a>
                    </section>
                @endif

                @if ($eventStats)
                    <section class="widget-card">
                        <h3 class="widget-title">Actualités</h3>
                        <p class="widget-stat">{{ $eventStats['published'] }} <span>publiées</span></p>
                        <p class="widget-meta">{{ $eventStats['drafts'] }} brouillons</p>
                        @if ($eventStats['latest'])
                            <p class="widget-meta">
                                Dernière : <a href="{{ route('admin.events.edit', $eventStats['latest']) }}">{{ $eventStats['latest']->title }}</a>
                                ({{ $eventStats['latest']->event_date->format('d/m/Y') }})
                            </p>
                        @endif
                        <a href="{{ route('admin.events.create') }}" class="widget-link">Nouvelle actualité</a>
                    </section>
                @endif

                @if ($userStats)
                    <section class="widget-card">
                        <h3 class="widget-title">Administrateurs</h3>
                        <p class="widget-stat">{{ $userStats['active'] }} <span>actifs</span></p>
                        @if ($userStats['last_login'])
                            <p class="widget-meta">Dernière connexion : {{ \Carbon\Carbon::parse($userStats['last_login'])->format('d/m/Y H:i') }}</p>
                        @endif
                        <a href="{{ route('admin.users.index') }}" class="widget-link">Gérer</a>
                    </section>
                @endif
            </div>
        @endif
    </div>
@endsection
