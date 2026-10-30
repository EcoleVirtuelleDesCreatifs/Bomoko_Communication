<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Invitation à l’administration Afriquinfos</title>
</head>
<body style="margin:0;padding:0;background:#f4f1ec;font-family:'Montserrat',Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ec;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">

        <tr><td style="background:#1a1918;padding:28px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="font-size:22px;font-weight:800;letter-spacing:-.5px;">
              <span style="color:#de5011;">Afriqu</span><span style="color:#f4f1ec;">infos</span>
            </td>
            <td align="right" style="color:#8f8a83;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">Administration</td>
          </tr></table>
        </td></tr>
        <tr><td style="height:4px;background:#de5011;line-height:4px;font-size:0;">&nbsp;</td></tr>

        <tr><td style="padding:36px 32px 8px;">
          <p style="margin:0 0 6px;color:#de5011;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Invitation</p>
          <h1 style="margin:0 0 16px;color:#1a1918;font-size:26px;line-height:1.25;font-weight:800;">Bonjour {{ $user->name }},</h1>
          <p style="margin:0 0 16px;color:#46413c;font-size:15px;line-height:1.65;">
            Vous avez été invité·e à rejoindre l’équipe d’administration d’<strong>Afriquinfos</strong>
            avec le rôle <strong>{{ $user->role }}</strong>, sur l’adresse <strong>{{ $user->email }}</strong>.
          </p>
          <p style="margin:0 0 28px;color:#46413c;font-size:15px;line-height:1.65;">
            Pour activer votre compte, définissez votre mot de passe en cliquant sur le bouton ci-dessous.
            Ce lien est valable <strong>72 heures</strong>.
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="background:#de5011;border-radius:6px;">
              <a href="{{ $inviteUrl }}" style="display:inline-block;padding:13px 28px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;">Définir mon mot de passe</a>
            </td>
          </tr></table>
          <p style="margin:28px 0 0;color:#8f8a83;font-size:12px;line-height:1.6;">
            Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
            <span style="word-break:break-all;color:#46413c;">{{ $inviteUrl }}</span>
          </p>
          <p style="margin:24px 0 36px;color:#8f8a83;font-size:12px;line-height:1.6;">
            Si vous n’attendiez pas cette invitation, ignorez simplement cet e-mail.
          </p>
        </td></tr>

        <tr><td style="background:#f4f1ec;padding:20px 32px;color:#8f8a83;font-size:11px;line-height:1.6;">
          Afriquinfos — L’actualité panafricaine, ni totems ni tabous.<br>
          Cet e-mail est envoyé automatiquement, merci de ne pas y répondre.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
