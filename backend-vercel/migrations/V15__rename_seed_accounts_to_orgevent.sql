-- Renames the @bwevent.local test/dev seed accounts to @orgevent.local,
-- matching the app's new name. These are the 5 accounts shown on the
-- login page's "Comptes de test" panel — no real customer data involved.

UPDATE users
SET email = replace(email, '@bwevent.local', '@orgevent.local')
WHERE email LIKE '%@bwevent.local';
