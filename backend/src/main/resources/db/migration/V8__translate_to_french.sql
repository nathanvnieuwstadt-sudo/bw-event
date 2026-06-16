-- V8: Translate all seed data to French

-- ── Banquet notes, room setup, dietary restrictions, AV needs ─────────────────

UPDATE banquets SET
  room_setup             = 'Tables rondes',
  dietary_restrictions   = 'Option végétarienne requise pour 15 convives, 2 allergies aux noix',
  av_needs               = 'Microphone + sono, écran de projection',
  notes                  = 'La mariée demande des bouquets de roses sur toutes les tables. Le gâteau arrive à 20h30.'
WHERE id = '20000000-0000-0000-0000-000000000001';

UPDATE banquets SET
  room_setup           = 'Style salle de réunion',
  dietary_restrictions = 'Repas halal pour 8 convives',
  av_needs             = 'Projecteur + pointeur laser',
  notes                = 'Soirée team building KBC. Facture au siège social.'
WHERE id = '20000000-0000-0000-0000-000000000002';

UPDATE banquets SET
  room_setup = 'Cocktail debout',
  notes      = '50e anniversaire. Le client préfère un DJ plutôt qu''un groupe live.'
WHERE id = '20000000-0000-0000-0000-000000000003';

UPDATE banquets SET
  room_setup           = 'Théâtre avec tables de dîner',
  dietary_restrictions = 'Option végane x 20, sans gluten x 5',
  av_needs             = 'Full AV : 2 écrans, micro sans fil, éclairage de scène',
  notes                = 'Gala de charité annuel. Tapis rouge à l''entrée. Photographes de presse attendus.'
WHERE id = '20000000-0000-0000-0000-000000000004';

UPDATE banquets SET
  room_setup           = 'Grandes tables familiales',
  dietary_restrictions = 'Pas de fruits de mer (allergie)',
  notes                = 'Déjeuner dominical décontracté. Des enfants seront présents.'
WHERE id = '20000000-0000-0000-0000-000000000005';

UPDATE banquets SET
  room_setup = 'Tables rondes',
  notes      = 'Annulé par le client le 01/06/2026. Acompte non perçu.'
WHERE id = '20000000-0000-0000-0000-000000000006';

UPDATE banquets SET
  room_setup = 'Cocktail debout',
  av_needs   = 'Système audio de fond',
  notes      = 'Réception cocktail informelle pour le 25e anniversaire de la famille De Smedt.'
WHERE id = '20000000-0000-0000-0000-000000000007';

UPDATE banquets SET
  room_setup           = 'Style salle de réunion',
  dietary_restrictions = 'Végétarien x 3, sans lactose x 1',
  av_needs             = 'Affichage HDMI pour présentation',
  notes                = 'Déjeuner client Accenture. Présentation pendant l''entrée.'
WHERE id = '20000000-0000-0000-0000-000000000008';

UPDATE banquets SET
  room_setup           = 'Tables rondes',
  dietary_restrictions = 'Sans gluten x 2',
  notes                = 'Dîner de répétition pour la famille Janssen. Acompte en attente.'
WHERE id = '20000000-0000-0000-0000-000000000009';

-- ── Menu items ────────────────────────────────────────────────────────────────

-- Wedding (b001)
UPDATE menu_items SET dish_name = 'Velouté de tomates à l''huile de basilic' WHERE id = '30000000-0000-0000-0000-000000000001';
UPDATE menu_items SET dish_name = 'Filet de bœuf, jus de truffe', notes = 'Saignant'         WHERE id = '30000000-0000-0000-0000-000000000002';
UPDATE menu_items SET dish_name = 'Risotto aux champignons des bois (V)', notes = 'Végétarien' WHERE id = '30000000-0000-0000-0000-000000000003';
UPDATE menu_items SET dish_name = 'Fondant au chocolat, glace vanille'                         WHERE id = '30000000-0000-0000-0000-000000000004';

-- Corporate KBC (b002)
UPDATE menu_items SET dish_name = 'Burrata, tomate ancienne'                                   WHERE id = '30000000-0000-0000-0000-000000000005';
UPDATE menu_items SET dish_name = 'Bar grillé, beurre blanc au safran'                         WHERE id = '30000000-0000-0000-0000-000000000006';
UPDATE menu_items SET dish_name = 'Carré d''agneau halal, harissa', notes = 'Halal'            WHERE id = '30000000-0000-0000-0000-000000000007';
UPDATE menu_items SET dish_name = 'Crème brûlée'                                               WHERE id = '30000000-0000-0000-0000-000000000008';

-- Gala (b004)
UPDATE menu_items SET dish_name = 'Bisque de homard'                                           WHERE id = '30000000-0000-0000-0000-000000000009';
UPDATE menu_items SET dish_name = 'Confit de canard, réduction de cerises'                     WHERE id = '30000000-0000-0000-0000-000000000010';
UPDATE menu_items SET dish_name = 'Steak de chou-fleur rôti (VE)', notes = 'Végan'            WHERE id = '30000000-0000-0000-0000-000000000011';
UPDATE menu_items SET dish_name = 'Tarte aux amandes sans gluten', notes = 'SG'               WHERE id = '30000000-0000-0000-0000-000000000012';
UPDATE menu_items SET dish_name = 'Gâteau opéra'                                               WHERE id = '30000000-0000-0000-0000-000000000013';

-- Family reunion (b005)
UPDATE menu_items SET dish_name = 'Soupe du jour'                                              WHERE id = '30000000-0000-0000-0000-000000000014';
UPDATE menu_items SET dish_name = 'Poulet rôti, pommes de terre rôties'                        WHERE id = '30000000-0000-0000-0000-000000000015';
UPDATE menu_items SET dish_name = 'Salade de fruits de saison'                                 WHERE id = '30000000-0000-0000-0000-000000000016';

-- Cocktail reception (b007)
UPDATE menu_items SET dish_name = 'Blinis au saumon fumé'                                      WHERE id = '30000000-0000-0000-0000-000000000017';
UPDATE menu_items SET dish_name = 'Mini bruschetta trio'                                        WHERE id = '30000000-0000-0000-0000-000000000018';
UPDATE menu_items SET dish_name = 'Verrine cocktail de crevettes'                              WHERE id = '30000000-0000-0000-0000-000000000019';
UPDATE menu_items SET dish_name = 'Plateau fromages & charcuterie', notes = 'Par table'        WHERE id = '30000000-0000-0000-0000-000000000020';

-- Corporate lunch (b008)
UPDATE menu_items SET dish_name = 'Salade César'                                               WHERE id = '30000000-0000-0000-0000-000000000021';
UPDATE menu_items SET dish_name = 'Suprême de poulet poêlé'                                    WHERE id = '30000000-0000-0000-0000-000000000022';
UPDATE menu_items SET dish_name = 'Tarte épinards & ricotta (V)', notes = 'Végétarien, option sans lactose' WHERE id = '30000000-0000-0000-0000-000000000023';
UPDATE menu_items SET dish_name = 'Panna cotta, coulis de fruits rouges'                       WHERE id = '30000000-0000-0000-0000-000000000024';

-- Private dinner (b009)
UPDATE menu_items SET dish_name = 'Soupe au cresson'                                           WHERE id = '30000000-0000-0000-0000-000000000025';
UPDATE menu_items SET dish_name = 'Épaule d''agneau confite, jus de romarin'                  WHERE id = '30000000-0000-0000-0000-000000000026';
UPDATE menu_items SET dish_name = 'Pâtes primavera SG', notes = 'Sans gluten'                 WHERE id = '30000000-0000-0000-0000-000000000027';
UPDATE menu_items SET dish_name = 'Tarte au citron, crème fraîche'                             WHERE id = '30000000-0000-0000-0000-000000000028';

-- ── Event types ───────────────────────────────────────────────────────────────

UPDATE event_types SET name = 'Mariage',           description = 'Réceptions de mariage et cérémonies'                                    WHERE id = '40000000-0000-0000-0000-000000000001';
UPDATE event_types SET name = 'Dîner d''entreprise', description = 'Dîners d''affaires, événements d''équipe et réceptions clients'       WHERE id = '40000000-0000-0000-0000-000000000002';
UPDATE event_types SET name = 'Anniversaire',       description = 'Célébrations d''anniversaire privées'                                   WHERE id = '40000000-0000-0000-0000-000000000003';
UPDATE event_types SET name = 'Gala / Charité',     description = 'Galas formels, levées de fonds et soirées en tenue de soirée'           WHERE id = '40000000-0000-0000-0000-000000000004';

-- ── Event type fields ─────────────────────────────────────────────────────────

-- Wedding fields
UPDATE event_type_fields SET field_label = 'Noms des mariés'                                              WHERE id = '50000000-0000-0000-0000-000000000001';
UPDATE event_type_fields SET field_label = 'Code vestimentaire', options = 'Cravate noire,Formel,Élégant décontracté,Décontracté' WHERE id = '50000000-0000-0000-0000-000000000002';
UPDATE event_type_fields SET field_label = 'Cérémonie sur place'                                          WHERE id = '50000000-0000-0000-0000-000000000003';
UPDATE event_type_fields SET field_label = 'Heure de livraison du gâteau'                                 WHERE id = '50000000-0000-0000-0000-000000000004';

-- Corporate Dinner fields
UPDATE event_type_fields SET field_label = 'Nom de la société'                                            WHERE id = '50000000-0000-0000-0000-000000000005';
UPDATE event_type_fields SET field_label = 'Facture à la société'                                         WHERE id = '50000000-0000-0000-0000-000000000006';
UPDATE event_type_fields SET field_label = 'Disposition des places', options = 'Salle de réunion,Théâtre,Tables rondes,En U,Cabaret' WHERE id = '50000000-0000-0000-0000-000000000007';

-- Birthday fields
UPDATE event_type_fields SET field_label = 'Âge célébré'                                                  WHERE id = '50000000-0000-0000-0000-000000000008';
UPDATE event_type_fields SET field_label = 'Gâteau fourni par la salle'                                   WHERE id = '50000000-0000-0000-0000-000000000009';
UPDATE event_type_fields SET field_label = 'Préférence musicale', options = 'DJ,Groupe live,Playlist uniquement,Aucun' WHERE id = '50000000-0000-0000-0000-000000000010';

-- Gala fields
UPDATE event_type_fields SET field_label = 'Association bénéficiaire'                                     WHERE id = '50000000-0000-0000-0000-000000000011';
UPDATE event_type_fields SET field_label = 'Entrée tapis rouge'                                           WHERE id = '50000000-0000-0000-0000-000000000012';
UPDATE event_type_fields SET field_label = 'Code vestimentaire', options = 'Cravate noire,Cravate blanche,Formel,Élégant décontracté' WHERE id = '50000000-0000-0000-0000-000000000013';
UPDATE event_type_fields SET field_label = 'Presse / photographes attendus'                               WHERE id = '50000000-0000-0000-0000-000000000014';

-- ── Banquet field values (text / select values that were in English) ───────────

UPDATE banquet_field_values SET value = 'Cravate noire'    WHERE field_id = '50000000-0000-0000-0000-000000000002' AND value = 'Black tie';
UPDATE banquet_field_values SET value = 'Salle de réunion' WHERE field_id = '50000000-0000-0000-0000-000000000007' AND value = 'Boardroom';
UPDATE banquet_field_values SET value = 'Cravate noire'    WHERE field_id = '50000000-0000-0000-0000-000000000013' AND value = 'Black tie';

-- ── Email threads ─────────────────────────────────────────────────────────────

UPDATE email_threads SET
  subject          = 'Demande de réception de mariage — 30 août',
  last_message_body = 'Bonjour,

Je m''appelle Eva Storms et je me marie le 30 août 2026. Nous recherchons un lieu pour notre dîner de réception — environ 85 convives.

Nous aurions besoin de la salle de 18h00 à minuit, et il nous faudrait une option végétarienne pour environ 10 convives. L''un de nos invités présente également une allergie sévère aux noix.

Pourriez-vous nous informer de vos disponibilités et tarifs ?

Cordialement,
Eva Storms'
WHERE id = '70000000-0000-0000-0000-000000000001';

UPDATE email_threads SET
  subject           = 'Dîner d''entreprise KBC — 18 juin',
  last_message_body = 'Bonjour,

Je reviens sur notre réservation pour notre événement d''équipe du 18 juin. Nous souhaitons reconfirmer le nombre de convives : 45, dont 8 nécessitent des repas halal.

Pourriez-vous également confirmer que la facture sera adressée à KBC Bank NV, Havenlaan 2, 1080 Bruxelles ?

Merci,
Pieter Van den Berg'
WHERE id = '70000000-0000-0000-0000-000000000002';

UPDATE email_threads SET
  subject           = 'Demande anniversaire — 60 ans, 12 septembre',
  last_message_body = 'Bonjour,

Je souhaite organiser un dîner d''anniversaire surprise pour les 60 ans de mon mari le samedi 12 septembre 2026. Nous attendons environ 40 convives.

Nous préférerions une salle privée si possible, avec un cocktail dès 19h00 suivi d''un dîner assis à 20h00. Serait-il possible d''accueillir un DJ ?

Merci de me faire part de ce qui est possible et du tarif.

Bien cordialement,
Hélène Dubois'
WHERE id = '70000000-0000-0000-0000-000000000003';

UPDATE email_threads SET
  subject           = 'Gala de charité annuel 2026 — Claes Events',
  last_message_body = 'Madame, Monsieur,

Je suis Lena Claes de Claes Events. Nous organisons notre gala de charité annuel le 25 juillet pour environ 200 convives. Il s''agit d''un événement en tenue de soirée avec entrée tapis rouge.

Nous avons besoin d''une installation AV complète comprenant deux écrans, un micro sans fil et un éclairage de scène. Il nous faudra également 20 repas vegan et 5 options sans gluten.

Nous avons déjà travaillé avec vous et espérons confirmer rapidement les détails.

Bien cordialement,
Lena Claes
Claes Events'
WHERE id = '70000000-0000-0000-0000-000000000004';

-- ── Agent drafts ──────────────────────────────────────────────────────────────

UPDATE agent_drafts SET draft_body =
'Madame Storms,

Merci de votre demande concernant votre réception de mariage le 30 août 2026.

Nous avons le plaisir de vous confirmer que cette date est disponible. Notre grande salle de banquet peut accueillir jusqu''à 120 convives et offrirait un cadre magnifique pour votre soirée.

Pour une réception de 85 convives de 18h00 à minuit, notre tarif indicatif est de 7 200 € (hors boissons et service). Ce forfait comprend :
- Location complète de la salle
- Dîner trois services avec café
- Coordinateur d''événement dédié
- Nappage, centres de table et aménagement de la salle

Nous proposons des options végétariennes et sommes parfaitement équipés pour gérer les allergies aux noix — notre équipe cuisine identifiera tous les plats en conséquence et assurera une expérience en toute sécurité pour votre convive.

Un acompte de 30 % (2 160 €) est demandé pour confirmer la réservation.

Seriez-vous disponible pour une visite des lieux cette semaine ? Nous serions ravis de vous faire découvrir l''espace.

Bien cordialement,
L''équipe BW Event'
WHERE id = '80000000-0000-0000-0000-000000000001';

UPDATE agent_drafts SET draft_body =
'Monsieur Van den Berg,

Merci de votre message. Nous avons le plaisir de vous confirmer les détails suivants pour votre réservation du 18 juin :

- Nombre de convives : 45
- Repas halal : 8 (clairement identifiés et préparés séparément par notre cuisine)
- Disposition de la salle : Style salle de réunion, comme convenu
- Horaires : 19h00 – 22h00

Nous adresserons la facture à :
KBC Bank NV
Havenlaan 2
1080 Bruxelles

Veuillez noter que le numéro de TVA en dossier est BE 0462.920.226. Si celui-ci doit être mis à jour, merci de nous le signaler avant l''événement.

Nous nous réjouissons d''accueillir votre équipe le 18.

Bien cordialement,
L''équipe BW Event'
WHERE id = '80000000-0000-0000-0000-000000000002';

UPDATE agent_drafts SET draft_body =
'Madame Dubois,

Merci de votre message. Nous serions ravis d''organiser la fête d''anniversaire de votre mari pour ses 60 ans le 12 septembre 2026.

Nous pouvons accueillir 40 convives avec un cocktail dès 19h00 et un dîner assis à 20h00. Notre salle privée dispose de son propre bar.

Une installation pour DJ est possible grâce à notre système audio intégré.

Le tarif pour cet événement commence à 3 200 €. Un acompte de 30 % (960 €) confirme la date.

Cordialement,
L''équipe BW Event'
WHERE id = '80000000-0000-0000-0000-000000000003';

UPDATE agent_drafts SET draft_body =
'Chère Hélène,

Quelle belle idée — un dîner d''anniversaire surprise pour les 60 ans de votre mari ! Nous serions absolument ravis de contribuer à rendre cette soirée inoubliable.

Le 12 septembre est disponible et nous pouvons vous proposer notre salle privée, qui accueille jusqu''à 50 convives et dispose de son propre bar privatif — idéal pour préserver la surprise jusqu''au dernier moment.

Voici ce que nous vous proposons :
- Cocktail d''accueil dès 19h00 (canapés inclus)
- Dîner trois services à partir de 20h00
- Installation DJ avec système audio intégré et piste de danse
- Cartons de menu personnalisés et décoration de table, si vous le souhaitez

Tarif pour 40 convives : à partir de 3 600 €, location de salle, service du dîner et coordination DJ inclus.

Un acompte de 30 % (1 080 €) est demandé pour confirmer la date. Nous pouvons également organiser une dégustation pour sélectionner les plats ensemble.

Souhaiteriez-vous visiter la salle ? Nous sommes disponibles la plupart des matinées cette semaine.

Bien cordialement,
L''équipe BW Event'
WHERE id = '80000000-0000-0000-0000-000000000004';

UPDATE agent_drafts SET draft_body =
'Madame Claes,

Merci de votre message. C''est toujours un plaisir de travailler avec Claes Events et nous sommes ravis de vous retrouver pour le Gala de Charité Annuel 2026.

Le 25 juillet est confirmé dans notre agenda. Voici un récapitulatif des dispositions :

- Convives : 200
- Disposition : Théâtre avec tables de dîner ; entrée tapis rouge dès 19h30
- Full AV : 2 écrans, micro sans fil, éclairage de scène (notre équipe AV se coordonnera directement avec votre prestataire)
- Régimes : 20 repas vegan, 5 sans gluten — tous clairement identifiés au service
- Code vestimentaire : Cravate noire

La presse et les photographes sont les bienvenus ; nous aménagerons un espace photo dans le hall d''entrée dès 19h00.

Votre acompte de 5 000 € a bien été reçu et enregistré. Le solde restant de 13 000 € sera facturé 14 jours avant la date de l''événement.

Nous vous contacterons à l''approche de la date pour la confirmation définitive du menu.

Bien cordialement,
L''équipe BW Event'
WHERE id = '80000000-0000-0000-0000-000000000005';

-- ── Agent instructions ────────────────────────────────────────────────────────

UPDATE agent_instructions SET
  title       = 'Collecter les informations clés de l''événement',
  instruction = 'Dans chaque première réponse à une nouvelle demande de réservation, demander systématiquement : (1) la date souhaitée, (2) le nombre estimé de convives, (3) le budget approximatif, et (4) le type d''événement (mariage, entreprise, anniversaire, etc.). Ne pas communiquer de tarif avant d''avoir obtenu ces quatre informations.'
WHERE id = '90000000-0000-0000-0000-000000000001';

UPDATE agent_instructions SET
  title       = 'Mentionner l''acompte requis',
  instruction = 'Toujours préciser qu''un acompte de 30 % est demandé pour confirmer une réservation. Lorsqu''un budget ou un devis a été abordé, calculer et indiquer le montant exact de l''acompte en euros.'
WHERE id = '90000000-0000-0000-0000-000000000002';

UPDATE agent_instructions SET
  title       = 'Signature et ton',
  instruction = 'Toujours signer les e-mails « L''équipe BW Event ». Adopter un ton chaleureux et professionnel — convivial sans être familier. S''adapter à la langue de l''expéditeur : si l''e-mail est rédigé en français, répondre intégralement en français ; si en néerlandais, répondre en néerlandais.'
WHERE id = '90000000-0000-0000-0000-000000000003';

UPDATE agent_instructions SET
  title       = 'Délai de préavis pour les grands groupes',
  instruction = 'Pour les événements de plus de 100 convives, informer le client qu''un délai minimum de 6 semaines est nécessaire pour la finalisation du menu et la planification du personnel. Signaler poliment si la date demandée est inférieure à ce délai.'
WHERE id = '90000000-0000-0000-0000-000000000004';

UPDATE agent_instructions SET
  title       = 'Prise en compte des régimes et allergies',
  instruction = 'Toujours accuser réception explicitement de tout régime alimentaire ou allergie mentionné par le client. Confirmer que la cuisine peut y répondre. Pour les allergies (noix, gluten, fruits de mer), préciser que les plats seront clairement identifiés et préparés avec le plus grand soin pour éviter toute contamination croisée.'
WHERE id = '90000000-0000-0000-0000-000000000005';

UPDATE agent_instructions SET
  title       = 'Proposer une visite des lieux',
  instruction = 'Pour les nouveaux clients ou les premières demandes, proposer une visite de la salle avant toute confirmation. Ne suggérer cette option que pour les événements avec un nombre estimé de convives de 30 ou plus. Garder la proposition brève — une phrase en fin de réponse.'
WHERE id = '90000000-0000-0000-0000-000000000006';
