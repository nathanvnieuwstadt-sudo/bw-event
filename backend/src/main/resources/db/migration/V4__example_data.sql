-- V4: Example data for local development

-- Contacts
INSERT INTO contacts (id, restaurant_id, name, email, phone, organization) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
   'Sophie Martens',    'sophie.martens@outlook.be',    '+32 478 12 34 56', 'Martens & Co'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
   'Thomas Devos',      'thomas.devos@gmail.com',       '+32 495 65 43 21', NULL),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
   'Lena Claes',        'lena.claes@claes-events.be',   '+32 472 99 00 11', 'Claes Events'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001',
   'Pieter Van den Berg','p.vandenberg@kbc.be',          '+32 489 55 66 77', 'KBC Bank'),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001',
   'Nathalie Wouters',  'nwouters@wouters-family.be',   '+32 476 33 44 55', NULL);

-- Banquets
INSERT INTO banquets (id, restaurant_id, contact_id, status, source, event_date, start_time, end_time,
  headcount, budget, room_setup, dietary_restrictions, av_needs, deposit_paid, deposit_amount, notes, created_by)
VALUES
  -- Confirmed: wedding reception next month
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000001',
   'CONFIRMED', 'MANUAL',
   '2026-07-12', '18:00', '23:30',
   120, 8500.00, 'Banquet rounds',
   'Vegetarian option required for 15 guests, 2 nut allergies',
   'Microphone + PA, slideshow screen',
   TRUE, 2000.00,
   'Bride requests rose centerpieces on all tables. Cake arrives at 20:30.',
   '00000000-0000-0000-0000-000000000012'),

  -- Confirmed: corporate dinner this week
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000004',
   'CONFIRMED', 'EMAIL',
   '2026-06-18', '19:00', '22:00',
   45, 3200.00, 'Boardroom style',
   'Halal meals for 8 guests',
   'Projector + laser pointer',
   TRUE, 800.00,
   'KBC team building evening. Invoice to head office.',
   '00000000-0000-0000-0000-000000000011'),

  -- Draft: birthday party
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000002',
   'DRAFT', 'MANUAL',
   '2026-08-02', '20:00', '01:00',
   60, NULL, 'Cocktail standing',
   NULL, NULL,
   FALSE, NULL,
   '50th birthday. Guest prefers DJ music over live band.',
   '00000000-0000-0000-0000-000000000012'),

  -- Confirmed: gala dinner next month
  ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000003',
   'CONFIRMED', 'EMAIL',
   '2026-07-25', '19:30', '00:00',
   200, 18000.00, 'Theatre with dinner tables',
   'Vegan option x 20, gluten-free x 5',
   'Full AV: 2 screens, wireless mic, stage lighting',
   TRUE, 5000.00,
   'Annual charity gala. Red carpet entrance. Press photographers expected.',
   '00000000-0000-0000-0000-000000000011'),

  -- Draft: family reunion
  ('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000005',
   'DRAFT', 'MANUAL',
   '2026-09-05', '13:00', '18:00',
   35, 1800.00, 'Family style long tables',
   'No shellfish (allergy)',
   NULL,
   FALSE, NULL,
   'Informal Sunday afternoon lunch. Children attending.',
   '00000000-0000-0000-0000-000000000012'),

  -- Cancelled
  ('20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000001',
   'CANCELLED', 'MANUAL',
   '2026-06-28', '18:00', '22:00',
   80, 4000.00, 'Banquet rounds',
   NULL, NULL,
   FALSE, NULL,
   'Cancelled by client on 2026-06-01. Deposit not collected.',
   '00000000-0000-0000-0000-000000000011');

-- Menu items
INSERT INTO menu_items (id, restaurant_id, banquet_id, dish_name, quantity, notes) VALUES
  -- Wedding (b001)
  ('30000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','Tomato velouté with basil oil',120,NULL),
  ('30000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','Beef tenderloin, truffle jus',105,'Medium rare'),
  ('30000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','Wild mushroom risotto (V)',15,'Vegetarian'),
  ('30000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','Chocolate fondant, vanilla ice cream',120,NULL),

  -- Corporate dinner (b002)
  ('30000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','Burrata, heirloom tomato',45,NULL),
  ('30000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','Grilled sea bass, saffron beurre blanc',37,NULL),
  ('30000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','Halal lamb rack, harissa',8,'Halal'),
  ('30000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','Crème brûlée',45,NULL),

  -- Gala dinner (b004)
  ('30000000-0000-0000-0000-000000000009','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000004','Lobster bisque',200,NULL),
  ('30000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000004','Duck confit, cherry reduction',175,NULL),
  ('30000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000004','Roasted cauliflower steak (VE)',20,'Vegan'),
  ('30000000-0000-0000-0000-000000000012','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000004','Gluten-free almond tart',5,'GF'),
  ('30000000-0000-0000-0000-000000000013','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000004','Opera cake',175,NULL),

  -- Family reunion (b005)
  ('30000000-0000-0000-0000-000000000014','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000005','Soup of the day',35,NULL),
  ('30000000-0000-0000-0000-000000000015','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000005','Roast chicken, roasted potatoes',35,NULL),
  ('30000000-0000-0000-0000-000000000016','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000005','Seasonal fruit salad',35,NULL);
