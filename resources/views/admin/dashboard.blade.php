@extends('layouts.admin')

@section('title', 'Tableau de bord')

@section('content')
    <div class="admin-container">
        <header class="admin-page-header">
            <div>
                <h1 class="admin-title">Tableau de bord</h1>
                <p class="admin-subtitle">Gérez vos réservations et votre carte en temps réel.</p>
            </div>
            <div class="row-actions">
                <a href="{{ route('admin.menu.index') }}" class="btn btn-gold">Gérer la carte</a>
                <a href="{{ route('admin.events.index') }}" class="btn btn-ghost-dark">Actualités & événements</a>
            </div>
        </header>

        @if (session('success'))
            <div class="alert alert-success" role="alert">
                {{ session('success') }}
            </div>
        @endif

        <div class="stats-grid">
            <div class="stat-card stat-card-total">
                <span class="stat-value">{{ $totalCount }}</span>
                <span class="stat-label">Réservations totales</span>
            </div>
            <div class="stat-card stat-card-pending">
                <span class="stat-value">{{ $pendingCount }}</span>
                <span class="stat-label">En attente</span>
            </div>
            <div class="stat-card stat-card-confirmed">
                <span class="stat-value">{{ $confirmedCount }}</span>
                <span class="stat-label">Confirmées</span>
            </div>
            <div class="stat-card stat-card-cancelled">
                <span class="stat-value">{{ $cancelledCount }}</span>
                <span class="stat-label">Annulées</span>
            </div>
        </div>

        <section class="admin-section">
            <div class="admin-section-header">
                <h2 class="admin-section-title">Réservations</h2>
            </div>

            <div class="table-wrapper">
                <table class="admin-table admin-table-reservations">
                    <thead>
                        <tr>
                            <th>Client</th>
                            <th>Contact</th>
                            <th>Jour / Heure</th>
                            <th>Couverts</th>
                            <th>Menu</th>
                            <th>Demandes</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse ($reservations as $reservation)
                            <tr>
                                <td>
                                    <strong>{{ $reservation->name }}</strong>
                                    <span class="row-meta">{{ $reservation->created_at->format('d/m/Y H:i') }}</span>
                                </td>
                                <td>
                                    <a href="mailto:{{ $reservation->email }}">{{ $reservation->email }}</a>
                                    @if ($reservation->phone)
                                        <br><a href="tel:{{ $reservation->phone }}">{{ $reservation->phone }}</a>
                                    @endif
                                </td>
                                <td>
                                    <span class="row-highlight">{{ $reservation->date->format('d/m/Y') }}</span>
                                    <span class="row-meta">à {{ \Carbon\Carbon::parse($reservation->time)->format('H:i') }}</span>
                                </td>
                                <td>
                                    <span class="badge badge-guests">{{ $reservation->guests }} pers.</span>
                                </td>
                                <td class="cell-message">{{ $reservation->menuChoiceLabel() ?: '—' }}</td>
                                <td class="cell-message">{{ Str::limit($reservation->message ?: $reservation->allergies, 60) ?: '—' }}</td>
                                <td>
                                    <span class="status-badge status-{{ $reservation->status }}">
                                        {{ match($reservation->status) {
                                            'pending' => 'En attente',
                                            'confirmed' => 'Confirmée',
                                            'cancelled' => 'Annulée',
                                            default => $reservation->status,
                                        } }}
                                    </span>
                                </td>
                                <td>
                                    <div class="row-actions">
                                        <a href="{{ route('admin.reservations.edit', $reservation) }}" class="btn btn-small btn-edit">Modifier</a>
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="8" class="cell-empty">Aucune réservation pour le moment.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <div class="pagination">
                {{ $reservations->links() }}
            </div>
        </section>
    </div>
@endsection
