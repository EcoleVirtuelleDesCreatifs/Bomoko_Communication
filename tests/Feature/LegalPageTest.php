<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LegalPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_legal_notice_page_renders(): void
    {
        $response = $this->get(route('legal.notice'));

        $response->assertOk()
            ->assertSee('Mentions légales', false)
            ->assertSee(config('site.phone'), false)
            ->assertSee(route('legal.privacy'), false)
            ->assertSee('Dernière mise à jour', false);
    }

    public function test_privacy_policy_page_renders(): void
    {
        $response = $this->get(route('legal.privacy'));

        $response->assertOk()
            ->assertSee('Politique de confidentialité', false)
            ->assertSee(config('site.phone'), false)
            ->assertSee(route('legal.notice'), false)
            ->assertSee('2013-450', false);
    }

    public function test_home_footer_contains_legal_links(): void
    {
        $response = $this->get(route('home'));

        $response->assertOk()
            ->assertSee(route('legal.notice'), false)
            ->assertSee(route('legal.privacy'), false);
    }

    public function test_sitemap_contains_legal_pages(): void
    {
        $response = $this->get('/sitemap.xml');

        $response->assertOk()
            ->assertSee(route('legal.notice'), false)
            ->assertSee(route('legal.privacy'), false);
    }
}
