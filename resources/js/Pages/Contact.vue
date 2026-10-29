<script setup>
import { useForm, usePage } from '@inertiajs/vue3';
import ChapterHead from '../Components/ChapterHead.vue';
import Crumbs from '../Components/Crumbs.vue';

const props = defineProps({ sujet: { type: String, default: '' } });
const page = usePage();

const subjects = {
    redaction: 'Écrire à la rédaction',
    publicite: 'Publicité et kit média',
    agenda: 'Proposer un événement',
    reponse: 'Droit de réponse',
    autre: 'Autre demande',
};

const form = useForm({
    name: '', email: '', subject: props.sujet || '', message: '', consent: false,
});

function submit() {
    form.post('/contact', {
        preserveScroll: true,
        onSuccess: () => form.reset(),
    });
}
</script>

<template>
  <div class="container-xl aq-page-head">
    <Crumbs :items="[{ label: 'Contact' }]" />
    <ChapterHead title="Contact" tagline="Une information, une réaction, un projet ? Écrivez-nous." :level="1" />
    <div class="row g-5 mb-5"><div class="col-lg-7">
      <form @submit.prevent="submit" novalidate>
        <div class="row g-3">
          <div class="col-md-6 aq-field"><label for="cName">Nom et prénom</label>
            <input class="form-control" id="cName" v-model="form.name" autocomplete="name" :class="{ 'is-invalid': form.errors.name }">
            <div class="invalid-feedback">{{ form.errors.name }}</div></div>
          <div class="col-md-6 aq-field"><label for="cEmail">Adresse e-mail</label>
            <input class="form-control" id="cEmail" v-model="form.email" type="email" autocomplete="email" :class="{ 'is-invalid': form.errors.email }">
            <div class="invalid-feedback">{{ form.errors.email }}</div></div>
        </div>
        <div class="aq-field"><label for="cSubject">Objet</label>
          <select class="form-select" id="cSubject" v-model="form.subject" :class="{ 'is-invalid': form.errors.subject }">
            <option value="">Choisissez un objet</option>
            <option v-for="(label, k) in subjects" :key="k" :value="k">{{ label }}</option>
          </select><div class="invalid-feedback">{{ form.errors.subject }}</div></div>
        <div class="aq-field"><label for="cMsg">Message</label>
          <textarea class="form-control" id="cMsg" v-model="form.message" rows="6" :class="{ 'is-invalid': form.errors.message }"></textarea>
          <div class="invalid-feedback">{{ form.errors.message }}</div></div>
        <div class="form-check aq-field">
          <input class="form-check-input" type="checkbox" id="cOk" v-model="form.consent" :class="{ 'is-invalid': form.errors.consent }">
          <label class="form-check-label fw-normal" for="cOk">J’accepte qu’Afriquinfos utilise ces informations pour me répondre.</label>
          <div class="invalid-feedback">{{ form.errors.consent }}</div></div>
        <button class="aq-btn aq-btn--primary" type="submit" :disabled="form.processing">Envoyer le message</button>
        <div class="mt-4" role="status"><div v-if="page.props.flash?.success" class="aq-success">{{ page.props.flash.success }}</div></div>
      </form>
    </div>
    <aside class="col-lg-5">
      <div class="aq-side-box"><h2>Rédaction</h2><p class="aq-serif"><strong>Bomoko Communication SA</strong><br>Directeur de la publication : Gadegbeku Edem<br><a href="mailto:redaction@afriquinfos.com">redaction@afriquinfos.com</a></p></div>
      <div class="aq-side-box"><h2>Suivez-nous</h2><div class="aq-social">
        <a href="https://www.facebook.com/afriquinfoscom/" aria-label="Afriquinfos sur Facebook" rel="noopener"><i class="bi bi-facebook" aria-hidden="true"></i></a>
        <a href="https://x.com/AfriquinfosActu" aria-label="Afriquinfos sur X" rel="noopener"><i class="bi bi-twitter-x" aria-hidden="true"></i></a></div></div>
    </aside></div>
  </div>
</template>
