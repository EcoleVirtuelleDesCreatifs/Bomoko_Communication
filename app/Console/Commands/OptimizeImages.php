<?php

namespace App\Console\Commands;

use App\Support\ResponsiveImage;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('images:optimize {--force : Regénère toutes les variantes}')]
#[Description('Génère les variantes responsives (webp/jpg/png) des images du site')]
class OptimizeImages extends Command
{
    private const IMAGES = [
        'logo/logo.png',
        'section/about.jpg',
        'section/bg-location.jpg',
        'section/booking.jpg',
        'section/chef1.jpg',
        'section/gallery-1.jpg',
        'section/gallery-13.jpg',
        'section/gallery-5.jpg',
        'section/gallery-9.jpg',
        'section/menu4.jpg',
        'section/res01.jpg',
        'section/res02.jpg',
        'section/res03.jpg',
        'section/video.jpg',
        'slider/img_slider_1.jpg',
        'slider/img_slider_2.jpg',
        'slider/img_slider_3.jpg',
    ];

    private const PNG_WIDTHS = [240, 480];

    public function handle(): int
    {
        $force = (bool) $this->option('force');
        $baseDir = public_path('assets/images');
        $outDir = $baseDir.'/optimized';

        foreach (self::IMAGES as $src) {
            $source = $baseDir.'/'.$src;

            if (! is_file($source)) {
                $this->warn("Source manquante : {$src}");

                continue;
            }

            $isPng = str_ends_with(strtolower($src), '.png');
            $base = preg_replace('/\.[^.]+$/', '', $src);
            $sourceWidth = getimagesize($source)[0] ?? 0;

            $widths = array_unique(array_merge(ResponsiveImage::WIDTHS, [$sourceWidth]));

            if ($isPng) {
                $widths = array_merge($widths, self::PNG_WIDTHS);
            }

            sort($widths);

            foreach ($widths as $width) {
                if ($width > $sourceWidth) {
                    continue;
                }

                $extensions = $isPng
                    ? ($width > self::PNG_WIDTHS[1] ? ['webp'] : ['png', 'webp'])
                    : ['webp', 'jpg'];

                foreach ($extensions as $ext) {
                    $relative = "{$base}-{$width}.{$ext}";
                    $target = "{$outDir}/{$relative}";

                    if (! $force && file_exists($target) && filemtime($target) >= filemtime($source)) {
                        continue;
                    }

                    if ($this->resize($source, $target, $width, $ext)) {
                        $this->line("  + {$relative}");
                    }
                }
            }
        }

        $this->info('Variantes générées dans public/assets/images/optimized/');

        return self::SUCCESS;
    }

    private function resize(string $source, string $target, int $width, string $ext): bool
    {
        $image = match (strtolower(pathinfo($source, PATHINFO_EXTENSION))) {
            'png' => imagecreatefrompng($source),
            default => imagecreatefromjpeg($source),
        };

        if (! $image) {
            $this->error("Lecture impossible : {$source}");

            return false;
        }

        $scaled = imagescale($image, $width);
        imagedestroy($image);

        if (! $scaled) {
            $this->error("Redimensionnement impossible : {$source}");

            return false;
        }

        $dir = dirname($target);
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $result = match ($ext) {
            'webp' => imagewebp($scaled, $target, 78),
            'png' => $this->savePng($scaled, $target),
            default => imagejpeg($scaled, $target, 80),
        };

        imagedestroy($scaled);

        return $result;
    }

    private function savePng(\GdImage $image, string $target): bool
    {
        imagealphablending($image, false);
        imagesavealpha($image, true);

        return imagepng($image, $target);
    }
}
