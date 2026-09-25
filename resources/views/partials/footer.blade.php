@php
    $homeUrl = route('home');
    $reservationUrl = config('site.reservation_url') ?: route('reservation');
    $instagramUrl = config('site.instagram_url') ?: '#';
    $facebookUrl = config('site.facebook_url') ?: '#';
    $legalNoticeUrl = config('site.legal_notice_url') ?: route('legal.notice');
    $privacyPolicyUrl = config('site.privacy_policy_url') ?: route('legal.privacy');
@endphp

<!-- ============ FOOTER ============ -->
<footer class="site-footer">
    <div class="container footer-grid">
        <div class="footer-brand">
            <span class="brand-script">Le Cercle</span>
            <p>Restaurant Bistronomique</p>
            <p class="footer-address">{{ config('site.address_line') }}<br>{{ config('site.city') }}</p>
        </div>
        <nav class="footer-nav" aria-label="Navigation pied de page">
            <ul>
                <li><a href="{{ $homeUrl }}#le-cercle">Le Cercle</a></li>
                <li><a href="{{ $homeUrl }}#la-carte">La Carte</a></li>
                <li><a href="{{ $homeUrl }}#espaces">Nos Espaces</a></li>
                <li><a href="{{ $homeUrl }}#galerie">Galerie</a></li>
                <li><a href="{{ route('events.index') }}">Événements</a></li>
                <li><a href="{{ $reservationUrl }}">Réservation</a></li>
                <li><a href="{{ $homeUrl }}#contact">Contact</a></li>
            </ul>
        </nav>
        <div class="footer-social">
            <p class="footer-label">Suivez-nous</p>
            <ul>
                <li><a href="{{ $instagramUrl }}">Instagram</a></li>
                <li><a href="{{ $facebookUrl }}">Facebook</a></li>
            </ul>
        </div>
    </div>
    <div class="container footer-bottom">
        <p>© {{ date('Y') }} Le Cercle. Tous droits réservés. Developpé par BOMOKO COMMUNICATION</p>
        <ul class="footer-legal">
            <li><a href="{{ $legalNoticeUrl }}">Mentions légales</a></li>
            <li><a href="{{ $privacyPolicyUrl }}">Politique de confidentialité</a></li>
        </ul>
    </div>
</footer>
