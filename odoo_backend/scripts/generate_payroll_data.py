"""
Payroll test data — completes "test data for all".
1. Salary structures for every active employee (first employee gets exactly
   ₹50,000 so the wireframe example can be verified).
2. Generates draft payslips for the last two completed months.
3. SENDS the older month (locked + emailed), leaves the recent one as drafts
   for the demo review workflow.
Usage:  python scripts/generate_payroll_data.py [--reset]
Run AFTER generate_attendance_data.py (payable days come from attendance).
"""
import os
import random
import sys
from argparse import ArgumentParser
from decimal import Decimal
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "odoo_backend.settings.dev")

import django  # noqa: E402

django.setup()

from django.contrib.auth import get_user_model  # noqa: E402

from apps.payroll.models import Payslip, SalaryStructure  # noqa: E402
from apps.company.models import CompanyConfig  # noqa: E402
from common.utils.dates import company_today  # noqa: E402
from services.payroll_service import month_shift, payroll_service  # noqa: E402

WAGES = [Decimal(w) for w in (28000, 35000, 42000, 50000, 60000, 75000, 90000)]


def main():
    ap = ArgumentParser()
    ap.add_argument("--reset", action="store_true")
    args = ap.parse_args()

    cfg = CompanyConfig.load()
    today = company_today(cfg.company.timezone)
    User = get_user_model()
    admin = User.objects.filter(role=User.Role.ADMIN, is_active=True).first()
    employees = list(User.objects.filter(is_active=True, is_superuser=False)
                     .order_by("login_id"))
    if not admin or not employees:
        sys.exit("Need an admin + employees. Run seed_onboarding & generate_test_data first.")

    if args.reset:
        n1, _ = Payslip.objects.all().delete()
        n2, _ = SalaryStructure.objects.all().delete()
        print(f"Reset: removed {n1} payslips, {n2} salary structures.")

    rnd = random.Random(11)
    print("Structures:")
    for i, emp in enumerate(employees):
        wage = Decimal("50000") if i == 0 else rnd.choice(WAGES)
        payload = payroll_service.upsert_structure(emp, {"monthly_wage": wage})
        print(f"  {emp.login_id:<18}{emp.full_name:<22} wage ₹{wage:,} → "
              f"basic {payload['basic']}  hra {payload['hra']}  "
              f"fixed {payload['fixed_allowance']}")
    demo = employees[0]
    p = payroll_service.structure_payload(demo.salary_structure)
    comps = {c["key"]: c["amount"] for c in p["components"]}
    total = sum(comps.values())
    assert total == Decimal("50000"), f"Component total {total} != wage!"
    print(f"\n✓ Wireframe check ({demo.full_name}, wage ₹50,000): total components = ₹{total:,}")

    recent = month_shift(today, -1)
    older = month_shift(today, -2)
    for label, m, y in (("older (send)", older.month, older.year),
                        ("recent (drafts)", recent.month, recent.year)):
        res = payroll_service.generate(admin, m, y)
        c = res["counts"]
        print(f"\nGenerate {m:02d}/{y} [{label}]: {c['generated']} generated, "
              f"{c['regenerated']} regenerated, {c['skipped_no_structure']} no-structure, "
              f"{c['skipped_no_working_days']} no-working-days")
        flagged = [r for r in res["results"] if r["result"] in ("generated", "regenerated")
                   and (r["flags"].get("absent_days") or r["flags"].get("missed_checkout_days"))]
        if flagged:
            print(f"  ⚠ {len(flagged)} payslip(s) carry accuracy flags "
                  f"(absences / missed checkouts) — visible in admin review")

    sent = payroll_service.send_bulk(admin, month=older.month, year=older.year)
    print(f"\nSent older month: {sent['sent']} payslip(s) emailed + locked "
          f"({sent['failed']} failed)")
    print(f"Recent month left as DRAFTS for the demo review → send flow.")
    print(f"\nEmployee view: {demo.full_name} sees {Payslip.objects.filter(employee=demo, status='sent').count()} "
          f"sent payslip(s) under /api/v1/employee/payroll/payslip/list/")


if __name__ == "__main__":
    main()