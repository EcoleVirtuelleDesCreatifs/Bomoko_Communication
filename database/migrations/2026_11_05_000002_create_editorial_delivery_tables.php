<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('debate_votes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('debate_id');
            $table->string('voter_hash', 64);
            $table->string('side', 6);
            $table->timestamp('created_at');
            $table->unique(['debate_id', 'voter_hash']);
        });
        Schema::create('article_daily_views', function (Blueprint $table) {
            $table->date('day')->primary();
            $table->unsignedBigInteger('views')->default(0);
        });
        Schema::create('newsletter_campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('client_key', 64)->unique();
            $table->string('subject');
            $table->text('intro');
            $table->json('article_ids');
            $table->timestamp('scheduled_at')->index();
            $table->string('status')->default('programmee')->index();
            $table->unsignedInteger('recipients')->default(0);
            $table->unsignedInteger('sent')->default(0);
            $table->unsignedInteger('failed')->default(0);
            $table->unsignedBigInteger('created_by');
            $table->timestamps();
        });
        Schema::create('newsletter_deliveries', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('campaign_id');
            $table->unsignedBigInteger('subscriber_id');
            $table->string('status')->default('pending')->index();
            $table->timestamp('sent_at')->nullable();
            $table->unique(['campaign_id', 'subscriber_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('newsletter_deliveries');
        Schema::dropIfExists('newsletter_campaigns');
        Schema::dropIfExists('article_daily_views');
        Schema::dropIfExists('debate_votes');
    }
};
