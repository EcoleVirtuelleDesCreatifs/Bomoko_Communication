<?php

namespace Database\Seeders;

use App\Models\MenuItem;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MenuItemSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        MenuItem::query()->delete();

        $sections = [
            MenuItem::CATEGORY_STARTERS => [
                'Les entrées du Cercle' => [
                    ['Gelée d’une bouillabaisse de poisson infusée au thym citron', 'Avec son effeuillé de poisson et sa rouille d’anchois.', 18000],
                    ['Ceviche de mérou aux fruits tropicaux', 'Vinaigrette d’agrumes et citron salé.', 16000],
                ],
                'Les signatures du chef' => [
                    ['Marbré de foie gras au pinot noir', 'Gelée de pomme Granny Smith, quenelle d’oignons rouges fondus et ananas au piment rouge.', 20000],
                ],
                'Les classiques bistrot' => [
                    ['Salade Caesar au poulet ou aux crevettes', 'Vinaigrette à l’anchois.', 12000],
                    ['Salade grecque', 'Tomates, concombre, oignon rouge, poivron vert, feta et olives.', 11000],
                ],
                'Nos poissons fumés' => [
                    ['Thon fumé', 'Condiments d’agrumes, accompagné d’une salade de frisette.', 12000],
                ],
                'Les carpaccios' => [
                    ['Carpaccio de bœuf', 'Roquette à l’huile d’olive, pesto maison, servi avec des copeaux de parmesan et des croûtons.', 15000],
                    ['Carpaccio de poisson blanc', 'Julienne de segments d’agrumes, granité à l’aneth et croquant de radis.', 15000],
                ],
                'Les entrées chaudes — crustacés' => [
                    ['Poulpe aux épices piquantes', 'Crémeux d’arouille à l’ail confit, croustillant de perles du Japon, servi avec une sauce marchand de vin.', 15000],
                    ['Gambas aux épices tandoori poêlées', 'Caviar d’aubergines, croustillant de chorizo, émulsion tandoori.', 15000],
                ],
            ],
            MenuItem::CATEGORY_MAINS => [
                'Pasta signature' => [
                    ['Spicy pasta aux gambas', 'Sauce bisque.', 15000],
                ],
                'Poissons et crustacés' => [
                    ['Mérou poêlé au beurre noisette', 'Sur un lit de blancs de poireaux fondants cuits à basse température sous vide, mousse d’agrumes et citron salé.', 22000],
                    ['Dos de sériole à la plancha', 'Courgettes et tomates à la provençale, gel d’orange onctueux, beurre blanc à l’aneth.', 20000],
                    ['Médaillons de langouste poêlés aux quatre herbes aromatiques', 'Potiron aux saveurs locales, sauce bisque flambée au rhum.', 33000],
                ],
                'Poisson signature' => [
                    ['Thon cuisiné à la façon de l’océan Indien', 'Accompagné de son riz coco.', 23000],
                ],
                'Volailles et viandes' => [
                    ['Suprême de volaille farci', 'Cuit sous vide, pétales d’oignon rôtis, accompagné de champignons sautés, dans son jus de morilles.', 20000],
                    ['Magret de canard rôti sur sa peau croustillante', 'Mousseline de carotte au zeste d’orange, romanesco et mini-carottes à la vapeur, jus de canard à l’orange.', 29000],
                    ['Queue de bœuf importée cuisinée à l’africaine', 'Son couscous aux petits légumes dans son jus de bœuf épicé.', 18000],
                    ['Souris d’agneau confite 24 heures', 'Purée de pommes de terre, sauce Périgueux (truffe) parfumée à la menthe fraîche du jardin.', 28000],
                    ['Poulet Jerk grillé au barbecue', 'Jus parfumé au thym et à la cannelle.', 18000],
                    ['Filet de bœuf importé, rossini poêlé', 'Mini-légumes glacés, terrine de patate douce, sauce au poivre.', 28000],
                ],
                'Le cochon' => [
                    ['Plumas de cochon noir de Bigorre laqué', 'Au miel sauvage de la forêt.', 26000],
                ],
                'Les pièces du boucher — accompagnement libre' => [
                    ['Côte de bœuf charolaise', 'Accompagnement libre.', null, 'Prix selon le poids'],
                    ['Entrecôte Simmental maturée', 'Accompagnement libre.', 38000],
                    ['Tomahawk d’Angus (1 kg et plus)', 'Accompagnement libre.', 100000],
                    ['Carré d’agneau d’Australie en croûte d’herbes', 'Accompagnement libre.', 90000],
                ],
                'Les accompagnements en supplément' => [
                    ['Frites faites maison', null, 4000],
                    ['Pommes exquises à la persillade', null, 4000],
                    ['Purée de pommes de terre fumée ou truffée', null, 4000],
                    ['Légumes de saison glacés au beurre', null, 4000],
                    ['Gnocchi aux truffes', null, 4000],
                    ['Riz noir aux petits légumes', null, 4000],
                    ['Délice de riz pilaf aux épices locales', null, 4000],
                ],
                'Notre formule enfant' => [
                    ['Formule enfant', 'Cheeseburger maison, accompagnement et glace au choix.', 12000],
                ],
            ],
            MenuItem::CATEGORY_DESSERTS => [
                'Nos délices sucrés' => [
                    ['Parfait mousse au chocolat', 'Imbibé au rhum et au café.', 9500],
                    ['Tapioca au lait de coco et aux fruits de la passion', null, 8000],
                    ['Cigare de poires pochées au vin rouge', 'Génoise aux noisettes concassées, gel de citron et caramel.', 10000],
                ],
                'Les classiques' => [
                    ['Fondant au chocolat et sa glace à la vanille', 'Option : liqueur de cacao.', 9000],
                    ['Baba au rhum', 'Sorbet citron.', 9000],
                    ['Délice du manguier', 'Glace à la mangue, biscuit à la mangue (option : liqueur de mangue).', 9000],
                ],
            ],
        ];

        $sortOrder = 0;

        foreach ($sections as $category => $sectionItems) {
            foreach ($sectionItems as $section => $items) {
                foreach ($items as $item) {
                    [$name, $description, $price, $priceNote] = array_pad($item, 4, null);

                    MenuItem::create([
                        'name' => $name,
                        'description' => $description,
                        'price' => $price,
                        'price_note' => $priceNote,
                        'category' => $category,
                        'section' => $section,
                        'sort_order' => $sortOrder += 10,
                        'is_active' => true,
                    ]);
                }
            }
        }
    }
}
