<?php

namespace App\Support;

class SiteAssets
{
    public const FILES = [
        'afriquinfos.css' => 'assets/css/afriquinfos.css',
        'admin.css' => 'assets/css/admin.css',
        'afriquinfos-print.css' => 'assets/css/afriquinfos-print.css',
        'admin.js' => 'assets/js/admin.js',
        'data.js' => 'assets/js/data.js',
        'logo-afriquinfos.png' => 'assets/img/logo-afriquinfos.png',
        'logo-afriquinfos-negatif.png' => 'assets/img/logo-afriquinfos-negatif.png',
        'logo-compact.png' => 'assets/img/logo-compact.png',
        'logo-compact-negatif.png' => 'assets/img/logo-compact-negatif.png',
    ];

    public static function url(string $file): string
    {
        abort_unless(isset(self::FILES[$file]), 404);

        return route('site.asset', ['version' => substr(hash_file('sha256', public_path(self::FILES[$file])), 0, 20), 'file' => $file]);
    }

    public static function map(): array
    {
        $map = [];
        foreach (self::FILES as $file => $path) {
            $map[$path] = self::url($file);
        }

        return $map;
    }
}
