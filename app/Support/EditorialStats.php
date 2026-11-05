<?php

namespace App\Support;

use App\Models\Article;
use App\Models\Rubrique;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class EditorialStats
{
    public function publications(): array
    {
        $users = User::all(['id', 'name'])->groupBy('name');

        return Article::published()->where('published_at', '>=', now()->startOfMonth()->subMonths(23))
            ->select('user_id', 'author_name')->selectRaw('DATE(published_at) AS day, COUNT(*) AS total')
            ->groupBy('user_id', 'author_name')->groupByRaw('DATE(published_at)')->get()
            ->map(function ($row) use ($users) {
                $matches = $users[$row->author_name] ?? collect();
                $id = $row->user_id ?: ($matches->count() === 1 ? $matches->first()->id : null);

                return ['member' => $id ? 'u'.$id : '__ext', 'day' => $row->day, 'count' => (int) $row->total];
            })->all();
    }

    public function dashboard(): array
    {
        $labels = Rubrique::pluck('label', 'slug');

        return [
            'published' => Article::published()->count(),
            'featured' => Article::published()->where('is_une', true)->count(),
            'scheduled' => Article::where('status', 'programme')->where('published_at', '>', now())->count(),
            'drafts' => Article::whereIn('status', ['brouillon', 'relecture'])->count(),
            'review' => Article::where('status', 'relecture')->count(),
            'rubriques' => Article::published()->select('rubrique_slug')->selectRaw('COUNT(*) AS total')->groupBy('rubrique_slug')
                ->get()->map(fn ($row) => ['label' => $labels[$row->rubrique_slug] ?? $row->rubrique_slug, 'n' => (int) $row->total])->sortByDesc('n')->values()->all(),
            'dailyViews' => DB::table('article_daily_views')->where('day', '>=', now()->subDays(13)->toDateString())->pluck('views', 'day')->all(),
        ];
    }
}
