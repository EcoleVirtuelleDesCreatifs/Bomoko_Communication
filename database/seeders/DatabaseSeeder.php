<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Comment;
use App\Models\Debate;
use App\Models\Event;
use App\Models\Region;
use App\Models\Rubrique;
use App\Models\Subscriber;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $data = json_decode(file_get_contents(__DIR__.'/aq-data.json'), true);

        $i = 0;
        foreach ($data['rubriques'] as $slug => $r) {
            Rubrique::create([
                'slug' => $slug,
                'label' => $r['label'],
                'tagline' => $r['tagline'],
                'in_menu' => $slug !== 'portraits',
                'sort' => $i++,
            ]);
        }

        $i = 0;
        foreach ($data['regions'] as $slug => $label) {
            Region::create(['slug' => $slug, 'label' => $label, 'sort' => $i++]);
        }

        foreach ($data['articles'] as $a) {
            Article::create([
                'slug' => $a['id'],
                'rubrique_slug' => $a['rub'],
                'region_slug' => $a['region'] ?? null,
                'country' => $a['country'] ?? null,
                'title' => $a['title'],
                'chapo' => $a['chapo'],
                'author_name' => $a['author'],
                'published_at' => $a['date'],
                'read_time' => $a['read'],
                'tags' => $a['tags'] ?? [],
                'body' => $a['body'] ?? [],
                'ph' => $a['ph'] ?? 'ink',
                'img' => $a['img'] ?? null,
                'icon' => $a['icon'] ?? null,
                'person' => $a['person'] ?? null,
                'views' => $a['views'] ?? 0,
                'is_une' => ! empty($a['une']),
                'status' => 'publie',
                'meta_desc' => mb_substr($a['chapo'] ?? '', 0, 155),
            ]);
        }

        // Articles de workflow (visibles dans l'admin)
        Article::create([
            'slug' => 'zlecaf-guide-pme', 'rubrique_slug' => 'economie', 'country' => 'Zlecaf',
            'title' => 'Zlecaf : le guide pratique pour les PME exportatrices',
            'chapo' => 'Règles d’origine, certificats, tarifs : ce que les petites entreprises doivent savoir avant d’exporter dans la zone.',
            'author_name' => 'Awa Koné', 'published_at' => now()->subHours(5), 'read_time' => 4,
            'tags' => ['Commerce', 'PME'], 'ph' => 'rust', 'img' => 'Conteneurs sur un quai',
            'body' => ['La zone de libre-échange continentale ouvre de nouveaux marchés aux PME.', '## Les étapes', 'Vérifier l’origine des produits, obtenir le certificat, déclarer en douane.'],
            'status' => 'brouillon',
        ]);
        Article::create([
            'slug' => 'benin-elections-generales-guide', 'rubrique_slug' => 'politique', 'region_slug' => 'afrique-de-l-ouest', 'country' => 'Bénin',
            'title' => 'Bénin : ce qu’il faut savoir avant les élections générales',
            'chapo' => 'Calendrier, candidatures, enjeux : notre guide pour comprendre le scrutin.',
            'author_name' => 'Moussa Diop', 'published_at' => now()->subDay(), 'read_time' => 6,
            'tags' => ['Élections', 'Bénin'], 'ph' => 'ink', 'img' => 'Bureau de vote',
            'body' => ['Les Béninois sont appelés aux urnes dans quelques mois.', '## Le calendrier', 'Les candidatures seront déposées auprès de la commission électorale.'],
            'status' => 'relecture',
            'meta_desc' => 'Calendrier, candidatures, enjeux : notre guide pour comprendre les élections générales au Bénin.',
        ]);
        Article::create([
            'slug' => 'can-tirage-au-sort-phase-finale', 'rubrique_slug' => 'sports', 'country' => 'Football',
            'title' => 'CAN : tout savoir sur le tirage au sort de la phase finale',
            'chapo' => 'Chapeaux, têtes de série, groupes possibles : le guide avant la cérémonie.',
            'author_name' => 'Jean-Baptiste Mbarga', 'published_at' => now()->addHours(44), 'read_time' => 5,
            'tags' => ['Football', 'CAN'], 'ph' => 'stadium', 'img' => 'Tirage au sort',
            'body' => ['Le tirage au sort de la phase finale aura lieu dans deux jours.', '## Les chapeaux', 'Les têtes de série sont désignées selon le classement continental.'],
            'status' => 'programme',
            'meta_desc' => 'Chapeaux, têtes de série, groupes possibles : tout savoir avant le tirage au sort de la CAN.',
        ]);

        foreach ($data['agenda'] as $e) {
            Event::create([
                'slug' => $e['id'], 'start_date' => $e['date'], 'end_date' => $e['end'] ?? null,
                'title' => $e['title'], 'city' => $e['city'], 'country' => $e['country'],
                'cat' => $e['cat'], 'desc' => $e['desc'],
            ]);
        }

        $d = $data['debat'];
        Debate::create([
            'question' => $d['question'],
            'pour_text' => $d['pour']['text'], 'pour_who' => $d['pour']['who'],
            'contre_text' => $d['contre']['text'], 'contre_who' => $d['contre']['who'],
            'votes_pour' => $d['base']['pour'], 'votes_contre' => $d['base']['contre'],
            'start_date' => now()->subDays(2), 'end_date' => now()->addDays(4), 'is_current' => true,
        ]);

        User::create(['name' => 'Awa Koné', 'email' => 'awa.kone@afriquinfos.com', 'password' => Hash::make('afriquinfos'), 'role' => 'admin', 'email_verified_at' => now()]);
        User::create(['name' => 'Moussa Diop', 'email' => 'moussa.diop@afriquinfos.com', 'password' => Hash::make('afriquinfos'), 'role' => 'chef', 'email_verified_at' => now()]);
        User::create(['name' => 'Jean-Baptiste Mbarga', 'email' => 'jb.mbarga@afriquinfos.com', 'password' => Hash::make('afriquinfos'), 'role' => 'journaliste', 'email_verified_at' => now()]);

        $names = ['Kouassi Yao', 'Aminata Traoré', 'Ibrahim Sow', 'Grace Mensah', 'Youssef Benali', 'Claire Mukendi', 'Samuel Okafor', 'Mariam Diallo'];
        $texts = ['Article très clair, merci pour ce décryptage.', 'Il manque le point de vue des syndicats dans cette analyse.', 'Enfin un média qui parle de ce sujet sans détour.', 'Gagnez de l’argent facilement, cliquez ici !!!', 'Pouvez-vous préciser la source du chiffre cité au deuxième paragraphe ?', 'Très bon article, à partager.', 'Je ne suis pas d’accord avec la conclusion.', 'Promo exceptionnelle sur nos produits, visitez notre site.'];
        $statuses = ['attente', 'attente', 'approuve', 'spam', 'attente', 'approuve', 'attente', 'spam'];
        $arts = Article::published()->limit(8)->pluck('id');
        foreach ($texts as $i => $t) {
            Comment::create([
                'article_id' => $arts[$i % $arts->count()],
                'author' => $names[$i], 'email' => strtolower(str_replace(' ', '.', $names[$i])).'@exemple.com',
                'text' => $t, 'status' => $statuses[$i], 'created_at' => now()->subHours($i * 3 + 1),
            ]);
        }

        $countries = ["Côte d'Ivoire", 'Sénégal', 'Cameroun', 'France', 'Mali', 'Bénin'];
        foreach ($names as $i => $n) {
            Subscriber::create([
                'name' => $n, 'email' => strtolower(str_replace(' ', '.', $n)).'@exemple.com',
                'country' => $countries[$i % count($countries)], 'created_at' => now()->subDays($i * 4 + 2),
            ]);
        }
    }
}
