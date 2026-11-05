<!doctype html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{{ $campaign->subject }}</title></head>
<body style="margin:0;background:#f5f3ee;font-family:Montserrat,Arial,sans-serif;color:#222">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:100%;background:white">
<tr><td style="padding:24px;background:#030304"><img src="{{ \App\Support\SiteAssets::url('logo-afriquinfos-negatif.png') }}" alt="Afriquinfos" width="168" style="display:block;height:auto;max-width:100%"></td></tr>
<tr><td style="padding:24px"><h1 style="font-size:24px">{{ $campaign->subject }}</h1><p style="white-space:pre-line;line-height:1.6">{{ $campaign->intro }}</p>
@foreach($articles as $article)
<h2 style="font-size:19px"><a href="{{ route('article.show', $article->slug) }}" style="color:#bb450a;text-decoration:underline">{{ $article->title }}</a></h2>
<p style="line-height:1.6">{{ $article->chapo }}</p>
@endforeach
</td></tr><tr><td style="padding:24px;border-top:1px solid #ddd;font-size:12px;color:#666">Vous recevez ce message car vous êtes abonné à Afriquinfos. <a href="{{ $unsubscribeUrl }}">Se désinscrire</a><p>Contact : redaction@afriquinfos.com</p></td></tr>
</table></td></tr></table>
</body></html>
