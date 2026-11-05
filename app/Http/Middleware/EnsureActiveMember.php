<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveMember
{
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless($request->user()?->status === 'actif'
            && in_array($request->user()->role, ['admin', 'chef', 'journaliste', 'contributeur'], true), 403);

        return $next($request);
    }
}
