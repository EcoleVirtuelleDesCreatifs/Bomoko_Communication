<script setup>
import { ref } from 'vue';
import { useForm } from '@inertiajs/vue3';
import { asset } from '../../utils';

const props = defineProps({ email: String, name: String });
const form = useForm({ password: '', password_confirmation: '' });
const show = ref(false);

function submit() { form.post(location.pathname + location.search); }
</script>

<template>
  <section class="ad-login" aria-labelledby="inviteTitle">
    <div class="ad-login__brand">
      <img :src="asset('assets/img/logo-afriquinfos-negatif.png')" alt="Afriquinfos" width="320" height="114">
      <p class="ad-login__claim">Ni totems, ni tabous.</p>
      <p class="ad-login__sub">Espace de rédaction et d’administration</p>
    </div>
    <div class="ad-login__panel">
      <form class="ad-login__form" @submit.prevent="submit" novalidate>
        <h1 id="inviteTitle">Bienvenue {{ name }}</h1>
        <p class="ad-muted">Définissez votre mot de passe pour activer votre compte ({{ email }}).</p>
        <div class="ad-field"><label for="ivPass">Nouveau mot de passe</label>
          <div class="ad-input-group">
            <input class="ad-input" id="ivPass" :type="show ? 'text' : 'password'" autocomplete="new-password" v-model="form.password" :aria-invalid="!!form.errors.password" required>
            <button type="button" class="ad-iconbtn" :aria-label="show ? 'Masquer' : 'Afficher'" :aria-pressed="show" @click="show = !show"><i class="bi" :class="show ? 'bi-eye-slash' : 'bi-eye'" aria-hidden="true"></i></button>
          </div><p class="ad-error">{{ form.errors.password }}</p></div>
        <div class="ad-field"><label for="ivPass2">Confirmer le mot de passe</label>
          <input class="ad-input" id="ivPass2" :type="show ? 'text' : 'password'" autocomplete="new-password" v-model="form.password_confirmation" required></div>
        <button class="ad-btn ad-btn--primary w-100" type="submit" :disabled="form.processing">Activer mon compte</button>
      </form>
    </div>
  </section>
</template>
