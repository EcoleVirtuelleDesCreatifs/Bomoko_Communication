@extends('layouts.app')

@section('robots', 'noindex, nofollow')
@section('title', ($code ?? '') . ' — ' . trim($__env->yieldContent('error_title')) . ' — Le Cercle')
@section('meta_description', 'Erreur ' . ($code ?? '') . ' — Le Cercle, restaurant bistronomique à Abidjan.')

@section('content')
    <section class="error-page">
        <div class="error-media" aria-hidden="true">
            <x-picture src="slider/img_slider_2.jpg" alt="" loading="eager" fetchpriority="high" sizes="100vw" />
            <div class="hero-overlay"></div>
        </div>
        <div class="error-content">
            <p class="error-code">{{ $code }}</p>
            <h1 class="error-title">@yield('error_title')</h1>
            <p class="error-message">@yield('error_message')</p>
            <div class="error-actions">
                <a href="{{ route('home') }}" class="btn btn-gold">Retour à l'accueil</a>
                <a href="{{ route('menu') }}" class="btn btn-outline">Voir la carte</a>
                <a href="{{ route('reservation') }}" class="link-arrow">Réserver une table</a>
            </div>
            <p class="error-help">Besoin d'aide ? <a href="tel:{{ preg_replace('/\s+/', '', (string) config('site.phone')) }}">{{ config('site.phone') }}</a></p>
        </div>
    </section>
@endsection
