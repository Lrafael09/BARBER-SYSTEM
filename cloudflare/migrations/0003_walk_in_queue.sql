-- Saturday walk-in queue support. Existing appointments remain normal bookings.
ALTER TABLE appointments ADD COLUMN booking_type TEXT NOT NULL DEFAULT 'appointment'
  CHECK (booking_type IN ('appointment', 'walk_in'));
ALTER TABLE appointments ADD COLUMN queue_number INTEGER;
CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_walkin_queue
  ON appointments (barbershop_id, substr(starts_at, 1, 10), queue_number)
  WHERE booking_type = 'walk_in';
