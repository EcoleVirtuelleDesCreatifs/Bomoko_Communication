<?php

namespace App\Support;

use App\Models\Event;
use App\Models\MenuItem;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class DashboardStats
{
    /**
     * @return array{today: int, today_guests: int, pending: int, upcoming_week: int, month: int, month_cancelled: int}
     */
    public function reservations(): array
    {
        $today = now()->toDateString();
        $weekEnd = now()->addDays(7)->toDateString();
        $monthStart = now()->startOfMonth()->toDateTimeString();

        $row = Reservation::query()
            ->selectRaw(
                'SUM(CASE WHEN status = ? AND DATE(date) = ? THEN 1 ELSE 0 END) as today, '.
                'SUM(CASE WHEN status = ? AND DATE(date) = ? THEN guests ELSE 0 END) as today_guests, '.
                'SUM(CASE WHEN status = ? AND DATE(date) >= ? THEN 1 ELSE 0 END) as pending, '.
                'SUM(CASE WHEN status = ? AND DATE(date) > ? AND DATE(date) <= ? THEN 1 ELSE 0 END) as upcoming_week, '.
                'SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) as month, '.
                'SUM(CASE WHEN status = ? AND created_at >= ? THEN 1 ELSE 0 END) as month_cancelled',
                [
                    Reservation::STATUS_CONFIRMED, $today,
                    Reservation::STATUS_CONFIRMED, $today,
                    Reservation::STATUS_PENDING, $today,
                    Reservation::STATUS_CONFIRMED, $today, $weekEnd,
                    $monthStart,
                    Reservation::STATUS_CANCELLED, $monthStart,
                ]
            )
            ->first();

        return [
            'today' => (int) ($row->today ?? 0),
            'today_guests' => (int) ($row->today_guests ?? 0),
            'pending' => (int) ($row->pending ?? 0),
            'upcoming_week' => (int) ($row->upcoming_week ?? 0),
            'month' => (int) ($row->month ?? 0),
            'month_cancelled' => (int) ($row->month_cancelled ?? 0),
        ];
    }

    /**
     * @return Collection<int, Reservation>
     */
    public function todo(): Collection
    {
        return Reservation::query()
            ->where('status', Reservation::STATUS_PENDING)
            ->whereDate('date', '>=', now()->toDateString())
            ->orderBy('date')
            ->orderBy('time')
            ->limit(8)
            ->get();
    }

    /**
     * @return Collection<int, Reservation>
     */
    public function todayService(): Collection
    {
        return Reservation::query()
            ->where('status', Reservation::STATUS_CONFIRMED)
            ->whereDate('date', now()->toDateString())
            ->orderBy('time')
            ->get();
    }

    /**
     * @return array{active: int, inactive: int, categories: array<string, int>}
     */
    public function menu(): array
    {
        $rows = MenuItem::query()
            ->selectRaw('category, SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active_count, COUNT(*) as total')
            ->groupBy('category')
            ->get();

        $categories = [];
        $active = 0;

        foreach ($rows as $row) {
            $categories[$row->category] = (int) $row->active_count;
            $active += (int) $row->active_count;
        }

        return [
            'active' => $active,
            'inactive' => (int) $rows->sum('total') - $active,
            'categories' => $categories,
        ];
    }

    /**
     * @return array{published: int, drafts: int, latest: ?Event}
     */
    public function events(): array
    {
        return [
            'published' => Event::where('is_published', true)->count(),
            'drafts' => Event::where('is_published', false)->count(),
            'latest' => Event::where('is_published', true)->latest('event_date')->first(),
        ];
    }

    /**
     * @return array{active: int, last_login: ?string}
     */
    public function users(): array
    {
        return [
            'active' => User::where('is_admin', true)->where('is_active', true)->count(),
            'last_login' => User::where('is_admin', true)->max('last_login_at'),
        ];
    }
}
