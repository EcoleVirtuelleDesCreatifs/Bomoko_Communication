<?php

namespace App\Enums;

enum AdminPermission: string
{
    case Reservations = 'reservations';
    case Menu = 'menu';
    case Events = 'events';

    public function label(): string
    {
        return match ($this) {
            self::Reservations => 'Réservations',
            self::Menu => 'La Carte',
            self::Events => 'Actualités',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::Reservations => 'Consulter et modifier les réservations',
            self::Menu => 'Gérer les plats de la carte',
            self::Events => 'Gérer les actualités et événements',
        };
    }
}
