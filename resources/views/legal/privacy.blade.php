@extends('legal.layout')

@section('title', 'Politique de confidentialité — Le Cercle')
@section('meta_description', 'Politique de confidentialité du restaurant Le Cercle : données collectées via le formulaire de réservation, finalités, durées de conservation, vos droits (loi ivoirienne n° 2013-450).')

@php
    $privacyEmail = config('site.legal.dpo_email') ?: config('site.contact_email') ?: config('site.admin_email');
@endphp

@section('legal_title', 'Politique de confidentialité')

@section('legal_toc')
    <li><a href="#responsable">Responsable du traitement</a></li>
    <li><a href="#donnees-collectees">Données collectées</a></li>
    <li><a href="#finalites">Finalités et bases légales</a></li>
    <li><a href="#destinataires">Destinataires</a></li>
    <li><a href="#conservation">Durée de conservation</a></li>
    <li><a href="#cookies">Cookies</a></li>
    <li><a href="#droits">Vos droits</a></li>
    <li><a href="#securite">Sécurité, mineurs et modifications</a></li>
@endsection

@section('legal_content')
    <h2 id="responsable">Responsable du traitement</h2>
    <p>
        Le responsable du traitement des données collectées via ce site est
        <strong>{{ config('site.legal.company_name') }}</strong>, {{ config('site.address_line') }},
        {{ config('site.city') }} — <a href="tel:{{ preg_replace('/\s+/', '', (string) config('site.phone')) }}">{{ config('site.phone') }}</a>.
    </p>

    <h2 id="donnees-collectees">Données collectées</h2>
    <p>Via le formulaire de réservation :</p>
    <ul>
        <li>Nom, adresse e-mail et numéro de téléphone ;</li>
        <li>Date et heure souhaitées, nombre de couverts, menu souhaité ;</li>
        <li>Allergies ou restrictions alimentaires — des données de santé que vous déclarez
            volontairement et qui sont traitées uniquement pour préparer votre repas, avec votre
            consentement ;</li>
        <li>Le contenu de votre message.</li>
    </ul>
    <p>Sont également collectées des données techniques : adresse IP et journaux de connexion du serveur.</p>

    <h2 id="finalites">Finalités et bases légales</h2>
    <ul>
        <li>Gestion des réservations et envoi de l'e-mail de confirmation (exécution des mesures
            précontractuelles) ;</li>
        <li>Prise en compte de vos allergies et restrictions alimentaires (consentement) ;</li>
        <li>Sécurité du site et prévention des abus (intérêt légitime).</li>
    </ul>

    <h2 id="destinataires">Destinataires</h2>
    <p>
        Vos données sont accessibles à l'équipe du restaurant, à notre prestataire d'envoi d'e-mails
        et à notre hébergeur, dans la stricte mesure nécessaire à leurs missions. Elles ne sont
        ni vendues ni cédées à des tiers à des fins commerciales.
    </p>

    <h2 id="conservation">Durée de conservation</h2>
    <p>
        Les réservations sont conservées 12 mois après la date du repas, puis supprimées ou
        anonymisées. Les journaux techniques sont conservés 12 mois maximum.
    </p>

    <h2 id="cookies">Cookies</h2>
    <p>
        Ce site n'utilise que le cookie de session technique et le jeton de protection CSRF,
        indispensables à son fonctionnement. Aucun cookie publicitaire ni de mesure d'audience
        n'est déposé. La carte Google Maps ne se charge qu'après un clic sur « Afficher le plan » ;
        elle est alors soumise à la politique de confidentialité de Google.
    </p>

    <h2 id="droits">Vos droits</h2>
    <p>
        Conformément à la loi n° 2013-450 du 19 juillet 2013 relative à la protection des données
        à caractère personnel en République de Côte d'Ivoire, vous disposez de droits d'accès, de
        rectification, d'opposition et de suppression de vos données.
    </p>
    @if ($privacyEmail)
        <p>Pour les exercer : <a href="mailto:{{ $privacyEmail }}">{{ $privacyEmail }}</a>.</p>
    @endif
    <p>
        Vous pouvez également adresser une réclamation à l'ARTCI (Autorité de Régulation des
        Télécommunications/TIC de Côte d'Ivoire).
    </p>

    <h2 id="securite">Sécurité, mineurs et modifications</h2>
    <p>
        Nous mettons en œuvre des mesures techniques et organisationnelles adaptées pour protéger
        vos données. Les réservations en ligne sont destinées aux adultes ; les informations
        relatives aux enfants ne doivent être renseignées que par un parent ou un accompagnant.
        La présente politique peut être modifiée ; la version en vigueur est celle affichée sur
        cette page à la date de votre visite.
    </p>
@endsection

@section('legal_next')
    Consultez également nos <a href="{{ route('legal.notice') }}">mentions légales</a>.
@endsection
