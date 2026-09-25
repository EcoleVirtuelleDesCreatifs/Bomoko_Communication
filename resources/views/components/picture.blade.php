@props([
    'src',
    'alt' => '',
    'sizes' => '100vw',
    'loading' => 'lazy',
    'fetchpriority' => null,
    'width' => null,
    'height' => null,
])

@php
    use App\Support\ResponsiveImage;

    $webpSrcset = ResponsiveImage::srcset(ResponsiveImage::variants($src, 'webp'));
    $jpgVariants = ResponsiveImage::variants($src, 'jpg');
    $jpgSrcset = ResponsiveImage::srcset($jpgVariants);
    $fallback = ResponsiveImage::fallback($src) ?: asset('assets/images/' . $src);
    $dimensions = ResponsiveImage::dimensions($src);
    $width ??= $dimensions['width'] ?? null;
    $height ??= $dimensions['height'] ?? null;
@endphp

@if ($webpSrcset !== '')
    <picture>
        <source type="image/webp" srcset="{{ $webpSrcset }}" sizes="{{ $sizes }}">
        @if ($jpgSrcset !== '')
            <source type="image/jpeg" srcset="{{ $jpgSrcset }}" sizes="{{ $sizes }}">
        @endif
        <img src="{{ $fallback }}" @if ($jpgSrcset !== '') srcset="{{ $jpgSrcset }}" sizes="{{ $sizes }}" @endif
            @if ($width) width="{{ $width }}" @endif @if ($height) height="{{ $height }}" @endif
            alt="{{ $alt }}" loading="{{ $loading }}" decoding="async" @if ($fetchpriority) fetchpriority="{{ $fetchpriority }}" @endif {{ $attributes }}>
    </picture>
@else
    <img src="{{ $fallback }}" @if ($width) width="{{ $width }}" @endif @if ($height) height="{{ $height }}" @endif
        alt="{{ $alt }}" loading="{{ $loading }}" decoding="async" @if ($fetchpriority) fetchpriority="{{ $fetchpriority }}" @endif {{ $attributes }}>
@endif
