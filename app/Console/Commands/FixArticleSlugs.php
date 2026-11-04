<?php

namespace App\Console\Commands;

use App\Models\Article;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class FixArticleSlugs extends Command
{
    protected $signature = 'articles:fix-slugs {--apply : Appliquer réellement les renommages}';
    protected $description = 'Corrige les slugs d\'articles tronqués en plein mot et crée des redirections 301';

    private function seoSlug(string $title, int $max = 70): string
    {
        $slug = Str::slug($title);
        if (mb_strlen($slug) > $max) {
            $slug = mb_substr($slug, 0, $max);
            $slug = mb_substr($slug, 0, (int) mb_strrpos($slug, '-')) ?: $slug;
        }
        return $slug;
    }

    public function handle(): int
    {
        $apply = $this->option('apply');
        $taken = Article::pluck('slug')->all();
        $taken = array_combine($taken, $taken);

        $changed = 0; $count = 0;
        Article::select('id', 'slug', 'title')->orderBy('id')->chunk(500, function ($articles) use (&$changed, &$count, &$taken, $apply) {
            foreach ($articles as $a) {
            if (mb_strlen($a->slug) < 70 || ! Str::startsWith(Str::slug($a->title), $a->slug) || Str::slug($a->title) === $a->slug) continue;
            $count++;
            $base = $this->seoSlug($a->title) ?: 'article';
            $new = $base; $i = 2;
            while (isset($taken[$new]) && $taken[$new] !== $a->slug) $new = $base.'-'.$i++;
            $taken[$new] = $new;

            $this->line("  {$a->slug}\n  → {$new}");
            if ($apply) {
                DB::table('slug_redirects')->updateOrInsert(
                    ['old_slug' => $a->slug],
                    ['new_slug' => $new, 'updated_at' => now(), 'created_at' => now()]
                );
                $old = $a->slug;
                $a->update(['slug' => $new]);
                unset($taken[$old]);
                $changed++;
            }
            }
        });
        $this->info($count.' slug(s) tronqué(s) détecté(s).');

        if ($changed) {
            // les flashs stockent le slug comme articleId : suivre le renommage
            $flash = DB::table('admin_data')->where('key', 'flash')->value('value');
            if ($flash) {
                $items = json_decode($flash, true) ?: [];
                $map = DB::table('slug_redirects')->pluck('new_slug', 'old_slug');
                foreach ($items as &$it) {
                    if (! empty($it['articleId']) && isset($map[$it['articleId']])) $it['articleId'] = $map[$it['articleId']];
                }
                DB::table('admin_data')->where('key', 'flash')->update(['value' => json_encode($items)]);
            }
            $this->info($changed.' slug(s) corrigé(s), redirections 301 créées.');
        } elseif (! $apply) {
            $this->comment('Mode aperçu : relancez avec --apply pour appliquer.');
        }
        return self::SUCCESS;
    }
}
