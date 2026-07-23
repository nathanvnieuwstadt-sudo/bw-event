-- V3: Assign DEV user to the demo restaurant so all routes work in local dev
UPDATE users
SET restaurant_id = '00000000-0000-0000-0000-000000000001'
WHERE email = 'dev@bwevent.local';
