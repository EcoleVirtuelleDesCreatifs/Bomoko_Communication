<!doctype html>
<html lang="fr" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="asset-url" content="{{ rtrim(asset(''), '/') }}">
  <title>{{ $meta['title'] ?? 'Afriquinfos — L’actualité panafricaine, ni totems ni tabous' }}</title>
  <meta name="description" content="{{ $meta['description'] ?? 'Afriquinfos, le média panafricain : politique, économie, sports, société, culture, opinion et l’actualité des six régions d’Afrique.' }}">
  <meta name="robots" content="{{ $meta['robots'] ?? 'index, follow, max-image-preview:large, max-snippet:-1' }}">
  <link rel="canonical" href="{{ $meta['canonical'] ?? url()->current() }}">
  <meta property="og:site_name" content="Afriquinfos">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:type" content="{{ $meta['og_type'] ?? 'website' }}">
  <meta property="og:title" content="{{ $meta['title'] ?? 'Afriquinfos — L’actualité panafricaine, ni totems ni tabous' }}">
  <meta property="og:description" content="{{ $meta['description'] ?? 'Afriquinfos, le média panafricain : politique, économie, sports, société, culture, opinion et l’actualité des six régions d’Afrique.' }}">
  <meta property="og:url" content="{{ $meta['canonical'] ?? url()->current() }}">
  <meta property="og:image" content="{{ $meta['image'] ?? asset('assets/img/og-default.jpg') }}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Afriquinfos — Ni totems, ni tabous. L’actualité panafricaine">
  @foreach(($meta['extra'] ?? []) as $property => $content)
  <meta property="{{ $property }}" content="{{ $content }}">
  @endforeach
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@AfriquinfosActu">
  <meta name="theme-color" content="#030304">
  <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('assets/img/favicon-32.png') }}">
  <link rel="apple-touch-icon" href="{{ asset('assets/img/apple-touch-icon.png') }}">
  <link rel="manifest" href="{{ asset('manifest.webmanifest') }}">
  <link rel="alternate" type="application/rss+xml" title="Afriquinfos" href="{{ url('/rss.xml') }}">
  <script>try{var t=localStorage.getItem('aq-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t)}catch(e){}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://cdn.jsdelivr.net">
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
  <link href="{{ asset('assets/css/afriquinfos.css') }}" rel="stylesheet">
  @if(request()->is('admin*'))<link href="{{ asset('assets/css/admin.css') }}" rel="stylesheet">@endif
  <link href="{{ asset('assets/css/afriquinfos-print.css') }}" rel="stylesheet" media="print">
  @foreach(($meta['jsonld'] ?? []) as $ld)
  <script type="application/ld+json">{!! json_encode($ld, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) !!}</script>
  @endforeach
  @vite(['resources/js/app.js'])
  @inertiaHead
</head>
<body>
  @inertia
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" defer></script>
</body>
</html>
