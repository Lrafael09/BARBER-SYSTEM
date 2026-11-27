"""Testes de integração do BARBER-SYSTEM: proprietário, cliente e colaborador."""

import tempfile
import unittest
from datetime import date, timedelta
from pathlib import Path

from app import create_app


class BarberSystemTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        database_path = str(Path(self.temp_dir.name) / "test.db")
        self.app = create_app({
            "TESTING": True,
            "SECRET_KEY": "chave-segura-apenas-para-testes",
            "DATABASE": database_path,
            "SESSION_COOKIE_SECURE": False,
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
            "whatsapp": "5511999999999",
        })
        self.assertEqual(response.status_code, 201, response.get_json())
        slug = response.get_json()["barbershop"]["slug"]
        response = self.client.post("/auth/login", json={
            "email": "dono@example.com",
            "password": "senha-forte-123",
        })
        self.assertEqual(response.status_code, 200, response.get_json())
        return slug

    def create_service(self):
        response = self.client.post("/admin/services", json={
            "name": "Corte",
            "description": "Corte tradicional",
            "price": "40.00",
            "duration_minutes": 30,
        })
        self.assertEqual(response.status_code, 201, response.get_json())
        return response.get_json()["service"]["id"]

    def create_schedule(self):
        days = [{
            "weekday": weekday,
            "is_open": True,
            "open_time": "08:00",
            "close_time": "18:00",
            "break_start": "12:00",
            "break_end": "13:00",
        } for weekday in range(7)]
        response = self.client.put("/admin/schedule", json={"days": days})
        self.assertEqual(response.status_code, 200, response.get_json())

    def next_monday(self):
        target = date.today() + timedelta(days=7)
        while target.weekday() != 0:
            target += timedelta(days=1)
        return target

    def test_health_and_pages(self):
        self.assertEqual(self.client.get("/health").status_code, 200)
        self.assertEqual(self.client.get("/admin/panel").status_code, 200)
        self.assertEqual(self.client.get("/barber/slug-inexistente").status_code, 404)

    def test_owner_registration_is_one_time_and_can_be_disabled(self):
        self.assertTrue(self.client.get("/auth/registration-status").get_json()["available"])
        self.register_and_login_owner()
        self.assertFalse(self.client.get("/auth/registration-status").get_json()["available"])
        second = self.client.post("/auth/register", json={
            "shop_name": "Outra Barbearia",
            "owner_name": "Outro Dono",
            "email": "outro@example.com",
            "password": "senha-forte-456",
        })
        self.assertEqual(second.status_code, 409)

        isolated = create_app({
            "TESTING": True,
            "SECRET_KEY": "outra-chave-segura",
            "DATABASE": str(Path(self.temp_dir.name) / "disabled.db"),
            "OWNER_REGISTRATION_ENABLED": False,
        })
        response = isolated.test_client().post("/auth/register", json={
            "shop_name": "Barbearia Bloqueada",
            "owner_name": "Dono",
            "email": "bloqueado@example.com",
            "password": "senha-forte-789",
        })
        self.assertEqual(response.status_code, 403)

    def test_full_customer_to_staff_to_finance_flow(self):
        slug = self.register_and_login_owner()
        service_id = self.create_service()
        self.create_schedule()

        first = self.client.post("/admin/barbers", json={"name": "Profissional Um", "pin": "1234"})
        second = self.client.post("/admin/barbers", json={"name": "Profissional Dois", "pin": "5678"})
        self.assertEqual(first.status_code, 201, first.get_json())
        self.assertEqual(second.status_code, 201, second.get_json())
        first_id = first.get_json()["barber"]["id"]
        second_id = second.get_json()["barber"]["id"]

        monday = self.next_monday()
        personal_days = []
        for weekday in range(7):
            personal_days.append({
                "weekday": weekday,
                "is_open": weekday == 0,
                "open_time": "09:00" if weekday == 0 else None,
                "close_time": "17:00" if weekday == 0 else None,
                "break_start": "12:00" if weekday == 0 else None,
                "break_end": "13:00" if weekday == 0 else None,
            })
        saved = self.client.put(f"/admin/staff/{first_id}/schedule", json={"days": personal_days})
        self.assertEqual(saved.status_code, 200, saved.get_json())

        catalog = self.client.get(f"/b/{slug}/catalog").get_json()
        self.assertEqual(len(catalog["services"]), 1)
        self.assertEqual({x["id"] for x in catalog["barbers"]}, {first_id, second_id})

        customer_a = self.client.post(f"/b/{slug}/customers", json={
            "name": "Cliente Um",
            "phone": "11987654321",
        })
        customer_b = self.client.post(f"/b/{slug}/customers", json={
            "name": "Cliente Dois",
            "phone": "11987654322",
        })
        self.assertEqual(customer_a.status_code, 201, customer_a.get_json())
        self.assertEqual(customer_b.status_code, 201, customer_b.get_json())
        customer_a_id = customer_a.get_json()["customer"]["id"]
        customer_b_id = customer_b.get_json()["customer"]["id"]

        availability = self.client.get(
            f"/b/{slug}/availability?service_id={service_id}&barber_id={first_id}&date={monday.isoformat()}"
        )
        self.assertEqual(availability.status_code, 200, availability.get_json())
        slots = availability.get_json()["slots"]
        self.assertIn("09:00", slots)
        self.assertNotIn("12:00", slots)

        booking_a = self.client.post(f"/b/{slug}/appointments", json={
            "customer_id": customer_a_id,
            "service_id": service_id,
            "barber_id": first_id,
            "starts_at": f"{monday.isoformat()}T09:00",
        })
        self.assertEqual(booking_a.status_code, 201, booking_a.get_json())

        # Outro profissional pode atender no mesmo horário sem compartilhar agenda.
        booking_b = self.client.post(f"/b/{slug}/appointments", json={
            "customer_id": customer_b_id,
            "service_id": service_id,
            "barber_id": second_id,
            "starts_at": f"{monday.isoformat()}T09:00",
        })
        self.assertEqual(booking_b.status_code, 201, booking_b.get_json())

        # O proprietário pode remover o expediente individual e voltar a herdar o geral.
        reset_schedule = self.client.delete(f"/admin/staff/{first_id}/schedule")
        self.assertEqual(reset_schedule.status_code, 200, reset_schedule.get_json())
        inherited_schedule = self.client.get(f"/admin/staff/{first_id}/schedule").get_json()
        self.assertTrue(inherited_schedule["uses_business_hours_when_unset"])

        # O link único lista profissionais e o PIN abre somente a agenda selecionada.
        staff = self.client.get(f"/barber/{slug}/staff")
        self.assertEqual(staff.status_code, 200, staff.get_json())
        self.assertEqual({x["id"] for x in staff.get_json()["staff"]}, {first_id, second_id})

        login = self.client.post(f"/barber/{slug}/login", json={
            "barber_id": first_id,
            "pin": "1234",
        })
        self.assertEqual(login.status_code, 200, login.get_json())
        own = self.client.get(f"/barber/appointments?date={monday.isoformat()}")
        self.assertEqual(own.status_code, 200, own.get_json())
        self.assertEqual([x["id"] for x in own.get_json()["appointments"]],
                         [booking_a.get_json()["appointment"]["id"]])

        completed = self.client.post(
            f"/barber/appointments/{booking_a.get_json()['appointment']['id']}/complete"
        )
        self.assertEqual(completed.status_code, 200, completed.get_json())

        # Volta à sessão do proprietário e confirma a entrada automática do atendimento.
        self.client.post("/barber/logout")
        self.client.post("/auth/login", json={
            "email": "dono@example.com",
            "password": "senha-forte-123",
        })
        entries_after_completion = self.client.get("/admin/finance/entries")
        self.assertEqual(entries_after_completion.status_code, 200, entries_after_completion.get_json())
        self.assertTrue(any(
            entry["entry_type"] == "income" and entry["appointment_id"] == booking_a.get_json()["appointment"]["id"]
            for entry in entries_after_completion.get_json()["entries"]
        ))

        finance = self.client.get("/admin/finance/summary?period=year")
        self.assertEqual(finance.status_code, 200, finance.get_json())

        goals = self.client.put("/admin/finance/goals", json={
            "daily": "200.00", "weekly": "1000.00", "monthly": "4000.00",
        })
        self.assertEqual(goals.status_code, 200, goals.get_json())

        expense = self.client.post("/admin/finance/entries", json={
            "entry_type": "expense",
            "description": "Aluguel",
            "category": "Estrutura",
            "amount": "500.00",
            "entry_date": date.today().isoformat(),
        })
        self.assertEqual(expense.status_code, 201, expense.get_json())

        summary = self.client.get("/admin/finance/summary?period=year").get_json()
        self.assertGreaterEqual(summary["expense_cents"], 50000)
        self.assertIn("daily", summary["goal_achieved"])

    def test_products_owner_provider_and_brand_settings(self):
        slug = self.register_and_login_owner()
        self.create_service()

        product = self.client.post("/admin/products", json={
            "name": "Pomada", "description": "Fixação forte", "price": "49.90",
        })
        self.assertEqual(product.status_code, 201, product.get_json())
        product_id = product.get_json()["product"]["id"]
        updated = self.client.patch(f"/admin/products/{product_id}", json={"price": "54.90"})
        self.assertEqual(updated.status_code, 200, updated.get_json())

        provider = self.client.patch("/admin/staff/owner", json={
            "can_serve": True, "pin": "9876",
        })
        self.assertEqual(provider.status_code, 200, provider.get_json())
        catalog = self.client.get(f"/b/{slug}/catalog").get_json()
        self.assertTrue(any(x["role"] == "owner" for x in catalog["barbers"]))

        settings = self.client.post("/admin/barbershop/settings", json={
            "name": "Barbearia Personalizada",
            "whatsapp": "5511999999999",
            "brand_color": "#55aa77",
            "theme": "light",
        })
        self.assertEqual(settings.status_code, 200, settings.get_json())
        public_page = self.client.get(f"/b/{slug}/book")
        self.assertEqual(public_page.status_code, 200)
        self.assertIn(b"theme-light", public_page.data)
        self.assertIn(b"#55aa77", public_page.data)

    def test_private_apis_reject_anonymous_access(self):
        self.assertEqual(self.client.get("/admin/dashboard").status_code, 401)
        self.assertEqual(self.client.get("/admin/barbers").status_code, 401)
        self.assertEqual(self.client.get("/barber/appointments").status_code, 401)


if __name__ == "__main__":
    unittest.main()
