<?php

/* =========================================================
   LE CERCLE — configuration du serveur
   ========================================================= */

// Mot de passe de l'espace admin à la PREMIÈRE connexion.
// Changez-le ensuite depuis Admin > Réglages (il sera alors stocké chiffré en base).
const ADMIN_PASSWORD_INITIAL = 'cercle2026';

// Fichier de base de données SQLite (créé automatiquement).
const DB_FILE = __DIR__.'/../data/cercle.sqlite';

// Carte de départ, importée au premier lancement.
const MENU_SEED_FILE = __DIR__.'/../data/menu.seed.json';

// Fuseau horaire du restaurant (journée de service, numéros de commande).
const TIMEZONE = 'Africa/Abidjan';
