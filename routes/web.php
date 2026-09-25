<?php

use App\Http\Controllers\Admin\AccountController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\EventController as AdminEventController;
use App\Http\Controllers\Admin\MenuItemController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LegalController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\RobotsController;
use App\Http\Controllers\SitemapController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('/carte', MenuController::class)->name('menu');
Route::redirect('/galerie', '/#galerie')->name('gallery');

Route::get('/evenements', [EventController::class, 'index'])->name('events.index');
Route::get('/evenements/{event}', [EventController::class, 'show'])->name('events.show');

Route::get('/reservation', [ReservationController::class, 'create'])->name('reservation');
Route::post('/reservation', [ReservationController::class, 'store'])->name('reservation.store');

Route::get('/sitemap.xml', SitemapController::class)->name('sitemap');
Route::get('/robots.txt', RobotsController::class)->name('robots');
Route::get('/llms.txt', [RobotsController::class, 'llms'])->name('llms');

Route::middleware('guest')->group(function (): void {
    Route::get('/admin/login', [LoginController::class, 'create'])->name('admin.login');
    Route::post('/admin/login', [LoginController::class, 'store'])->name('admin.login.store');
});

Route::middleware(['auth', 'admin'])->prefix('admin')->group(function (): void {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');

    Route::get('/compte', [AccountController::class, 'edit'])->name('admin.account.edit');
    Route::put('/compte', [AccountController::class, 'update'])->name('admin.account.update');

    Route::middleware('can:manage-reservations')->group(function (): void {
        Route::get('/reservations/{reservation}/edit', [DashboardController::class, 'edit'])->name('admin.reservations.edit');
        Route::put('/reservations/{reservation}', [DashboardController::class, 'update'])->name('admin.reservations.update');
        Route::patch('/reservations/{reservation}/status', [DashboardController::class, 'updateStatus'])->name('admin.reservations.status');
    });

    Route::resource('menu', MenuItemController::class)->names('admin.menu')->except(['show'])
        ->middleware('can:manage-menu');
    Route::resource('events', AdminEventController::class)->names('admin.events')->except(['show'])
        ->middleware('can:manage-events');
    Route::delete('/event-images/{image}', [AdminEventController::class, 'destroyImage'])->name('admin.event-images.destroy')
        ->middleware('can:manage-events');

    Route::resource('users', UserController::class)->names('admin.users')->except(['show'])
        ->middleware('can:manage-users');
});

Route::post('/admin/logout', [LoginController::class, 'destroy'])
    ->middleware('auth')
    ->name('admin.logout');

Route::get('/mentions-legales', [LegalController::class, 'notice'])->name('legal.notice');
Route::get('/politique-de-confidentialite', [LegalController::class, 'privacy'])->name('legal.privacy');

Route::fallback(fn () => response()->view('errors.404', ['code' => 404], 404));
