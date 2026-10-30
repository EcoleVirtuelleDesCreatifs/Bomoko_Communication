<?php

use App\Http\Controllers\Admin\AdminStateController;
use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\FormController;
use App\Http\Controllers\FrontController;
use App\Http\Controllers\SeoController;
use Illuminate\Support\Facades\Route;

Route::get('/', [FrontController::class, 'home'])->name('home');
Route::get('/rubrique/{slug}', [FrontController::class, 'rubrique'])->name('rubrique');
Route::get('/afriques/{region?}', [FrontController::class, 'afriques'])->name('afriques');
Route::get('/article/{slug}', [FrontController::class, 'article'])->name('article.show');
Route::get('/portraits', [FrontController::class, 'portraits'])->name('portraits');
Route::get('/agendas', [FrontController::class, 'agendas'])->name('agendas');
Route::get('/recherche', [FrontController::class, 'recherche'])->name('recherche');
Route::get('/contact', [FrontController::class, 'contact'])->name('contact');
Route::get('/mentions-legales', [FrontController::class, 'legal'])->defaults('page', 'mentions-legales')->name('legal.mentions');
Route::get('/confidentialite', [FrontController::class, 'legal'])->defaults('page', 'confidentialite')->name('legal.confidentialite');
Route::get('/cookies', [FrontController::class, 'legal'])->defaults('page', 'cookies')->name('legal.cookies');

Route::post('/contact', [FormController::class, 'contact'])->middleware('throttle:5,1')->name('contact.send');
Route::post('/newsletter', [FormController::class, 'newsletter'])->middleware('throttle:10,1')->name('newsletter');
Route::get('/desinscription', [FormController::class, 'unsubscribe'])->middleware('signed')->name('unsubscribe');
Route::post('/debat/{debate}/vote', [FormController::class, 'vote'])->middleware('throttle:10,1')->name('debate.vote');
Route::post('/article/{article}/commentaire', [FormController::class, 'comment'])
    ->middleware('throttle:5,1')->name('article.comment');

Route::get('/rss.xml', [SeoController::class, 'rss'])->name('rss');
Route::get('/sitemap.xml', [SeoController::class, 'sitemap'])->name('sitemap');
Route::get('/robots.txt', [SeoController::class, 'robots'])->name('robots');

Route::prefix('admin')->name('admin.')->group(function () {
    Route::middleware('guest')->group(function () {
        Route::get('/login', [AuthController::class, 'login'])->name('login');
        Route::post('/login', [AuthController::class, 'authenticate'])
            ->middleware('throttle:5,1')->name('login.post');
    });

    Route::middleware('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
        Route::get('/', [AdminStateController::class, 'app'])->name('dashboard');
        Route::get('/api/state', [AdminStateController::class, 'show'])->name('state.show');
        Route::get('/api/article/{slug}', [AdminStateController::class, 'article'])->name('state.article');
        Route::post('/api/state', [AdminStateController::class, 'save'])->name('state.save');
    });
});
