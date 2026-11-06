<?php

namespace App\Support;

class ArticleLayoutAudit
{
    public function inspect(mixed $body): array
    {
        if (! is_array($body) || $body === [] || array_filter($body, fn ($block) => ! is_string($block) || trim($block) !== '') === []) {
            return ['issues' => [['code' => 'empty_or_invalid_body', 'block' => null, 'detail' => 'Corps absent ou format invalide : vérifier le contenu original.']], 'proposed_body' => null];
        }

        $issues = [];
        $proposal = [];
        $changed = false;
        foreach ($body as $index => $block) {
            if (! is_string($block)) {
                $issues[] = ['code' => 'invalid_block', 'block' => $index, 'detail' => 'Bloc non textuel : révision manuelle nécessaire.'];
                $proposal[] = $block;

                continue;
            }
            $html = str_starts_with(ltrim($block), '<');
            $text = $block;
            if ($html) {
                $document = new \DOMDocument;
                @$document->loadHTML('<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>'.$block.'</body></html>', LIBXML_NONET);
                $xpath = new \DOMXPath($document);
                $chunks = $xpath->query('//body//text()[normalize-space() != "" and not(ancestor::script) and not(ancestor::style)]');
                $text = implode(' ', array_map(fn ($node) => $node->textContent, iterator_to_array($chunks)));
                $nodes = $xpath->query('//p | //li | //div[not(p) and not(div) and not(ul) and not(ol) and not(h2)]');
                $longest = $nodes->length === 0 ? mb_strlen($text) : 0;
                foreach ($nodes as $node) {
                    $longest = max($longest, mb_strlen($node->textContent));
                }
                if (preg_match('/\bfont-family\s*:/i', $block)) {
                    $issues[] = ['code' => 'pasted_font', 'block' => $index, 'detail' => 'Police incorporée : le rendu la normalise en Montserrat, sans correction du texte nécessaire.'];
                }
                foreach ($document->getElementsByTagName('img') as $image) {
                    if ($image->getAttribute('src') === '' || str_starts_with($image->getAttribute('src'), 'data:')) {
                        $issues[] = ['code' => 'unresolved_image', 'block' => $index, 'detail' => 'Image sans URL persistante : vérifier le média dans l’administration.'];
                        break;
                    }
                }
            } else {
                $longest = max(array_map('mb_strlen', preg_split('/\R/', $block)));
                if (preg_match('/\R[\t ]*\R/', $block) && ! str_starts_with($block, '[img:')) {
                    $parts = preg_split('/\R(?:[\t ]*\R)+/', $block);
                    array_push($proposal, ...$parts);
                    $changed = true;
                    $issues[] = ['code' => 'explicit_paragraph_breaks', 'block' => $index, 'detail' => 'Séparations déjà présentes : proposition de blocs distincts, à valider.'];
                } else {
                    $proposal[] = $block;
                }
            }
            if ($html) {
                $proposal[] = $block;
            }
            if ($longest >= 1200) {
                $issues[] = ['code' => 'long_text_block', 'block' => $index, 'detail' => 'Bloc d’au moins 1 200 caractères : paragraphes potentiellement fusionnés, à vérifier. Ce seuil ne prouve pas une anomalie.'];
            }
            $text = preg_replace('~https?://[^\s<>]+~u', '', $text);
            if (preg_match('/[.!?…][\p{L}]/u', $text)) {
                $issues[] = ['code' => 'joined_sentences', 'block' => $index, 'detail' => 'Ponctuation suivie immédiatement de lettres : possible collage de phrases. Les abréviations peuvent aussi déclencher ce signal.'];
            }
        }

        return ['issues' => $issues, 'proposed_body' => $changed && count(array_filter($body, 'is_string')) === count($body) ? $proposal : null];
    }
}
