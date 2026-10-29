<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rubriques', function (Blueprint $table) {
            $table->string('slug')->primary();
            $table->string('label');
            $table->string('tagline')->nullable();
            $table->boolean('in_menu')->default(true);
            $table->unsignedSmallInteger('sort')->default(0);
        });

        Schema::create('regions', function (Blueprint $table) {
            $table->string('slug')->primary();
            $table->string('label');
            $table->unsignedSmallInteger('sort')->default(0);
        });

        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('rubrique_slug')->index();
            $table->string('region_slug')->nullable()->index();
            $table->string('country')->nullable();
            $table->string('title');
            $table->text('chapo')->nullable();
            $table->string('author_name')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('published_at')->nullable()->index();
            $table->unsignedSmallInteger('read_time')->default(4);
            $table->json('tags')->nullable();
            $table->json('body')->nullable();
            $table->string('ph')->default('ink');
            $table->string('img')->nullable();
            $table->string('image_path')->nullable();
            $table->string('icon')->nullable();
            $table->json('person')->nullable();
            $table->unsignedInteger('views')->default(0);
            $table->boolean('is_une')->default(false);
            $table->string('status')->default('brouillon')->index();
            $table->string('meta_desc')->nullable();
            $table->timestamps();

            $table->foreign('rubrique_slug')->references('slug')->on('rubriques');
            $table->foreign('region_slug')->references('slug')->on('regions')->nullOnDelete();
        });

        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->string('title');
            $table->string('city')->nullable();
            $table->string('country')->nullable();
            $table->string('cat')->nullable();
            $table->text('desc')->nullable();
            $table->timestamps();
        });

        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained()->cascadeOnDelete();
            $table->string('author');
            $table->string('email')->nullable();
            $table->text('text');
            $table->string('status')->default('attente')->index();
            $table->text('reply')->nullable();
            $table->timestamps();
        });

        Schema::create('subscribers', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('email')->unique();
            $table->string('country')->nullable();
            $table->string('status')->default('actif')->index();
            $table->timestamps();
        });

        Schema::create('debates', function (Blueprint $table) {
            $table->id();
            $table->string('question');
            $table->text('pour_text');
            $table->string('pour_who');
            $table->text('contre_text');
            $table->string('contre_who');
            $table->unsignedInteger('votes_pour')->default(0);
            $table->unsignedInteger('votes_contre')->default(0);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->boolean('is_current')->default(false);
            $table->timestamps();
        });

        Schema::create('contact_messages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('subject');
            $table->text('message');
            $table->boolean('read')->default(false);
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('journaliste')->after('email');
            $table->timestamp('last_login_at')->nullable()->after('remember_token');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'last_login_at']);
        });
        Schema::dropIfExists('contact_messages');
        Schema::dropIfExists('debates');
        Schema::dropIfExists('subscribers');
        Schema::dropIfExists('comments');
        Schema::dropIfExists('events');
        Schema::dropIfExists('articles');
        Schema::dropIfExists('regions');
        Schema::dropIfExists('rubriques');
    }
};
