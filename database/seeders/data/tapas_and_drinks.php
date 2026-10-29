<?php

/**
 * Cartes « L'Esprit Terrasse » (tapas & planches, 26/10/2026) et
 * « Carte des Vins, Champagne, Spiritueux & Boissons » (V4, 27/10/2026).
 *
 * Format d'une ligne : [nom, description, prix bouteille/assiette, prix au verre, mention de prix]
 * Prix en FCFA. `null` = non proposé.
 *
 * @return array<string, array<string, list<array{0: string, 1: ?string, 2: ?int, 3?: ?int, 4?: ?string}>>>
 */

use App\Models\MenuItem;

return [
    MenuItem::CATEGORY_TAPAS => [
        'Côté végétal' => [
            ['Croustillants de mozzarella d’Italie', 'Bouchées dorées au pesto maison, servies sur une fondue de tomates au curcuma et au gingembre.', 12000],
            ['Bruschettas de légumes confits', 'Pain au gruyère, légumes à la provençale, tapenade d’olives noires : une bouchée aux accents méditerranéens.', 12000],
        ],
        'Côté mer' => [
            ['Croustillants de sardines de nos côtes', 'Sardines fraîches, salade verte et sauce traditionnelle relevée à la tomate, aux herbes, à l’ail et au piment doux.', 14000],
            ['Saumon fumé d’Écosse', 'Saumon délicatement fumé, crème parfumée à la ciboulette et pain d’épices.', 18000],
        ],
        'Côté terre' => [
            ['Brochettes de bœuf du Sahel & poulet fermier', 'Bœuf du Sahel façon teriyaki, poulet fermier laqué au miel, légumes et pommes de terre sautées à l’ail.', 16000],
        ],
    ],
    MenuItem::CATEGORY_BOARDS => [
        'Un voyage gourmand à deux' => [
            ['Planche végétale du Cercle', 'Une sélection de produits du terroir et de légumes frais, accompagnés d’un assortiment de sauces fraîcheur.', 20000],
            ['Charcuteries d’Espagne & fromages de France', 'Saucisson artisanal et jambon de pays d’Espagne, fromages affinés de France, cornichons, beurre demi-sel et pain d’épices.', 32000],
            ['Planche de fruits de mer de nos côtes', 'Gambas flambées au pastis et à la crème, mini-brochettes de poisson et calamars frits à la parisienne. Aïoli aux herbes, câpres et condiments.', 32000],
            ['Surf & Turf · Terre & mer', 'Produits de nos côtes (calamars, poisson et crevettes) mariés au bœuf du Sahel et au poulet fermier, légumes et sauces épicées.', 36000],
        ],
    ],

    MenuItem::CATEGORY_CHAMPAGNES => [
        'Bruts' => [
            ['Séduction — Champagne Guyot', null, 50000, 10000],
            ['Mumm Cordon Rouge Brut', null, 80000],
            ['Billecart-Salmon Brut Réserve', null, 80000],
            ['Drappier Carte d’Or Brut', null, 80000, 15000],
            ['Drappier Cuvée Charles de Gaulle', null, 120000],
            ['Veuve Clicquot Brut', null, 90000],
            ['Bollinger Brut', null, 100000],
            ['Ruinart Brut', null, 100000],
            ['Perrier-Jouët Brut', null, 100000],
            ['Dom Pérignon Vintage Brut', null, 300000],
        ],
        'Rosés' => [
            ['Billecart-Salmon Brut Rosé', null, 110000],
        ],
        'Demi-secs' => [
            ['Cédric Guyot Demi-Sec', null, 50000, 10000],
            ['Drappier Carte d’Or Demi-Sec', null, 80000, 15000],
            ['Billecart-Salmon Demi-Sec', null, 90000],
            ['Moët & Chandon Nectar', null, 100000],
        ],
        'Blancs de blancs' => [
            ['Billecart-Salmon Blanc de Blancs', null, 100000],
            ['Drappier Blanc de Blancs', null, 110000],
            ['Barons de Rothschild Blanc de Blancs', null, 130000],
            ['Perrier-Jouët Blanc de Blancs', null, 180000],
            ['Ruinart Blanc de Blancs', null, 190000],
        ],
        'Cuvées de prestige et millésimées' => [
            ['Louis Roederer Cristal', null, 300000],
            ['Billecart-Salmon Brut Sous-Bois', null, 110000],
            ['Drappier Grande Sendrée 2015', null, 175000],
        ],
        'Magnums' => [
            ['Ruinart Blanc de Blancs — 1,5 L', null, 320000],
        ],
    ],

    MenuItem::CATEGORY_WHITE_WINES => [
        'Alsace' => [
            ['Riesling — Gustave Lorentz, 2023', null, 30000],
            ['Riesling Grand Cru Zinnkoepflé — BIO, 2023', null, 45000],
            ['Gewurztraminer Vendanges Tardives — Moltès, BIO', null, 65000],
            ['Gewurztraminer Grand Cru — Gustave Lorentz', null, 75000],
        ],
        'Vallée de la Loire' => [
            ['OVNI Blanc — Domaine Mourat', null, 30000, 8000],
            ['Sauvignon « Attitude » — Pascal Jolivet', null, 30000],
            ['Menetou-Salon — Domaine de Loye', null, 40000],
            ['Pouilly-Fumé, cuvée Loire — Jonathan Didier Pabiot', null, 45000],
            ['Sancerre — Domaine Delaporte', null, 45000],
            ['Muscadet — Château du Cleray', null, 30000],
        ],
        'Vallée du Rhône' => [
            ['Côtes-du-Rhône « Belleruche » — M. Chapoutier', null, 30000],
            ['Viognier — Alain Jaume', null, 35000],
            ['Condrieu « Amaraze » — Domaine Richard', null, 75000],
        ],
        'Bordeaux' => [
            ['Ambre de Maltus — Château Maltus', null, 35000],
        ],
        'Bourgogne' => [
            ['Bourgogne Aligoté — J. Moreau & Fils, 2022', null, 35000],
            ['Chablis — Maison Dampt Frères, 2022', null, 40000],
            ['Hautes-Côtes de Beaune — Éric Montchovet, 2022', null, 40000],
            ['Saint-Véran — Château La Tour de l’Ange', null, 40000],
            ['Ladoix — Céline Perrin, BIO, 2023', null, 50000],
            ['Pouilly-Fuissé « Les Gavouilles », 2020', null, 45000],
            ['Pouilly-Fuissé — Maison Guillot-Broux, 2022', null, 60000],
            ['Montagny 1er Cru « Les Bassets » — Domaine Antoire, 2023', null, 55000],
            ['Beaune 1er Cru « Les Pertuisots » — Domaine Germain, 2022', null, 80000],
            ['Auxey-Duresses « Les Hoz » — Agnès Paquet', null, 70000],
            ['Auxey-Duresses « Vieilles Vignes » — Prunier-Bonheur, 2023', null, 80000],
            ['Meursault « Sous la Velle » — Domaine Céline Perrin, BIO, 2022', null, 100000],
            ['Meursault 1er Cru — Domaine Matrot, 2022', null, 160000],
            ['Puligny-Montrachet 1er Cru — Domaine Langoureau, 2023', null, 175000],
            ['Chassagne-Montrachet — Louis Latour, 2023', null, 180000],
        ],
        'Vins blancs moelleux & liquoreux' => [
            ['Monbazillac — Château de la Verdaugie', null, 30000, 8000],
            ['Jurançon — Domaine Roche Guilhem', null, 35000],
            ['Vouvray « Les Bosquets »', null, 40000],
        ],
    ],

    MenuItem::CATEGORY_RED_WINES => [
        'Beaujolais' => [
            ['Brouilly « Réserve de la Beauvoisie », 2024', null, 30000],
            ['Fleurie — Domaine des Fonds, 2022', null, 35000],
        ],
        'Vallée de la Loire' => [
            ['Pinot Noir « Attitude » — Pascal Jolivet', null, 35000],
            ['Saumur-Champigny « La Paterne » — Antoine Sanzay', null, 40000],
            ['Saint-Nicolas-de-Bourgueil — Domaine Amirault, BIO, 2021', null, 40000],
            ['Sancerre — Domaine Delaporte, 2022', null, 45000],
            ['Saumur « Gondwana » — Les Fosses Sèches, 2023', null, 90000],
        ],
        'Vallée du Rhône' => [
            ['Côtes-du-Rhône Villages « Laurus », 2019', null, 30000],
            ['Côtes-du-Rhône — Domaine Gramenon, BIO, 2021', null, 35000],
            ['Saint-Joseph — Chapoutier, 2022', null, 50000],
            ['Crozes-Hermitage — Domaine Reynaud, BIO, 2022', null, 50000],
            ['Gigondas — Domaine Alain Jaume, BIO', null, 50000],
            ['Châteauneuf-du-Pape — Domaine Alain Jaume, BIO', null, 65000],
            ['Côte-Rôtie — Domaine Gallet, 2021', null, 75000],
            ['Côte-Rôtie « La Vallière » — Domaine Gérin, 2021', null, 120000],
            ['Hermitage « Monier de la Sizeranne » — M. Chapoutier', null, 160000],
        ],
        'Languedoc' => [
            ['« Les 3 Géants » — Domaine La Grange, BIO', null, 30000],
            ['« Ode à la Main ! » — Domaine Ortola, BIO', null, 40000],
            ['Pic-Saint-Loup — Mas Bruguière, BIO', null, 50000],
            ['Terrasses du Larzac — Domaine de Montcalmès, 2021', null, 60000],
        ],
        'Bourgogne' => [
            ['Bourgogne Pinot Noir — Moillard, 2020', null, 35000],
            ['Hautes-Côtes de Beaune — Domaine Éric Montchovet', null, 45000],
            ['Beaune 1er Cru — Faiveley, 2023', null, 120000],
            ['Savigny-lès-Beaune — Domaine Petitot', null, 60000],
            ['Mercurey « Vieilles Vignes » — Faiveley, 2023', null, 65000],
            ['Hautes-Côtes de Nuits — Louis Latour, 2023', null, 65000],
            ['Santenay 1er Cru « Beaurepaire » — Domaine Philippe Germain', null, 75000],
            ['Nuits-Saint-Georges — Christophe Chevaux, 2021', null, 80000],
            ['Pommard — Domaine Éric Montchovet', null, 80000],
            ['Pommard — Domaine Carillon, 2019', null, 120000],
            ['Aloxe-Corton « Les Boutières » — Domaine Céline Perrin', null, 75000],
            ['Aloxe-Corton — Louis Latour, 2020', null, 130000],
            ['Gevrey-Chambertin « Vieilles Vignes » — Faiveley', null, 110000],
            ['Gevrey-Chambertin « Racine du Temps » — René Bouvier, 2023', null, 160000],
            ['Chambolle-Musigny — Faiveley, 2022', null, 120000],
            ['Clos Vougeot — Louis Latour', null, 400000],
        ],
        'Bordeaux' => [
            ['Graves — Château Haut-Reys', null, 30000, 8000],
            ['Lalande-de-Pomerol « Plaisir de Siaurac », 2022', null, 30000],
            ['Blaye — Château Belle Coline, BIO', null, 35000],
            ['Saint-Émilion Grand Cru — Château Martinet, 2017', null, 45000],
            ['Saint-Émilion Grand Cru — Château La Tour Perey', null, 70000],
            ['Saint-Julien « Pavillon du Glana », 2021', null, 50000],
            ['Pessac-Léognan « Le Petit Smith » — Haut-Lafitte, 2018', null, 100000],
            ['Pessac-Léognan Grand Cru Classé — Château Pape Clément, 2020', null, 200000],
            ['Margaux « Haut du Tertre », 2021', null, 75000],
            ['Margaux Grand Cru Classé — Château Giscours, 2021', null, 200000],
            ['Pauillac « Verso » — Château Haut-Batailley, 2017', null, 65000],
            ['Pauillac « Écho de Lynch-Bages », 2020', null, 150000],
            ['Saint-Julien — Château Talbot, 2022', null, 200000],
            ['Saint-Estèphe « Tour du Marbuzet », 2019', null, 65000],
            ['Haut-Médoc — Château La Lagune, 2015', null, 140000],
            ['Pomerol « Fugue de Nénin », 2019', null, 80000],
            ['Pomerol — Château La Patache, 2021', null, 100000],
        ],
    ],

    MenuItem::CATEGORY_ROSE_WINES => [
        'Sélection' => [
            ['OVNI Rosé — Domaine Mourat, Loire', null, 30000, 8000],
            ['Bleu de Mer — Pays d’Oc, 2024', null, 30000],
            ['Whispering Angel — Côtes-de-Provence, 2024', null, 35000],
        ],
    ],

    MenuItem::CATEGORY_WHISKIES => [
        'Single malts d’Écosse — Highlands et îles' => [
            ['Glenmorangie 12 ans', null, 80000, 8000],
            ['Glenmorangie 18 ans', null, 180000, 18000],
            ['Glenmorangie Signet', null, 300000, 30000],
            ['Dalmore 12 ans', null, 150000, 15000],
            ['Dalmore Cigar Malt', null, 300000, 30000],
            ['Arran Barrel Reserve', null, 130000, 13000],
            ['Oban 14 ans', null, 200000, 20000],
            ['Clynelish 14 ans', null, 150000, 15000],
        ],
        'Single malts d’Écosse — Speyside' => [
            ['Singleton 12 ans', null, 80000, 8000],
            ['Glenfarclas 12 ans', null, 100000, 10000],
            ['Glenlivet 15 ans', null, 160000, 16000],
            ['Aberlour 12 ans', null, 180000, 18000],
            ['Macallan 12 ans', null, 150000, 15000],
            ['Macallan 15 ans', null, 250000, 25000],
            ['Macallan 18 ans', null, null, 47000],
        ],
        'Single malts d’Écosse — Lowlands' => [
            ['Glenkinchie 12 ans', null, 100000, 10000],
        ],
        'Single malts d’Écosse — Islay' => [
            ['Ardbeg 10 ans — tourbé', null, 100000, 10000],
            ['Caol Ila 12 ans — tourbé', null, 150000, 15000],
            ['Kilchoman — tourbé', null, 150000, 15000],
            ['Lagavulin — tourbé', null, 160000, 16000],
        ],
        'Single malts d’Écosse — Île de Skye' => [
            ['Talisker 10 ans — tourbé', null, 100000, 10000],
        ],
        'Whiskeys d’Irlande' => [
            ['Jameson Black Barrel', null, 80000, 8000],
            ['Bushmills 10 ans', null, 80000, 8000],
            ['Redbreast 12 ans', null, 200000, 20000],
        ],
        'Écosse — whiskies blended' => [
            ['Johnnie Walker Black Label', null, 80000, 8000],
            ['Johnnie Walker Double Black Label', null, 100000, 10000],
            ['Johnnie Walker Blue Label', null, null, 40000],
            ['Chivas Regal 12 ans', null, 80000, 8000],
            ['Chivas Regal 15 ans', null, 110000, 11000],
            ['Chivas Regal 18 ans', null, 140000, 14000],
            ['Ballantine’s 17 ans', null, 200000, 20000],
        ],
        'Japon — whiskies japonais' => [
            ['Nikka Days', null, 80000, 8000],
            ['Nikka Coffey Grain', null, 150000, 15000],
            ['Yamazaki Distiller’s Reserve', null, 250000, 25000],
            ['Yoichi Single Malt', null, 150000, 15000],
            ['Hibiki Suntory', null, 250000, 25000],
        ],
        'États-Unis — Kentucky' => [
            ['Woodford Reserve', null, 80000, 8000],
            ['Bulleit 95 Rye', null, 110000, 11000],
            ['Duke Kentucky Bourbon', null, null, 30000],
        ],
        'États-Unis — Tennessee' => [
            ['Jack Daniel’s Old No. 7', null, 70000, 7000],
            ['Jack Daniel’s Tennessee Honey', null, 70000, 7000],
            ['Jack Daniel’s Gentleman Jack', null, 90000, 9000],
            ['Jack Daniel’s Single Barrel', null, 120000, 12000],
        ],
    ],

    MenuItem::CATEGORY_RUMS => [
        'Sélection internationale' => [
            ['Canerock — Jamaïque', null, 70000, 7000],
            ['Plantation Barbados 5 ans — Barbade', null, 80000, 8000],
            ['Havana Club Especial — Cuba', null, 70000, 7000],
            ['Havana Club 7 ans — Cuba', null, 80000, 8000],
            ['Havana Club Selección de Maestros — Cuba', null, 110000, 11000],
            ['Diplomático Reserva Exclusiva — Venezuela', null, 100000, 10000],
            ['Dictador 12 ans — Colombie', null, 120000, 12000],
            ['Eminente 7 ans — Cuba', null, 150000, 15000],
            ['Chairman’s Reserve — Sainte-Lucie', null, 150000, 15000],
            ['Abuelo 12 ans — Panama', null, 120000, 12000],
            ['Don Papa — Philippines', null, 120000, 12000],
            ['Barbancourt 8 ans, Réserve Spéciale — Haïti', null, 150000, 15000],
            ['Rhum J.M VSOP — Martinique', null, 120000, 12000],
            ['Clément VSOP — Martinique', null, 150000, 15000],
            ['Plantation XO — Barbade', null, 150000, 15000],
            ['Clément XO — Martinique', null, 150000, 15000],
            ['Depaz XO — Martinique', null, 150000, 15000],
            ['Zacapa — Guatemala', null, 180000, 18000],
        ],
    ],

    MenuItem::CATEGORY_BRANDIES => [
        'Cognacs' => [
            ['Ferrand 10 Générations', null, 80000, 8000],
            ['Martell VS', null, 80000, 8000],
            ['Martell XO', null, null, 45000],
            ['Tesseron Lot n° 90 XO Ovation', null, 150000, 15000],
            ['Jules Gautret Grande Champagne VSOP', null, null, 20000],
            ['Ferrand Sélection des Anges XO', null, null, 30000],
            ['Hennessy VS', null, 80000, 8000],
            ['Hennessy XO', null, 350000, 35000],
            ['Rémy Martin VSOP', null, 120000, 12000],
            ['Rémy Martin XO', null, null, 45000],
            ['Tesseron Lot n° 53 XO Perfection', null, null, 50000],
        ],
        'Armagnacs' => [
            ['L’Encantada 20 ans', null, null, 15000],
            ['Bas-Armagnac Tariquet XO', null, null, 15000],
            ['Armagnac Saint-Vivant XO', null, null, 12000],
            ['Bas-Armagnac Aubade XO', null, null, 20000],
        ],
        'Calvados' => [
            ['Lecompte 12 ans', null, null, 10000],
        ],
    ],

    MenuItem::CATEGORY_SPIRITS => [
        'Vodkas' => [
            ['Belvedere', null, 70000, 7000],
            ['Grey Goose', null, 100000, 10000],
            ['Crystal Head', null, 120000, 12000],
        ],
        'Gins' => [
            ['Citadelle', null, 60000, 6000],
            ['Bombay Sapphire', null, 80000, 8000],
            ['Monkey 47 Schwarzwald — 50 cl', null, 100000, 10000],
            ['Hendrick’s', null, 120000, 12000],
        ],
        'Téquilas' => [
            ['Olmeca Gold', null, 80000, 8000],
            ['Don Julio Reposado', null, 180000, 18000],
            ['Casamigos Reposado', null, 150000, 15000],
            ['Clase Azul Reposado', null, null, 45000],
        ],
        'Mezcals' => [
            ['Derrumbes San Luis', null, 100000, 10000],
            ['400 Conejos Joven', null, 70000, 7000],
        ],
    ],

    MenuItem::CATEGORY_APERITIFS => [
        'Sélection au verre' => [
            ['Martini Rosso', null, null, 7000],
            ['Martini Bianco', null, null, 7000],
            ['Suze', null, null, 7000],
            ['Porto Sandeman 10 ans', null, null, 9000],
            ['Porto Sandeman blanc', null, null, 7000],
            ['Ricard', null, null, 7000],
            ['Ricard aux herbes fraîches', null, null, 7000],
            ['Malibu Coco', null, null, 7000],
            ['Get 27 — menthe', null, null, 7000],
            ['Get 31 — menthe', null, null, 7000],
            ['Fernet-Branca', null, null, 7000],
            ['Jägermeister', null, null, 7000],
            ['Baileys Original', null, null, 7000],
            ['Limoncello', null, null, 7000],
            ['Manzanita — pomme verte', null, null, 7000],
            ['Prosecco Riccadonna', null, null, 7000],
            ['Chartreuse verte 2025', null, null, 20000],
        ],
    ],

    MenuItem::CATEGORY_COCKTAILS => [
        'Nos créations iconiques' => [
            ['Whisky Sour Premium', 'Bourbon Woodford Reserve, jus de citron frais, sirop de canne, blanc d’œuf, Angostura bitters.', 10000],
            ['Porn-star Martini Ritual', 'Vodka, vanille de Madagascar, Passoã, purée de fruit de la passion, citron vert.', 10000],
            ['Cosmopolitan Épuré', 'Vodka, Cointreau, jus de cranberry, citron vert.', 10000],
            ['Mango Colada Artisanale', 'Rhum blanc agricole, purée de mangue fraîche, crème de coco, jus d’ananas.', 10000],
            ['Margarita d’Agave Noir', 'Téquila, Cointreau, jus de citron vert, trait de sirop d’agave bio.', 10000],
            ['Apple Martini Cristallin', 'Vodka, liqueur de pomme verte, jus de pomme Granny Smith, citron.', 10000],
            ['Blue Lagoon Électrique', 'Vodka, curaçao bleu, jus de citron, limonade.', 10000],
        ],
        'Notre atelier de mojitos' => [
            ['Le Classique', 'Rhum blanc agricole des Antilles, menthe poivrée, citron vert, sucre de canne bio, eau gazeuse. Décor de menthe fraîche et de citron.', 10000],
            ['Le Passion', 'Base de mojito classique, pulpe et graines de fruit de la passion.', 10000],
            ['Le Litchi', 'Base de mojito classique, liqueur de litchi, litchi et fleurs comestibles.', 10000],
            ['Le Pastèque', 'Base de mojito classique, jus de pastèque frais et tranche de pastèque.', 10000],
        ],
        'Haute mixologie' => [
            ['Roméo & Juliette', 'Gin Hendrick’s, liqueur de rose, jus de pamplemousse rose, sirop de gingembre, champagne brut.', 15000],
            ['Negroni Arte', 'Gin Hendrick’s, Campari, vermouth rouge, zeste d’orange.', 15000],
            ['Aperol Spritz Vénitien', 'Aperol, prosecco, trait d’eau gazeuse.', 10000],
            ['Kir Royal d’Élite', 'Crème de cassis, champagne brut ou demi-sec.', 15000],
            ['Ti-Punch Tradition', 'Rhum vieux agricole des Antilles, sirop de canne, zeste de citron.', 12000],
        ],
    ],

    MenuItem::CATEGORY_MOCKTAILS => [
        'Nos créations originales — sans alcool' => [
            ['Le Sang d’Or', 'Nectar de mangue, jus de grenade, sirop de curcuma, tonic.', 7000],
            ['Le Pur Passion', 'Fruit de la passion frais, jus d’ananas, sirop de vanille, eau de coco.', 7000],
            ['Le Virgin Ginger Mule', 'Jus de citron pressé, sirop de gingembre, bouquet de menthe fraîche.', 7000],
            ['Le Jardin Secret', 'Distillat botanique sans alcool, jus de concombre, sirop de sureau, trait de citron vert.', 7000],
            ['L’Azur Secret', 'Limonade, sirop de curaçao bleu sans alcool, jus de citron, eau gazeuse.', 7000],
            ['Le Coco-Citronnelle', 'Eau de coco, crème de coco, infusion concentrée de citronnelle, trait de sirop de sucre.', 7000],
            ['Le Bora Bora', 'Ananas, fruit de la passion, orange, grenadine.', 7000],
            ['Le Sensuel', 'Bissap, fraise, vanille de Madagascar, ananas.', 7000],
        ],
    ],

    MenuItem::CATEGORY_SHOOTERS => [
        'À partager : 3 ou 6 shooters de 4 cl chacun' => [
            ['Baileys', null, null, null, '3 shooters 10 000 · 6 shooters 18 000'],
            ['Get 27', null, null, null, '3 shooters 10 000 · 6 shooters 18 000'],
            ['Téquila Olmeca', null, null, null, '3 shooters 12 000 · 6 shooters 20 000'],
            ['Rhum Barbados', null, null, null, '3 shooters 12 000 · 6 shooters 20 000'],
            ['Vodka', null, null, null, '3 shooters 13 000 · 6 shooters 25 000'],
            ['Rhum Zacapa', null, null, null, '3 shooters 25 000 · 6 shooters 45 000'],
            ['Mezcal', null, null, null, '3 shooters 28 000 · 6 shooters 55 000'],
            ['Clase Azul', null, null, null, '3 shooters 55 000 · 6 shooters 100 000'],
        ],
    ],

    MenuItem::CATEGORY_DRINKS => [
        'Eaux' => [
            ['Kirène plate', null, 4000],
            ['Kirène pétillante', null, 4000],
            ['Perrier', null, 5000],
        ],
        'Softs' => [
            ['Orangina', null, 3500],
            ['Coca-Cola', null, 3500],
            ['Fanta Orange', null, 3500],
            ['Red Bull', null, 3500],
            ['7 Up', null, 3500],
            ['Sanbittèr', null, 3500],
        ],
        'Bières' => [
            ['Corona', null, 4000],
            ['Heineken', null, 4000],
            ['Budweiser', null, 4000],
            ['Beaufort', null, 4000],
        ],
    ],
];
