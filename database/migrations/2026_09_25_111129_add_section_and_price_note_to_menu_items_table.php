<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('menu_items', function (Blueprint $table) {
            $table->string('section')->nullable()->after('category');
            $table->string('price_note')->nullable()->after('price');
            $table->unsignedInteger('price')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('menu_items', function (Blueprint $table) {
            $table->dropColumn(['section', 'price_note']);
            $table->unsignedInteger('price')->nullable(false)->change();
        });
    }
};
