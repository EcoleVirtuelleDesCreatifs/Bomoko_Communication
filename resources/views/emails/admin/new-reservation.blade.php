<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle réservation</title>
</head>
<body style="margin:0;padding:0;background:#f2f4f7;color:#34302c;font-family:Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;background:#f2f4f7;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;overflow:hidden;background:#ffffff;border-radius:10px;">
                    <tr>
                        <td style="padding:34px;background:#2b2118;text-align:center;">
                            <div style="margin-bottom:9px;color:#b8965a;font-family:Georgia,serif;font-size:34px;font-style:italic;">Le Cercle</div>
                            <h1 style="margin:0;color:#ffffff;font-size:21px;font-weight:400;">Nouvelle demande de réservation</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:34px;">
                            <p style="margin:0 0 20px;line-height:1.7;">Une nouvelle réservation vient d’être enregistrée sur le site.</p>
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8f6f2;border-left:3px solid #b8965a;">
                                <tr><td style="padding:22px 24px 8px;"><strong>Client</strong><br>{{ $reservation->name }}</td></tr>
                                <tr><td style="padding:8px 24px;"><strong>Date et heure</strong><br>{{ $reservation->date->translatedFormat('l d F Y') }} à {{ \Carbon\Carbon::parse($reservation->time)->format('H:i') }}</td></tr>
                                <tr><td style="padding:8px 24px;"><strong>Nombre de couverts</strong><br>{{ $reservation->guests }}</td></tr>
                                <tr><td style="padding:8px 24px;"><strong>Contact</strong><br>{{ $reservation->email }}@if ($reservation->phone)<br>{{ $reservation->phone }}@endif</td></tr>
                                @if ($reservation->menu_choice && $reservation->menuChoiceLabel())
                                    <tr><td style="padding:8px 24px;"><strong>Menu</strong><br>{{ $reservation->menuChoiceLabel() }}</td></tr>
                                @endif
                                @if ($reservation->allergies)
                                    <tr><td style="padding:8px 24px;color:#8b5b17;"><strong>Allergies ou restrictions</strong><br>{{ $reservation->allergies }}</td></tr>
                                @endif
                                @if ($reservation->message)
                                    <tr><td style="padding:8px 24px 22px;"><strong>Demande particulière</strong><br>{{ $reservation->message }}</td></tr>
                                @endif
                            </table>
                            <div style="padding-top:26px;text-align:center;">
                                <a href="{{ route('admin.reservations.edit', $reservation) }}" style="display:inline-block;padding:13px 19px;border-radius:6px;background:#6b4a2e;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;">Traiter cette réservation</a>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:19px 34px;border-top:1px solid #ece7df;color:#8a7f72;font-size:12px;text-align:center;">
                            Notification automatique de l’administration Le Cercle
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    <!-- The whole future lies in uncertainty: live immediately. - Seneca -->
</body>
</html>
