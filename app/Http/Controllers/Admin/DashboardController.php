<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateReservationRequest;
use App\Mail\ReservationConfirmed;
use App\Models\Reservation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function index(): View
    {
        $reservations = Reservation::latest()->paginate(10);

        return view('admin.dashboard', [
            'reservations' => $reservations,
            'pendingCount' => Reservation::where('status', Reservation::STATUS_PENDING)->count(),
            'confirmedCount' => Reservation::where('status', Reservation::STATUS_CONFIRMED)->count(),
            'cancelledCount' => Reservation::where('status', Reservation::STATUS_CANCELLED)->count(),
            'totalCount' => Reservation::count(),
        ]);
    }

    public function edit(Reservation $reservation): View
    {
        return view('admin.reservations.edit', compact('reservation'));
    }

    public function update(UpdateReservationRequest $request, Reservation $reservation): RedirectResponse
    {
        $previousStatus = $reservation->status;
        $reservation->update($request->validated());

        if ($previousStatus !== Reservation::STATUS_CONFIRMED && $reservation->fresh()->status === Reservation::STATUS_CONFIRMED) {
            Mail::to($reservation->email)->send(new ReservationConfirmed($reservation));
        }

        return redirect()->route('admin.dashboard')->with('success', 'La réservation a été mise à jour.');
    }
}
