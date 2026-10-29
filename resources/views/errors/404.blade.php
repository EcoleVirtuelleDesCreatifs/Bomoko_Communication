<!doctype html>
<html lang="fr" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Page introuvable — Afriquinfos</title>
  <meta name="robots" content="noindex, follow">
  <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('assets/img/favicon-32.png') }}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
  <link href="{{ asset('assets/css/afriquinfos.css') }}" rel="stylesheet">
</head>
<body>
  <main class="aq-errpage">
    <img src="{{ asset('assets/img/logo-compact.png') }}" alt="Afriquinfos" width="150" height="40">
    <p class="aq-errpage__code" aria-hidden="true">404</p>
    <h1>Cette page est introuvable</h1>
    <p>L'adresse demandée n'existe pas ou l'article a été déplacé. Retrouvez l'actualité panafricaine depuis l'accueil ou lancez une recherche.</p>
    <div class="aq-errpage__links">
      <a class="aq-btn aq-btn--primary" href="/"><i class="bi bi-house" aria-hidden="true"></i>Retour à l'accueil</a>
      <a class="aq-btn aq-btn--outline" href="/recherche"><i class="bi bi-search" aria-hidden="true"></i>Rechercher un article</a>
    </div>
    <div class="aq-errpage__links" style="margin-top:2.5rem">
      <a href="/rubrique/politique">Politique</a> · <a href="/rubrique/economie">Économie</a> · <a href="/rubrique/sports">Sports</a> · <a href="/afriques">Les Afriques</a> · <a href="/portraits">Portraits</a> · <a href="/agendas">Agendas</a>
    </div>
  </main>
</body>
</html>
