-- V2: Seed data for local development

-- Default restaurant for dev
INSERT INTO restaurants (id, name, agent_mode)
VALUES ('00000000-0000-0000-0000-000000000001', 'Demo Restaurant', 'APPROVAL');

-- DEV superadmin user
-- Password: devpassword  (bcrypt hash below)
INSERT INTO users (id, restaurant_id, email, password_hash, role)
VALUES (
    '00000000-0000-0000-0000-000000000010',
    NULL,
    'dev@bwevent.local',
    '$2y$12$/B/ica1dtp75fz6qVUL.e.GjGURmk9Pf.Gl0RlGzqMkLK.Gh.o7mS',
    'DEV'
);

-- GENERAL_MANAGER user for testing
-- Password: devpassword
INSERT INTO users (id, restaurant_id, email, password_hash, role)
VALUES (
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000001',
    'manager@bwevent.local',
    '$2y$12$/B/ica1dtp75fz6qVUL.e.GjGURmk9Pf.Gl0RlGzqMkLK.Gh.o7mS',
    'GENERAL_MANAGER'
);

-- FLOOR_MANAGER user for testing
-- Password: devpassword
INSERT INTO users (id, restaurant_id, email, password_hash, role)
VALUES (
    '00000000-0000-0000-0000-000000000012',
    '00000000-0000-0000-0000-000000000001',
    'floor@bwevent.local',
    '$2y$12$/B/ica1dtp75fz6qVUL.e.GjGURmk9Pf.Gl0RlGzqMkLK.Gh.o7mS',
    'FLOOR_MANAGER'
);

-- KITCHEN user for testing
-- Password: devpassword
INSERT INTO users (id, restaurant_id, email, password_hash, role)
VALUES (
    '00000000-0000-0000-0000-000000000013',
    '00000000-0000-0000-0000-000000000001',
    'kitchen@bwevent.local',
    '$2y$12$/B/ica1dtp75fz6qVUL.e.GjGURmk9Pf.Gl0RlGzqMkLK.Gh.o7mS',
    'KITCHEN'
);
