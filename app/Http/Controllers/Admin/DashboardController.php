<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateReservationRequest;
use App\Mail\ReservationConfirmed;
use App\Models\Reservation;
use App\Support\DashboardStats;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function index(Request $request, DashboardStats $stats): View
    {
        $user = $request->user();
        $canReservations = $user->can('manage-reservations');

        $filters = [
            'status' => $request->query('status'),
            'period' => $request->query('period', 'upcoming'),
            'q' => $request->query('q'),
        ];

        $reservations = null;
        $statusCounts = ['pending' => 0, 'confirmed' => 0, 'cancelled' => 0];

        if ($canReservations) {
            $counts = Reservation::query()
                ->selectRaw('status, COUNT(*) as total')
                ->groupBy('status')
                ->pluck('total', 'status');

            foreach ($statusCounts as $key => $_) {
                $statusCounts[$key] = (int) ($counts[$key] ?? 0);
            }

            $reservations = Reservation::query()
                ->when($filters['status'], fn ($query) => $query->where('status', $filters['status']))
                ->when($filters['period'] === 'upcoming', fn ($query) => $query->whereDate('date', '>=', now()->toDateString())->orderBy('date')->orderBy('time'))
                ->when($filters['period'] === 'past', fn ($query) => $query->whereDate('date', '<', now()->toDateString())->orderByDesc('date')->orderByDesc('time'))
                ->when($filters['period'] === 'all', fn ($query) => $query->orderByDesc('date')->orderByDesc('time'))
                ->when($filters['q'], function ($query) use ($filters) {
                    $term = '%'.$filters['q'].'%';
                    $query->where(fn ($q) => $q
                        ->where('name', 'like', $term)
                        ->orWhere('email', 'like', $term)
                        ->orWhere('phone', 'like', $term));
                })
                ->paginate(15)
                ->withQueryString();
        }

        return view('admin.dashboard', [
            'canReservations' => $canReservations,
            'stats' => $canReservations ? $stats->reservations() : null,
            'todo' => $canReservations ? $stats->todo() : collect(),
            'todayService' => $canReservations ? $stats->todayService() : collect(),
            'reservations' => $reservations,
            'statusCounts' => $statusCounts,
            'filters' => $filters,
            'menuStats' => $user->can('manage-menu') ? $stats->menu() : null,
            'eventStats' => $user->can('manage-events') ? $stats->events() : null,
            'userStats' => $user->can('manage-users') ? $stats->users() : null,
        ]);
    }

    public function edit(Reservation $reservation): View
    {
        return view('admin.reservations.edit', compact('reservation'));
    }

    public function update(UpdateReservationRequest $request, Reservation $reservation): RedirectResponse
    {
        $reservation->update($request->validated());
        $this->applyStatus($reservation, $reservation->status);

        return redirect()->route('admin.dashboard')->with('success', 'La réservation a été mise à jour.');
    }

    public function updateStatus(Request $request, Reservation $reservation): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in([Reservation::STATUS_PENDING, Reservation::STATUS_CONFIRMED, Reservation::STATUS_CANCELLED])],
        ]);

        $reservation->update(['status' => $validated['status']]);
        $this->applyStatus($reservation, $validated['status']);

        $labels = [
            Reservation::STATUS_PENDING => 'remise en attente',
            Reservation::STATUS_CONFIRMED => 'confirmée',
            Reservation::STATUS_CANCELLED => 'annulée',
        ];

        return redirect()->route('admin.dashboard')
            ->with('success', "La réservation de {$reservation->name} a été {$labels[$validated['status']]}.");
    }

    private function applyStatus(Reservation $reservation, string $newStatus): void
    {
        if ($newStatus === Reservation::STATUS_CONFIRMED && $reservation->wasChanged('status')) {
            Mail::to($reservation->email)->send(new ReservationConfirmed($reservation));
        }
    }
}
