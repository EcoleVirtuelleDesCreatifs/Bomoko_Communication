@props([
    'src',
    'sizes' => '100vw',
])

@php
    use App\Support\ResponsiveImage;

    $webpSrcset = ResponsiveImage::srcset(ResponsiveImage::variants($src, 'webp'));
    $fallback = ResponsiveImage::fallback($src) ?: asset('assets/images/' . $src);
@endphp

<link rel="preload" as="image" href="{{ $fallback }}" @if ($webpSrcset !== '') imagesrcset="{{ $webpSrcset }}" imagesizes="{{ $sizes }}" @endif fetchpriority="high">
