import json
import logging
from datetime import datetime
from decimal import Decimal

from django.db import transaction

from apps.accounts.models import User
from apps.company.models import Company, CompanyConfig, PublicHoliday

logger = logging.getLogger(__name__)


def load_config(path):
    with open(path) as f:
        return json.load(f)


def _d(value):
    return Decimal(str(value)) if value is not None else None


@transaction.atomic
def seed_onboarding(config):
    summary = {}

    # Company (idempotent — name is the key, logo preserved on updates)
    c = config["company"]
    company, created = Company.objects.get_or_create(
        name=c["name"],
        defaults={"prefix": (c.get("prefix") or "DF")[:5].upper(),
                  "timezone": c.get("timezone", "Asia/Kolkata")},
    )
    Company.objects.filter(pk=company.pk).update(
        prefix=(c.get("prefix") or company.prefix)[:5].upper(),
        timezone=c.get("timezone", company.timezone),
    )
    summary["company"], summary["company_created"] = company.name, created

    # Config (single row, always refreshed from file)
    att, lv, pr = config.get("attendance", {}), config.get("leave", {}), config.get("payroll", {})
    cfg, _ = CompanyConfig.objects.get_or_create(company=company)
    cfg.working_weekdays = att.get("working_weekdays", [1, 2, 3, 4, 5])
    cfg.standard_hours_per_day = _d(att.get("standard_hours_per_day", 8))
    cfg.half_day_threshold_hours = _d(att.get("half_day_threshold_hours", 8))
    cfg.break_time_hrs = _d(att.get("break_time_hrs", 1))
    cfg.sick_leave_backdate_days = att.get("sick_leave_backdate_days", 30)
    cfg.paid_leave_total = lv.get("paid_leave_total", 24)
    cfg.sick_leave_total = lv.get("sick_leave_total", 7)
    cfg.pf_rate_percent = _d(pr.get("pf_rate_percent", 12))
    cfg.professional_tax = _d(pr.get("professional_tax", 200))
    cfg.salary_components = pr.get("components", cfg.salary_components)
    cfg.save()

    # Holidays
    created_holidays = 0
    for h in config.get("holidays", []):
        _, was_created = PublicHoliday.objects.get_or_create(
            company=company, date=h["date"], defaults={"name": h["name"]}
        )
        created_holidays += int(was_created)
    summary["holidays_created"] = created_holidays

    # First admin
    a = config["admin"]
    from django.conf import settings as dj_settings
    temp_password = a.get("password") or dj_settings.DEMO_TEMP_PASSWORD or get_random_string(12)
    admin = User.objects.filter(email__iexact=a["email"]).first()
    if not admin:
        from services.employee_service import generate_login_id
        name_parts = a["name"].strip().split(" ", 1)
        from django.utils.crypto import get_random_string
        temp_password = a.get("password") or get_random_string(12)
        admin = User.objects.create_user(
            email=a["email"],
            password=temp_password,
            first_name=name_parts[0],
            last_name=name_parts[1] if len(name_parts) > 1 else "",
            login_id=generate_login_id(company, a["name"], datetime.now().year),
            role=User.Role.ADMIN,
            company=company,
            date_of_joining=datetime.now().date(),
            must_change_password=True,
        )
        logger.info(f"Seeded first admin: {admin.email} ({admin.login_id})")
    summary["admin_created"] = temp_password is not None
    summary["admin_email"] = admin.email
    summary["admin_login_id"] = admin.login_id
    if temp_password:
        summary["admin_temp_password"] = temp_password
    return summary

# ── Company settings & holidays (admin) ─────────────────────────────────────

CONFIG_PAYLOAD_FIELDS = (
    "working_weekdays", "standard_hours_per_day", "half_day_threshold_hours",
    "break_time_hrs", "sick_leave_backdate_days", "paid_leave_total",
    "sick_leave_total", "pf_rate_percent", "professional_tax",
)


def get_settings():
    cfg = CompanyConfig.objects.select_related("company").first()
    if not cfg:
        raise RuntimeError("CompanyConfig missing — run: python manage.py seed_onboarding")
    return {
        "company": {"id": cfg.company_id, "name": cfg.company.name,
                    "prefix": cfg.company.prefix,
                    "timezone": cfg.company.timezone,
                    "logo": cfg.company.logo.url if cfg.company.logo else None},
        "config": {f: getattr(cfg, f) for f in CONFIG_PAYLOAD_FIELDS},
    }


def update_settings(data):
    cfg = CompanyConfig.load()
    for field in CONFIG_PAYLOAD_FIELDS:
        if field in data:
            setattr(cfg, field, data[field])
    cfg.save()
    logger.info(f"CompanyConfig updated: {list(data.keys())}")
    return get_settings()


def holiday_list(params):
    cfg = CompanyConfig.load()
    qs = PublicHoliday.objects.filter(company=cfg.company).order_by("date")
    year = params.get("year")
    if year:
        try:
            qs = qs.filter(date__year=int(year))
        except (TypeError, ValueError):
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"year": ["Must be an integer."]})
    return qs


def holiday_create(data):
    cfg = CompanyConfig.load()
    if PublicHoliday.objects.filter(company=cfg.company, date=data["date"]).exists():
        from rest_framework.exceptions import ValidationError
        raise ValidationError({"date": ["A holiday already exists on this date."]})
    return PublicHoliday.objects.create(company=cfg.company, **data)


def holiday_update(holiday, data):
    cfg = CompanyConfig.load()
    new_date = data.get("date", holiday.date)
    if (PublicHoliday.objects.filter(company=cfg.company, date=new_date)
            .exclude(id=holiday.id).exists()):
        from rest_framework.exceptions import ValidationError
        raise ValidationError({"date": ["A holiday already exists on this date."]})
    for f, v in data.items():
        setattr(holiday, f, v)
    holiday.save()
    return holiday


def holiday_delete(holiday):
    holiday.delete()