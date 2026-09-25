@extends('legal.layout')

@section('title', 'Mentions légales — Le Cercle')
@section('meta_description', 'Mentions légales du site du restaurant Le Cercle, aux II Plateaux Vallons, Abidjan : éditeur, hébergement, propriété intellectuelle, réservations.')

@php
    $field = fn ($value) => $value ?: '<span class="legal-todo">À compléter</span>';
    $contactEmail = config('site.contact_email') ?: config('site.admin_email');
@endphp

@section('legal_title', 'Mentions légales')

@section('legal_toc')
    <li><a href="#editeur">Éditeur du site</a></li>
    <li><a href="#hebergement">Hébergement</a></li>
    <li><a href="#realisation">Conception et réalisation</a></li>
    <li><a href="#propriete">Propriété intellectuelle</a></li>
    <li><a href="#reservations">Réservations</a></li>
    <li><a href="#responsabilite">Responsabilité et liens externes</a></li>
    <li><a href="#donnees">Données personnelles</a></li>
    <li><a href="#droit">Droit applicable</a></li>
@endsection

@section('legal_content')
    <h2 id="editeur">Éditeur du site</h2>
    <p>
        Le présent site est édité par <strong>{{ config('site.legal.company_name') }}</strong>,
        {!! $field(config('site.legal.legal_form') ? 'société de forme ' . config('site.legal.legal_form') : null) !!},
        au capital de {!! $field(config('site.legal.capital')) !!},
        immatriculée au RCCM sous le numéro {!! $field(config('site.legal.rccm')) !!},
        numéro de contribuable {!! $field(config('site.legal.tax_id')) !!}.
    </p>
    <ul>
        <li>Siège : {{ config('site.address_line') }}, {{ config('site.city') }}</li>
        <li>Téléphone : <a href="tel:{{ preg_replace('/\s+/', '', (string) config('site.phone')) }}">{{ config('site.phone') }}</a></li>
        @if ($contactEmail)
            <li>E-mail : <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></li>
        @endif
        <li>Directeur de la publication : {!! $field(config('site.legal.director')) !!}</li>
    </ul>

    <h2 id="hebergement">Hébergement</h2>
    <p>
        Hébergeur : {!! $field(config('site.legal.host_name')) !!}<br>
        Adresse : {!! $field(config('site.legal.host_address')) !!}
    </p>

    <h2 id="realisation">Conception et réalisation</h2>
    <p>
        Ce site a été conçu et réalisé par <strong>BOMOKO COMMUNICATION</strong>, agence de communication
        à Abidjan, pour le compte du restaurant Le Cercle. BOMOKO COMMUNICATION intervient en qualité de
        prestataire technique et n'est pas l'éditeur du site : le contenu publié (textes, carte, photographies,
        actualités) relève de la seule responsabilité de Le Cercle.
    </p>

    <h2 id="propriete">Propriété intellectuelle</h2>
    <p>
        L'ensemble des éléments composant ce site — textes, photographies, logo, charte graphique,
        carte et descriptions des plats — est protégé par le droit de la propriété intellectuelle.
        Toute reproduction, représentation ou diffusion, totale ou partielle, sans accord écrit
        préalable du Cercle est interdite.
    </p>

    <h2 id="reservations">Réservations</h2>
    <p>
        Une demande de réservation envoyée via le formulaire du site ne vaut pas confirmation :
        la réservation est validée uniquement après confirmation par e-mail ou par téléphone.
        Les prix sont exprimés en francs CFA (FCFA), service compris ; la carte est susceptible
        d'évoluer selon les saisons et les arrivages. Les allergies et restrictions alimentaires
        déclarées le sont sous la responsabilité de la personne qui les renseigne.
    </p>

    <h2 id="responsabilite">Responsabilité et liens externes</h2>
    <p>
        Le Cercle s'efforce de fournir des informations exactes mais ne saurait garantir l'absence
        d'erreurs ou d'omissions. Le site contient des liens externes (Google Maps, réseaux sociaux)
        dont le contenu relève de la seule responsabilité de leurs éditeurs.
    </p>

    <h2 id="donnees">Données personnelles</h2>
    <p>
        Le traitement des données personnelles est décrit dans notre
        <a href="{{ route('legal.privacy') }}">politique de confidentialité</a>.
    </p>

    <h2 id="droit">Droit applicable</h2>
    <p>
        Les présentes mentions légales sont régies par le droit de la République de Côte d'Ivoire.
        Tout litige relatif à l'utilisation du site relève de la compétence des tribunaux d'Abidjan.
    </p>
@endsection

@section('legal_next')
    Consultez également notre <a href="{{ route('legal.privacy') }}">politique de confidentialité</a>.
@endsection
