import logging
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db.models import Q

from apps.attendance.models import Attendance, AttendanceSession
from apps.company.models import CompanyConfig, PublicHoliday
from apps.leaves.models import TimeOffRequest
from apps.payroll.models import Payslip, SalaryStructure
from common.utils.dates import company_today
from services.attendance_service import attendance_service
from services.leave_service import leave_service

logger = logging.getLogger(__name__)
User = get_user_model()


class DashboardService:

    def _cfg(self):
        return CompanyConfig.load()

    # ── shared day context + card grid ────────────────────────────────
    def _day_context(self, cfg, today):
        holiday = PublicHoliday.objects.filter(company=cfg.company, date=today).first()
        is_weekend = today.isoweekday() not in set(cfg.working_weekdays)
        day_type = "holiday" if holiday else ("weekend" if is_weekend else "working_day")
        return day_type, (holiday.name if holiday else None)

    def _cards(self, cfg, today, day_type, search=None):
        """Wireframe card grid: 🟢 present (row today) · ✈️ on leave ·
        🟡 absent (working day, no row) · neutral on weekends/holidays."""
        qs = User.objects.filter(is_active=True, is_superuser=False) \
                         .order_by("first_name", "last_name")
        if search:
            qs = qs.filter(Q(first_name__icontains=search) | Q(last_name__icontains=search)
                           | Q(department__icontains=search) | Q(login_id__icontains=search))
        employees = list(qs)
        rows = {a.employee_id: a for a in Attendance.objects.filter(date=today)}
        open_ids = set(AttendanceSession.objects
                       .filter(check_out__isnull=True, attendance__date=today)
                       .values_list("attendance__employee_id", flat=True))

        cards, counts = [], {"total": len(employees), "present": 0,
                             "on_leave": 0, "absent": 0, "neutral": 0}
        for emp in employees:
            att = rows.get(emp.id)
            if day_type != "working_day":
                status = "neutral"
            elif att and att.status == Attendance.Status.LEAVE:
                status = "on_leave"
            elif att is not None and att.status != Attendance.Status.ABSENT:
                status = "present"
            else:
                status = "absent"
            counts[status] += 1
            cards.append({
                "employee_id": str(emp.id), "login_id": emp.login_id,
                "name": emp.full_name,
                "profile_picture": emp.profile_picture.url if emp.profile_picture else None,
                "department": emp.department, "job_position": emp.job_position,
                "status": status,                       # present | on_leave | absent | neutral
                "checked_in_now": emp.id in open_ids,
            })
        return cards, counts

    # ── employee dashboard ────────────────────────────────────────────
    def employee_overview(self, user, search=None):
        cfg = self._cfg()
        today = company_today(cfg.company.timezone)
        day_type, holiday_name = self._day_context(cfg, today)
        cards, counts = self._cards(cfg, today, day_type, search)
        my_state = attendance_service.today_state(user, cfg)

        alerts = []
        if day_type == "working_day" and not my_state["checked_in"]:
            alerts.append({"type": "check_in_reminder",
                           "message": "You haven't checked in yet today."})
        if AttendanceSession.objects.filter(check_out__isnull=True,
                                            attendance__employee=user,
                                            attendance__date__lt=today).exists():
            alerts.append({"type": "missed_checkout",
                           "message": "You have a missed check-out — contact HR to correct it."})
        pending = TimeOffRequest.objects.filter(
            employee=user, status=TimeOffRequest.Status.PENDING).count()
        if pending:
            alerts.append({"type": "pending_leave",
                           "message": f"You have {pending} leave request(s) awaiting approval."})
        next_hol = PublicHoliday.objects.filter(
            company=cfg.company, date__range=(today, today + timedelta(days=7))
        ).order_by("date").first()
        if next_hol:
            alerts.append({"type": "holiday_upcoming",
                           "message": f"Upcoming holiday: {next_hol.name} on {next_hol.date}."})

        activity = []
        verbs = {"approved": "approved", "rejected": "rejected",
                 "cancelled": "cancelled", "pending": "submitted — awaiting approval"}
        for r in TimeOffRequest.objects.filter(employee=user).order_by("-updated_at")[:5]:
            activity.append({"type": "leave", "at": r.updated_at,
                             "message": f"{r.get_leave_type_display()} "
                                        f"({r.start_date} → {r.end_date}) was {verbs[r.status]}."})
        for p in Payslip.objects.filter(employee=user, status=Payslip.Status.SENT) \
                                .order_by("-sent_at")[:2]:
            activity.append({"type": "payslip", "at": p.sent_at,
                             "message": f"Payslip for {p.month:02d}/{p.year} is available "
                                        f"(net ₹{p.net_pay})."})
        activity.sort(key=lambda a: a["at"], reverse=True)

        upcoming = [{"date": h.date, "name": h.name} for h in
                    PublicHoliday.objects.filter(company=cfg.company, date__gte=today)
                    .order_by("date")[:3]]

        return {
            "today": today, "day_type": day_type, "holiday_name": holiday_name,
            "my_checkin": my_state,
            "counts": counts, "cards": cards,
            "balances": leave_service.balances(user),
            "alerts": alerts, "recent_activity": activity[:5],
            "upcoming_holidays": upcoming,
        }

    # ── admin dashboard ───────────────────────────────────────────────
    def admin_overview(self, search=None):
        cfg = self._cfg()
        today = company_today(cfg.company.timezone)
        day_type, holiday_name = self._day_context(cfg, today)
        cards, counts = self._cards(cfg, today, day_type, search)
        counts["checked_in_now"] = sum(1 for c in cards if c["checked_in_now"])

        pending_qs = TimeOffRequest.objects.filter(
            status=TimeOffRequest.Status.PENDING).select_related("employee", "reviewed_by")
        pending_count = pending_qs.count()
        pending_latest = [leave_service.request_payload(r, include_dates=False)
                          for r in pending_qs.order_by("-created_at")[:3]]

        missed_qs = attendance_service.missed_checkout_queryset()
        missed_count = missed_qs.count()
        missed_latest = [attendance_service.missed_checkout_item(s) for s in missed_qs[:3]]

        recent_hires = [{
            "id": str(e.id), "name": e.full_name, "login_id": e.login_id,
            "department": e.department, "job_position": e.job_position,
            "date_of_joining": e.date_of_joining,
            "profile_picture": e.profile_picture.url if e.profile_picture else None,
        } for e in User.objects.filter(is_active=True, is_superuser=False)
         .order_by("-date_joined")[:5]]

        month, year = today.month, today.year
        total_emp = counts["total"]
        with_structure = SalaryStructure.objects.filter(
            employee__is_active=True, employee__is_superuser=False).count()
        sent = Payslip.objects.filter(month=month, year=year, status=Payslip.Status.SENT).count()
        draft = Payslip.objects.filter(month=month, year=year, status=Payslip.Status.DRAFT).count()
        payroll = {"month": month, "year": year, "draft": draft, "sent": sent,
                   "generated": sent + draft,
                   "no_structure": max(total_emp - with_structure, 0),
                   "not_generated": max(with_structure - (sent + draft), 0)}

        alerts = []
        if pending_count:
            alerts.append({"type": "pending_leaves",
                           "message": f"{pending_count} leave request(s) awaiting approval."})
        if missed_count:
            alerts.append({"type": "missed_checkouts",
                           "message": f"{missed_count} missed check-out(s) need correction."})
        if payroll["no_structure"]:
            alerts.append({"type": "no_structure", "message":
                           f"{payroll['no_structure']} employee(s) have no salary structure."})
        if draft:
            alerts.append({"type": "drafts_pending", "message":
                           f"{draft} draft payslip(s) for {month:02d}/{year} awaiting send."})
        if holiday_name:
            alerts.append({"type": "holiday_today",
                           "message": f"Today is a holiday: {holiday_name}."})

        return {
            "today": today, "day_type": day_type, "holiday_name": holiday_name,
            "counts": counts, "cards": cards,
            "pending_leave_requests": {"count": pending_count, "latest": pending_latest},
            "missed_checkouts": {"count": missed_count, "latest": missed_latest},
            "recent_hires": recent_hires,
            "payroll": payroll,
            "alerts": alerts,
        }


dashboard_service = DashboardService()