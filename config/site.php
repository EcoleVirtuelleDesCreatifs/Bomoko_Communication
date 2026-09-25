<?php

return [
    'contact_email' => env('SITE_CONTACT_EMAIL'),
    'phone' => env('SITE_PHONE', '+225 07 47 04 47 04'),
    'opening_hours' => env('SITE_OPENING_HOURS', 'Lun. – Ven. dès 11h · Sam. soir uniquement · Dim. fermé'),
    'address_line' => env('SITE_ADDRESS_LINE', 'II Plateaux Vallons, Rue J97, Îlot 2552'),
    'city' => env('SITE_CITY', 'Abidjan, Côte d’Ivoire'),
    'reservation_url' => env('SITE_RESERVATION_URL'),
    'menu_url' => env('SITE_MENU_URL'),
    'gallery_url' => env('SITE_GALLERY_URL'),
    'instagram_url' => env('SITE_INSTAGRAM_URL'),
    'facebook_url' => env('SITE_FACEBOOK_URL'),
    'legal_notice_url' => env('SITE_LEGAL_NOTICE_URL'),
    'privacy_policy_url' => env('SITE_PRIVACY_POLICY_URL'),
    'admin_email' => env('ADMIN_EMAIL'),
    'legal' => [
        'company_name' => env('SITE_LEGAL_COMPANY_NAME', 'Le Cercle'),
        'legal_form' => env('SITE_LEGAL_FORM'),
        'capital' => env('SITE_LEGAL_CAPITAL'),
        'rccm' => env('SITE_LEGAL_RCCM'),
        'tax_id' => env('SITE_LEGAL_TAX_ID'),
        'director' => env('SITE_LEGAL_DIRECTOR'),
        'host_name' => env('SITE_HOST_NAME'),
        'host_address' => env('SITE_HOST_ADDRESS'),
        'dpo_email' => env('SITE_DPO_EMAIL'),
    ],
];
