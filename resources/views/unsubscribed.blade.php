<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Désinscription — Afriquinfos</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="{{ asset('assets/css/afriquinfos.css') }}" rel="stylesheet">
</head>
<body>
<main class="container-xl py-5" style="max-width:42rem;">
  <div class="aq-legal__doc" style="text-align:center;padding:3rem 1.5rem;">
    <p style="font-size:2.5rem;margin:0;">👋</p>
    <h1 style="font-size:1.6rem;margin:.75rem 0 1rem;">Vous êtes désinscrit</h1>
    <p style="color:var(--muted,#6b655e);">
      @if($email) L’adresse <strong>{{ $email }}</strong> ne recevra plus le brief Afriquinfos. @endif
      Vous pouvez vous réabonner à tout moment depuis le site.
    </p>
    <p style="margin-top:1.5rem;"><a href="{{ url('/') }}" style="color:var(--orange,#de5011);font-weight:600;">← Retour à l’accueil</a></p>
  </div>
</main>
</body>
</html>
