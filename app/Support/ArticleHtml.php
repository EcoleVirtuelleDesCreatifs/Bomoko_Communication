<?php

namespace App\Support;

use Symfony\Component\HtmlSanitizer\HtmlSanitizer;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerConfig;

class ArticleHtml
{
    public function sanitize(string $html, array $mediaSources = []): string
    {
        if ($mediaSources !== [] || preg_match('/(?:white-space|font-weight|font-style|text-decoration(?:-line)?|text-align)\s*:/i', $html)) {
            $document = new \DOMDocument;
            @$document->loadHTML('<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>'.$html.'</body></html>', LIBXML_NONET);
            $this->preserveLineBreaks($document);
            $this->preserveFormatting($document);
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

    private function preserveFormatting(\DOMDocument $document): void
    {
        foreach (iterator_to_array($document->getElementsByTagName('*')) as $element) {
            $style = $element->getAttribute('style');
            $tag = strtolower($element->tagName);
            if (in_array($tag, ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'], true) && preg_match('/(?:^|;)\s*text-align\s*:\s*(left|center|right|justify)\s*(?:!important\s*)?(?:;|$)/i', $style, $match)) {
                $element->setAttribute('align', strtolower($match[1]));
            }
            $formats = [
                'strong' => ! in_array($tag, ['strong', 'b'], true) && preg_match('/(?:^|;)\s*font-weight\s*:\s*(?:bold|[6-9]00)\s*(?:!important\s*)?(?:;|$)/i', $style),
                'em' => ! in_array($tag, ['em', 'i'], true) && preg_match('/(?:^|;)\s*font-style\s*:\s*italic\s*(?:!important\s*)?(?:;|$)/i', $style),
                'u' => $tag !== 'u' && preg_match('/(?:^|;)\s*text-decoration(?:-line)?\s*:[^;]*\bunderline\b/i', $style),
            ];
            foreach ($formats as $format => $enabled) {
                if (! $enabled || ! $element->hasChildNodes()) {
                    continue;
                }
                $wrapper = $document->createElement($format);
                while ($element->firstChild !== null) {
                    $wrapper->appendChild($element->firstChild);
                }
                $element->appendChild($wrapper);
            }
        }
    }

    private function preserveLineBreaks(\DOMDocument $document): void
    {
        $nodes = iterator_to_array((new \DOMXPath($document))->query('//body//text()'));
        foreach ($nodes as $node) {
            if (! preg_match('/[\r\n]/', $node->nodeValue)) {
                continue;
            }
            $mode = null;
            $preformatted = false;
            for ($parent = $node->parentNode; $parent instanceof \DOMElement; $parent = $parent->parentNode) {
                if (in_array(strtolower($parent->tagName), ['pre', 'code'], true)) {
                    $preformatted = true;
                    break;
                }
                if ($mode === null && preg_match('/(?:^|;)\s*white-space\s*:\s*([a-z-]+)/i', $parent->getAttribute('style'), $match)) {
                    $mode = strtolower($match[1]);
                }
            }
            if ($preformatted || ! in_array($mode, ['pre', 'pre-wrap', 'pre-line', 'break-spaces'], true)) {
                continue;
            }
            $fragment = $document->createDocumentFragment();
            foreach (preg_split('/\r\n|\r|\n/', $node->nodeValue) as $i => $line) {
                if ($i) {
                    $fragment->appendChild($document->createElement('br'));
                }
                $fragment->appendChild($document->createTextNode($line));
            }
            $node->parentNode->replaceChild($fragment, $node);
        }
    }
}
