<?php

namespace Tests\Unit;

use App\Support\ArticleHtml;
use PHPUnit\Framework\TestCase;

class ArticleHtmlTest extends TestCase
{
    public function test_rendering_removes_executable_markup_and_fonts_but_keeps_content(): void
    {
        $input = '<p style="font-family:Georgia">Texte <strong>important</strong><a href="https://example.test">Source</a></p><img src="/storage/photo.jpg" onerror="alert(1)"><script>alert(1)</script><a href="javascript:alert(1)">Refusé</a>';
        $output = (new ArticleHtml)->sanitize($input);
        $this->assertStringContainsString('Texte', $output);
        $this->assertStringContainsString('<strong>important</strong>', $output);
        $this->assertStringContainsString('https://example.test', $output);
        $this->assertStringContainsString('/storage/photo.jpg', $output);
        $this->assertStringNotContainsString('font-family', $output);
        $this->assertStringNotContainsString('onerror', $output);
        $this->assertStringNotContainsString('<script', $output);
        $this->assertStringNotContainsString('javascript:', $output);
    }
}
