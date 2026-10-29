<script setup>
defineProps({
    a: { type: Object, required: true },
    alt: { type: Boolean, default: false },
    priority: { type: Boolean, default: false },
    sizes: { type: String, default: '(min-width: 992px) 50vw, 100vw' },
});
</script>

<template>
  <img v-if="a.src" :src="a.src" :alt="alt ? a.img : ''" width="1200" height="750" decoding="async"
       :fetchpriority="priority ? 'high' : null" :loading="priority ? null : 'lazy'">
  <div v-else class="aq-ph" :class="'aq-ph--' + a.ph" :role="alt ? 'img' : null" :aria-label="alt ? 'Photo : ' + a.img : null" :aria-hidden="alt ? null : 'true'">
    <span v-if="a.person" class="aq-ph__initials" aria-hidden="true">{{ a.person.initials }}</span>
  </div>
</template>
