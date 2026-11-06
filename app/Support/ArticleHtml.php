<?php

namespace App\Support;

use Symfony\Component\HtmlSanitizer\HtmlSanitizer;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerConfig;

class ArticleHtml
{
    public function sanitize(string $html, array $mediaSources = []): string
    {
        if ($mediaSources !== []) {
            $document = new \DOMDocument;
            @$document->loadHTML('<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>'.$html.'</body></html>', LIBXML_NONET);
            foreach ($document->getElementsByTagName('img') as $image) {
                $source = $mediaSources[$image->getAttribute('data-mid')] ?? null;
                if ($source !== null) {
                    $image->setAttribute('src', $source);
                }
            }
            $html = '';
            foreach ($document->getElementsByTagName('body')->item(0)->childNodes as $node) {
                $html .= $document->saveHTML($node);
            }
        }

        $config = (new HtmlSanitizerConfig)
            ->allowSafeElements()
            ->allowAttribute('align', ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
            ->allowElement('img', ['src', 'alt', 'width', 'height', 'loading'])
            ->allowElement('figure')
            ->allowElement('figcaption')
            ->allowRelativeLinks()
            ->allowRelativeMedias()
            ->allowLinkSchemes(['http', 'https', 'mailto', 'tel'])
            ->allowMediaSchemes(['http', 'https'])
            ->dropAttribute('style', '*')
            ->dropAttribute('face', '*')
            ->forceAttribute('a', 'rel', 'noopener noreferrer')
            ->withMaxInputLength(2000000);

        return (new HtmlSanitizer($config))->sanitize($html);
    }
}
