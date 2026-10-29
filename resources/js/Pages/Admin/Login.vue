<script setup>
import { ref } from 'vue';
import { useForm } from '@inertiajs/vue3';
import { asset } from '../../utils';

const form = useForm({ email: '', password: '', remember: false });
const show = ref(false);

function submit() { form.post('/admin/login'); }
</script>

<template>
  <section class="ad-login" aria-labelledby="loginTitle">
    <div class="ad-login__brand">
      <img :src="asset('assets/img/logo-afriquinfos-negatif.png')" alt="Afriquinfos" width="320" height="114">
      <p class="ad-login__claim">Ni totems, ni tabous.</p>
      <p class="ad-login__sub">Espace de rédaction et d’administration</p>
    </div>
    <div class="ad-login__panel">
      <form class="ad-login__form" @submit.prevent="submit" novalidate>
        <h1 id="loginTitle">Connexion</h1>
        <p class="ad-muted">Accès réservé à l’équipe d’Afriquinfos.</p>
        <div class="ad-field"><label for="lgEmail">Adresse e-mail</label>
          <input class="ad-input" id="lgEmail" type="email" autocomplete="username" v-model="form.email" :aria-invalid="!!form.errors.email" required>
          <p class="ad-error">{{ form.errors.email }}</p></div>
        <div class="ad-field"><label for="lgPass">Mot de passe</label>
          <div class="ad-input-group">
            <input class="ad-input" id="lgPass" :type="show ? 'text' : 'password'" autocomplete="current-password" v-model="form.password" :aria-invalid="!!form.errors.password" required>
            <button type="button" class="ad-iconbtn" :aria-label="show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'" :aria-pressed="show" @click="show = !show"><i class="bi" :class="show ? 'bi-eye-slash' : 'bi-eye'" aria-hidden="true"></i></button>
          </div><p class="ad-error">{{ form.errors.password }}</p></div>
        <button class="ad-btn ad-btn--primary w-100" type="submit" :disabled="form.processing">Se connecter</button>
        <p class="ad-demo-note">Compte de démonstration : awa.kone@afriquinfos.com / afriquinfos</p>
      </form>
    </div>
  </section>
</template>
