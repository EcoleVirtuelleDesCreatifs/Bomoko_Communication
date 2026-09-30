@extends('layouts.admin')

@section('title', $event ? 'Modifier une actualité' : 'Nouvelle actualité')

@section('content')
    <div class="admin-container internal-editor-page internal-editor-events">
        <header class="admin-page-header internal-editor-hero">
            <div>
                <span class="dashboard-eyebrow">Espace éditorial</span>
                <h1 class="admin-title">{{ $event ? 'Modifier une actualité' : 'Nouvelle actualité' }}</h1>
                <p class="admin-subtitle">Composez une publication immersive avec ses informations, sa couverture et sa galerie.</p>
            </div>
            <a href="{{ route('admin.events.index') }}" class="internal-editor-back">← Retour aux actualités</a>
        </header>

        @if ($errors->any())
            <div class="alert alert-error" role="alert">
                <ul>
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        @if ($event && $event->images->isNotEmpty())
            <section class="admin-section internal-editor-gallery">
                <h2 class="admin-section-title">Galerie existante</h2>
                <div class="admin-gallery-grid">
                    @foreach ($event->images as $image)
                        <figure class="admin-gallery-item">
                            <img src="{{ $image->url() }}" alt="{{ $image->caption ?: $event->title }}" class="admin-thumb admin-thumb-large">
                            <form method="POST" action="{{ route('admin.event-images.destroy', $image) }}" onsubmit="return confirm('Supprimer cette image ?');">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="btn btn-small btn-danger">Supprimer</button>
                            </form>
                        </figure>
                    @endforeach
                </div>
            </section>
        @endif

        <form method="POST" action="{{ $event ? route('admin.events.update', $event) : route('admin.events.store') }}" class="admin-card-form internal-editor-form" enctype="multipart/form-data">
            @csrf
            @if ($event)
                @method('PUT')
            @endif

            <div class="form-group">
                <label for="title">Titre</label>
                <input type="text" id="title" name="title" value="{{ old('title', $event?->title) }}" required>
            </div>

            <div class="form-group">
                <label for="summary">Résumé</label>
                <textarea id="summary" name="summary" rows="3">{{ old('summary', $event?->summary) }}</textarea>
            </div>

            <x-rich-editor name="content" id="content" :value="old('content', $event?->content)" label="Contenu" placeholder="Rédigez le contenu de l'actualité…" />

            <div class="form-row">
                <div class="form-group">
                    <label for="event_date">Date de l'événement</label>
                    <input type="datetime-local" id="event_date" name="event_date" value="{{ old('event_date', $event?->event_date?->format('Y-m-d\TH:i')) }}">
                </div>
                <div class="form-group">
                    <label for="location">Lieu</label>
                    <input type="text" id="location" name="location" value="{{ old('location', $event?->location) }}">
                </div>
            </div>

            <div class="form-group">
                <label for="cover_image">Image de couverture</label>
                @if ($event?->cover_image)
                    <img src="{{ asset('storage/' . $event->cover_image) }}" alt="{{ $event->title }}" class="admin-thumb admin-thumb-preview">
                @endif
                <input type="file" id="cover_image" name="cover_image" accept="image/*">
            </div>

            <div class="form-group">
                <label for="gallery">Ajouter des photos à la galerie</label>
                <input type="file" id="gallery" name="gallery[]" accept="image/*" multiple>
            </div>

            <div class="form-group form-checkbox">
                <label>
                    <input type="checkbox" name="is_published" value="1" {{ old('is_published', $event?->is_published) ? 'checked' : '' }}>
                    Publié sur le site
                </label>
            </div>

            <div class="form-actions form-actions-left">
                <button type="submit" class="btn btn-gold">{{ $event ? 'Enregistrer' : 'Publier' }}</button>
                <a href="{{ route('admin.events.index') }}" class="btn btn-ghost-dark">Annuler</a>
            </div>
        </form>
    </div>
@endsection
