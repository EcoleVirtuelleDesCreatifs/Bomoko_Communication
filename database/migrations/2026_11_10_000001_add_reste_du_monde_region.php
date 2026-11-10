<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('regions')->insertOrIgnore([
            'slug' => 'reste-du-monde',
            'label' => 'Reste du monde / International',
            'sort' => 99,
        ]);
    }

    public function down(): void
    {
        // Conservée : retirer la région détacherait les articles qui l'utilisent.
    }
};
