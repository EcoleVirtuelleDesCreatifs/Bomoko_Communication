@extends('layouts.admin')

@section('title', 'Actualités & événements')

@section('content')
    <div class="admin-container">
        <header class="admin-page-header">
            <div>
                <h1 class="admin-title">Actualités & événements</h1>
                <p class="admin-subtitle">Publiez les événements et actualités affichés sur le site.</p>
            </div>
            <a href="{{ route('admin.events.create') }}" class="btn btn-gold">Nouvelle actualité</a>
        </header>

        @if (session('success'))
            <div class="alert alert-success" role="alert">
                {{ session('success') }}
            </div>
        @endif

        <section class="admin-section">
            <div class="table-wrapper">
                <table class="admin-table admin-table-events">
                    <thead>
                        <tr>
                            <th>Couverture</th>
                            <th>Titre</th>
                            <th>Date de l'événement</th>
                            <th>Photos</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse ($events as $event)
                            <tr>
                                <td>
                                    @if ($event->cover_image)
                                        <img src="{{ asset('storage/' . $event->cover_image) }}" alt="{{ $event->title }}" class="admin-thumb">
                                    @else
                                        <span class="row-meta">—</span>
                                    @endif
                                </td>
                                <td>
                                    <strong>{{ $event->title }}</strong>
                                    <span class="row-meta">/{{ $event->slug }}</span>
                                </td>
                                <td>
                                    @if ($event->event_date)
                                        <span class="row-highlight">{{ $event->event_date->format('d/m/Y') }}</span>
                                        <span class="row-meta">à {{ $event->event_date->format('H:i') }}</span>
                                    @else
                                        <span class="row-meta">—</span>
                                    @endif
                                </td>
                                <td>
                                    <span class="badge badge-guests">{{ $event->images_count }} photo{{ $event->images_count > 1 ? 's' : '' }}</span>
                                </td>
                                <td>
                                    <span class="status-badge {{ $event->is_published ? 'status-active' : 'status-inactive' }}">
                                        {{ $event->is_published ? 'Publié' : 'Brouillon' }}
                                    </span>
                                </td>
                                <td>
                                    <div class="row-actions">
                                        <a href="{{ route('admin.events.edit', $event) }}" class="btn btn-small btn-edit">Modifier</a>
                                        <form method="POST" action="{{ route('admin.events.destroy', $event) }}" onsubmit="return confirm('Supprimer cette actualité ?');">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="btn btn-small btn-danger">Supprimer</button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="6" class="cell-empty">Aucune actualité pour le moment.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <div class="pagination">
                {{ $events->links() }}
            </div>
        </section>
    </div>
@endsection
