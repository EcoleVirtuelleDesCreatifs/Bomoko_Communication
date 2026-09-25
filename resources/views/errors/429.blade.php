@extends('errors.layout', ['code' => 429])

@section('error_title', 'Trop de requêtes')
@section('error_message', 'Vous avez effectué trop de requêtes. Réessayez dans un instant.')
