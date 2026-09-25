<?php

namespace Tests\Feature;

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class SubdirectoryUrlTest extends TestCase
{
    use RefreshDatabase;

    public function test_urls_are_prefixed_when_app_runs_in_a_subdirectory(): void
    {
        // Symfony détecte le base path via SCRIPT_NAME quand REQUEST_URI contient
        // le préfixe — get() ne permet pas ce niveau de contrôle, on passe par le kernel.
        $request = Request::create('https://afriquinfos.com/maquette-cercle/', 'GET', [], [], [], [
            'SCRIPT_NAME' => '/maquette-cercle/index.php',
            'SCRIPT_FILENAME' => '/var/www/index.php',
            'PHP_SELF' => '/maquette-cercle/index.php',
            'HTTP_HOST' => 'afriquinfos.com',
            'HTTPS' => 'on',
            'SERVER_PORT' => 443,
        ]);

        $response = $this->app->make(Kernel::class)->handle($request);
        $content = $response->getContent();

        $this->assertSame(200, $response->getStatusCode());
        $this->assertStringContainsString('/maquette-cercle/carte', $content);
        $this->assertStringContainsString('/maquette-cercle/assets/', $content);
        $this->assertStringContainsString('/maquette-cercle/css/style.css', $content);
    }
}
