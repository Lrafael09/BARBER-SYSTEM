-- Keep scheduled appointments conflict-protected while allowing multiple people in the walk-in queue.
DROP TRIGGER IF EXISTS appointments_prevent_overlap_insert;
DROP TRIGGER IF EXISTS appointments_prevent_overlap_update;

CREATE TRIGGER appointments_prevent_overlap_insert
BEFORE INSERT ON appointments
WHEN NEW.status = 'scheduled' AND NEW.booking_type = 'appointment'
BEGIN
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM appointments a
    WHERE a.barbershop_id = NEW.barbershop_id
      AND a.barber_id = NEW.barber_id
      AND a.status = 'scheduled'
      AND a.booking_type = 'appointment'
      AND a.starts_at < NEW.ends_at
      AND a.ends_at > NEW.starts_at
  ) THEN RAISE(ABORT, 'appointment_conflict') END;

  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM time_blocks b
    WHERE b.barbershop_id = NEW.barbershop_id
      AND (b.barber_id IS NULL OR b.barber_id = NEW.barber_id)
      AND b.starts_at < NEW.ends_at
      AND b.ends_at > NEW.starts_at
  ) THEN RAISE(ABORT, 'time_block_conflict') END;
END;

CREATE TRIGGER appointments_prevent_overlap_update
BEFORE UPDATE OF barbershop_id, barber_id, starts_at, ends_at, status ON appointments
WHEN NEW.status = 'scheduled' AND NEW.booking_type = 'appointment'
BEGIN
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM appointments a
    WHERE a.id <> NEW.id
      AND a.barbershop_id = NEW.barbershop_id
      AND a.barber_id = NEW.barber_id
      AND a.status = 'scheduled'
      AND a.booking_type = 'appointment'
      AND a.starts_at < NEW.ends_at
      AND a.ends_at > NEW.starts_at
  ) THEN RAISE(ABORT, 'appointment_conflict') END;

  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM time_blocks b
    WHERE b.barbershop_id = NEW.barbershop_id
      AND (b.barber_id IS NULL OR b.barber_id = NEW.barber_id)
      AND b.starts_at < NEW.ends_at
      AND b.ends_at > NEW.starts_at
  ) THEN RAISE(ABORT, 'time_block_conflict') END;
END;
