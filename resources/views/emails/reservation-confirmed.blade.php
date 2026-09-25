<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Votre réservation au Cercle est confirmée</title>
    <style>
        body { font-family: 'Montserrat', sans-serif; background: #f5f0e8; color: #4a4139; margin: 0; padding: 0; }
        .container { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 12px 40px rgba(43, 33, 24, 0.08); }
        .header { background: #2b2118; padding: 40px; text-align: center; }
        .header h1 { color: #f5f0e8; font-weight: 300; font-size: 24px; margin: 0; letter-spacing: 0.08em; }
        .brand { font-family: 'Pinyon Script', cursive; color: #b8965a; font-size: 42px; display: block; margin-bottom: 12px; }
        .body { padding: 40px; }
        .body p { line-height: 1.8; margin-bottom: 18px; }
        .details { background: #f8f6f2; border-left: 3px solid #b8965a; padding: 24px; margin: 28px 0; }
        .details strong { color: #2b2118; }
        .footer { padding: 24px 40px; text-align: center; font-size: 12px; color: #8a7f72; border-top: 1px solid #efe9dd; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span class="brand">Le Cercle</span>
            <h1>Votre table est confirmée</h1>
        </div>
        <div class="body">
            <p>Bonjour {{ $reservation->name }},</p>
            <p>Nous avons le plaisir de confirmer votre réservation au Cercle pour le :</p>

            <div class="details">
                <p><strong>Date :</strong> {{ $reservation->date->format('d/m/Y') }}</p>
                <p><strong>Heure :</strong> {{ \Carbon\Carbon::parse($reservation->time)->format('H:i') }}</p>
                <p><strong>Nombre de couverts :</strong> {{ $reservation->guests }}</p>
                @if ($reservation->menu_choice && $reservation->menuChoiceLabel())
                    <p><strong>Menu choisi :</strong> {{ $reservation->menuChoiceLabel() }}</p>
                @endif
                @if ($reservation->allergies)
                    <p><strong>Allergies / Restrictions :</strong> {{ $reservation->allergies }}</p>
                @endif
                @if ($reservation->phone)
                    <p><strong>Téléphone :</strong> {{ $reservation->phone }}</p>
                @endif
                @if ($reservation->message)
                    <p><strong>Commentaire :</strong> {{ $reservation->message }}</p>
                @endif
            </div>

            <p>Nous nous réjouissons de vous accueillir.</p>
            <p>À très bientôt,<br>L’équipe du Cercle</p>
        </div>
        <div class="footer">
            {{ config('site.address_line') }} — {{ config('site.city') }}
        </div>
    </div>
</body>
</html>
