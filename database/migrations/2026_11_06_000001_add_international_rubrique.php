<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('rubriques')->insertOrIgnore([
            'slug' => 'international',
            'label' => 'International / Reste du monde',
            'tagline' => 'Actualités internationales et du reste du monde',
            'in_menu' => false,
            'sort' => min(65535, (int) DB::table('rubriques')->max('sort') + 1),
        ]);
    }

    public function down(): void {}
};
