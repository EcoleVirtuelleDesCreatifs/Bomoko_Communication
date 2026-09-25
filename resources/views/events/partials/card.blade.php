@php
    $headingLevel = $headingLevel ?? 'h2';
@endphp
<article class="event-card reveal">
    @if ($event->cover_image)
        <figure class="event-card-media">
            <img src="{{ asset('storage/' . $event->cover_image) }}" alt="{{ $event->title }}" loading="lazy" decoding="async">
        </figure>
    @endif
    <div class="event-card-body">
        <p class="event-card-meta">
            @if ($event->event_date)
                <time datetime="{{ $event->event_date->toDateString() }}">{{ $event->event_date->format('d/m/Y') }}</time>
            @endif
            @if ($event->location)
                <span>{{ $event->location }}</span>
            @endif
        </p>
        <{{ $headingLevel }} class="event-card-title">
            <a href="{{ route('events.show', $event) }}">{{ $event->title }}</a>
        </{{ $headingLevel }}>
        <p class="event-card-summary">{{ Str::limit($event->summary, 140) }}</p>
        <a href="{{ route('events.show', $event) }}" class="link-arrow">Lire la suite</a>
    </div>
</article>
