<script setup>
import { computed } from 'vue';
import { Link } from '@inertiajs/vue3';
import ChapterHead from '../Components/ChapterHead.vue';
import Crumbs from '../Components/Crumbs.vue';

const props = defineProps({
    page: { type: String, required: true },
    title: { type: String, required: true },
});

const links = [
    { slug: 'mentions-legales', label: 'Mentions légales', href: '/mentions-legales' },
    { slug: 'confidentialite', label: 'Confidentialité', href: '/confidentialite' },
    { slug: 'cookies', label: 'Cookies', href: '/cookies' },
];
</script>

<template>
  <div class="container-xl aq-page-head">
    <Crumbs :items="[{ label: title }]" />
    <ChapterHead :title="title" tagline="Informations juridiques et protection de vos données" :level="1" />

    <div class="mb-4 d-flex gap-2 flex-wrap" role="group" aria-label="Pages légales">
      <Link v-for="l in links" :key="l.slug" class="aq-btn" :class="page === l.slug ? 'aq-btn--primary' : 'aq-btn--outline'" :href="l.href" :aria-current="page === l.slug ? 'page' : null">{{ l.label }}</Link>
    </div>

    <div class="row g-5 mb-5"><div class="col-lg-8 aq-prose" style="max-width: none">

      <template v-if="page === 'mentions-legales'">
        <h2>Éditeur du site</h2>
        <p>Le site <strong>Afriquinfos</strong> (ci-après « le Site ») est édité par la société <strong>Bomoko Communication SA</strong>, société de presse.</p>
        <p><strong>Directeur de la publication</strong> : Gadegbeku Edem — <a href="mailto:gadegbekuedem@gmail.com">gadegbekuedem@gmail.com</a><br>
        <strong>Contact rédaction</strong> : <a href="mailto:redaction@afriquinfos.com">redaction@afriquinfos.com</a></p>
        <h2>Hébergement</h2>
        <p>Le Site est hébergé par <strong>Hestia</strong>.</p>
        <h2>Propriété intellectuelle</h2>
        <p>L’ensemble des contenus du Site (articles, reportages, photographies, infographies, logo, charte graphique) est la propriété exclusive de Bomoko Communication SA ou de ses partenaires. Toute reproduction, représentation, diffusion ou rediffusion, totale ou partielle, sans autorisation écrite préalable est interdite, conformément au droit d’auteur.</p>
        <h2>Liens hypertextes</h2>
        <p>Le Site peut contenir des liens vers des sites tiers. Afriquinfos n’exerce aucun contrôle sur leur contenu et décline toute responsabilité à leur égard. L’établissement d’un lien vers le Site est autorisé pour les pages publiques, sous réserve d’une mention claire de la source.</p>
        <h2>Responsabilité</h2>
        <p>Les informations publiées le sont à titre journalistique et informatif. Afriquinfos s’efforce d’en garantir l’exactitude mais ne saurait être tenu responsable des erreurs, omissions ou de l’usage qui en est fait. Les tribunes publiées n’engagent que leurs auteurs.</p>
        <h2>Droit applicable</h2>
        <p>Les présentes mentions légales sont régies par le droit applicable au siège social de Bomoko Communication SA. Tout litige relatif à l’utilisation du Site relève des tribunaux compétents du ressort de ce siège.</p>
      </template>

      <template v-else-if="page === 'confidentialite'">
        <h2>Données collectées</h2>
        <p>Afriquinfos collecte uniquement les données nécessaires à ses services :</p>
        <ul>
          <li><strong>Formulaire de contact</strong> : nom, adresse e-mail, objet et contenu du message — utilisés exclusivement pour répondre à votre demande ;</li>
          <li><strong>Newsletter</strong> : adresse e-mail — utilisée pour l’envoi du brief quotidien, désinscription possible à tout moment ;</li>
          <li><strong>Commentaires</strong> : nom affiché et adresse e-mail (non publiée) — pour la modération ;</li>
          <li><strong>Mesure d’audience</strong> : données de navigation anonymisées (pages vues).</li>
        </ul>
        <h2>Base légale et durée de conservation</h2>
        <p>Les traitements reposent sur votre consentement (newsletter, commentaires), sur l’exécution de mesures précontractuelles (réponse à vos demandes) et sur l’intérêt légitime du média (sécurité, statistiques). Les données sont conservées 24 mois maximum pour les messages de contact, et jusqu’à la désinscription pour la newsletter.</p>
        <h2>Vos droits</h2>
        <p>Conformément à la réglementation applicable en matière de protection des données personnelles, vous disposez d’un droit d’accès, de rectification, d’effacement, d’opposition et de portabilité de vos données. Pour les exercer, écrivez à <strong>redaction@afriquinfos.com</strong> ou via le <Link href="/contact">formulaire de contact</Link>.</p>
        <h2>Partage et sous-traitants</h2>
        <p>Vos données ne sont ni vendues ni partagées à des tiers à des fins commerciales. Elles peuvent être traitées par nos prestataires techniques (hébergement, envoi d’e-mails) dans le strict cadre de leurs missions.</p>
        <h2>Sécurité</h2>
        <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées (chiffrement des échanges en HTTPS, accès restreint à l’administration, mots de passe chiffrés) pour protéger vos données contre tout accès non autorisé.</p>
      </template>

      <template v-else-if="page === 'cookies'">
        <h2>Qu’est-ce qu’un cookie ?</h2>
        <p>Un cookie est un petit fichier enregistré sur votre appareil lors de la consultation d’un site. Afriquinfos utilise un nombre limité de cookies et de stockages locaux, répartis en deux catégories.</p>
        <h2>Cookies strictement nécessaires</h2>
        <p>Ils sont indispensables au fonctionnement du Site et ne requièrent pas de consentement :</p>
        <ul>
          <li><strong>Session et sécurité</strong> : identifiant de session et jeton de protection contre les falsifications de requêtes (formulaires, administration) ;</li>
          <li><strong>Préférences d’affichage</strong> : choix du thème clair/sombre et taille du texte des articles, conservés localement sur votre appareil ;</li>
          <li><strong>Vote au débat</strong> : mémorisation de votre participation au débat de la semaine.</li>
        </ul>
        <h2>Cookies de mesure d’audience</h2>
        <p>Des statistiques de fréquentation peuvent être collectées de manière agrégée et anonymisée pour améliorer les contenus. Aucun cookie publicitaire de tiers n’est déposé par défaut.</p>
        <h2>Gérer vos préférences</h2>
        <p>Vous pouvez à tout moment supprimer les cookies et stockages locaux depuis les réglages de votre navigateur. La plupart des navigateurs permettent également de refuser les cookies par site ou globalement ; le blocage des cookies techniques peut toutefois altérer certaines fonctions (connexion à l’espace de rédaction, formulaires).</p>
        <h2>En savoir plus</h2>
        <p>Pour toute question relative aux cookies ou à vos données, consultez notre <Link href="/confidentialite">politique de confidentialité</Link> ou écrivez-nous via la page <Link href="/contact">Contact</Link>.</p>
      </template>

    </div>
    <aside class="col-lg-4"><div class="aq-sticky"><div class="aq-side-box">
      <h2>Documents</h2>
      <p class="aq-serif"><Link href="/mentions-legales">Mentions légales</Link><br><Link href="/confidentialite">Politique de confidentialité</Link><br><Link href="/cookies">Gestion des cookies</Link></p>
      <p class="ad-muted aq-serif mb-0"><small>Dernière mise à jour : octobre 2026</small></p>
    </div></div></aside></div>
  </div>
</template>
