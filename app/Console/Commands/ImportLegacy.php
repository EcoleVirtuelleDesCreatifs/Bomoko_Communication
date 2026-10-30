<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ImportLegacy extends Command
{
    protected $signature = 'app:import-legacy {--db=afriquinfos_old : Base contenant l\'ancien schéma} {--suffix= : Suffixe des anciennes tables (ex. _old pour articles_old)} {--truncate : Vider les nouvelles tables avant import}';

    private $old;

    private function t(string $name): string
    {
        $suffixed = $name . $this->option('suffix');
        return $this->option('suffix') && Schema::connection('legacy')->hasTable($suffixed) ? $suffixed : $name;
    }

    protected $description = 'Importe les articles, rubriques, régions, événements et abonnés de l\'ancienne base vers le nouveau schéma';

    private array $statusMap = [
        'published' => 'publie',
        'draft' => 'brouillon',
        'pending' => 'relecture',
        'review' => 'relecture',
        'scheduled' => 'programme',
        'trash' => 'corbeille',
        'corbeille' => 'corbeille',
    ];

    public function handle(): int
    {
        $db = $this->option('db');
        config(['database.connections.legacy' => array_merge(config('database.connections.mysql'), ['database' => $db])]);
        $this->old = $old = DB::connection('legacy');

        try {
            $old->select('SELECT 1');
        } catch (\Throwable $e) {
            $this->error("Impossible de se connecter à la base « {$db} » : {$e->getMessage()}");
            return self::FAILURE;
        }

        if ($this->option('truncate')) {
            Schema::disableForeignKeyConstraints();
            foreach (['comments', 'articles', 'events', 'subscribers'] as $t) {
                DB::table($t)->truncate();
            }
            Schema::enableForeignKeyConstraints();
            $this->warn('Tables articles/events/subscribers vidées.');
        }

        // 1. Rubriques depuis categories
        $cats = $old->table($this->t('categories'))->get();
        $rubRows = $cats->map(fn($c) => [
            'slug' => $c->slug,
            'label' => $c->name,
            'tagline' => $c->description,
            'in_menu' => (bool) $c->show_in_menu,
            'sort' => $c->position,
        ])->all();
        DB::table('rubriques')->insertOrIgnore($rubRows);
        $this->info('Rubriques : ' . count($rubRows) . ' traitées.');

        // 2. Régions
        $regs = $old->table($this->t('regions'))->get();
        $regRows = $regs->map(fn($r) => ['slug' => $r->slug, 'label' => $r->name, 'sort' => $r->position])->all();
        DB::table('regions')->insertOrIgnore($regRows);
        $this->info('Régions : ' . count($regRows) . ' traitées.');

        // 3. Tables de correspondance
        $catSlug = $cats->pluck('slug', 'id');
        $regSlug = $regs->pluck('slug', 'id');
        $validRub = DB::table('rubriques')->pluck('slug')->flip();
        $validReg = DB::table('regions')->pluck('slug')->flip();
        $fallbackRub = DB::table('rubriques')->orderBy('sort')->value('slug');

        $media = $old->table($this->t('media'))->get(['id', 'disk', 'path', 'alt', 'caption', 'title'])->keyBy('id');
        $authors = Schema::connection('legacy')->hasTable($this->t('users'))
            ? $old->table($this->t('users'))->pluck('name', 'id')
            : collect();

        $tagMap = [];
        if (Schema::connection('legacy')->hasTable($this->t('article_tag')) && Schema::connection('legacy')->hasTable($this->t('tags'))) {
            foreach ($old->table($this->t('article_tag'))->join($this->t('tags') . ' as t', 't.id', '=', $this->t('article_tag') . '.tag_id')->get(['article_id', 't.name']) as $row) {
                $tagMap[$row->article_id][] = $row->name;
            }
        }

        $countryMap = [];
        if (Schema::connection('legacy')->hasTable($this->t('article_country')) && Schema::connection('legacy')->hasTable($this->t('countries'))) {
            foreach ($old->table($this->t('article_country'))->join($this->t('countries') . ' as c', 'c.id', '=', $this->t('article_country') . '.country_id')->get(['article_id', 'c.name']) as $row) {
                $countryMap[$row->article_id] ??= $row->name;
            }
        }

        // 4. Articles
        $existingSlugs = DB::table('articles')->pluck('slug')->flip();
        $imported = 0;
        $skipped = 0;
        $old->table($this->t('articles'))->orderBy('id')->chunk(500, function ($rows) use (
            &$imported,
            &$skipped,
            $existingSlugs,
            $catSlug,
            $regSlug,
            $validRub,
            $validReg,
            $fallbackRub,
            $media,
            $authors,
            $tagMap,
            $countryMap
        ) {
            $batch = [];
            foreach ($rows as $a) {
                if ($a->deleted_at) {
                    $skipped++;
                    continue;
                }
                $slug = mb_substr($a->slug, 0, 250);
                if ($existingSlugs->has($slug)) {
                    $slug .= '-' . $a->id;
                    if ($existingSlugs->has($slug)) {
                        $skipped++;
                        continue;
                    }
                }
                $existingSlugs->put($slug, true);

                $rub = $catSlug[$a->category_id] ?? $fallbackRub;
                if (! $validRub->has($rub)) $rub = $fallbackRub;
                $region = $regSlug[$a->region_id] ?? null;
                if ($region && ! $validReg->has($region)) $region = null;

                $m = $a->featured_media_id ? $media->get($a->featured_media_id) : null;
                $imagePath = $m ? ($m->disk === 'legacy' ? 'legacy/' . $m->path : $m->path) : null;
                $alt = $a->image_caption ?: ($m?->alt ?? $m?->title);

                $body = trim((string) $a->body);
                $blocks = $body === '' ? [] : [str_starts_with($body, '<') ? $body : '<p>' . nl2br(e($body)) . '</p>'];

                $batch[] = [
                    'slug' => $slug,
                    'rubrique_slug' => $rub,
                    'region_slug' => $region,
                    'country' => $countryMap[$a->id] ?? null,
                    'title' => $a->title,
                    'chapo' => $a->excerpt,
                    'author_name' => $authors[$a->author_id] ?? 'Rédaction Afriquinfos',
                    'published_at' => $a->published_at,
                    'read_time' => $a->reading_time ?: 4,
                    'tags' => json_encode($tagMap[$a->id] ?? [], JSON_UNESCAPED_UNICODE),
                    'body' => json_encode($blocks, JSON_UNESCAPED_UNICODE),
                    'ph' => 'ink',
                    'img' => $alt ? mb_substr($alt, 0, 250) : null,
                    'image_path' => $imagePath,
                    'views' => $a->views_count,
                    'is_une' => (bool) $a->is_featured,
                    'status' => $this->statusMap[$a->status] ?? 'brouillon',
                    'meta_desc' => $a->meta_description ? mb_substr($a->meta_description, 0, 190) : null,
                    'created_at' => $a->created_at,
                    'updated_at' => $a->updated_at,
                ];
            }
            foreach (array_chunk($batch, 50) as $chunk) {
                DB::table('articles')->insert($chunk);
                $imported += count($chunk);
            }
        });
        $this->info("Articles : {$imported} importés, {$skipped} ignorés.");

        // 5. Événements
        $evImported = 0;
        if (Schema::connection('legacy')->hasTable($this->t('events'))) {
            $existing = DB::table('events')->pluck('slug')->flip();
            $countries = Schema::connection('legacy')->hasTable($this->t('countries'))
                ? $old->table($this->t('countries'))->pluck('name', 'id') : collect();
            foreach ($old->table($this->t('events'))->orderBy('id')->get() as $e) {
                $slug = $e->slug;
                if ($existing->has($slug)) $slug .= '-' . $e->id;
                DB::table('events')->insert([
                    'slug' => $slug,
                    'start_date' => substr((string) $e->starts_at, 0, 10),
                    'end_date' => $e->ends_at ? substr((string) $e->ends_at, 0, 10) : null,
                    'title' => $e->title,
                    'city' => $e->city,
                    'country' => $countries[$e->country_id] ?? null,
                    'cat' => 'culture',
                    'desc' => $e->description,
                    'created_at' => $e->created_at,
                    'updated_at' => $e->updated_at,
                ]);
                $evImported++;
            }
        }
        $this->info("Événements : {$evImported} importés.");

        // 6. Abonnés newsletter
        $subImported = 0;
        if (Schema::connection('legacy')->hasTable($this->t('newsletter_subscribers'))) {
            foreach ($old->table($this->t('newsletter_subscribers'))->orderBy('id')->cursor() as $s) {
                $ok = DB::table('subscribers')->insertOrIgnore([
                    'email' => $s->email,
                    'status' => $s->unsubscribed_at ? 'inactif' : 'actif',
                    'created_at' => $s->created_at,
                    'updated_at' => $s->updated_at,
                ]);
                $subImported += $ok;
            }
        }
        $this->info("Abonnés : {$subImported} importés.");

        $this->newLine();
        $this->warn('Les images : les fichiers ne sont pas dans le dump SQL. Copiez les anciens fichiers vers storage/app/public/legacy/ (chemins type 2026/08/photo.jpg) puis php artisan storage:link.');

        return self::SUCCESS;
    }
}
