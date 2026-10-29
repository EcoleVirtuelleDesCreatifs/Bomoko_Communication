<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Bienvenue dans le brief Afriquinfos</title>
</head>
<body style="margin:0;padding:0;background:#f4f1ec;font-family:'Montserrat',Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ec;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">

        {{-- En-tête --}}
        <tr><td style="background:#1a1918;padding:28px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="font-size:22px;font-weight:800;letter-spacing:-.5px;">
              <span style="color:#de5011;">Afriqu</span><span style="color:#f4f1ec;">infos</span>
            </td>
            <td align="right" style="color:#8f8a83;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">Le brief panafricain</td>
          </tr></table>
        </td></tr>
        <tr><td style="height:4px;background:#de5011;line-height:4px;font-size:0;">&nbsp;</td></tr>

        {{-- Corps --}}
        <tr><td style="padding:36px 32px 8px;">
          <p style="margin:0 0 6px;color:#de5011;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Inscription confirmée</p>
          <h1 style="margin:0 0 16px;color:#1a1918;font-size:26px;line-height:1.25;font-weight:800;">Bienvenue {{ $subscriber->name ? ' '.$subscriber->name : '' }}!</h1>
          <p style="margin:0 0 16px;color:#46413c;font-size:15px;line-height:1.65;">
            Votre adresse <strong>{{ $subscriber->email }}</strong> est désormais abonnée au brief Afriquinfos :
            chaque matin, l’essentiel de l’actualité panafricaine — politique, économie, société, culture et sports —
            sélectionné par notre rédaction. Ni totems, ni tabous.
          </p>
          <p style="margin:0 0 28px;color:#46413c;font-size:15px;line-height:1.65;">
            Votre premier brief arrive <strong>demain matin</strong>. En attendant, retrouvez toute l’actualité sur le site.
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="background:#de5011;border-radius:6px;">
              <a href="{{ url('/') }}" style="display:inline-block;padding:13px 28px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;">Lire l’actualité du jour</a>
            </td>
          </tr></table>
        </td></tr>

        {{-- Rubriques --}}
        <tr><td style="padding:28px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ec;border-radius:8px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 10px;color:#1a1918;font-size:13px;font-weight:700;">Ce que vous recevrez</p>
              <p style="margin:0;color:#6b655e;font-size:13px;line-height:1.7;">
                Politique &amp; diplomaties · Économie &amp; business · Société · Culture &amp; sports · Portraits et grands entretiens · L’agenda du continent
              </p>
            </td></tr>
          </table>
        </td></tr>

        {{-- Pied --}}
        <tr><td style="background:#1a1918;padding:24px 32px;">
          <p style="margin:0 0 6px;color:#f4f1ec;font-size:12px;">Afriquinfos est édité par <strong style="color:#de5011;">Bomoko Communication SA</strong> · Direction de la publication : Gadegbeku Edem</p>
          <p style="margin:0;color:#8f8a83;font-size:11px;line-height:1.6;">
            Vous recevez cet e-mail car vous vous êtes inscrit sur {{ url('/') }}.
            <a href="{{ url('/cookies') }}" style="color:#8f8a83;text-decoration:underline;">Préférences cookies</a> ·
            <a href="{{ url('/confidentialite') }}" style="color:#8f8a83;text-decoration:underline;">Confidentialité</a> ·
            <a href="{{ url('/mentions-legales') }}" style="color:#8f8a83;text-decoration:underline;">Mentions légales</a> ·
            <a href="{{ $unsubscribeUrl }}" style="color:#8f8a83;text-decoration:underline;">Se désinscrire</a>
          </p>
        </td></tr>
      </table>
      <p style="margin:16px 0 0;color:#8f8a83;font-size:11px;">© {{ date('Y') }} Afriquinfos — L’actualité panafricaine, ni totems ni tabous.</p>
    </td></tr>
  </table>
</body>
</html>
