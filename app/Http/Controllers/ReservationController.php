<?php

namespace App\Http\Controllers;

use App\Enums\AdminPermission;
use App\Http\Requests\StoreReservationRequest;
use App\Mail\NewReservationAdminNotification;
use App\Mail\ReservationReceived;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\View\View;

class ReservationController extends Controller
{
    public function create(): View
    {
        return view('reservation.create');
    }

    public function store(StoreReservationRequest $request): RedirectResponse
    {
        $reservation = Reservation::create($request->validated());

        try {
            Mail::to($reservation->email)->send(new ReservationReceived($reservation));

            User::query()
                ->where('is_admin', true)
                ->where('is_active', true)
                ->get()
                ->filter(fn (User $user): bool => $user->hasPermission(AdminPermission::Reservations))
                ->each(fn (User $user) => Mail::to($user->email)->send(new NewReservationAdminNotification($reservation)));
        } catch (\Throwable $e) {
            report($e);
        }

        return redirect()
            ->route('reservation')
            ->with('success', 'Votre demande de réservation a bien été envoyée. Nous vous recontacterons rapidement.');
    }
}
