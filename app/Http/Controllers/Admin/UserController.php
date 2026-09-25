<?php

namespace App\Http\Controllers\Admin;

use App\Enums\AdminPermission;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAdminUserRequest;
use App\Http\Requests\UpdateAdminUserRequest;
use App\Mail\AdminAccountCreated;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;

class UserController extends Controller
{
    public function index(): View
    {
        $users = User::orderBy('name')->paginate(15);

        return view('admin.users.index', compact('users'));
    }

    public function create(): View
    {
        return view('admin.users.form', [
            'user' => null,
            'roles' => UserRole::cases(),
            'permissions' => AdminPermission::cases(),
        ]);
    }

    public function store(StoreAdminUserRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $generatePassword = $request->boolean('generate_password');
        $password = $generatePassword ? Str::password(12) : $validated['password'];
        $role = UserRole::from($validated['role']);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($password),
            'is_admin' => true,
            'role' => $role,
            'permissions' => $role === UserRole::SuperAdmin ? null : ($validated['permissions'] ?? []),
            'is_active' => $validated['is_active'] ?? true,
        ]);

        if ($request->boolean('send_credentials')) {
            Mail::to($user->email)->send(new AdminAccountCreated($user, $password));

            return redirect()->route('admin.users.index')
                ->with('success', "Le compte de {$user->name} a été créé et les identifiants envoyés par e-mail.");
        }

        $message = "Le compte de {$user->name} a été créé.";

        if ($generatePassword) {
            $message .= " Mot de passe généré (à communiquer une seule fois) : {$password}";
        }

        return redirect()->route('admin.users.index')->with('success', $message);
    }

    public function edit(User $user): View
    {
        return view('admin.users.form', [
            'user' => $user,
            'roles' => UserRole::cases(),
            'permissions' => AdminPermission::cases(),
        ]);
    }

    public function update(UpdateAdminUserRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();
        $role = UserRole::from($validated['role']);

        $this->guardSelfAndLastSuperAdmin($request->user(), $user, $role, $validated['is_active'] ?? false);

        $attributes = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $role,
            'permissions' => $role === UserRole::SuperAdmin ? null : ($validated['permissions'] ?? []),
            'is_active' => $validated['is_active'] ?? false,
        ];

        if (! empty($validated['password'])) {
            $attributes['password'] = Hash::make($validated['password']);
        }

        $user->update($attributes);

        return redirect()->route('admin.users.index')
            ->with('success', "Le compte de {$user->name} a été mis à jour.");
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === request()->user()->id) {
            return back()->withErrors(['user' => 'Vous ne pouvez pas supprimer votre propre compte.']);
        }

        if ($user->isSuperAdmin() && $this->activeSuperAdminCount() <= 1) {
            return back()->withErrors(['user' => 'Impossible de supprimer le dernier super administrateur actif.']);
        }

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', "Le compte de {$user->name} a été supprimé.");
    }

    private function guardSelfAndLastSuperAdmin(User $actor, User $user, UserRole $role, bool $isActive): void
    {
        if ($user->id === $actor->id) {
            if (! $isActive) {
                throw ValidationException::withMessages(['is_active' => 'Vous ne pouvez pas désactiver votre propre compte.']);
            }

            if ($role !== UserRole::SuperAdmin) {
                throw ValidationException::withMessages(['role' => 'Vous ne pouvez pas retirer votre propre rôle de super administrateur.']);
            }
        }

        $wasActiveSuperAdmin = $user->isSuperAdmin() && $user->is_active;
        $losesSuperAdmin = $role !== UserRole::SuperAdmin || ! $isActive;

        if ($wasActiveSuperAdmin && $losesSuperAdmin && $this->activeSuperAdminCount() <= 1) {
            throw ValidationException::withMessages([
                'role' => 'Impossible de rétrograder ou désactiver le dernier super administrateur actif.',
            ]);
        }
    }

    private function activeSuperAdminCount(): int
    {
        return User::where('role', UserRole::SuperAdmin->value)->where('is_active', true)->count();
    }
}
