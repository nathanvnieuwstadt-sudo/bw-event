-- V7: Agent inbox seed data (email threads + drafts) and agent instructions

-- ── Extend email_threads with incoming message body ───────────────────────────

ALTER TABLE email_threads ADD COLUMN last_message_body TEXT;

-- ── Agent instructions table ──────────────────────────────────────────────────

CREATE TABLE agent_instructions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id   UUID         NOT NULL,
    title           VARCHAR(255) NOT NULL,
    instruction     TEXT         NOT NULL,
    enabled         BOOLEAN      NOT NULL DEFAULT TRUE,
    display_order   INTEGER      NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_instructions_restaurant ON agent_instructions(restaurant_id, display_order);

-- ── Seed email threads ────────────────────────────────────────────────────────

INSERT INTO email_threads (id, restaurant_id, banquet_id, gmail_thread_id, subject, last_message_at, last_message_body) VALUES

  ('70000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
   NULL, 'thread_001',
   'Wedding reception enquiry — August 30th',
   '2026-06-14 10:23:00+00',
   'Hi,

My name is Eva Storms and I am getting married on August 30th, 2026. We are looking for a venue for our wedding reception dinner — approximately 85 guests.

We would need the room from 18:00 to midnight, and we require a vegetarian option for about 10 guests. One guest also has a severe nut allergy.

Could you please let us know about availability and pricing?

Kind regards,
Eva Storms'),

  ('70000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000002', 'thread_002',
   'Re: KBC Corporate dinner — June 18th',
   '2026-06-10 14:45:00+00',
   'Hello,

This is a follow-up on the confirmed booking for our team event on June 18th. We would like to reconfirm the headcount: 45 guests, of which 8 require halal meals.

Could you also confirm the invoice will be addressed to KBC Bank NV, Havenlaan 2, 1080 Brussels?

Thank you,
Pieter Van den Berg'),

  ('70000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
   NULL, 'thread_003',
   'Birthday party — 60th, September 12th',
   '2026-06-13 09:15:00+00',
   'Good morning,

I would like to organise a surprise 60th birthday dinner for my husband on Saturday September 12th, 2026. We expect around 40 guests.

We would prefer a private room if available, and we would love a cocktail hour from 19:00 followed by a sit-down dinner at 20:00. Could you also accommodate a DJ?

Please let me know what is possible and the cost.

Warm regards,
Hélène Dubois'),

  ('70000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000004', 'thread_004',
   'Annual Charity Gala 2026 — Claes Events',
   '2026-06-08 16:30:00+00',
   'Dear BW Event,

This is Lena Claes from Claes Events. We are planning our annual charity gala on July 25th for approximately 200 guests. This is a black tie event with a red carpet entrance.

We require full AV support including two screens, wireless microphone, and stage lighting. We also need 20 vegan meals and 5 gluten-free options.

We have worked with you before and look forward to confirming the details.

Best,
Lena Claes
Claes Events');

-- ── Seed agent drafts ─────────────────────────────────────────────────────────

-- Thread 1 — wedding inquiry: PENDING (awaiting approval)
INSERT INTO agent_drafts (id, restaurant_id, email_thread_id, banquet_id, draft_body, status)
VALUES (
  '80000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '70000000-0000-0000-0000-000000000001',
  NULL,
  'Dear Ms. Storms,

Thank you for your enquiry regarding your wedding reception on August 30th, 2026.

We are delighted to confirm that we have availability for this date. Our main banquet hall comfortably accommodates up to 120 guests and would be a beautiful setting for your special evening.

For a reception of 85 guests from 18:00 to midnight, our indicative pricing is €7,200 (excluding beverages and service charge). This includes:
- Full room hire
- Three-course dinner with coffee
- Dedicated event coordinator
- Table linens, centrepieces, and room setup

We absolutely cater for vegetarian guests and are very well-equipped to manage nut allergies — our kitchen team will flag all dishes accordingly and ensure a fully safe experience for your guest.

A deposit of 30% (€2,160) would be required to secure your booking.

Would you be available for a site visit later this week? We would love to show you the space.

Warm regards,
The BW Event Team',
  'PENDING'
);

-- Thread 2 — KBC follow-up: SENT (historical)
INSERT INTO agent_drafts (id, restaurant_id, email_thread_id, banquet_id, draft_body, status, reviewed_by, reviewed_at)
VALUES (
  '80000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  '70000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000002',
  'Dear Mr. Van den Berg,

Thank you for your email. We are pleased to confirm the following details for your booking on June 18th:

- Headcount: 45 guests
- Halal meals: 8 (clearly labelled and prepared separately by our kitchen)
- Room setup: Boardroom style, as agreed
- Start time: 19:00 — End time: 22:00

We will address the invoice to:
KBC Bank NV
Havenlaan 2
1080 Brussels

Please note that the VAT number on file is BE 0462.920.226. Should this need updating, kindly let us know before the event.

We look forward to welcoming your team on the 18th.

Kind regards,
The BW Event Team',
  'SENT',
  '00000000-0000-0000-0000-000000000011',
  '2026-06-10 15:12:00+00'
);

-- Thread 3 — birthday party: REJECTED first draft + new PENDING draft
INSERT INTO agent_drafts (id, restaurant_id, email_thread_id, banquet_id, draft_body, status, reviewed_by, reviewed_at)
VALUES (
  '80000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  '70000000-0000-0000-0000-000000000003',
  NULL,
  'Dear Ms. Dubois,

Thank you for reaching out. We would be happy to host your husband''s 60th birthday celebration on September 12th, 2026.

We can accommodate 40 guests with a cocktail hour from 19:00 and sit-down dinner at 20:00. Our private dining room includes its own bar area.

A DJ setup is possible with our built-in sound system.

Pricing for this event starts from €3,200. A 30% deposit (€960) secures the date.

Kind regards,
The BW Event Team',
  'REJECTED',
  '00000000-0000-0000-0000-000000000012',
  '2026-06-13 11:30:00+00'
);

INSERT INTO agent_drafts (id, restaurant_id, email_thread_id, banquet_id, draft_body, status)
VALUES (
  '80000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000001',
  '70000000-0000-0000-0000-000000000003',
  NULL,
  'Dear Hélène,

What a wonderful idea — a surprise 60th birthday dinner for your husband! We would be absolutely delighted to help make it a truly special evening.

September 12th is available and we can offer you our private dining room, which seats up to 50 guests and has its own private bar — ideal for keeping the surprise until the last moment.

Here is what we can offer:
- Cocktail reception from 19:00 (selection of canapés included)
- Three-course sit-down dinner from 20:00
- DJ setup with our integrated sound system and dance floor
- Personalised menu cards and table decorations, should you wish

Package pricing for 40 guests: from €3,600, including full room hire, dinner service, and DJ coordination.

A 30% deposit (€1,080) is required to confirm the date. We can also arrange a tasting session for the menu if you would like to select the dishes together.

Would you like to schedule a visit to see the space? We are available most mornings this week.

Warm regards,
The BW Event Team',
  'PENDING'
);

-- Thread 4 — gala: APPROVED
INSERT INTO agent_drafts (id, restaurant_id, email_thread_id, banquet_id, draft_body, status, reviewed_by, reviewed_at)
VALUES (
  '80000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000001',
  '70000000-0000-0000-0000-000000000004',
  '20000000-0000-0000-0000-000000000004',
  'Dear Ms. Claes,

Thank you for your message. It is always a pleasure to work with Claes Events and we are delighted you are returning for the 2026 Annual Charity Gala.

July 25th is confirmed in our calendar. Here is a summary of the arrangements:

- Guests: 200
- Room setup: Theatre with dinner tables; red carpet entrance from 19:30
- Full AV: 2 screens, wireless microphone, stage lighting (our AV team will coordinate directly with your production company)
- Dietary: 20 vegan meals, 5 gluten-free — all clearly labelled at service
- Dress code: Black tie

Press and photographers are welcome; we will designate a photo area in the entrance foyer and ensure the space is ready from 19:00.

Your deposit of €5,000 has been received and recorded. The remaining balance of €13,000 will be invoiced 14 days before the event date.

We will be in touch closer to the date for final menu confirmation.

With kind regards,
The BW Event Team',
  'APPROVED',
  '00000000-0000-0000-0000-000000000011',
  '2026-06-08 17:45:00+00'
);

-- ── Seed agent instructions ───────────────────────────────────────────────────

INSERT INTO agent_instructions (id, restaurant_id, title, instruction, enabled, display_order) VALUES
  ('90000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
   'Collect key event details',
   'In every first reply to a new booking inquiry, always ask for: (1) preferred event date, (2) estimated headcount, (3) approximate budget, and (4) type of event (wedding, corporate, birthday, etc.). Do not quote pricing until all four are known.',
   TRUE, 0),

  ('90000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
   'Mention deposit requirement',
   'Always mention that a 30% deposit is required to secure a booking. When a budget or quote has been discussed, calculate and state the exact deposit amount in euros.',
   TRUE, 1),

  ('90000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
   'Signature and tone',
   'Always sign emails as "The BW Event Team". Use a warm, professional tone — friendly but not overly casual. Mirror the language of the sender: if they write in French, reply fully in French; if Dutch, reply in Dutch.',
   TRUE, 2),

  ('90000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001',
   'Large group notice period',
   'For events with more than 100 guests, inform the client that a minimum of 6 weeks notice is required for menu finalisation and staffing. Politely flag if their requested date is within this window.',
   TRUE, 3),

  ('90000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001',
   'Dietary and allergy acknowledgement',
   'Always explicitly acknowledge any dietary requirements or allergies mentioned by the client. Confirm that the kitchen can accommodate them. For allergies (nuts, gluten, shellfish), state that dishes will be clearly labelled and prepared with extra care to avoid cross-contamination.',
   TRUE, 4),

  ('90000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001',
   'Suggest a site visit',
   'For new clients or first-time inquiries, offer a site visit to view the venue before committing. Only suggest this for events with an estimated headcount of 30 or more. Keep the offer brief — one sentence at the end of the reply.',
   FALSE, 5);
