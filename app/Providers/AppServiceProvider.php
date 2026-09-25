<?php

namespace App\Providers;

use App\Enums\AdminPermission;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

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
    }
}
