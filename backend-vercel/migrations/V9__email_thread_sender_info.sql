-- V9: Let an email thread identify its sender before a banquet exists.
--
-- Until now, an inbound email's "contact" could only be resolved through
-- its linked banquet (banquet_id -> contact_id). That's backwards for a
-- fresh enquiry: most incoming emails have no banquet yet. This adds an
-- optional direct link to an existing contact, plus free-text fallback
-- fields for a sender who isn't a contact yet.

ALTER TABLE email_threads
  ADD COLUMN contact_id   UUID REFERENCES contacts(id) ON DELETE SET NULL,
  ADD COLUMN sender_name  VARCHAR(255),
  ADD COLUMN sender_email VARCHAR(255);

CREATE INDEX idx_email_threads_contact ON email_threads(contact_id);
