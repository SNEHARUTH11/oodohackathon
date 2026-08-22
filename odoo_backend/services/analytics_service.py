import calendar
import logging
from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError

from apps.attendance.models import Attendance
from apps.company.models import CompanyConfig, PublicHoliday
from apps.leaves.models import TimeOffRequest
from apps.payroll.models import Payslip
from common.utils.dates import company_today, month_date_range
from services.attendance_service import attendance_service
from services.leave_service import leave_service

logger = logging.getLogger(__name__)
User = get_user_model()


def _shift(d, k):
    total = d.month - 1 + k
    return date(d.year + total // 12, total % 12 + 1, 1)


class AnalyticsService:

    def overview(self, year=None):
        cfg = CompanyConfig.load()
        today = company_today(cfg.company.timezone)
        if year is None:
            year = today.year
        else:
            try:
                year = int(year)
            except (TypeError, ValueError):
                raise ValidationError({"year": ["Must be an integer."]})
        employees = list(User.objects.filter(is_active=True, is_superuser=False))
        weekdays = set(cfg.working_weekdays)

        # Department distribution + monthly joins
        dept = {}
        for e in employees:
            dept[e.department or "Unassigned"] = dept.get(e.department or "Unassigned", 0) + 1
        department_distribution = [{"label": k, "count": v}
                                   for k, v in sorted(dept.items(), key=lambda x: -x[1])]
        joins = {m: 0 for m in range(1, 13)}
        for e in employees:
            if e.date_of_joining and e.date_of_joining.year == year:
                joins[e.date_of_joining.month] += 1
        monthly_joins = [{"label": calendar.month_abbr[m], "month": m, "count": joins[m]}
                         for m in range(1, 13)]

        # 12-month attendance trend (bulk-loaded, config-aware)
        first_month = _shift(today, -11)
        holidays = set(PublicHoliday.objects.filter(
            company=cfg.company, date__range=(first_month, today))
            .values_list("date", flat=True))
        att = {}
        for a in Attendance.objects.filter(
                employee__in=employees, date__range=(first_month, today)) \
                .select_related("linked_time_off"):
            lt = a.linked_time_off.leave_type if a.linked_time_off else None
            att[(a.employee_id, a.date)] = (a.status, lt)

        attendance_trend = []
        m = first_month
        while m <= today:
            ms, me = month_date_range(m.year, m.month)
            eff_end = min(me, today)
            P = H = L = U = A = expected = 0
            for e in employees:
                d = max(ms, e.date_of_joining or ms)
                while d <= eff_end:
                    if d.isoweekday() in weekdays and d not in holidays:
                        expected += 1
                        row = att.get((e.id, d))
                        if row is None:
                            A += 1
                        elif row[0] == "present":
                            P += 1
                        elif row[0] == "half_day":
                            H += 1
                        elif row[0] == "leave":
                            if row[1] == "unpaid":
                                U += 1
                            else:
                                L += 1
                        else:
                            A += 1
                    d += timedelta(days=1)
            rate = round((P + 0.5 * H + L) / expected * 100, 1) if expected else None
            attendance_trend.append({
                "month": f"{m.year}-{m.month:02d}",
                "label": f"{calendar.month_abbr[m.month]} {str(m.year)[2:]}",
                "expected_days": expected, "present": P, "half_days": H,
                "leave_days": L, "unpaid_leave_days": U, "absent": A,
                "attendance_rate": rate,
            })
            m = date(m.year + (m.month == 12), m.month % 12 + 1, 1)

        # Leave type distribution (approved, working days inside `year`)
        dist = {"paid": 0, "sick": 0, "unpaid": 0}
        for req in TimeOffRequest.objects.filter(
                status=TimeOffRequest.Status.APPROVED,
                start_date__lte=date(year, 12, 31), end_date__gte=date(year, 1, 1)):
            seg_s, seg_e = max(req.start_date, date(year, 1, 1)), min(req.end_date, date(year, 12, 31))
            dist[req.leave_type] += len(leave_service.working_dates(cfg, seg_s, seg_e))
        leave_distribution = [{"label": k.title(), "days": v} for k, v in dist.items()]

        # Payroll trend (12 months, zeros filled — chart-ready)
        cutoff = first_month.year * 12 + first_month.month
        agg = {}
        for p in Payslip.objects.filter(employee__in=employees):
            ym = p.year * 12 + p.month
            if ym < cutoff:
                continue
            slot = agg.setdefault(ym, {"gross": Decimal("0"), "deductions": Decimal("0"),
                                       "net": Decimal("0"), "sent": 0, "draft": 0})
            slot["gross"] += p.gross_earnings
            slot["deductions"] += p.total_deductions
            slot["net"] += p.net_pay
            slot["sent" if p.status == Payslip.Status.SENT else "draft"] += 1
        payroll_trend = []
        m = first_month
        while m <= today:
            s = agg.get(m.year * 12 + m.month,
                        {"gross": 0, "deductions": 0, "net": 0, "sent": 0, "draft": 0})
            payroll_trend.append({
                "month": f"{m.year}-{m.month:02d}",
                "label": f"{calendar.month_abbr[m.month]} {str(m.year)[2:]}",
                "gross": float(s["gross"]), "deductions": float(s["deductions"]),
                "net": float(s["net"]), "sent": s["sent"], "draft": s["draft"],
            })
            m = date(m.year + (m.month == 12), m.month % 12 + 1, 1)

        return {
            "year": year,
            "headcount": len(employees),
            "department_distribution": department_distribution,
            "monthly_joins": monthly_joins,
            "attendance_trend": attendance_trend,
            "leave_distribution": leave_distribution,
            "payroll_trend": payroll_trend,
            "pending_items": {
                "leave_requests": TimeOffRequest.objects.filter(
                    status=TimeOffRequest.Status.PENDING).count(),
                "missed_checkouts": attendance_service.missed_checkout_queryset().count(),
                "draft_payslips": Payslip.objects.filter(
                    status=Payslip.Status.DRAFT).count(),
            },
        }


analytics_service = AnalyticsService()