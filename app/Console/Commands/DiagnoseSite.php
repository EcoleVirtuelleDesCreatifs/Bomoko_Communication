<?php

namespace App\Console\Commands;

use App\Support\SiteAssets;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;

class DiagnoseSite extends Command
{
    protected $signature = 'site:diagnose';

    protected $description = 'Contrôles en lecture seule du déploiement, des fichiers SEO et des services';

    public function handle(): int
    {
        $this->line('Application : '.base_path());
        $this->line('Répertoire public attendu : '.public_path());
        foreach (['robots.txt', 'sitemap.xml', 'rss.xml'] as $file) {
            foreach (array_unique([base_path($file), public_path($file)]) as $path) {
                if (is_file($path)) {
                    $this->warn('Fichier statique potentiellement prioritaire : '.$path);
                }
            }
        }
        $legacyCss = base_path('assets/css/afriquinfos.css');
        if (is_file($legacyCss)) {
            $this->warn('Ancienne CSS de maquette à la racine : '.$legacyCss.' — SHA256 '.hash_file('sha256', $legacyCss));
        }
        $this->line('CSS courante : '.SiteAssets::url('afriquinfos.css'));
        $this->line('CSS SHA256 : '.hash_file('sha256', public_path('assets/css/afriquinfos.css')));
        $this->line('Transport e-mail : '.config('mail.default'));
        foreach (['admin_audit_events', 'debate_votes', 'article_daily_views', 'newsletter_campaigns', 'newsletter_deliveries'] as $table) {
            $this->line($table.' : '.(Schema::hasTable($table) ? 'présente' : 'MANQUANTE'));
        }
        Artisan::call('inertia:check-ssr');
        $this->line(trim(Artisan::output()));
        $this->comment('À vérifier dans le panneau serveur : DocumentRoot, cron schedule:run, supervision SSR, règles et purge Cloudflare, sauvegardes et restauration.');

        return self::SUCCESS;
    }
}
