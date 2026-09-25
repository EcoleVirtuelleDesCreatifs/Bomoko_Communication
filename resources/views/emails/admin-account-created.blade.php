<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Votre accès à l’administration du Cercle</title>
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
        .button { display: inline-block; background: #b8965a; color: #2b2118; text-decoration: none; padding: 14px 28px; border-radius: 4px; font-weight: 600; letter-spacing: 0.04em; }
        .footer { padding: 24px 40px; text-align: center; font-size: 12px; color: #8a7f72; border-top: 1px solid #efe9dd; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span class="brand">Le Cercle</span>
            <h1>Administration</h1>
        </div>
        <div class="body">
            <p>Bonjour {{ $user->name }},</p>
            <p>Un compte administrateur vient d’être créé pour vous sur le site du Cercle. Voici vos identifiants de connexion :</p>

            <div class="details">
                <p><strong>E-mail :</strong> {{ $user->email }}</p>
                <p><strong>Mot de passe :</strong> {{ $plainPassword }}</p>
            </div>

            <p style="text-align:center">
                <a href="{{ route('admin.login') }}" class="button">Accéder à l’administration</a>
            </p>

            <p>Pour des raisons de sécurité, nous vous conseillons de modifier ce mot de passe dès votre première connexion via la page « Mon compte ».</p>
            <p>L’équipe du Cercle</p>
        </div>
        <div class="footer">
            {{ config('site.address_line') }} — {{ config('site.city') }}
        </div>
    </div>
</body>
</html>
