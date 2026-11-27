"""Testes básicos de integração do BARBER-SYSTEM."""

import tempfile
import unittest
from pathlib import Path

from app import create_app


class BarberSystemSmokeTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        database_path = str(Path(self.temp_dir.name) / "test.db")
        self.app = create_app({
            "TESTING": True,
            "SECRET_KEY": "chave-segura-apenas-para-testes",
            "DATABASE": database_path,
            "SESSION_COOKIE_SECURE": False
        })
        self.client = self.app.test_client()

    def tearDown(self):
        self.temp_dir.cleanup()

    def register_and_login_owner(self):
        response = self.client.post("/auth/register", json={
            "shop_name": "Barbearia Teste",
            "owner_name": "Proprietário Teste",
            "email": "dono@example.com",
            "password": "senha-forte-123",
            "whatsapp": "5511999999999"
        })
        self.assertEqual(response.status_code, 201)

        response = self.client.post("/auth/login", json={
            "email": "dono@example.com",
            "password": "senha-forte-123"
        })
        self.assertEqual(response.status_code, 200)
        return response.get_json()["barbershop"]["slug"]

    def test_health_endpoint(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["database"], "connected")

    def test_owner_registration_login_and_dashboard(self):
        self.register_and_login_owner()
        response = self.client.get("/admin/dashboard")
        self.assertEqual(response.status_code, 200)
        self.assertIn("today", response.get_json())

    def test_registration_is_hidden_after_first_owner(self):
        self.assertTrue(self.client.get("/auth/registration-status").get_json()["available"])
        self.register_and_login_owner()
        self.assertFalse(self.client.get("/auth/registration-status").get_json()["available"])
        second = self.client.post("/auth/register", json={
            "shop_name": "Outra Barbearia",
            "owner_name": "Outro Dono",
            "email": "outro@example.com",
            "password": "senha-forte-456"
        })
        self.assertEqual(second.status_code, 409)

    def test_registration_can_be_disabled_in_code(self):
        self.app.config["OWNER_REGISTRATION_ENABLED"] = False
        status = self.client.get("/auth/registration-status")
        self.assertFalse(status.get_json()["available"])
        response = self.client.post("/auth/register", json={
            "shop_name": "Barbearia Bloqueada",
            "owner_name": "Dono",
            "email": "bloqueado@example.com",
            "password": "senha-forte-789"
        })
        self.assertEqual(response.status_code, 403)

    def test_owner_can_create_service_and_barber(self):
        self.register_and_login_owner()
        service = self.client.post("/admin/services", json={
            "name": "Corte", "description": "Corte tradicional",
            "price": "35.00", "duration_minutes": 30
        })
        self.assertEqual(service.status_code, 201)
        barber = self.client.post("/admin/barbers", json={
            "name": "Profissional Teste", "pin": "1234"
        })
        self.assertEqual(barber.status_code, 201)
        self.assertIn("id", barber.get_json()["barber"])

    def test_private_panels_reject_anonymous_access(self):
        self.assertEqual(self.client.get("/admin/dashboard").status_code, 401)
        self.assertEqual(self.client.get("/barber/me").status_code, 401)

    def test_unknown_public_barbershop_returns_404(self):
        response = self.client.get("/b/barbearia-inexistente/book")
        self.assertEqual(response.status_code, 404)


if __name__ == "__main__":
    unittest.main()
