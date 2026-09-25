@extends('errors.layout', ['code' => 419])

@section('error_title', 'Session expirée')
@section('error_message', 'Le formulaire a expiré, veuillez réessayer.')

@section('content')
    <section class="error-page">
        <div class="error-media" aria-hidden="true">
            <x-picture src="slider/img_slider_2.jpg" alt="" loading="eager" fetchpriority="high" sizes="100vw" />
            <div class="hero-overlay"></div>
        </div>
        <div class="error-content">
            <p class="error-code">419</p>
            <h1 class="error-title">Session expirée</h1>
            <p class="error-message">Le formulaire a expiré, veuillez réessayer.</p>
            <div class="error-actions">
                <a href="{{ url()->previous() }}" class="btn btn-gold">Retour</a>
                <a href="{{ route('home') }}" class="btn btn-outline">Retour à l'accueil</a>
            </div>
            <p class="error-help">Besoin d'aide ? <a href="tel:{{ preg_replace('/\s+/', '', (string) config('site.phone')) }}">{{ config('site.phone') }}</a></p>
        </div>
    </section>
@endsection
