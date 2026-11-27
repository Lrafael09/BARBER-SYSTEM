import sqlite3
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class CloudflareBookingSchemaTests(unittest.TestCase):
    def setUp(self):
        self.db = sqlite3.connect(":memory:")
        self.db.execute("PRAGMA foreign_keys = ON")
        self.db.executescript((ROOT / "cloudflare" / "schema.sql").read_text(encoding="utf-8"))
        self.db.executescript((ROOT / "cloudflare" / "auth-sessions.sql").read_text(encoding="utf-8"))
        self.db.executescript((ROOT / "cloudflare" / "public-booking.sql").read_text(encoding="utf-8"))

        self.shop_id = self.db.execute(
            "INSERT INTO barbershops(name,slug) VALUES('Barbearia Teste','barbearia-teste')"
        ).lastrowid
        self.barber_id = self.db.execute(
            "INSERT INTO users(barbershop_id,name,role,can_serve) VALUES(?, 'Profissional Um','barber',1)",
            (self.shop_id,),
        ).lastrowid
        self.other_barber_id = self.db.execute(
            "INSERT INTO users(barbershop_id,name,role,can_serve) VALUES(?, 'Profissional Dois','barber',1)",
            (self.shop_id,),
        ).lastrowid
        self.customer_id = self.db.execute(
            "INSERT INTO customers(barbershop_id,name,phone,phone_last4) VALUES(?,?,?,?)",
            (self.shop_id, "Cliente Teste", "11987654321", "4321"),
        ).lastrowid
        self.service_id = self.db.execute(
            "INSERT INTO services(barbershop_id,name,price_cents,duration_minutes) VALUES(?,?,?,?)",
            (self.shop_id, "Corte", 4000, 30),
        ).lastrowid
        self.db.commit()

    def tearDown(self):
        self.db.close()

    def add_appointment(self, barber_id, starts_at, ends_at):
        return self.db.execute(
            """INSERT INTO appointments(
                   barbershop_id,customer_id,service_id,barber_id,service_name,
                   price_cents,duration_minutes,starts_at,ends_at,status
               ) VALUES(?,?,?,?,?,?,?,?,?,'scheduled')""",
            (self.shop_id, self.customer_id, self.service_id, barber_id, "Corte",
             4000, 30, starts_at, ends_at),
        )

    def test_blocks_overlapping_appointments_for_same_professional(self):
        self.add_appointment(self.barber_id, "2026-11-30T09:00:00", "2026-11-30T09:30:00")
        with self.assertRaisesRegex(sqlite3.IntegrityError, "appointment_conflict"):
            self.add_appointment(self.barber_id, "2026-11-30T09:15:00", "2026-11-30T09:45:00")

    def test_allows_same_time_for_different_professionals(self):
        self.add_appointment(self.barber_id, "2026-11-30T09:00:00", "2026-11-30T09:30:00")
        self.add_appointment(self.other_barber_id, "2026-11-30T09:00:00", "2026-11-30T09:30:00")

    def test_blocks_appointments_during_shop_or_barber_time_blocks(self):
        self.db.execute(
            """INSERT INTO time_blocks(
                   barbershop_id,barber_id,starts_at,ends_at,reason,created_by
               ) VALUES(?,?,?,?,?,?)""",
            (self.shop_id, self.barber_id, "2026-11-30T09:00:00",
             "2026-11-30T10:00:00", "Bloqueio", self.barber_id),
        )
        with self.assertRaisesRegex(sqlite3.IntegrityError, "time_block_conflict"):
            self.add_appointment(self.barber_id, "2026-11-30T09:15:00", "2026-11-30T09:45:00")

    def test_update_cannot_create_an_overlap(self):
        first = self.add_appointment(
            self.barber_id, "2026-11-30T09:00:00", "2026-11-30T09:30:00"
        )
        second = self.add_appointment(
            self.barber_id, "2026-11-30T10:00:00", "2026-11-30T10:30:00"
        )
        self.db.commit()
        with self.assertRaisesRegex(sqlite3.IntegrityError, "appointment_conflict"):
            self.db.execute(
                "UPDATE appointments SET starts_at=?,ends_at=? WHERE id=?",
                ("2026-11-30T09:15:00", "2026-11-30T09:45:00", second.lastrowid),
            )


if __name__ == "__main__":
    unittest.main()
