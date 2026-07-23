-- V6: Event types, OWNER user, near-term kitchen banquets, and field values

-- ── Users ────────────────────────────────────────────────────────────────────

-- OWNER user (password: devpassword)
INSERT INTO users (id, restaurant_id, email, password_hash, role)
VALUES (
    '00000000-0000-0000-0000-000000000014',
    '00000000-0000-0000-0000-000000000001',
    'owner@bwevent.local',
    '$2y$12$/B/ica1dtp75fz6qVUL.e.GjGURmk9Pf.Gl0RlGzqMkLK.Gh.o7mS',
    'OWNER'
);

-- ── Event types ──────────────────────────────────────────────────────────────

INSERT INTO event_types (id, restaurant_id, name, description) VALUES
  ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
   'Wedding', 'Wedding receptions and ceremonies'),
  ('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
   'Corporate Dinner', 'Business dinners, team events, and client entertainment'),
  ('40000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
   'Birthday Party', 'Private birthday celebrations'),
  ('40000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001',
   'Gala / Charity', 'Formal galas, charity fundraisers, and black-tie events');

-- ── Event type fields ─────────────────────────────────────────────────────────

-- Wedding fields
INSERT INTO event_type_fields (id, event_type_id, field_key, field_label, field_type, options, required, display_order) VALUES
  ('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001',
   'couple_names', 'Couple names', 'TEXT', NULL, TRUE, 0),
  ('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001',
   'dress_code', 'Dress code', 'SELECT', 'Black tie,Formal,Smart casual,Casual', FALSE, 1),
  ('50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001',
   'ceremony_included', 'Ceremony on-site', 'BOOLEAN', NULL, FALSE, 2),
  ('50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000001',
   'cake_delivery_time', 'Wedding cake delivery time', 'TEXT', NULL, FALSE, 3);

-- Corporate Dinner fields
INSERT INTO event_type_fields (id, event_type_id, field_key, field_label, field_type, options, required, display_order) VALUES
  ('50000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000002',
   'company_name', 'Company name', 'TEXT', NULL, TRUE, 0),
  ('50000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000002',
   'invoice_required', 'Invoice to company', 'BOOLEAN', NULL, FALSE, 1),
  ('50000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000002',
   'seating_arrangement', 'Seating arrangement', 'SELECT', 'Boardroom,Theatre,Banquet rounds,U-shape,Cabaret', FALSE, 2);

-- Birthday Party fields
INSERT INTO event_type_fields (id, event_type_id, field_key, field_label, field_type, options, required, display_order) VALUES
  ('50000000-0000-0000-0000-000000000008', '40000000-0000-0000-0000-000000000003',
   'age_milestone', 'Age milestone', 'NUMBER', NULL, FALSE, 0),
  ('50000000-0000-0000-0000-000000000009', '40000000-0000-0000-0000-000000000003',
   'cake_included', 'Cake provided by venue', 'BOOLEAN', NULL, FALSE, 1),
  ('50000000-0000-0000-0000-000000000010', '40000000-0000-0000-0000-000000000003',
   'music_preference', 'Music preference', 'SELECT', 'DJ,Live band,Playlist only,None', FALSE, 2);

-- Gala / Charity fields
INSERT INTO event_type_fields (id, event_type_id, field_key, field_label, field_type, options, required, display_order) VALUES
  ('50000000-0000-0000-0000-000000000011', '40000000-0000-0000-0000-000000000004',
   'charity_name', 'Beneficiary charity', 'TEXT', NULL, FALSE, 0),
  ('50000000-0000-0000-0000-000000000012', '40000000-0000-0000-0000-000000000004',
   'red_carpet', 'Red carpet entrance', 'BOOLEAN', NULL, FALSE, 1),
  ('50000000-0000-0000-0000-000000000013', '40000000-0000-0000-0000-000000000004',
   'dress_code', 'Dress code', 'SELECT', 'Black tie,White tie,Formal,Smart casual', TRUE, 2),
  ('50000000-0000-0000-0000-000000000014', '40000000-0000-0000-0000-000000000004',
   'press_expected', 'Press / photographers expected', 'BOOLEAN', NULL, FALSE, 3);

-- ── Link existing banquets to event types ────────────────────────────────────

UPDATE banquets SET event_type_id = '40000000-0000-0000-0000-000000000001'
  WHERE id = '20000000-0000-0000-0000-000000000001'; -- wedding

UPDATE banquets SET event_type_id = '40000000-0000-0000-0000-000000000002'
  WHERE id = '20000000-0000-0000-0000-000000000002'; -- corporate KBC dinner

UPDATE banquets SET event_type_id = '40000000-0000-0000-0000-000000000003'
  WHERE id = '20000000-0000-0000-0000-000000000003'; -- birthday party (draft)

UPDATE banquets SET event_type_id = '40000000-0000-0000-0000-000000000004'
  WHERE id = '20000000-0000-0000-0000-000000000004'; -- gala dinner

-- ── Field values for linked banquets ─────────────────────────────────────────

-- Wedding (b001)
INSERT INTO banquet_field_values (id, banquet_id, field_id, value) VALUES
  ('60000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001',
   '50000000-0000-0000-0000-000000000001', 'Sophie & Luca Martens'),
  ('60000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001',
   '50000000-0000-0000-0000-000000000002', 'Black tie'),
  ('60000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001',
   '50000000-0000-0000-0000-000000000003', 'false'),
  ('60000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001',
   '50000000-0000-0000-0000-000000000004', '20:30');

-- Corporate KBC dinner (b002)
INSERT INTO banquet_field_values (id, banquet_id, field_id, value) VALUES
  ('60000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002',
   '50000000-0000-0000-0000-000000000005', 'KBC Bank'),
  ('60000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000002',
   '50000000-0000-0000-0000-000000000006', 'true'),
  ('60000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000002',
   '50000000-0000-0000-0000-000000000007', 'Boardroom');

-- Birthday party draft (b003)
INSERT INTO banquet_field_values (id, banquet_id, field_id, value) VALUES
  ('60000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000003',
   '50000000-0000-0000-0000-000000000008', '50'),
  ('60000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000003',
   '50000000-0000-0000-0000-000000000009', 'false'),
  ('60000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000003',
   '50000000-0000-0000-0000-000000000010', 'DJ');

-- Gala dinner (b004)
INSERT INTO banquet_field_values (id, banquet_id, field_id, value) VALUES
  ('60000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000004',
   '50000000-0000-0000-0000-000000000011', 'Rode Neuzen Dag'),
  ('60000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000004',
   '50000000-0000-0000-0000-000000000012', 'true'),
  ('60000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000004',
   '50000000-0000-0000-0000-000000000013', 'Black tie'),
  ('60000000-0000-0000-0000-000000000014', '20000000-0000-0000-0000-000000000004',
   '50000000-0000-0000-0000-000000000014', 'true');

-- ── Additional contacts ───────────────────────────────────────────────────────

INSERT INTO contacts (id, restaurant_id, name, email, phone, organization) VALUES
  ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001',
   'Jan De Smedt', 'jan.desmedt@telenet.be', '+32 473 11 22 33', NULL),
  ('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001',
   'Isabelle Peeters', 'i.peeters@accenture.com', '+32 496 44 55 66', 'Accenture Belgium'),
  ('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001',
   'Marc Janssen', 'marc.janssen@skynet.be', '+32 487 77 88 99', NULL);

-- ── Near-term banquets for Kitchen View (within 14 days of 2026-06-15) ───────

INSERT INTO banquets (id, restaurant_id, contact_id, status, source, event_date, start_time, end_time,
  headcount, budget, room_setup, dietary_restrictions, av_needs, deposit_paid, deposit_amount, notes,
  created_by, event_type_id)
VALUES
  -- 2026-06-17: cocktail reception
  ('20000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000006',
   'CONFIRMED', 'MANUAL',
   '2026-06-17', '17:00', '21:00',
   30, 2200.00, 'Cocktail standing',
   NULL, 'Background music system',
   TRUE, 500.00,
   'Informal drinks reception for De Smedt family 25th anniversary.',
   '00000000-0000-0000-0000-000000000012',
   NULL),

  -- 2026-06-21: corporate lunch
  ('20000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000007',
   'CONFIRMED', 'EMAIL',
   '2026-06-21', '12:00', '15:00',
   18, 1400.00, 'Boardroom style',
   'Vegetarian x 3, lactose-free x 1',
   'HDMI display for presentation',
   TRUE, 400.00,
   'Accenture client lunch. Presentation during starter course.',
   '00000000-0000-0000-0000-000000000011',
   '40000000-0000-0000-0000-000000000002'),

  -- 2026-06-26: private dinner
  ('20000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000008',
   'CONFIRMED', 'MANUAL',
   '2026-06-26', '19:00', '23:00',
   24, 1800.00, 'Banquet rounds',
   'Gluten-free x 2',
   NULL,
   FALSE, NULL,
   'Rehearsal dinner for Janssen family. Deposit outstanding.',
   '00000000-0000-0000-0000-000000000012',
   NULL);

-- ── Menu items for near-term banquets ────────────────────────────────────────

INSERT INTO menu_items (id, restaurant_id, banquet_id, dish_name, quantity, notes) VALUES
  -- Cocktail reception (b007)
  ('30000000-0000-0000-0000-000000000017','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000007','Smoked salmon blinis',90,NULL),
  ('30000000-0000-0000-0000-000000000018','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000007','Mini bruschetta trio',90,NULL),
  ('30000000-0000-0000-0000-000000000019','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000007','Prawn cocktail cups',60,NULL),
  ('30000000-0000-0000-0000-000000000020','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000007','Cheese & charcuterie board',6,'Per table'),

  -- Corporate lunch (b008)
  ('30000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000008','Caesar salad',18,NULL),
  ('30000000-0000-0000-0000-000000000022','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000008','Pan-seared chicken supreme',15,NULL),
  ('30000000-0000-0000-0000-000000000023','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000008','Spinach & ricotta tart (V)',3,'Vegetarian, lactose-free option'),
  ('30000000-0000-0000-0000-000000000024','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000008','Panna cotta, berry coulis',18,NULL),

  -- Private dinner (b009)
  ('30000000-0000-0000-0000-000000000025','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000009','Watercress soup',24,NULL),
  ('30000000-0000-0000-0000-000000000026','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000009','Slow-roasted lamb shoulder, rosemary jus',22,NULL),
  ('30000000-0000-0000-0000-000000000027','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000009','GF pasta primavera',2,'Gluten-free'),
  ('30000000-0000-0000-0000-000000000028','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000009','Lemon tart, crème fraîche',24,NULL);

-- ── Field values for near-term confirmed corporate lunch ─────────────────────

INSERT INTO banquet_field_values (id, banquet_id, field_id, value) VALUES
  ('60000000-0000-0000-0000-000000000015', '20000000-0000-0000-0000-000000000008',
   '50000000-0000-0000-0000-000000000005', 'Accenture Belgium'),
  ('60000000-0000-0000-0000-000000000016', '20000000-0000-0000-0000-000000000008',
   '50000000-0000-0000-0000-000000000006', 'true'),
  ('60000000-0000-0000-0000-000000000017', '20000000-0000-0000-0000-000000000008',
   '50000000-0000-0000-0000-000000000007', 'Boardroom');
