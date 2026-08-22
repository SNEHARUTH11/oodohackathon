"""
Demo data seeder — employees, managers, HR officer, bank details, skills, certs.
Usage:
    python scripts/generate_test_data.py             # seed (skips if already seeded)
    python scripts/generate_test_data.py --reset     # wipe employees/HR and reseed
    python scripts/generate_test_data.py --count 20
Note: goes through employee_service (real code path) — each creation sends a
welcome email (console backend prints them in dev).
"""
import os
import random
import string
import sys
from argparse import ArgumentParser
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "odoo_backend.settings.dev")

import django  # noqa: E402

django.setup()

from django.contrib.auth import get_user_model  # noqa: E402

from apps.company.models import Company  # noqa: E402
from apps.employees.models import BankDetail, Certification, Skill  # noqa: E402
from services.employee_service import employee_service  # noqa: E402

FIRST = ["Aarav", "Diya", "Ishaan", "Meera", "Rohan", "Sneha", "Kabir",
         "Ananya", "Vikram", "Priya", "Arjun", "Neha", "Rahul", "Tara"]
LAST = ["Sharma", "Patel", "Nair", "Iyer", "Gupta", "Reddy", "Mehta", "Joshi"]
DEPTS = {
    "Engineering": "Software Engineer",
    "HR": "HR Executive",
    "Sales": "Sales Executive",
    "Finance": "Accountant",
    "Design": "UI Designer",
}
SKILLS = ["Python", "Django", "React", "SQL", "Figma", "Communication", "Excel", "REST APIs"]
CERTS = [("AWS Certified Developer", "Amazon"), ("Advanced Excel", "Microsoft"),
         ("Django for Professionals", "Online")]


def main():
    ap = ArgumentParser()
    ap.add_argument("--count", type=int, default=12)
    ap.add_argument("--reset", action="store_true")
    args = ap.parse_args()

    User = get_user_model()
    company = Company.objects.first()
    if not company:
        sys.exit("No company found. Run `python manage.py seed_onboarding` first.")
    admin = User.objects.filter(role=User.Role.ADMIN, is_active=True).first()
    if not admin:
        sys.exit("No active admin found. Run `python manage.py seed_onboarding` first.")

    seeded_roles = [User.Role.EMPLOYEE, User.Role.HR_OFFICER]
    if User.objects.filter(role__in=seeded_roles).exists() and not args.reset:
        sys.exit("Employees already exist. Re-run with --reset to wipe and reseed.")
    if args.reset:
        deleted, _ = User.objects.filter(role__in=seeded_roles).delete()
        print(f"Reset: removed {deleted} employee/HR users.")

    rnd = random.Random(42)
    creds = []
    seq = [0]

    def make(first, last, role, dept, position, manager=None, joining=None):
        seq[0] += 1
        email = f"{first.lower()}.{last.lower()}{seq[0]}@oaloo.in"
        payload = employee_service.create_employee(admin, {
            "first_name": first, "last_name": last, "email": email,
            "phone": f"9{rnd.randint(10 ** 8, 10 ** 9 - 1)}",
            "role": role, "department": dept, "job_position": position,
            "location": rnd.choice(["Ahmedabad", "Bengaluru", "Pune", "Mumbai"]),
            "manager": manager,
            "date_of_joining": joining or date(rnd.randint(2022, 2025),
                                               rnd.randint(1, 12), rnd.randint(1, 28)),
        })
        creds.append(payload)
        return User.objects.get(id=payload["id"])

    hr = make("Nisha", "Verma", User.Role.HR_OFFICER, "HR", "HR Officer",
              joining=date(2022, 3, 1))
    eng_mgr = make("Suresh", "Rao", User.Role.EMPLOYEE, "Engineering",
                   "Engineering Manager", joining=date(2022, 6, 15))
    sales_mgr = make("Kavita", "Menon", User.Role.EMPLOYEE, "Sales",
                     "Sales Manager", joining=date(2023, 1, 9))

    for _ in range(args.count):
        first, last = rnd.choice(FIRST), rnd.choice(LAST)
        dept, position = rnd.choice(list(DEPTS.items()))
        mgr = eng_mgr if dept == "Engineering" else (sales_mgr if dept == "Sales" else hr)
        emp = make(first, last, User.Role.EMPLOYEE, dept, position, manager=mgr)

        BankDetail.objects.create(
            employee=emp,
            account_number="".join(rnd.choices(string.digits, k=12)),
            bank_name=rnd.choice(["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank"]),
            ifsc_code=f"HDFC000{rnd.randint(1000, 9999)}",
            pan_no="".join(rnd.choices(string.ascii_uppercase, k=5))
                   + "".join(rnd.choices(string.digits, k=4))
                   + rnd.choice(string.ascii_uppercase),
            uan_no=f"10{rnd.randint(10 ** 10, 10 ** 11 - 1)}",
        )
        for s in rnd.sample(SKILLS, rnd.randint(2, 4)):
            Skill.objects.get_or_create(employee=emp, name=s)
        if rnd.random() < 0.6:
            name, issuer = rnd.choice(CERTS)
            Certification.objects.create(
                employee=emp, name=name, issuer=issuer,
                issue_date=date(rnd.randint(2021, 2024), rnd.randint(1, 12), rnd.randint(1, 28)),
            )

    print(f"\nSeeded {len(creds)} users (1 HR officer, 2 managers, {args.count} employees).")
    print(f"{'LOGIN ID':<18}{'ROLE':<13}{'NAME':<22}TEMP PASSWORD")
    print("-" * 75)
    for c in creds:
        print(f"{c['login_id']:<18}{c['role']:<13}{c['full_name']:<22}{c['temp_password']}")
    print("\nAll users must_change_password=True — they are prompted on first login.")


if __name__ == "__main__":
    main()