@extends('layouts.admin')

@section('title', 'Gestion de la carte')

@section('content')
    <div class="admin-container">
        <header class="admin-page-header">
            <div>
                <h1 class="admin-title">La Carte</h1>
                <p class="admin-subtitle">Gérez les entrées, plats, desserts et boissons affichés sur le site.</p>
            </div>
            <a href="{{ route('admin.menu.create') }}" class="btn btn-gold">Ajouter un plat</a>
        </header>

        @if (session('success'))
            <div class="alert alert-success" role="alert">
                {{ session('success') }}
            </div>
        @endif

        @forelse ($groupedItems as $category => $items)
            <section class="admin-section">
                <h2 class="admin-section-title">{{ $categories[$category] ?? $category }}</h2>

                <div class="table-wrapper">
                    <table class="admin-table admin-table-menu">
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Sous-rubrique</th>
                                <th>Description</th>
                                <th class="text-right">Prix</th>
                                <th>Ordre</th>
                                <th>Visible</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($items as $item)
                                <tr class="{{ ! $item->is_active ? 'row-inactive' : '' }}">
                                    <td><strong>{{ $item->name }}</strong></td>
                                    <td>{{ $item->section ?: '—' }}</td>
                                    <td class="cell-message">{{ $item->description ?: '—' }}</td>
                                    <td class="text-right">{{ $item->formattedPrice() }}</td>
                                    <td>{{ $item->sort_order }}</td>
                                    <td>
                                        <span class="status-badge {{ $item->is_active ? 'status-active' : 'status-inactive' }}">
                                            {{ $item->is_active ? 'Oui' : 'Non' }}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="row-actions">
                                            <a href="{{ route('admin.menu.edit', $item) }}" class="btn btn-small btn-edit">Modifier</a>
                                            <form method="POST" action="{{ route('admin.menu.destroy', $item) }}" onsubmit="return confirm('Supprimer ce plat ?');">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit" class="btn btn-small btn-danger">Supprimer</button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </section>
        @empty
            <div class="admin-empty">
                <p>Aucun plat enregistré.</p>
                <a href="{{ route('admin.menu.create') }}" class="btn btn-gold">Ajouter le premier plat</a>
            </div>
        @endforelse
    </div>
@endsection
