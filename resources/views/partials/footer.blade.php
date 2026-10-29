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
            <p class="footer-contact" style="text-transform: none; letter-spacing: 0.04em;"><a href="tel:{{ preg_replace('/\s+/', '', (string) config('site.phone')) }}">{{ config('site.phone') }}</a><br><a href="mailto:{{ config('site.contact_email') }}">{{ config('site.contact_email') }}</a></p>
        </div>
        <nav class="footer-nav" aria-label="Navigation pied de page">
            <ul>
                <li><a href="{{ $homeUrl }}#le-cercle">Le Cercle</a></li>
                <li><a href="{{ route('menu') }}">La carte bistronomique</a></li>
                <li><a href="{{ route('menu.tapas') }}">La carte à tapas</a></li>
                <li><a href="{{ route('menu.drinks') }}">La carte des boissons</a></li>
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
        <p>© {{ date('Y') }} Le Cercle. Tous droits réservés.</p>
        <ul class="footer-legal">
            <li><a href="{{ $legalNoticeUrl }}">Mentions légales</a></li>
            <li><a href="{{ $privacyPolicyUrl }}">Politique de confidentialité</a></li>
        </ul>
    </div>
</footer>
