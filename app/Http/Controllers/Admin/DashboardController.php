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
        $canReservations = auth()->user()->can('manage-reservations');

        return view('admin.dashboard', [
            'canReservations' => $canReservations,
            'reservations' => $canReservations ? Reservation::latest()->paginate(10) : collect(),
            'pendingCount' => $canReservations ? Reservation::where('status', Reservation::STATUS_PENDING)->count() : 0,
            'confirmedCount' => $canReservations ? Reservation::where('status', Reservation::STATUS_CONFIRMED)->count() : 0,
            'cancelledCount' => $canReservations ? Reservation::where('status', Reservation::STATUS_CANCELLED)->count() : 0,
            'totalCount' => $canReservations ? Reservation::count() : 0,
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
