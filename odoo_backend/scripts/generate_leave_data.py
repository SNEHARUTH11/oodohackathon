"""
Seed leave requests through leave_service (balances + attendance rows stay
consistent). Mix: past approved sick & paid, future approved (airplane dots),
pending (approve/reject demo), one rejected.
Usage:
    python scripts/generate_leave_data.py [--reset]
"""
import os
import random
import sys
from argparse import ArgumentParser
from datetime import timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "odoo_backend.settings.dev")

import django  # noqa: E402

django.setup()

from django.contrib.auth import get_user_model  # noqa: E402
from rest_framework.exceptions import ValidationError  # noqa: E402

from apps.attendance.models import Attendance  # noqa: E402
from apps.company.models import CompanyConfig  # noqa: E402
from apps.leaves.models import LeaveBalance, TimeOffRequest  # noqa: E402
from common.utils.dates import company_today  # noqa: E402
from services.leave_service import leave_service  # noqa: E402


def try_apply(emp, leave_type, start, length, remarks=""):
    try:
        payload = leave_service.apply_request(
            emp,
            {
                "leave_type": leave_type,
                "start_date": start,
                "end_date": start + timedelta(days=length - 1),
                "remarks": remarks,
            },
            allow_past=True,
        )
        return TimeOffRequest.objects.get(id=payload["id"])
    except ValidationError:
        return None


def free_past_start(cfg, emp, today, rnd, min_back, max_back, length):
    """Past window with no attendance rows on its working dates."""
    for _ in range(12):
        start = today - timedelta(days=rnd.randint(min_back, max_back))
        if (emp.date_of_joining or start) <= start:
            days = leave_service.working_dates(cfg, start, start + timedelta(days=length - 1))
            if days and not Attendance.objects.filter(employee=emp, date__in=days).exists():
                return start
    return None


def main():
    ap = ArgumentParser()
    ap.add_argument("--reset", action="store_true")
    args = ap.parse_args()

    cfg = CompanyConfig.load()
    today = company_today(cfg.company.timezone)
    User = get_user_model()
    hr = User.objects.filter(role=User.Role.ADMIN, is_active=True).first()
    employees = list(User.objects.filter(is_active=True, is_superuser=False,
                                         role=User.Role.EMPLOYEE).order_by("login_id"))
    if not hr or not employees:
        sys.exit("Need an admin + employees. Run seed_onboarding and generate_test_data first.")

    if args.reset:
        deleted, _ = Attendance.objects.filter(linked_time_off__isnull=False).delete()
        TimeOffRequest.objects.all().delete()
        LeaveBalance.objects.all().delete()
        print(f"Reset: removed leave-linked attendance rows: {deleted}")

    if TimeOffRequest.objects.exists() and not args.reset:
        sys.exit("Leave requests already exist — re-run with --reset.")

    rnd = random.Random(7)
    counts = {"approved": 0, "pending": 0, "rejected": 0}

    for emp in employees:
        # 1) past approved SICK (within backdate window, ~1-3 days, 80% of employees)
        if rnd.random() < 0.8:
            start = free_past_start(cfg, emp, today, rnd, 3,
                                    min(cfg.sick_leave_backdate_days, 28), rnd.randint(1, 3))
            if start:
                req = try_apply(emp, "sick", start, (today - start).days + 1, "Was unwell")
                if req:
                    leave_service.approve(hr, req, "Get well soon")
                    counts["approved"] += 1

        # 2) past approved PAID (2-4 days, outside recent window, 70%)
        if rnd.random() < 0.7:
            length = rnd.randint(2, 4)
            start = free_past_start(cfg, emp, today, rnd, 40, 120, length)
            if start:
                req = try_apply(emp, "paid", start, length, "Family function")
                if req:
                    leave_service.approve(hr, req)
                    counts["approved"] += 1

        # 3) future approved PAID (1-3 days, 50% → airplane dots on dashboard)
        if rnd.random() < 0.5:
            start = today + timedelta(days=rnd.randint(7, 45))
            req = try_apply(emp, "paid", start, rnd.randint(1, 3), "Planned trip")
            if req:
                leave_service.approve(hr, req)
                counts["approved"] += 1

        # 4) pending (60% — leaves something in the admin approve/reject queue)
        if rnd.random() < 0.6:
            ltype = rnd.choice(["paid", "sick", "unpaid"])
            start = today + timedelta(days=rnd.randint(1, 20))
            if try_apply(emp, ltype, start, rnd.randint(1, 2), "Please approve"):
                counts["pending"] += 1

        # 5) rejected (30%)
        if rnd.random() < 0.3:
            start = today + timedelta(days=rnd.randint(10, 40))
            req = try_apply(emp, "unpaid", start, 1, "Personal work")
            if req:
                leave_service.reject(hr, req, "Not enough notice — please reapply later.")
                counts["rejected"] += 1

    print(f"\nLeave data seeded for {len(employees)} employees: "
          f"{counts['approved']} approved, {counts['pending']} pending, "
          f"{counts['rejected']} rejected.")
    sample = employees[0]
    print(f"Sample balances ({sample.full_name}): {leave_service.balances(sample)}")
    print("Approved requests wrote status=leave attendance rows (linked_time_off set).")


if __name__ == "__main__":
    main()