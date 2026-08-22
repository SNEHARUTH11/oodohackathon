"""
Seed realistic attendance history (deterministic, seed=42).
Usage:
    python scripts/generate_attendance_data.py               # last 3 months
    python scripts/generate_attendance_data.py --months 4 --reset
    python scripts/generate_attendance_data.py --missed 3    # extra missed check-outs
Today is seeded specially: ~60% open sessions (green dots), ~20% done, ~20% absent.
"""
import os
import random
import sys
from argparse import ArgumentParser
from datetime import date, datetime, time, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "odoo_backend.settings.dev")

import django  # noqa: E402

django.setup()

from django.contrib.auth import get_user_model  # noqa: E402

from apps.attendance.models import Attendance, AttendanceSession  # noqa: E402
from apps.company.models import CompanyConfig, PublicHoliday  # noqa: E402
from common.utils.dates import company_today  # noqa: E402
from services.attendance_service import attendance_service  # noqa: E402


def dt(d, hour, minute, tz):
    return datetime.combine(d, time(hour, minute), tzinfo=tz)


def month_shift(d, k):
    total = d.month - 1 + k
    return date(d.year + total // 12, total % 12 + 1, 1)


def main():
    ap = ArgumentParser()
    ap.add_argument("--months", type=int, default=3)
    ap.add_argument("--missed", type=int, default=2)
    ap.add_argument("--reset", action="store_true")
    args = ap.parse_args()

    cfg = CompanyConfig.load()
    tz = ZoneInfo(cfg.company.timezone)
    today = company_today(cfg.company.timezone)
    weekdays = set(cfg.working_weekdays)
    holidays = set(PublicHoliday.objects.filter(
        company=cfg.company, date__lte=today).values_list("date", flat=True))

    User = get_user_model()
    employees = list(User.objects.filter(is_active=True, is_superuser=False).order_by("login_id"))
    if not employees:
        sys.exit("No employees found. Run generate_test_data.py first.")

    if args.reset:
        deleted, _ = Attendance.objects.filter(employee__in=employees).delete()
        print(f"Reset: removed {deleted} attendance rows (sessions cascade).")
    elif Attendance.objects.filter(employee__in=employees).exists():
        sys.exit("Attendance already exists — re-run with --reset.")

    rnd = random.Random(42)
    period_start = month_shift(today, -(args.months - 1))
    stats = {"present": 0, "half_day": 0, "absent": 0, "skipped_existing": 0}

    for emp in employees:
        d = max(period_start, emp.date_of_joining or period_start)
        while d < today:                                   # regular past days
            if Attendance.objects.filter(employee=emp, date=d).exists():
                stats["skipped_existing"] += 1
            elif d.isoweekday() in weekdays and d not in holidays:
                roll = rnd.random()
                if roll < 0.07:                            # absent — no row
                    stats["absent"] += 1
                else:
                    att, _ = Attendance.objects.get_or_create(employee=emp, date=d)
                    in_dt = dt(d, 9 + rnd.randint(0, 1), rnd.choice([0, 15, 30, 45]), tz)
                    if roll < 0.10:                        # half day (2.5–5h)
                        dur = rnd.randint(150, 300)
                        AttendanceSession.objects.create(
                            attendance=att, check_in=in_dt,
                            check_out=in_dt + timedelta(minutes=dur),
                            source="self", created_by=emp)
                        stats["half_day"] += 1
                    else:                                  # full day 8–10.5h, 25% two sessions
                        total = rnd.randint(480, 630)
                        if rnd.random() < 0.25:
                            s1 = rnd.randint(210, 270)
                            gap = rnd.randint(30, 60)
                            out1 = in_dt + timedelta(minutes=s1)
                            in2 = out1 + timedelta(minutes=gap)
                            AttendanceSession.objects.create(
                                attendance=att, check_in=in_dt, check_out=out1,
                                source="self", created_by=emp)
                            AttendanceSession.objects.create(
                                attendance=att, check_in=in2,
                                check_out=in2 + timedelta(minutes=total - s1),
                                source="self", created_by=emp)
                        else:
                            AttendanceSession.objects.create(
                                attendance=att, check_in=in_dt,
                                check_out=in_dt + timedelta(minutes=total),
                                source="self", created_by=emp)
                        stats["present"] += 1
                    attendance_service._recompute(att, cfg)
            d += timedelta(days=1)

    # ── today: mixed live state for dashboard dots ────────────────────
    if today.isoweekday() in weekdays and today not in holidays:
        pool = employees[:]
        rnd.shuffle(pool)
        n_open, n_done = int(len(pool) * 0.6), int(len(pool) * 0.2)
        for i, emp in enumerate(pool):
            att, _ = Attendance.objects.get_or_create(employee=emp, date=today)
            in_dt = dt(today, 9 + rnd.randint(0, 1), rnd.choice([0, 15, 30, 45]), tz)
            if i < n_open:                                 # checked in, still working
                AttendanceSession.objects.create(
                    attendance=att, check_in=in_dt, source="self", created_by=emp)
            elif i < n_open + n_done:                      # finished the day
                AttendanceSession.objects.create(
                    attendance=att, check_in=in_dt,
                    check_out=in_dt + timedelta(minutes=rnd.randint(480, 630)),
                    source="self", created_by=emp)
            else:
                continue                                   # absent today (yellow dots)
            attendance_service._recompute(att, cfg)

    # ── missed check-outs (past, open sessions → admin flagged list) ──
    injected = 0
    for emp in employees:
        if injected >= args.missed:
            break
        for back in range(3, 15):
            d = today - timedelta(days=back)
            if (d.isoweekday() in weekdays and d not in holidays
                    and not Attendance.objects.filter(employee=emp, date=d).exists()
                    and (emp.date_of_joining or date(2000, 1, 1)) <= d):
                att, _ = Attendance.objects.get_or_create(employee=emp, date=d)
                AttendanceSession.objects.create(
                    attendance=att, check_in=dt(d, 10, rnd.choice([0, 30]), tz), source="self",
                    created_by=emp)
                attendance_service._recompute(att, cfg)
                injected += 1
                break

    print(f"\nAttendance seeded for {len(employees)} employees "
          f"({period_start} → {today}):")
    print(f"  present={stats['present']}  half_day={stats['half_day']}  "
          f"absent={stats['absent']}  missed_checkouts={injected}")
    print(f"  today: ~60% checked-in (green), ~20% completed, ~20% absent (yellow)")


if __name__ == "__main__":
    main()