@extends('layouts.admin')

@section('title', 'Actualités & événements')

@section('content')
    @php
        $publishedCount = $events->getCollection()->where('is_published', true)->count();
        $draftCount = $events->count() - $publishedCount;
        $photosCount = $events->sum('images_count');
    @endphp

    <div class="admin-container events-admin-page">
        <header class="admin-page-header events-admin-hero">
            <div class="events-admin-hero-copy">
                <span class="dashboard-eyebrow">Espace éditorial</span>
                <h1 class="admin-title">Actualités & événements</h1>
                <p class="admin-subtitle">Faites vivre l’univers du Cercle avec des publications fortes, élégantes et toujours à jour.</p>
            </div>
            <a href="{{ route('admin.events.create') }}" class="events-admin-create"><span>+</span> Nouvelle actualité</a>
        </header>

        <div class="events-admin-stats">
            <article class="events-admin-stat events-admin-stat-primary">
                <span class="events-admin-stat-icon">01</span>
                <div><strong>{{ $events->total() }}</strong><span>Publications au total</span></div>
            </article>
            <article class="events-admin-stat events-admin-stat-success">
                <span class="events-admin-stat-icon">02</span>
                <div><strong>{{ $publishedCount }}</strong><span>Publiées sur cette page</span></div>
            </article>
            <article class="events-admin-stat events-admin-stat-warning">
                <span class="events-admin-stat-icon">03</span>
                <div><strong>{{ $draftCount }}</strong><span>Brouillons à finaliser</span></div>
            </article>
            <article class="events-admin-stat events-admin-stat-purple">
                <span class="events-admin-stat-icon">04</span>
                <div><strong>{{ $photosCount }}</strong><span>Photos associées</span></div>
            </article>
        </div>

        @if (session('success'))
            <div class="alert alert-success" role="alert">
                {{ session('success') }}
            </div>
        @endif

        <div class="events-admin-toolbar">
            <div>
                <span class="dashboard-section-kicker">Bibliothèque éditoriale</span>
                <h2>Vos publications</h2>
            </div>
            <p>Page {{ $events->currentPage() }} sur {{ $events->lastPage() }}</p>
        </div>

        @if ($events->isEmpty())
            <div class="admin-empty events-admin-empty">
                <span>Votre espace éditorial est vide</span>
                <h2>Racontez votre première histoire</h2>
                <p>Annoncez un événement, partagez les coulisses ou mettez en avant un moment fort du restaurant.</p>
                <a href="{{ route('admin.events.create') }}" class="events-admin-create"><span>+</span> Créer une actualité</a>
            </div>
        @else
            <div class="events-admin-grid">
                @foreach ($events as $event)
                    <article class="events-admin-card {{ ! $event->is_published ? 'is-draft' : '' }}">
                        <div class="events-admin-media">
                            @if ($event->cover_image)
                                <img src="{{ asset('storage/' . $event->cover_image) }}" alt="{{ $event->title }}">
                            @else
                                <div class="events-admin-placeholder">
                                    <span>{{ Str::upper(Str::substr($event->title, 0, 1)) }}</span>
                                    <small>Le Cercle</small>
                                </div>
                            @endif
                            <span class="events-admin-status {{ $event->is_published ? 'is-published' : 'is-draft' }}">
                                {{ $event->is_published ? 'Publié' : 'Brouillon' }}
                            </span>
                            <span class="events-admin-photo-count">{{ $event->images_count }} photo{{ $event->images_count > 1 ? 's' : '' }}</span>
                        </div>

                        <div class="events-admin-card-body">
                            <div class="events-admin-date">
                                @if ($event->event_date)
                                    <span>{{ $event->event_date->translatedFormat('d M') }}</span>
                                    <small>{{ $event->event_date->format('Y · H:i') }}</small>
                                @else
                                    <span>À définir</span>
                                    <small>Date de l’événement</small>
                                @endif
                            </div>
                            <h2>{{ $event->title }}</h2>
                            <span class="events-admin-slug">/{{ $event->slug }}</span>
                            <div class="events-admin-actions">
                                <a href="{{ route('admin.events.edit', $event) }}" class="events-admin-edit">Modifier la publication <span>→</span></a>
                                <form method="POST" action="{{ route('admin.events.destroy', $event) }}" onsubmit="return confirm('Supprimer cette actualité ?');">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="events-admin-delete">Supprimer</button>
                                </form>
                            </div>
                        </div>
                    </article>
                @endforeach
            </div>

            <div class="pagination events-admin-pagination">
                {{ $events->links() }}
            </div>
        @endif
    </div>
@endsection
