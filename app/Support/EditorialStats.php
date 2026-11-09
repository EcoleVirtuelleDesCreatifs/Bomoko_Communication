<?php

namespace App\Support;

use App\Models\Article;
use App\Models\Rubrique;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class EditorialStats
{
    public function publications(?User $user = null): array
    {
        $users = User::all(['id', 'name'])->groupBy('name');

        return $this->owned(Article::published()->where('published_at', '>=', now()->startOfMonth()->subMonths(23)), $user)
            ->select('user_id', 'author_name')->selectRaw('DATE(published_at) AS day, COUNT(*) AS total')
            ->groupBy('user_id', 'author_name')->groupByRaw('DATE(published_at)')->get()
            ->map(function ($row) use ($users) {
                $matches = $users[$row->author_name] ?? collect();
                $id = $row->user_id ?: ($matches->count() === 1 ? $matches->first()->id : null);

                return ['member' => $id ? 'u'.$id : '__ext', 'day' => $row->day, 'count' => (int) $row->total];
            })->all();
    }

    public function dashboard(?User $user = null): array
    {
        $labels = Rubrique::pluck('label', 'slug');

        return [
            'published' => $this->owned(Article::published(), $user)->count(),
            'featured' => $this->owned(Article::published()->where('is_une', true), $user)->count(),
            'scheduled' => $this->owned(Article::where('status', 'programme')->where('published_at', '>', now()), $user)->count(),
            'drafts' => $this->owned(Article::whereIn('status', ['brouillon', 'relecture']), $user)->count(),
            'review' => $this->owned(Article::where('status', 'relecture'), $user)->count(),
            'rubriques' => $this->owned(Article::published(), $user)->select('rubrique_slug')->selectRaw('COUNT(*) AS total')->groupBy('rubrique_slug')
                ->get()->map(fn ($row) => ['label' => $labels[$row->rubrique_slug] ?? $row->rubrique_slug, 'n' => (int) $row->total])->sortByDesc('n')->values()->all(),
            'dailyViews' => $user ? [] : DB::table('article_daily_views')->where('day', '>=', now()->subDays(13)->toDateString())->pluck('views', 'day')->all(),
        ];
    }

    private function owned($query, ?User $user)
    {
        if (! $user) {
            return $query;
        }
        $unique = User::where('name', $user->name)->count() === 1;

        return $query->where(fn ($q) => $q->where('user_id', $user->id)
            ->when($unique, fn ($q) => $q->orWhere(
                fn ($q) => $q->whereNull('user_id')->where('author_name', $user->name))));
    }
}
