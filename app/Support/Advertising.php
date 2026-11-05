<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

class Advertising
{
    public static function active(): array
    {
        $ads = json_decode(DB::table('admin_data')->where('key', 'ads')->value('value') ?? '[]', true) ?: [];
        $today = now()->toDateString();

        return array_values(array_filter($ads, fn ($ad) => ! filter_var($ad['paused'] ?? false, FILTER_VALIDATE_BOOLEAN)
            && ! empty($ad['id']) && ! empty($ad['slot'])
            && ! empty($ad['start']) && ! empty($ad['end']) && $ad['start'] <= $today && $ad['end'] >= $today));
    }
}
