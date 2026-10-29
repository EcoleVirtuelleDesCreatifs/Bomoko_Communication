<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_data', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->json('value')->nullable();
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('status')->default('actif')->after('role');
        });

        Schema::table('articles', function (Blueprint $table) {
            $table->string('media_id')->nullable()->after('person');
        });
    }

    public function down(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->dropColumn('media_id');
        });
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('status');
        });
        Schema::dropIfExists('admin_data');
    }
};
