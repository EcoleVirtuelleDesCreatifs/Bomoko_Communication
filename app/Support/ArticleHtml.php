<?php

namespace App\Support;

use Symfony\Component\HtmlSanitizer\HtmlSanitizer;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerConfig;

class ArticleHtml
{
    public function sanitize(string $html): string
    {
        $config = (new HtmlSanitizerConfig)
            ->allowSafeElements()
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
