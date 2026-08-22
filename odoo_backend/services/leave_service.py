import logging
from datetime import date, timedelta

from django.db import transaction
from django.db.models import Q
from rest_framework.exceptions import ValidationError

from apps.attendance.models import Attendance
from apps.company.models import CompanyConfig, PublicHoliday
from apps.leaves.models import LeaveBalance, TimeOffRequest
from common.utils.dates import company_today
from services.notification_service import send_email

logger = logging.getLogger(__name__)


class LeaveService:

    def _cfg(self):
        return CompanyConfig.load()

    # ── date math ─────────────────────────────────────────────────────
    def working_dates(self, cfg, start, end):
        """Working days in [start, end]: config weekdays minus public holidays.
        Leave days are counted/consumed only on these dates."""
        holidays = set(PublicHoliday.objects.filter(
            company=cfg.company, date__range=(start, end)).values_list("date", flat=True))
        weekdays = set(cfg.working_weekdays)
        out, d, step = [], start, timedelta(days=1)
        while d <= end:
            if d.isoweekday() in weekdays and d not in holidays:
                out.append(d)
            d += step
        return out

    @staticmethod
    def _iter_year_segments(start, end):
        d = start
        while d <= end:
            seg_end = min(end, date(d.year, 12, 31))
            yield d.year, d, seg_end
            d = seg_end + timedelta(days=1)

    # ── balances ──────────────────────────────────────────────────────
    def _balance_for(self, employee, year, cfg):
        bal, _ = LeaveBalance.objects.get_or_create(
            employee=employee, year=year,
            defaults={"paid_leave_total": cfg.paid_leave_total,
                      "sick_leave_total": cfg.sick_leave_total},
        )
        return bal

    @staticmethod
    def balances_payload(bal):
        return {
            "paid": {"total": bal.paid_leave_total, "used": bal.paid_leave_used,
                     "available": bal.paid_leave_total - bal.paid_leave_used},
            "sick": {"total": bal.sick_leave_total, "used": bal.sick_leave_used,
                     "available": bal.sick_leave_total - bal.sick_leave_used},
            "unpaid": {"used": bal.unpaid_leave_used},
        }

    def balances(self, employee, year=None):
        cfg = self._cfg()
        year = year or company_today(cfg.company.timezone).year
        bal = self._balance_for(employee, year, cfg)
        return {"year": year, **self.balances_payload(bal)}

    def _check_balance(self, employee, cfg, start, end, leave_type):
        if leave_type == TimeOffRequest.LeaveType.UNPAID:
            return
        for year, seg_s, seg_e in self._iter_year_segments(start, end):
            days = len(self.working_dates(cfg, seg_s, seg_e))
            if not days:
                continue
            bal = self._balance_for(employee, year, cfg)
            if leave_type == TimeOffRequest.LeaveType.PAID:
                avail = bal.paid_leave_total - bal.paid_leave_used
            else:
                avail = bal.sick_leave_total - bal.sick_leave_used
            if days > avail:
                raise ValidationError({
                    "detail": f"Insufficient {leave_type} balance for {year}: "
                              f"requested {days} day(s), {max(avail, 0)} available."
                })

    # ── apply / review / cancel ───────────────────────────────────────
    def _overlap_exists(self, employee, start, end):
        return TimeOffRequest.objects.filter(
            employee=employee,
            status__in=[TimeOffRequest.Status.PENDING, TimeOffRequest.Status.APPROVED],
            start_date__lte=end, end_date__gte=start,
        ).exists()

    def apply_request(self, user, data, allow_past=False):
        """allow_past=True is the trusted seeding path — relaxes ONLY the
        date-window and sick-attachment rules. Overlap/balance still enforced."""
        cfg = self._cfg()
        today = company_today(cfg.company.timezone)
        start, end = data["start_date"], data["end_date"]
        leave_type = data["leave_type"]

        if start > end:
            raise ValidationError({"end_date": ["End date must be on or after start date."]})
        if not allow_past:
            if leave_type == TimeOffRequest.LeaveType.SICK:
                if start < today - timedelta(days=cfg.sick_leave_backdate_days):
                    raise ValidationError({"start_date": [
                        f"Sick leave can be backdated at most {cfg.sick_leave_backdate_days} days."]})
                if not data.get("attachment"):
                    raise ValidationError({"attachment": [
                        "A medical certificate is required for sick leave."]})
            elif start < today:
                raise ValidationError({"start_date": [
                    "Past dates are allowed only for sick leave."]})

        if self._overlap_exists(user, start, end):
            raise ValidationError({"detail": "You already have a pending/approved request "
                                             "overlapping these dates."})

        days = self.working_dates(cfg, start, end)
        if not days:
            raise ValidationError({"detail": "The selected range contains no working days "
                                             "(weekends/holidays are excluded)."})
        self._check_balance(user, cfg, start, end, leave_type)

        req = TimeOffRequest.objects.create(
            employee=user, leave_type=leave_type, start_date=start, end_date=end,
            days_count=len(days), remarks=data.get("remarks", ""),
            attachment=data.get("attachment"),
        )
        logger.info(f"Leave applied: {req} by {user.login_id}")
        return self.request_payload(req, cfg)

    def approve(self, actor, req, comment=""):
        if req.status != TimeOffRequest.Status.PENDING:
            raise ValidationError({"detail": f"Only pending requests can be approved "
                                             f"(current: {req.status})."})
        cfg = self._cfg()
        self._check_balance(req.employee, cfg, req.start_date, req.end_date, req.leave_type)

        with transaction.atomic():
            req.status = TimeOffRequest.Status.APPROVED
            req.reviewed_by = actor
            req.review_comment = comment
            req.save(update_fields=["status", "reviewed_by", "review_comment", "updated_at"])

            for year, seg_s, seg_e in self._iter_year_segments(req.start_date, req.end_date):
                days = len(self.working_dates(cfg, seg_s, seg_e))
                if not days:
                    continue
                bal = self._balance_for(req.employee, year, cfg)
                if req.leave_type == TimeOffRequest.LeaveType.PAID:
                    bal.paid_leave_used += days
                elif req.leave_type == TimeOffRequest.LeaveType.SICK:
                    bal.sick_leave_used += days
                else:
                    bal.unpaid_leave_used += days
                bal.save()

            for d in self.working_dates(cfg, req.start_date, req.end_date):
                att, _ = Attendance.objects.get_or_create(
                    employee=req.employee, date=d,
                    defaults={"status": Attendance.Status.LEAVE})
                att.status = Attendance.Status.LEAVE
                att.linked_time_off = req
                att.updated_by = actor
                att.save(update_fields=["status", "linked_time_off", "updated_by", "updated_at"])

        send_email(
            subject="Your leave request has been approved",
            message=(f"Hi {req.employee.full_name},\n\nYour {req.leave_type} leave "
                     f"({req.start_date} → {req.end_date}, {req.days_count} working day(s)) "
                     f"was approved by {actor.full_name}."
                     + (f"\n\nComment: {comment}" if comment else "")),
            recipient_list=[req.employee.email],
        )
        logger.info(f"Leave approved: {req} by {actor.login_id}")
        return self.request_payload(req, cfg)

    def reject(self, actor, req, comment=""):
        if req.status != TimeOffRequest.Status.PENDING:
            raise ValidationError({"detail": f"Only pending requests can be rejected "
                                             f"(current: {req.status})."})
        req.status = TimeOffRequest.Status.REJECTED
        req.reviewed_by = actor
        req.review_comment = comment
        req.save(update_fields=["status", "reviewed_by", "review_comment", "updated_at"])
        send_email(
            subject="Your leave request was rejected",
            message=(f"Hi {req.employee.full_name},\n\nYour {req.leave_type} leave "
                     f"({req.start_date} → {req.end_date}) was rejected by {actor.full_name}."
                     + (f"\n\nComment: {comment}" if comment else "")),
            recipient_list=[req.employee.email],
        )
        logger.info(f"Leave rejected: {req} by {actor.login_id}")
        return self.request_payload(req)

    def cancel(self, user, req):
        if req.employee_id != user.id:
            raise ValidationError({"detail": "You can only cancel your own requests."})
        if req.status != TimeOffRequest.Status.PENDING:
            raise ValidationError({"detail": "Only pending requests can be cancelled."})
        req.status = TimeOffRequest.Status.CANCELLED
        req.save(update_fields=["status", "updated_at"])
        logger.info(f"Leave cancelled: {req}")
        return self.request_payload(req)

    # ── payloads / lists ──────────────────────────────────────────────
    def request_payload(self, req, cfg=None, include_dates=True):
        p = {
            "id": str(req.id),
            "employee": {
                "id": str(req.employee_id), "name": req.employee.full_name,
                "login_id": req.employee.login_id,
                "profile_picture": (req.employee.profile_picture.url
                                    if req.employee.profile_picture else None),
            },
            "leave_type": req.leave_type,
            "start_date": req.start_date, "end_date": req.end_date,
            "days_count": req.days_count,
            "status": req.status,
            "remarks": req.remarks,
            "attachment": req.attachment.url if req.attachment else None,
            "reviewed_by": req.reviewed_by.full_name if req.reviewed_by else None,
            "review_comment": req.review_comment,
            "created_at": req.created_at, "updated_at": req.updated_at,
        }
        if include_dates:
            p["dates"] = self.working_dates(cfg or self._cfg(), req.start_date, req.end_date)
        return p

    def list_requests(self, params, employee=None):
        qs = TimeOffRequest.objects.select_related("employee", "reviewed_by",
                                                   "employee__manager")
        if employee is not None:
            qs = qs.filter(employee=employee)
        status = params.get("status")
        if status:
            qs = qs.filter(status=status)
        leave_type = params.get("leave_type")
        if leave_type:
            qs = qs.filter(leave_type=leave_type)
        year = params.get("year")
        if year:
            try:
                y = int(year)
                qs = qs.filter(start_date__year__lte=y, end_date__year__gte=y)
            except (TypeError, ValueError):
                raise ValidationError({"year": ["Must be an integer."]})
        search = (params.get("search") or "").strip()
        if search:
            qs = qs.filter(Q(employee__first_name__icontains=search)
                           | Q(employee__last_name__icontains=search)
                           | Q(employee__login_id__icontains=search))
        return qs

    def calendar(self, user, year=None):
        cfg = self._cfg()
        year = year or company_today(cfg.company.timezone).year
        try:
            year = int(year)
        except (TypeError, ValueError):
            raise ValidationError({"year": ["Must be an integer."]})
        if not 2000 <= year <= 2100:
            raise ValidationError({"year": ["Out of allowed range."]})

        holidays = list(PublicHoliday.objects.filter(
            company=cfg.company, date__year=year).order_by("date"))
        requests = TimeOffRequest.objects.filter(
            employee=user, start_date__year__lte=year, end_date__year__gte=year
        ).order_by("start_date")

        marked = []
        for req in requests:
            seg_s = max(req.start_date, date(year, 1, 1))
            seg_e = min(req.end_date, date(year, 12, 31))
            for d in self.working_dates(cfg, seg_s, seg_e):
                marked.append({"date": d, "status": req.status,
                               "leave_type": req.leave_type, "request_id": str(req.id)})
        marked.sort(key=lambda m: m["date"])

        return {
            "year": year,
            "working_weekdays": cfg.working_weekdays,
            "balances": self.balances(user, year),
            "holidays": [{"id": str(h.id), "date": h.date, "name": h.name} for h in holidays],
            "marked_dates": marked,
            "requests": [self.request_payload(r, cfg) for r in requests],
        }

    # ── allocations (admin) ───────────────────────────────────────────
    def allocation_list(self, params):
        cfg = self._cfg()
        year = params.get("year") or company_today(cfg.company.timezone).year
        try:
            year = int(year)
        except (TypeError, ValueError):
            raise ValidationError({"year": ["Must be an integer."]})
        from django.contrib.auth import get_user_model
        qs = get_user_model().objects.filter(is_active=True, is_superuser=False)
        search = (params.get("search") or "").strip()
        if search:
            qs = qs.filter(Q(first_name__icontains=search) | Q(last_name__icontains=search)
                           | Q(login_id__icontains=search))
        items = []
        for emp in qs.order_by("login_id"):
            bal = self._balance_for(emp, year, cfg)
            items.append({
                "employee": {"id": str(emp.id), "login_id": emp.login_id,
                             "name": emp.full_name,
                             "department": emp.department},
                "year": year, **self.balances_payload(bal),
            })
        return items

    def allocation_update(self, employee, data):
        cfg = self._cfg()
        year = data.get("year") or company_today(cfg.company.timezone).year
        bal = self._balance_for(employee, year, cfg)
        if "paid_leave_total" in data:
            if data["paid_leave_total"] < bal.paid_leave_used:
                raise ValidationError({"paid_leave_total": [
                    f"Cannot set below already-used {bal.paid_leave_used} day(s)."]})
            bal.paid_leave_total = data["paid_leave_total"]
        if "sick_leave_total" in data:
            if data["sick_leave_total"] < bal.sick_leave_used:
                raise ValidationError({"sick_leave_total": [
                    f"Cannot set below already-used {bal.sick_leave_used} day(s)."]})
            bal.sick_leave_total = data["sick_leave_total"]
        bal.save()
        return {"employee": {"id": str(employee.id), "name": employee.full_name},
                "year": year, **self.balances_payload(bal)}


leave_service = LeaveService()