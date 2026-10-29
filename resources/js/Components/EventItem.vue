<script setup>
import { evDay, evMonth, eventRange, fr, toast } from '../utils';

const props = defineProps({ e: { type: Object, required: true } });

function downloadIcs() {
    const e = props.e;
    const endPlus = new Date((e.end_date || e.start_date) + 'T00:00:00Z');
    endPlus.setUTCDate(endPlus.getUTCDate() + 1);
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Afriquinfos//Agenda//FR', 'BEGIN:VEVENT',
        'UID:' + e.slug + '@afriquinfos.com', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z',
        'DTSTART;VALUE=DATE:' + e.start_date.replace(/-/g, ''), 'DTEND;VALUE=DATE:' + endPlus.toISOString().slice(0, 10).replace(/-/g, ''),
        'SUMMARY:' + e.title, 'LOCATION:' + (e.city || '') + ', ' + (e.country || ''), 'DESCRIPTION:' + (e.desc || ''), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    const a = document.createElement('a');
    a.href = url; a.download = e.slug + '.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Événement ajouté : ouvrez le fichier .ics pour l’enregistrer dans votre agenda.');
}
</script>

<template>
  <article class="aq-event">
    <div class="aq-event__date" aria-hidden="true"><span class="aq-event__day">{{ evDay(e) }}</span><span class="aq-event__month">{{ evMonth(e) }}</span></div>
    <div><span class="aq-event__cat">{{ e.cat }}</span><h3 class="aq-event__title">{{ fr(e.title) }}</h3>
      <p class="aq-event__where"><i class="bi bi-geo-alt" aria-hidden="true"></i> {{ e.city }}, {{ e.country }} — {{ eventRange(e) }}</p>
      <p class="aq-event__desc">{{ fr(e.desc) }}</p>
      <button type="button" class="aq-linkbtn" :aria-label="'Ajouter « ' + e.title + ' » à mon agenda'" @click="downloadIcs"><i class="bi bi-calendar-plus" aria-hidden="true"></i>Ajouter à mon agenda</button>
    </div>
  </article>
</template>
