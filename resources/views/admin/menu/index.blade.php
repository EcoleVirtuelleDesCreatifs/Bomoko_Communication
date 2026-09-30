@extends('layouts.admin')

@section('title', 'Gestion de la carte')

@section('content')
    @php
        $allItems = $groupedItems->flatten();
        $activeItems = $allItems->where('is_active', true)->count();
        $inactiveItems = $allItems->count() - $activeItems;
    @endphp

    <div class="admin-container menu-admin-page">
        <header class="admin-page-header menu-admin-hero">
            <div class="menu-admin-hero-copy">
                <span class="dashboard-eyebrow">Gestion du restaurant</span>
                <h1 class="admin-title">La Carte</h1>
                <p class="admin-subtitle">Organisez votre offre, maîtrisez sa visibilité et gardez une carte toujours à jour.</p>
            </div>
            <a href="{{ route('admin.menu.create') }}" class="menu-admin-create"><span>+</span> Ajouter un plat</a>
        </header>

        <div class="menu-admin-stats">
            <article class="menu-admin-stat menu-admin-stat-primary">
                <span class="menu-admin-stat-icon">01</span>
                <div><strong>{{ $allItems->count() }}</strong><span>Plats enregistrés</span></div>
            </article>
            <article class="menu-admin-stat menu-admin-stat-success">
                <span class="menu-admin-stat-icon">02</span>
                <div><strong>{{ $activeItems }}</strong><span>Visibles sur le site</span></div>
            </article>
            <article class="menu-admin-stat menu-admin-stat-warning">
                <span class="menu-admin-stat-icon">03</span>
                <div><strong>{{ $inactiveItems }}</strong><span>Plats masqués</span></div>
            </article>
            <article class="menu-admin-stat menu-admin-stat-purple">
                <span class="menu-admin-stat-icon">04</span>
                <div><strong>{{ $groupedItems->count() }}</strong><span>Catégories actives</span></div>
            </article>
        </div>

        @if (session('success'))
            <div class="alert alert-success" role="alert">
                {{ session('success') }}
            </div>
        @endif

        <div class="menu-admin-toolbar">
            <div>
                <span class="dashboard-section-kicker">Organisation de l’offre</span>
                <h2>Contenu de la carte</h2>
            </div>
            <p>{{ $activeItems }} plat{{ $activeItems > 1 ? 's' : '' }} actuellement publié{{ $activeItems > 1 ? 's' : '' }}</p>
        </div>

        @forelse ($groupedItems as $category => $items)
            <section class="admin-section menu-category-card">
                <header class="menu-category-header">
                    <div class="menu-category-title">
                        <span class="menu-category-index">{{ str_pad((string) $loop->iteration, 2, '0', STR_PAD_LEFT) }}</span>
                        <div>
                            <h2 class="admin-section-title">{{ $categories[$category] ?? $category }}</h2>
                            <span>{{ $items->count() }} élément{{ $items->count() > 1 ? 's' : '' }}</span>
                        </div>
                    </div>
                    <a href="{{ route('admin.menu.create') }}" class="menu-category-add">Ajouter dans cette catégorie <span>→</span></a>
                </header>

                <div class="table-wrapper menu-table-wrapper">
                    <table class="admin-table admin-table-menu admin-table-responsive">
                        <thead>
                            <tr>
                                <th>Plat</th>
                                <th>Sous-rubrique</th>
                                <th>Description</th>
                                <th class="text-right">Prix</th>
                                <th>Ordre</th>
                                <th>Visibilité</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($items as $item)
                                <tr class="{{ ! $item->is_active ? 'row-inactive' : '' }}">
                                    <td data-label="Plat"><strong class="menu-item-name">{{ $item->name }}</strong></td>
                                    <td data-label="Sous-rubrique"><span class="menu-section-tag">{{ $item->section ?: 'Général' }}</span></td>
                                    <td data-label="Description" class="cell-message">{{ $item->description ?: 'Aucune description' }}</td>
                                    <td data-label="Prix" class="text-right"><strong class="menu-item-price">{{ $item->formattedPrice() }}</strong></td>
                                    <td data-label="Ordre"><span class="menu-order">{{ $item->sort_order }}</span></td>
                                    <td data-label="Visibilité">
                                        <span class="status-badge {{ $item->is_active ? 'status-active' : 'status-inactive' }}">
                                            {{ $item->is_active ? 'En ligne' : 'Masqué' }}
                                        </span>
                                    </td>
                                    <td data-label="Actions">
                                        <div class="row-actions menu-row-actions">
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
            <div class="admin-empty menu-admin-empty">
                <span>La carte est vide</span>
                <h2>Créez votre première proposition</h2>
                <p>Ajoutez vos entrées, plats, desserts et boissons pour commencer à composer votre carte.</p>
                <a href="{{ route('admin.menu.create') }}" class="menu-admin-create"><span>+</span> Ajouter le premier plat</a>
            </div>
        @endforelse
    </div>
@endsection
