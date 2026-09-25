<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReservationRequest;
use App\Models\Reservation;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class ReservationController extends Controller
{
    public function create(): View
    {
        return view('reservation.create');
    }

    public function store(StoreReservationRequest $request): RedirectResponse
    {
        Reservation::create($request->validated());

        return redirect()
            ->route('reservation')
            ->with('success', 'Votre demande de réservation a bien été envoyée. Nous vous recontacterons rapidement.');
    }
}
