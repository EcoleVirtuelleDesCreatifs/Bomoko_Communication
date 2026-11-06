<?php

namespace Tests\Unit;

use App\Support\ArticleHtml;
use App\Support\ArticleLayoutAudit;
use PHPUnit\Framework\TestCase;

class ArticleHtmlTest extends TestCase
{
    public function test_layout_audit_marks_suspected_damage_without_inventing_paragraphs(): void
    {
        $body = ['<span>'.str_repeat('Phrase fusionnée.Suite immédiate. ', 50).'</span>'];
        $result = (new ArticleLayoutAudit)->inspect($body);
        $this->assertContains('long_text_block', array_column($result['issues'], 'code'));
        $this->assertContains('joined_sentences', array_column($result['issues'], 'code'));
        $this->assertNull($result['proposed_body']);
    }

    public function test_layout_audit_does_not_propose_replacements_for_invalid_blocks_or_html(): void
    {
        $audit = new ArticleLayoutAudit;
        $this->assertNull($audit->inspect(["Premier\n\nSecond", null])['proposed_body']);
        $this->assertNotEmpty($audit->inspect(null)['issues']);
        $this->assertNotEmpty($audit->inspect(['  '])['issues']);
        $this->assertNull($audit->inspect(['<p style="font-family:Georgia">Texte</p>'])['proposed_body']);
        $this->assertSame([], $audit->inspect(['Un [lien](https://example.test/path).'])['issues']);
        $this->assertNull($audit->inspect(['Texte sur une ligne.'])['proposed_body']);
    }

    public function test_editor_whitespace_breaks_survive_safe_public_rendering(): void
    {
        $input = "<p><span style=\"white-space:pre-wrap;font-family:Georgia\">Premier\n\n<strong>Second\nSuite</strong></span></p>";
        $output = (new ArticleHtml)->sanitize($input);
        $this->assertSame(3, substr_count($output, '<br'));
        $this->assertStringContainsString('Second<br', $output);
        $this->assertStringNotContainsString('style=', $output);
        $this->assertSame($output, (new ArticleHtml)->sanitize($output));
    }

    public function test_supported_inline_styles_become_safe_semantic_formatting(): void
    {
        $input = '<p style="text-align:justify;font-family:Georgia"><span style="font-weight:700;font-style:italic;text-decoration:underline">Important</span></p>';
        $output = (new ArticleHtml)->sanitize($input);
        $this->assertStringContainsString('align="justify"', $output);
        $this->assertStringContainsString('<u><em><strong>Important</strong></em></u>', $output);
        $this->assertStringNotContainsString('style=', $output);
        $this->assertSame($output, (new ArticleHtml)->sanitize($output));
    }

    public function test_normal_html_indentation_and_code_do_not_gain_artificial_breaks(): void
    {
        $input = "<div>\n<p>Premier</p>\n<p>Second</p>\n<pre>Code\nSuite</pre></div>";
        $output = (new ArticleHtml)->sanitize($input);
        $this->assertStringNotContainsString('<br', $output);
        $this->assertStringContainsString("Code\nSuite", $output);
    }

    public function test_editor_structure_survives_public_sanitization(): void
    {
        $input = '<div><p>Premier paragraphe<br>Suite <em>italique</em>.</p><h2>Intertitre</h2><ol start="3"><li>Premier point</li><li>Deuxième point</li></ol><blockquote>Une citation</blockquote><figure><img src="/storage/photo.jpg" alt="Photo"><figcaption>Légende</figcaption></figure></div>';
        $output = (new ArticleHtml)->sanitize($input);
        foreach (['<p>', '<br', '<em>italique</em>', '<h2>Intertitre</h2>', '<ol start="3">', '<li>Premier point</li>', '<blockquote>Une citation</blockquote>', '<figure>', '<figcaption>Légende</figcaption>'] as $markup) {
            $this->assertStringContainsString($markup, $output);
        }
    }

    public function test_new_images_are_resolved_without_moving_them_out_of_their_paragraph(): void
    {
        $input = '<p>Avant<img src="data:image/png;base64,AAAA" data-mid="m123" alt="Photo">Après</p>';
        $output = (new ArticleHtml)->sanitize($input, ['m123' => 'https://example.test/storage/medias/photo.jpg']);
        $this->assertStringContainsString('<p>Avant<img', $output);
        $this->assertStringContainsString('src="https://example.test/storage/medias/photo.jpg"', $output);
        $this->assertStringContainsString('Après</p>', $output);
        $this->assertStringNotContainsString('data-mid', $output);
        $this->assertStringNotContainsString('base64', $output);
    }

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
