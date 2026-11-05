<?php

namespace App\Http\Controllers;

use App\Support\SiteAssets;

class SiteAssetController extends Controller
{
    public function show(string $version, string $file)
    {
        abort_unless(isset(SiteAssets::FILES[$file]), 404);
        $path = public_path(SiteAssets::FILES[$file]);
        abort_unless(hash_equals(substr(hash_file('sha256', $path), 0, 20), $version), 404);
        $type = match (pathinfo($file, PATHINFO_EXTENSION)) {
            'css' => 'text/css', 'js' => 'application/javascript', default => 'image/png',
        };

        return response()->file($path, ['Content-Type' => $type, 'Cache-Control' => 'public, max-age=31536000, immutable']);
    }
}
