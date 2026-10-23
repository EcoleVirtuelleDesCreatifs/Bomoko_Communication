<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Votre demande de réservation au Cercle</title>
</head>
<body style="margin:0;padding:0;background:#f5f0e8;color:#4a4139;font-family:Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f0e8;padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;">
                    <tr>
                        <td style="background:#2b2118;padding:38px;text-align:center;">
                            <div style="color:#b8965a;font-family:Georgia,serif;font-size:38px;font-style:italic;margin-bottom:10px;">Le Cercle</div>
                            <h1 style="margin:0;color:#f5f0e8;font-size:22px;font-weight:400;">Demande bien reçue</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:36px;">
                            <p style="margin:0 0 18px;line-height:1.7;">Bonjour {{ $reservation->name }},</p>
                            <p style="margin:0 0 22px;line-height:1.7;">Nous avons bien reçu votre demande de réservation. Voici le récapitulatif des informations transmises :</p>

                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8f6f2;border-left:3px solid #b8965a;">
                                <tr><td style="padding:22px 24px 8px;"><strong>Date</strong><br>{{ $reservation->date->translatedFormat('l d F Y') }}</td></tr>
                                <tr><td style="padding:8px 24px;"><strong>Heure</strong><br>{{ \Carbon\Carbon::parse($reservation->time)->format('H:i') }}</td></tr>
                                <tr><td style="padding:8px 24px;"><strong>Nombre de couverts</strong><br>{{ $reservation->guests }}</td></tr>
                                @if ($reservation->menu_choice && $reservation->menuChoiceLabel())
                                    <tr><td style="padding:8px 24px;"><strong>Menu choisi</strong><br>{{ $reservation->menuChoiceLabel() }}</td></tr>
                                @endif
                                @if ($reservation->phone)
                                    <tr><td style="padding:8px 24px;"><strong>Téléphone</strong><br>{{ $reservation->phone }}</td></tr>
                                @endif
                                @if ($reservation->allergies)
                                    <tr><td style="padding:8px 24px;"><strong>Allergies ou restrictions</strong><br>{{ $reservation->allergies }}</td></tr>
                                @endif
                                @if ($reservation->message)
                                    <tr><td style="padding:8px 24px 22px;"><strong>Votre message</strong><br>{{ $reservation->message }}</td></tr>
                                @endif
                            </table>

                            <p style="margin:24px 0 12px;line-height:1.7;"><strong>Votre demande est actuellement en attente de confirmation.</strong></p>
                            <p style="margin:0;line-height:1.7;">Vous recevrez un second e-mail lorsque notre équipe aura confirmé votre table.</p>
                            <p style="margin:24px 0 0;line-height:1.7;">À très bientôt,<br>L’équipe du Cercle</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px 36px;border-top:1px solid #efe9dd;color:#8a7f72;font-size:12px;text-align:center;">
                            {{ config('site.address_line') }} — {{ config('site.city') }}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    <!-- You must be the change you wish to see in the world. - Mahatma Gandhi -->
</body>
</html>
