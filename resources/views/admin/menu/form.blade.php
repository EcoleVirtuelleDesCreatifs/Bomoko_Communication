@extends('layouts.admin')

@section('title', $item ? 'Modifier un plat' : 'Ajouter un plat')

@section('content')
    <div class="admin-container admin-container-narrow">
        <div class="admin-page-header">
            <div>
                <h1 class="admin-title">{{ $item ? 'Modifier un plat' : 'Ajouter un plat' }}</h1>
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

        <form method="POST" action="{{ $item ? route('admin.menu.update', $item) : route('admin.menu.store') }}" class="admin-card-form">
            @csrf
            @if ($item)
                @method('PUT')
            @endif

            <div class="form-row">
                <div class="form-group">
                    <label for="name">Nom du plat</label>
                    <input type="text" id="name" name="name" value="{{ old('name', $item?->name) }}" required>
                </div>
                <div class="form-group">
                    <label for="price">Prix (FCFA) <span class="row-meta">— facultatif si une mention de prix est indiquée</span></label>
                    <input type="number" id="price" name="price" min="0" value="{{ old('price', $item?->price) }}">
                </div>
                <div class="form-group">
                    <label for="price_note">Mention de prix</label>
                    <input type="text" id="price_note" name="price_note" maxlength="100" placeholder="ex. Prix selon le poids" value="{{ old('price_note', $item?->price_note) }}">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="category">Catégorie</label>
                    <select id="category" name="category" required>
                        @foreach ($categories as $key => $label)
                            <option value="{{ $key }}" {{ old('category', $item?->category) === $key ? 'selected' : '' }}>
                                {{ $label }}
                            </option>
                        @endforeach
                    </select>
                </div>
                <div class="form-group">
                    <label for="sort_order">Ordre d’affichage</label>
                    <input type="number" id="sort_order" name="sort_order" min="0" value="{{ old('sort_order', $item?->sort_order ?? 0) }}">
                </div>
            </div>

            <div class="form-group">
                <label for="section">Sous-rubrique</label>
                <input type="text" id="section" name="section" list="sections-list" maxlength="100" value="{{ old('section', $item?->section) }}">
                <datalist id="sections-list">
                    @foreach ($sections as $section)
                        <option value="{{ $section }}"></option>
                    @endforeach
                </datalist>
            </div>

            <div class="form-group">
                <label for="description">Description</label>
                <textarea id="description" name="description" rows="3">{{ old('description', $item?->description) }}</textarea>
            </div>

            <div class="form-group form-checkbox">
                <label>
                    <input type="checkbox" name="is_active" value="1" {{ old('is_active', $item?->is_active ?? true) ? 'checked' : '' }}>
                    Visible sur le site
                </label>
            </div>

            <div class="form-actions form-actions-left">
                <button type="submit" class="btn btn-gold">{{ $item ? 'Enregistrer' : 'Ajouter' }}</button>
                <a href="{{ route('admin.menu.index') }}" class="btn btn-ghost-dark">Annuler</a>
            </div>
        </form>
    </div>
@endsection
