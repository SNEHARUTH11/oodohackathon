import logging
from datetime import timedelta
from decimal import Decimal
from zoneinfo import ZoneInfo

from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone as dj_tz
from django.utils.dateparse import parse_date
from rest_framework.exceptions import ValidationError

from apps.attendance.models import Attendance, AttendanceSession
from apps.company.models import CompanyConfig, PublicHoliday
from common.utils.dates import company_today, month_date_range

logger = logging.getLogger(__name__)
User = get_user_model()


def hhmm(hours) -> str:
    """Decimal hours → 'HH:MM' (e.g. 9.5 → '09:30')."""
    minutes = int(round(float(hours or 0) * 60))
    return f"{minutes // 60:02d}:{minutes % 60:02d}"


def _to_aware(dt, tz_name):
    """Naive datetimes from clients are interpreted in the company timezone."""
    if dt is None:
        return None
    if dj_tz.is_aware(dt):
        return dt
    return dt.replace(tzinfo=ZoneInfo(tz_name))


class AttendanceService:

    # ── config helpers ────────────────────────────────────────────────
    def _cfg(self):
        return CompanyConfig.load()

    def _holidays_between(self, cfg, start, end):
        qs = PublicHoliday.objects.filter(company=cfg.company, date__range=(start, end))
        return {h.date: h.name for h in qs}

    def _resolve_month_year(self, month, year, cfg):
        today = company_today(cfg.company.timezone)

        def _int(val, field, default):
            if val in (None, ""):
                return default
            try:
                return int(val)
            except (TypeError, ValueError):
                raise ValidationError({field: ["Must be an integer."]})

        month = _int(month, "month", today.month)
        year = _int(year, "year", today.year)
        if not 1 <= month <= 12:
            raise ValidationError({"month": ["Must be between 1 and 12."]})
        if not 2000 <= year <= 2100:
            raise ValidationError({"year": ["Out of allowed range."]})
        return month, year

    # ── check in / out ────────────────────────────────────────────────
    def check_in(self, user):
        cfg = self._cfg()
        if AttendanceSession.objects.filter(check_out__isnull=True, attendance__employee=user).exists():
            raise ValidationError({
                "detail": "You already have an open check-in. Check out first, or ask HR to fix a missed check-out."
            })
        today = company_today(cfg.company.timezone)
        att, _ = Attendance.objects.get_or_create(employee=user, date=today)
        AttendanceSession.objects.create(
            attendance=att, check_in=dj_tz.now(),
            source=AttendanceSession.Source.SELF, created_by=user,
        )
        self._recompute(att, cfg)
        logger.info(f"Check-in: {user.login_id} @ {today}")
        return self.today_state(user, cfg)

    def check_out(self, user):
        cfg = self._cfg()
        session = (AttendanceSession.objects
                   .filter(check_out__isnull=True, attendance__employee=user)
                   .select_related("attendance").first())
        if not session:
            raise ValidationError({"detail": "You are not checked in."})
        session.check_out = dj_tz.now()
        if session.check_out <= session.check_in:          # sub-minute session guard
            session.check_out = session.check_in + timedelta(minutes=1)
        session.save()
        self._recompute(session.attendance, cfg)
        logger.info(f"Check-out: {user.login_id} ({hhmm(session.attendance.work_hours)}h)")
        return self.today_state(user, cfg)

    # ── status engine ─────────────────────────────────────────────────
    def _recompute(self, att, cfg=None):
        cfg = cfg or self._cfg()
        sessions = list(att.sessions.order_by("check_in"))
        completed = [s for s in sessions if s.check_out]
        open_now = any(s.check_out is None for s in sessions)
        today = company_today(cfg.company.timezone)

        total = sum((s.check_out - s.check_in).total_seconds() for s in completed) / 3600
        total = Decimal(str(total)).quantize(Decimal("0.01"))
        standard = cfg.standard_hours_per_day

        if total >= standard:
            status = Attendance.Status.PRESENT
        elif total > 0:
            status = Attendance.Status.HALF_DAY
        elif open_now and att.date >= today:
            status = Attendance.Status.PRESENT          # in progress right now
        else:
            status = Attendance.Status.HALF_DAY         # degenerate row; admin fixes

        att.work_hours = total
        att.extra_hours = max(total - standard, Decimal("0.00"))
        att.status = status
        att.save(update_fields=["work_hours", "extra_hours", "status", "updated_at"])
        return att

    # ── payloads ──────────────────────────────────────────────────────
    @staticmethod
    def session_payload(s):
        return {
            "id": str(s.id),
            "check_in": s.check_in,
            "check_out": s.check_out,
            "source": s.source,
            "created_by": s.created_by.full_name if s.created_by else None,
        }

    def row_payload(self, att, sessions=None, include_sessions=True, cfg=None):
        cfg = cfg or self._cfg()
        sessions = sessions if sessions is not None else list(att.sessions.order_by("check_in"))
        completed = [s for s in sessions if s.check_out]
        open_s = next((s for s in sessions if not s.check_out), None)
        today = company_today(cfg.company.timezone)
        payload = {
            "id": str(att.id),
            "date": att.date,
            "status": att.status,
            "check_in": sessions[0].check_in if sessions else None,
            "check_out": completed[-1].check_out if completed else None,
            "work_hours": att.work_hours,
            "work_hours_display": hhmm(att.work_hours),
            "extra_hours": att.extra_hours,
            "extra_hours_display": hhmm(att.extra_hours),
            "flags": {
                "open_session": bool(open_s),
                "missed_checkout": bool(open_s and att.date < today),
                "short_day": bool(
                    att.status == Attendance.Status.HALF_DAY
                    and att.work_hours < cfg.half_day_threshold_hours
                ),
            },
        }
        if include_sessions:
            payload["sessions"] = [self.session_payload(s) for s in sessions]
        return payload

    def today_state(self, user, cfg=None):
        """Powers the nav status dot + dashboard check-in/out button."""
        cfg = cfg or self._cfg()
        today = company_today(cfg.company.timezone)
        att = (Attendance.objects.filter(employee=user, date=today)
               .prefetch_related("sessions").first())
        sessions = list(att.sessions.order_by("check_in")) if att else []
        open_s = next((s for s in sessions if not s.check_out), None)
        completed = [s for s in sessions if s.check_out]
        worked = sum((s.check_out - s.check_in).total_seconds() for s in completed) / 3600
        return {
            "date": today,
            "checked_in": bool(open_s),
            "open_since": open_s.check_in if open_s else None,
            "can_check_in": not open_s,
            "can_check_out": bool(open_s),
            "attendance_id": str(att.id) if att else None,
            "work_hours_today": round(worked, 2),
            "work_hours_today_display": hhmm(worked),
            "status": att.status if att else None,
        }

    # ── employee monthly view ─────────────────────────────────────────
    def monthly_view(self, employee, month=None, year=None):
        cfg = self._cfg()
        month, year = self._resolve_month_year(month, year, cfg)
        start, end = month_date_range(year, month)
        holidays = self._holidays_between(cfg, start, end)
        weekdays = set(cfg.working_weekdays)
        today = company_today(cfg.company.timezone)
        joined = employee.date_of_joining

        rows = {a.date: a for a in
                (Attendance.objects.filter(employee=employee, date__range=(start, end))
                 .prefetch_related("sessions"))}

        summary = {"working_days": 0, "present_days": 0, "half_days": 0,
                   "leave_days": 0, "absent_days": 0,
                   "total_work_hours": Decimal("0.00"), "total_extra_hours": Decimal("0.00")}
        days, d = [], start
        while d <= end:
            entry = {"date": d, "status": "upcoming", "check_in": None, "check_out": None,
                     "work_hours": None, "work_hours_display": None,
                     "extra_hours_display": None, "holiday_name": None, "id": None}
            if joined and d < joined:
                entry["status"] = "not_joined"
            elif d not in weekdays:
                entry["status"] = "weekend"
            elif d in holidays:
                entry["status"] = "holiday"
                entry["holiday_name"] = holidays[d]
            elif d > today:
                pass  # upcoming (default)
            else:
                summary["working_days"] += 1
                att = rows.get(d)
                if att is None:
                    entry["status"] = "absent"
                    summary["absent_days"] += 1
                else:
                    entry.update({
                        "id": str(att.id), "status": att.status,
                        "check_in": att.sessions.order_by("check_in").first().check_in
                                    if att.sessions.exists() else None,
                        "check_out": (att.sessions.filter(check_out__isnull=False)
                                      .order_by("check_out").last().check_out
                                      if att.sessions.filter(check_out__isnull=False).exists() else None),
                        "work_hours": att.work_hours,
                        "work_hours_display": hhmm(att.work_hours),
                        "extra_hours_display": hhmm(att.extra_hours),
                    })
                    if att.status == Attendance.Status.PRESENT:
                        summary["present_days"] += 1
                    elif att.status == Attendance.Status.HALF_DAY:
                        summary["half_days"] += 1
                    elif att.status == Attendance.Status.LEAVE:
                        summary["leave_days"] += 1
                    summary["total_work_hours"] += att.work_hours
                    summary["total_extra_hours"] += att.extra_hours
            days.append(entry)
            d += timedelta(days=1)

        summary["total_work_hours"] = float(summary["total_work_hours"])
        summary["total_extra_hours"] = float(summary["total_extra_hours"])
        return {
            "month": month, "year": year,
            "summary": summary,
            "days": days,
            "holidays": [{"date": hd, "name": nm} for hd, nm in sorted(holidays.items())],
        }

    # ── admin views ───────────────────────────────────────────────────
    def admin_day_view(self, params):
        cfg = self._cfg()
        date_str = params.get("date")
        if date_str:
            day = parse_date(date_str)
            if not day:
                raise ValidationError({"date": ["Invalid date. Use YYYY-MM-DD."]})
        else:
            day = company_today(cfg.company.timezone)

        holidays = self._holidays_between(cfg, day, day)
        day_info = {
            "date": day,
            "is_weekend": day.isoweekday() not in set(cfg.working_weekdays),
            "is_holiday": day in holidays,
            "holiday_name": holidays.get(day),
        }

        qs = User.objects.filter(is_active=True, is_superuser=False)
        search = (params.get("search") or "").strip()
        if search:
            qs = qs.filter(Q(first_name__icontains=search) | Q(last_name__icontains=search)
                           | Q(login_id__icontains=search) | Q(department__icontains=search))
        employees = list(qs.order_by("first_name", "last_name").prefetch_related(
            "attendance_records__sessions"))

        items = []
        for emp in employees:
            att = next((a for a in emp.attendance_records.all() if a.date == day), None)
            if att is not None:
                sessions = list(att.sessions.all())
                open_s = next((s for s in sessions if s.check_out is None), None)
                completed = [s for s in sessions if s.check_out]
                items.append({
                    "employee": self._employee_card(emp),
                    "status": att.status,
                    "checked_in_now": bool(open_s),
                    "check_in": sessions[0].check_in if sessions else None,
                    "check_out": completed[-1].check_out if completed else None,
                    "work_hours": att.work_hours, "work_hours_display": hhmm(att.work_hours),
                    "extra_hours": att.extra_hours, "extra_hours_display": hhmm(att.extra_hours),
                })
            else:
                status = ("holiday" if day in holidays
                          else "weekend" if day_info["is_weekend"] else "absent")
                items.append({"employee": self._employee_card(emp), "status": status,
                              "checked_in_now": False, "check_in": None, "check_out": None,
                              "work_hours": None, "work_hours_display": None,
                              "extra_hours": None, "extra_hours_display": None})

        counts = {"present": 0, "half_day": 0, "leave": 0, "absent": 0, "checked_in_now": 0}
        for it in items:
            if it["status"] in counts:
                counts[it["status"]] += 1
            if it["checked_in_now"]:
                counts["checked_in_now"] += 1
        return {"date": day, "day": day_info, "counts": counts, "items": items}

    @staticmethod
    def _employee_card(u):
        return {
            "id": str(u.id), "login_id": u.login_id, "name": u.full_name,
            "department": u.department, "job_position": u.job_position,
            "profile_picture": u.profile_picture.url if u.profile_picture else None,
        }

    def missed_checkout_queryset(self):
        cfg = self._cfg()
        today = company_today(cfg.company.timezone)
        return (AttendanceSession.objects
                .filter(check_out__isnull=True, attendance__date__lt=today)
                .select_related("attendance", "attendance__employee")
                .order_by("-attendance__date"))

    def missed_checkout_item(self, s):
        pending = (dj_tz.now() - s.check_in).total_seconds() / 3600
        return {
            "session_id": str(s.id),
            "attendance_id": str(s.attendance_id),
            "date": s.attendance.date,
            "check_in": s.check_in,
            "pending_hours": round(pending, 2),
            "employee": self._employee_card(s.attendance.employee),
        }

    # ── admin corrections (audit: updated_by + source=admin) ──────────
    def admin_create(self, actor, data):
        cfg = self._cfg()
        tz_name = cfg.company.timezone
        employee = User.objects.filter(id=data["employee_id"], is_active=True).first()
        if not employee:
            raise ValidationError({"employee_id": ["Active employee not found."]})
        check_in, check_out = data.get("check_in"), data.get("check_out")
        if check_out and not check_in:
            raise ValidationError({"check_in": ["Required when check-out is provided."]})
        if check_in and check_out and check_out <= check_in:
            raise ValidationError({"check_out": ["Check-out must be after check-in."]})

        att, _ = Attendance.objects.get_or_create(employee=employee, date=data["date"])
        if check_in:
            AttendanceSession.objects.create(
                attendance=att, check_in=_to_aware(check_in, tz_name),
                check_out=_to_aware(check_out, tz_name),
                source=AttendanceSession.Source.ADMIN, created_by=actor,
            )
        self._recompute(att, cfg)
        if data.get("status"):
            att.status = data["status"]
        att.updated_by = actor
        att.save(update_fields=["status", "updated_by", "updated_at"])
        logger.info(f"Attendance admin-create: {employee.login_id} {att.date} by {actor.login_id}")
        return self.row_payload(att)

    def admin_update(self, actor, att, data):
        cfg = self._cfg()
        tz_name = cfg.company.timezone
        session_id = data.get("session_id")
        has_times = data.get("check_in") is not None or data.get("check_out") is not None

        if session_id:
            session = att.sessions.filter(id=session_id).first()
            if not session:
                raise ValidationError({"session_id": ["Session not part of this attendance record."]})
            if not has_times and not data.get("status"):
                raise ValidationError({"detail": "Provide check_in/check_out and/or status."})
            if data.get("check_in"):
                session.check_in = _to_aware(data["check_in"], tz_name)
            if data.get("check_out"):
                session.check_out = _to_aware(data["check_out"], tz_name)
            if session.check_out and session.check_out <= session.check_in:
                raise ValidationError({"check_out": ["Check-out must be after check-in."]})
            session.save()
        elif has_times:
            raise ValidationError({"session_id": ["Required when editing session times."]})
        elif not data.get("status"):
            raise ValidationError({"detail": "Nothing to update."})

        self._recompute(att, cfg)
        if data.get("status"):                      # explicit admin override wins
            att.status = data["status"]
        att.updated_by = actor
        att.save(update_fields=["status", "updated_by", "updated_at"])
        logger.info(f"Attendance admin-update: {att.id} by {actor.login_id}")
        return self.row_payload(att)


attendance_service = AttendanceService()