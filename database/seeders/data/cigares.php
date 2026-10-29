<?php

/**
 * Carte « La Cave à Cigares » (document client LB1).
 *
 * Format d'une ligne : [maison — série, format · origine du tabac, prix à l'unité]
 * Prix en FCFA, par cigare.
 *
 * @return array<string, array<string, list<array{0: string, 1: ?string, 2: ?int}>>>
 */

use App\Models\MenuItem;

return [
    MenuItem::CATEGORY_CIGARES => [
        'Notre sélection' => [
            ['A.J. Fernandez — New World Oscuro', 'Toro Redondo · Nicaragua', 15000],
            ['Rocky Patel — LB1', 'Toro · Honduras, Nicaragua, Équateur', 15000],
            ['H. Upmann — Coronas Major', 'Corona (AT) · Cuba', 20000],
            ['El Septimo — Culinary Art · Nigori', 'Corona Gorda · Équateur, Rép. dominicaine, Nicaragua, Brésil', 15000],
            ['La Flor Dominicana — Reserva Especial', 'Robusto · Équateur, Rép. dominicaine', 15000],
            ['Horacio — Bulier H52T', 'Toro · Équateur, Nicaragua, Costa Rica', 15000],
            ['Horacio — Jacques Chancel ou Sled', 'Éditions spéciales · Équateur, Nicaragua, Costa Rica', 20000],
            ['Gurkha — Cask Blend', 'Grand Robusto · République dominicaine', 15000],
            ['Oliva — Serie O · Robusto ou Toro', 'Deux formats au choix · Équateur, Nicaragua', 15000],
            ['NUB — Sun Grown, Connecticut ou Maduro', 'Format 4 × 60 · Nicaragua, Équateur ou Brésil ; Cameroun (Connecticut)', 15000],
            ['Plasencia — Reserva Original', 'Toro · Nicaragua', 15000],
        ],
    ],
];
