<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Tarifs desserts transmis par le client : classiques 10 000 FCFA, délices sucrés 15 000 FCFA.
     */
    public function up(): void
    {
        DB::table('menu_items')->where('category', 'desserts')->where('section', 'Les classiques')->update(['price' => 10000]);
        DB::table('menu_items')->where('category', 'desserts')->where('section', 'Nos délices sucrés')->update(['price' => 15000]);
    }

    public function down(): void
    {
        //
    }
};
