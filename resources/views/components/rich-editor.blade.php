@props([
    'name' => 'content',
    'id' => 'content',
    'value' => '',
    'label' => null,
    'placeholder' => 'Rédigez votre contenu ici…',
])

<div class="rich-editor" data-rich-editor>
    @if ($label)
        <label for="{{ $id }}" class="rich-editor-label">{{ $label }}</label>
    @endif

    <div class="rich-editor-toolbar" role="toolbar" aria-label="Mise en forme">
        <button type="button" data-command="bold" title="Gras (Ctrl+B)">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h8a4 4 0 0 1 0 8H6z"/><path d="M6 12h9a4 4 0 0 1 0 8H6z"/></svg>
        </button>
        <button type="button" data-command="italic" title="Italique (Ctrl+I)">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
        </button>
        <button type="button" data-command="underline" title="Souligné (Ctrl+U)">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>
        </button>
        <span class="rich-editor-sep"></span>
        <button type="button" data-command="formatBlock" data-value="H2" title="Titre 2">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17 12h3m0 0v6m0-6-4-4"/></svg>
        </button>
        <button type="button" data-command="formatBlock" data-value="H3" title="Titre 3">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17.5 9.5V18h3"/><path d="M17.5 7.5h.01"/></svg>
        </button>
        <span class="rich-editor-sep"></span>
        <button type="button" data-command="insertUnorderedList" title="Liste à puces">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
        </button>
        <button type="button" data-command="insertOrderedList" title="Liste numérotée">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1V4H2v2h1v6H2v2h3v-2H4V6z"/><path d="M6 12H4c0-1 1-2 2-3h1V8H3"/><path d="M5 20h1.5a1.5 1.5 0 0 0 0-3H5v-1h3"/></svg>
        </button>
        <span class="rich-editor-sep"></span>
        <button type="button" data-command="createLink" data-prompt="URL du lien" title="Lien">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        </button>
        <button type="button" data-command="unlink" title="Retirer le lien">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m10 13-3 3a5 5 0 0 0 7.07 7.07l3-3a5.002 5.002 0 0 0-3.66-8.33"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/><line x1="22" y1="2" x2="2" y2="22"/></svg>
        </button>
        <button type="button" data-command="removeFormat" title="Effacer la mise en forme">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2"/><path d="M9 21h6"/><path d="M10 21V7"/><path d="M14 21V7"/><path d="m3 7 9 9 9-9"/></svg>
        </button>
    </div>

    <div class="rich-editor-content" contenteditable="true" role="textbox" aria-multiline="true" data-placeholder="{{ $placeholder }}">
        {!! $value !!}
    </div>

    <textarea name="{{ $name }}" id="{{ $id }}" class="rich-editor-source" rows="6">{{ $value }}</textarea>
</div>
