<script setup>
import { Link } from '@inertiajs/vue3';

defineProps({
    id: { type: String, default: '' },
    title: { type: String, required: true },
    tagline: { type: String, default: '' },
    href: { type: String, default: '' },
    more: { type: String, default: 'Tout voir' },
    level: { type: Number, default: 2 },
});
</script>

<template>
  <header class="aq-chapter__head">
    <component :is="'h' + level" class="aq-chapter__title" :id="id ? 'h-' + id : null">{{ title }}</component>
    <p class="aq-chapter__tagline">{{ tagline }}</p>
    <Link v-if="href" class="aq-more" :href="href">{{ more }}</Link>
  </header>
</template>
