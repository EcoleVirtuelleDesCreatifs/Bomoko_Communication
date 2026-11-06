<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Support\ArticleLayoutAudit;
use Illuminate\Console\Command;
use Symfony\Component\Console\Output\OutputInterface;

class AuditArticleLayouts extends Command
{
    protected $signature = 'articles:audit-layout {--status=* : Limiter aux statuts indiqués} {--json : Rapport JSONL sur la sortie standard}';

    protected $description = 'Audit en lecture seule des mises en page, avec propositions à valider, sans modification des articles';

    public function handle(ArticleLayoutAudit $audit): int
    {
        $statuses = $this->option('status');
        if (array_diff($statuses, Article::STATUSES) !== []) {
            $this->error('Statut invalide. Valeurs possibles : '.implode(', ', Article::STATUSES));

            return self::FAILURE;
        }
        if (! $this->option('json')) {
            $this->info('Lecture seule : aucun contenu, statut, compteur ni horodatage ne sera modifié.');
            $this->warn('Les signaux sont des pistes de révision, pas des erreurs certaines. Aucune séparation perdue ne sera inventée.');
        }
        $query = Article::query()->select(['id', 'slug', 'title', 'status', 'body', 'updated_at']);
        if ($statuses !== []) {
            $query->whereIn('status', $statuses);
        }
        $scanned = $flagged = $proposals = 0;
        $counts = [];
        foreach ($query->lazyById(100) as $article) {
            $scanned++;
            $result = $audit->inspect($article->body);
            if ($result['issues'] === []) {
                continue;
            }
            $flagged++;
            $proposals += $result['proposed_body'] !== null ? 1 : 0;
            foreach (array_unique(array_column($result['issues'], 'code')) as $code) {
                $counts[$code] = ($counts[$code] ?? 0) + 1;
            }
            if ($this->option('json')) {
                $this->jsonLine([
                    'type' => 'article', 'id' => $article->id, 'slug' => $article->slug,
                    'title' => $article->title, 'status' => $article->status,
                    'base_updated_at' => $article->getRawOriginal('updated_at'),
                    'base_body_sha256' => hash('sha256', $article->getRawOriginal('body') ?? 'null'),
                    'review_required' => true, 'original_body' => $article->body,
                    ...$result,
                ]);
            } else {
                $this->line('#'.$article->id.' '.$article->slug.' ['.$article->status.'] : '.implode(', ', array_unique(array_column($result['issues'], 'code'))));
            }
        }
        $summary = ['type' => 'summary', 'read_only' => true, 'scanned' => $scanned, 'flagged' => $flagged, 'proposals' => $proposals, 'articles_by_signal' => $counts];
        if ($this->option('json')) {
            $this->jsonLine($summary);
        } else {
            $this->info($scanned.' article(s) examiné(s), '.$flagged.' à vérifier, '.$proposals.' proposition(s) fondée(s) sur des séparations existantes.');
            $this->comment('Export privé pour validation : articles:audit-layout --json. Ne pas publier le rapport : il peut contenir des brouillons.');
        }

        return self::SUCCESS;
    }

    private function jsonLine(array $value): void
    {
        $this->output->writeln(json_encode($value, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE | JSON_THROW_ON_ERROR), OutputInterface::OUTPUT_RAW);
    }
}
