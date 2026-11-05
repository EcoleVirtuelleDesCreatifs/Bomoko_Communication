<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function login()
    {
        if (Auth::check()) {
            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('Admin/Login')->withViewData([
            'meta' => ['title' => 'Afriquinfos — Administration', 'robots' => 'noindex, nofollow'],
        ]);
    }

    public function authenticate(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ], [
            'email.required' => 'Saisissez votre adresse e-mail.',
            'password.required' => 'Saisissez votre mot de passe.',
            'password.min' => 'Le mot de passe doit contenir au moins 6 caractères.',
        ]);

        if (! Auth::attempt($credentials + ['status' => 'actif'], $request->boolean('remember'))) {
            return back()->withErrors(['email' => 'Identifiants incorrects.'])->onlyInput('email');
        }

        $request->session()->regenerate();
        $request->user()->update(['last_login_at' => now()]);
        $this->recordSessionEvent($request, 'connexion');

        if ($request->header('X-Inertia')) {
            return Inertia::location($request->session()->pull('url.intended', route('admin.dashboard')));
        }

        return redirect()->intended(route('admin.dashboard'));
    }

    public function logout(Request $request)
    {
        $this->recordSessionEvent($request, 'deconnexion');
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login');
    }

    private function recordSessionEvent(Request $request, string $event): void
    {
        try {
            $request->user()?->events()->create(['event' => $event, 'ip' => $request->ip()]);
        } catch (\Throwable $e) {
            report($e);
        }
    }

    public function acceptForm(Request $request, User $user)
    {
        abort_unless($user->status === 'invite', 403);

        return Inertia::render('Admin/AcceptInvite', [
            'email' => $user->email,
            'name' => $user->name,
        ])->withViewData(['meta' => ['title' => 'Activer votre compte — Afriquinfos', 'robots' => 'noindex, nofollow']]);
    }

    public function acceptInvite(Request $request, User $user)
    {
        abort_unless($user->status === 'invite', 403);
        $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ], [
            'password.required' => 'Choisissez un mot de passe.',
            'password.min' => 'Le mot de passe doit contenir au moins 8 caractères.',
            'password.confirmed' => 'Les deux mots de passe ne correspondent pas.',
        ]);

        $user->update([
            'password' => $request->password,
            'status' => 'actif',
            'email_verified_at' => now(),
        ]);

        Auth::login($user);
        $request->session()->regenerate();
        $user->update(['last_login_at' => now()]);
        $this->recordSessionEvent($request, 'connexion');

        if ($request->header('X-Inertia')) {
            return Inertia::location(route('admin.dashboard'));
        }

        return redirect()->route('admin.dashboard');
    }
}
