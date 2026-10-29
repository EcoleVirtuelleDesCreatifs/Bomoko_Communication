<script setup>
import { ref } from 'vue';
import { useForm, usePage } from '@inertiajs/vue3';

const page = usePage();
const form = useForm({ email: '' });
const localMsg = ref('');

function submit() {
    localMsg.value = '';
    form.post('/newsletter', {
        preserveScroll: true,
        onSuccess: () => form.reset(),
    });
}
</script>

<template>
  <section class="aq-newsletter aq-below" id="newsletter" aria-labelledby="h-nl"><div class="container-xl"><div class="aq-newsletter__box"><div>
    <h2 id="h-nl">Le brief panafricain, chaque matin</h2><p>L’essentiel de l’actualité du continent, sans totems ni tabous. Gratuit, désinscription en un clic.</p></div>
    <form class="aq-form" @submit.prevent="submit" novalidate><label for="nlEmail" class="visually-hidden">Adresse e-mail</label><div class="aq-form__row">
      <input type="email" class="form-control" id="nlEmail" v-model="form.email" placeholder="votre@email.com" autocomplete="email" required aria-describedby="nlMsg">
      <button class="aq-btn aq-btn--ink" type="submit" :disabled="form.processing">S’inscrire</button></div>
      <p class="aq-form__msg" id="nlMsg" role="status">{{ form.errors.email || localMsg || page.props.flash?.newsletter }}</p></form></div></div>
  </section>
</template>
