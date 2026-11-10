<?php

namespace App\Support;

use Google\Analytics\Data\V1beta\Client\BetaAnalyticsDataClient;
use Google\Analytics\Data\V1beta\DateRange;
use Google\Analytics\Data\V1beta\Dimension;
use Google\Analytics\Data\V1beta\Metric;
use Google\Analytics\Data\V1beta\OrderBy;
use Google\Analytics\Data\V1beta\OrderBy\MetricOrderBy;
use Google\Analytics\Data\V1beta\RunRealtimeReportRequest;
use Google\Analytics\Data\V1beta\RunReportRequest;
use Illuminate\Support\Facades\Cache;
use Throwable;

class GoogleAnalytics
{
    public function summary(?string $start = null, ?string $end = null): array
    {
        $start = $start ?: '30daysAgo';
        $end = $end ?: 'today';
        $property = config('services.google_analytics.property_id');
        $credentials = config('services.google_analytics.credentials_path');

        if (! $property || ! $credentials) {
            return ['configured' => false];
        }
        if (! str_starts_with($credentials, '/')) {
            $credentials = base_path($credentials);
        }
        if (! is_file($credentials)) {
            return ['configured' => false, 'error' => 'Fichier de clé introuvable : '.$credentials];
        }

        $cacheKey = 'ga4-summary:'.md5($start.'|'.$end);
        $cached = Cache::get($cacheKey);
        if (is_array($cached)) {
            return $cached;
        }

        try {
            $result = $this->fetch($property, $credentials, $start, $end) + ['configured' => true, 'range' => [$start, $end]];
        } catch (Throwable $e) {
            $result = ['configured' => true, 'error' => 'API GA4 indisponible : '.$e->getMessage()];
        }

        Cache::put($cacheKey, $result, now()->addMinutes(isset($result['error']) ? 5 : 30));

        return $result;
    }

    public function geo(): array
    {
        $property = config('services.google_analytics.property_id');
        $credentials = config('services.google_analytics.credentials_path');
        if (! $property || ! $credentials) {
            return ['configured' => false];
        }
        if (! str_starts_with($credentials, '/')) {
            $credentials = base_path($credentials);
        }
        if (! is_file($credentials)) {
            return ['configured' => false];
        }
        $cached = Cache::get('ga4-geo');
        if (is_array($cached)) {
            return $cached;
        }
        try {
            $client = new BetaAnalyticsDataClient(['credentials' => $credentials]);
            $property = 'properties/'.ltrim($property, 'properties/');
            $range = [new DateRange(['start_date' => '30daysAgo', 'end_date' => 'today'])];
            $result = [
                'configured' => true,
                'countries' => $this->report($client, $property, $range, ['country'], ['activeUsers'], 'activeUsers', 8),
                'cities' => $this->report($client, $property, $range, ['city'], ['activeUsers'], 'activeUsers', 8),
                'articleCities' => $this->report($client, $property, $range, ['pagePath', 'city'], ['activeUsers'], 'activeUsers', 60),
                'articleCountries' => $this->report($client, $property, $range, ['pagePath', 'country'], ['activeUsers'], 'activeUsers', 60),
            ];
        } catch (Throwable $e) {
            $result = ['configured' => true, 'error' => 'API GA4 indisponible : '.$e->getMessage()];
        }
        Cache::put('ga4-geo', $result, now()->addMinutes(isset($result['error']) ? 5 : 30));

        return $result;
    }

    private function fetch(string $property, string $credentials, string $start, string $end): array
    {
        $client = new BetaAnalyticsDataClient(['credentials' => $credentials]);
        $property = 'properties/'.ltrim($property, 'properties/');
        $range = [new DateRange(['start_date' => $start, 'end_date' => $end])];

        $totals = $client->runReport((new RunReportRequest)
            ->setProperty($property)
            ->setDateRanges($range)
            ->setMetrics([
                new Metric(['name' => 'sessions']),
                new Metric(['name' => 'totalUsers']),
                new Metric(['name' => 'screenPageViews']),
                new Metric(['name' => 'averageSessionDuration']),
                new Metric(['name' => 'engagedSessions']),
                new Metric(['name' => 'engagementRate']),
                new Metric(['name' => 'newUsers']),
            ]));

        $row = $totals->getRows()[0] ?? null;
        $m = $row ? $row->getMetricValues() : [];

        $daily = $client->runReport((new RunReportRequest)
            ->setProperty($property)
            ->setDateRanges($range)
            ->setDimensions([new Dimension(['name' => 'date'])])
            ->setMetrics([
                new Metric(['name' => 'sessions']),
                new Metric(['name' => 'screenPageViews']),
                new Metric(['name' => 'activeUsers']),
            ]));

        $dailyRows = [];
        foreach ($daily->getRows() as $r) {
            $dailyRows[] = [
                'day' => $this->day($r->getDimensionValues()[0]->getValue()),
                'sessions' => (int) $r->getMetricValues()[0]->getValue(),
                'views' => (int) $r->getMetricValues()[1]->getValue(),
                'users' => (int) $r->getMetricValues()[2]->getValue(),
            ];
        }
        usort($dailyRows, fn ($a, $b) => strcmp($a['day'], $b['day']));

        return [
            'totals' => [
                'sessions' => (int) ($m[0]->getValue() ?? 0),
                'users' => (int) ($m[1]->getValue() ?? 0),
                'views' => (int) ($m[2]->getValue() ?? 0),
                'avgDuration' => (float) ($m[3]->getValue() ?? 0),
                'engagedSessions' => (int) ($m[4]->getValue() ?? 0),
                'engagementRate' => (float) ($m[5]->getValue() ?? 0),
                'newUsers' => (int) ($m[6]->getValue() ?? 0),
            ],
            'daily' => $dailyRows,
            'topPages' => $this->report($client, $property, $range,
                ['pageTitle', 'pagePath'], ['screenPageViews', 'activeUsers', 'userEngagementDuration'], 'screenPageViews', 15),
            'landingPages' => $this->report($client, $property, $range,
                ['landingPage'], ['sessions', 'totalUsers', 'newUsers'], 'sessions', 10),
            'channels' => $this->report($client, $property, $range,
                ['sessionDefaultChannelGroup'], ['totalUsers', 'newUsers', 'sessions'], 'totalUsers', 10),
            'events' => $this->report($client, $property, $range,
                ['eventName'], ['eventCount'], 'eventCount', 10),
            'countries' => $this->report($client, $property, $range,
                ['country'], ['sessions'], 'sessions', 10),
            'realtime' => $this->realtime($client, $property),
        ];
    }

    private function report(BetaAnalyticsDataClient $client, string $property, array $range, array $dimNames, array $metricNames, string $orderMetric, int $limit): array
    {
        $report = $client->runReport((new RunReportRequest)
            ->setProperty($property)
            ->setDateRanges($range)
            ->setDimensions(array_map(fn ($n) => new Dimension(['name' => $n]), $dimNames))
            ->setMetrics(array_map(fn ($n) => new Metric(['name' => $n]), $metricNames))
            ->setOrderBys([new OrderBy(['metric' => new MetricOrderBy(['metric_name' => $orderMetric]), 'desc' => true])])
            ->setLimit($limit));

        $rows = [];
        foreach ($report->getRows() as $r) {
            $rows[] = array_merge(
                array_map(fn ($d) => $d->getValue(), iterator_to_array($r->getDimensionValues())),
                array_map(fn ($mv) => (float) $mv->getValue(), iterator_to_array($r->getMetricValues()))
            );
        }

        return $rows;
    }

    private function realtime(BetaAnalyticsDataClient $client, string $property): ?int
    {
        try {
            $report = $client->runRealtimeReport((new RunRealtimeReportRequest)
                ->setProperty($property)
                ->setMetrics([new Metric(['name' => 'activeUsers'])]));

            return (int) ($report->getRows()[0]->getMetricValues()[0]->getValue() ?? 0);
        } catch (Throwable) {
            return null;
        }
    }

    private function day(string $gaDate): string
    {
        return strlen($gaDate) === 8 ? substr($gaDate, 0, 4).'-'.substr($gaDate, 4, 2).'-'.substr($gaDate, 6, 2) : $gaDate;
    }
}
