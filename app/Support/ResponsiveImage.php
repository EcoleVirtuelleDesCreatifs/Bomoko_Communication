<?php

namespace App\Support;

class ResponsiveImage
{
    public const WIDTHS = [480, 960, 1440, 1920];

    /**
     * Optimized variants that exist on disk.
     *
     * @return array<int, string> width => URL
     */
    public static function variants(string $src, string $ext = 'webp'): array
    {
        $base = preg_replace('/\.[^.]+$/', '', $src);
        $variants = [];

        $sourceWidth = self::dimensions($src)['width'] ?? null;
        $widths = $sourceWidth
            ? array_unique(array_merge(self::WIDTHS, [$sourceWidth]))
            : self::WIDTHS;
        sort($widths);

        foreach ($widths as $width) {
            $file = "{$base}-{$width}.{$ext}";

            if (file_exists(public_path('assets/images/optimized/'.$file))) {
                $variants[$width] = asset('assets/images/optimized/'.$file);
            }
        }

        return $variants;
    }

    /**
     * @return array<int, string>|null
     */
    public static function dimensions(string $src): ?array
    {
        static $cache = [];

        if (array_key_exists($src, $cache)) {
            return $cache[$src];
        }

        $path = public_path('assets/images/'.$src);

        if (! is_file($path)) {
            return $cache[$src] = null;
        }

        $size = getimagesize($path);

        return $cache[$src] = $size ? ['width' => $size[0], 'height' => $size[1]] : null;
    }

    /**
     * @param  array<int, string>  $variants
     */
    public static function srcset(array $variants): string
    {
        return implode(', ', array_map(
            fn (int $width, string $url) => "{$url} {$width}w",
            array_keys($variants),
            $variants,
        ));
    }

    /**
     * Largest JPG fallback URL among existing optimized variants.
     */
    public static function fallback(string $src): ?string
    {
        $variants = self::variants($src, 'jpg');

        return $variants === [] ? null : end($variants);
    }
}
