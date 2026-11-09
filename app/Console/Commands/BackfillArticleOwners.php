<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Models\User;
use Illuminate\Console\Command;

class BackfillArticleOwners extends Command
{
    protected $signature = 'articles:assign-owners {--apply : Écrire les attributions en base}';

    protected $description = 'Rattache les articles sans user_id à leur auteur quand le nom correspond à un seul membre.';

    public function handle(): int
    {
        $apply = (bool) $this->option('apply');
        $byName = User::all(['id', 'name'])->groupBy('name');
        $assigned = $ambiguous = $unmatched = 0;

        Article::whereNull('user_id')->orderBy('id')->chunk(200, function ($articles) use ($byName, $apply, &$assigned, &$ambiguous, &$unmatched) {
            foreach ($articles as $a) {
                $matches = $byName[$a->author_name] ?? collect();
                if ($matches->count() === 1) {
                    if ($apply) {
                        $a->timestamps = false;
                        $a->forceFill(['user_id' => $matches->first()->id])->save();
                    }
                    $assigned++;
                    $this->line(sprintf('  ✔ « %s » → %s', $a->title, $matches->first()->name));
                } elseif ($matches->count() > 1) {
                    $ambiguous++;
                    $this->warn(sprintf('  ⚠ « %s » : nom ambigu « %s » (%d comptes)', $a->title, $a->author_name, $matches->count()));
                } else {
                    $unmatched++;
                    $this->line(sprintf('  – « %s » : aucun compte « %s », laissé sans propriétaire', $a->title, $a->author_name));
                }
            }
        });

        $this->info(sprintf('%d article(s) %s, %d ambigu(s), %d sans correspondance.',
            $assigned, $apply ? 'rattachés' : 'à rattacher', $ambiguous, $unmatched));
        if (! $apply && $assigned) {
            $this->comment('Relancez avec --apply pour écrire en base.');
        }

        return self::SUCCESS;
    }
}
