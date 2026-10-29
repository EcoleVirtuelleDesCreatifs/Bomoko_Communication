<script setup>
import { Link } from '@inertiajs/vue3';

defineProps({ items: { type: Array, required: true } });
</script>

<template>
  <nav aria-label="Fil d’Ariane"><ol class="aq-crumbs">
    <li><Link href="/">Accueil</Link></li>
    <li v-for="(it, i) in items" :key="i">
      <Link v-if="it.href && i < items.length - 1" :href="it.href">{{ it.label }}</Link>
      <span v-else aria-current="page">{{ it.label }}</span>
    </li>
  </ol></nav>
</template>
