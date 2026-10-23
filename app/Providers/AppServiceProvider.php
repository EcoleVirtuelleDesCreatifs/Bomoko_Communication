<?php

namespace App\Providers;

use App\Enums\AdminPermission;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;
use Illuminate\View\View as ViewContract;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if ($this->app->isProduction()) {
            URL::forceScheme('https');
        }

        foreach (AdminPermission::cases() as $permission) {
            Gate::define('manage-'.$permission->value, fn (User $user) => $user->hasPermission($permission));
        }

        Gate::define('manage-users', fn (User $user) => $user->isSuperAdmin());

        View::composer('layouts.admin', function (ViewContract $view): void {
            $user = Auth::user();
            $pendingReservationsCount = 0;

            if ($user?->can('manage-reservations')) {
                $pendingReservationsCount = Reservation::query()
                    ->where('status', Reservation::STATUS_PENDING)
                    ->whereDate('date', '>=', now()->toDateString())
                    ->count();
            }

            $view->with('pendingReservationsCount', $pendingReservationsCount);
        });
    }
}
