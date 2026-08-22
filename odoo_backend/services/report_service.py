import calendar
import csv
import logging
from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.db.models import Count
from django.http import HttpResponse
from rest_framework.exceptions import ValidationError

from apps.attendance.models import Attendance
from apps.company.models import CompanyConfig, PublicHoliday
from apps.leaves.models import LeaveBalance, TimeOffRequest
from apps.payroll.models import Payslip, SalaryStructure
from common.utils.dates import company_today, month_date_range

logger = logging.getLogger(__name__)
User = get_user_model()

LEGEND = [
    {"code": "P", "meaning": "Present"}, {"code": "HD", "meaning": "Half Day"},
    {"code": "L", "meaning": "Leave (paid / sick / manual)"}, {"code": "UL", "meaning": "Unpaid Leave"},
    {"code": "A", "meaning": "Absent"}, {"code": "WE", "meaning": "Weekend"},
    {"code": "HOL", "meaning": "Public Holiday"}, {"code": "NJ", "meaning": "Not Joined"},
]
COMPONENTS = ["basic", "hra", "standard_allowance", "performance_bonus",
              "lta", "fixed_allowance"]


def _int(val, field, default):
    if val in (None, ""):
        return default
    try:
        return int(val)
    except (TypeError, ValueError):
        raise ValidationError({field: ["Must be an integer."]})


def _csv_response(filename, header, rows):
    resp = HttpResponse(content_type="text/csv")
    resp["Content-Disposition"] = f'attachment; filename="{filename}"'
    writer = csv.writer(resp)
    writer.writerow(header)
    writer.writerows(rows)
    return resp


class ReportService:

    def _cfg_today(self):
        cfg = CompanyConfig.load()
        return cfg, company_today(cfg.company.timezone)

    def _employees(self, employee_id=None, department=None):
        qs = User.objects.filter(is_active=True, is_superuser=False)
        if employee_id:
            qs = qs.filter(id=employee_id)
        if department:
            qs = qs.filter(department__icontains=department)
        return list(qs.order_by("login_id"))

    @staticmethod
    def _rate(present, half, leave, working):
        if not working:
            return None
        return round((present + 0.5 * half + leave) / working * 100, 1)

    # ── 1. Attendance sheet (matrix + summary) ────────────────────────
    def attendance_monthly(self, params, export=False):
        cfg, today = self._cfg_today()
        month = _int(params.get("month"), "month", today.month)
        year = _int(params.get("year"), "year", today.year)
        if not 1 <= month <= 12:
            raise ValidationError({"month": ["Must be between 1 and 12."]})
        employees = self._employees(params.get("employee_id"), params.get("department"))
        start, end = month_date_range(year, month)
        weekdays = set(cfg.working_weekdays)
        holidays = set(PublicHoliday.objects.filter(
            company=cfg.company, date__range=(start, end)).values_list("date", flat=True))
        att = {(a.employee_id, a.date): a for a in
               Attendance.objects.filter(employee__in=employees, date__range=(start, end))
               .select_related("linked_time_off")}

        items, totals = [], dict(present=0, half_days=0, leave_days=0,
                                 unpaid_leave_days=0, absent=0, working_days=0)
        csv_rows = []
        for emp in employees:
            codes, s = {}, dict(present=0, half_days=0, leave_days=0,
                                unpaid_leave_days=0, absent=0, working_days=0)
            d = start
            while d <= end:
                if emp.date_of_joining and d < emp.date_of_joining:
                    code = "NJ"
                elif d.isoweekday() not in weekdays:
                    code = "WE"
                elif d in holidays:
                    code = "HOL"
                elif d > today:
                    code = ""
                else:
                    s["working_days"] += 1
                    a = att.get((emp.id, d))
                    if a is None:
                        code, s["absent"] = "A", s["absent"] + 1
                    elif a.status == Attendance.Status.PRESENT:
                        code, s["present"] = "P", s["present"] + 1
                    elif a.status == Attendance.Status.HALF_DAY:
                        code, s["half_days"] = "HD", s["half_days"] + 1
                    elif a.status == Attendance.Status.LEAVE:
                        lt = a.linked_time_off.leave_type if a.linked_time_off else None
                        if lt == "unpaid":
                            code = "UL"; s["unpaid_leave_days"] += 1
                        else:
                            code = "L"; s["leave_days"] += 1
                    else:
                        code, s["absent"] = "A", s["absent"] + 1
                codes[str(d.day)] = code
                d += timedelta(days=1)
            for k in totals:
                totals[k] += s[k]
            items.append({
                "employee": {"id": str(emp.id), "login_id": emp.login_id,
                             "name": emp.full_name, "department": emp.department},
                "codes": codes,
                "summary": {**s, "attendance_rate": self._rate(
                    s["present"], s["half_days"], s["leave_days"], s["working_days"])},
            })
            csv_rows.append([emp.login_id, emp.full_name, emp.department]
                            + [codes[str(d)] for d in range(1, end.day + 1)]
                            + [s["present"], s["half_days"], s["leave_days"],
                               s["unpaid_leave_days"], s["absent"], s["working_days"],
                               self._rate(s["present"], s["half_days"],
                                          s["leave_days"], s["working_days"]) or ""])

        totals["attendance_rate"] = self._rate(
            totals["present"], totals["half_days"], totals["leave_days"],
            totals["working_days"])
        if export:
            header = (["Login ID", "Name", "Department"]
                      + [str(d) for d in range(1, end.day + 1)]
                      + ["P", "HD", "L", "UL", "A", "Working Days", "Rate %"])
            return _csv_response(f"attendance_{year}_{month:02d}.csv", header, csv_rows)
        return {"month": month, "year": year,
                "month_label": f"{calendar.month_name[month]} {year}",
                "legend": LEGEND, "employees": items, "totals": totals}

    # ── 2. Payroll register ───────────────────────────────────────────
    def payroll_register(self, params, export=False):
        _, today = self._cfg_today()
        month = _int(params.get("month"), "month", today.month)
        year = _int(params.get("year"), "year", today.year)
        if not 1 <= month <= 12:
            raise ValidationError({"month": ["Must be between 1 and 12."]})
        employees = self._employees(params.get("employee_id"), params.get("department"))
        structs = {s.employee_id: s for s in
                   SalaryStructure.objects.filter(employee__in=employees)}
        slips = {p.employee_id: p for p in
                 Payslip.objects.filter(employee__in=employees, month=month, year=year)}

        items, totals, csv_rows = [], dict(gross=0, deductions=0, net=0, payslips=0), []
        for emp in employees:
            s, p = structs.get(emp.id), slips.get(emp.id)
            item = {
                "employee": {"id": str(emp.id), "login_id": emp.login_id,
                             "name": emp.full_name, "department": emp.department},
                "monthly_wage": float(s.monthly_wage) if s else None,
                "payslip_status": p.status if p else "not_generated",
                "working_days": p.working_days if p else None,
                "payable_days": float(p.payable_days) if p else None,
                **{k: float(getattr(p, k)) if p else None for k in COMPONENTS},
                "gross_earnings": float(p.gross_earnings) if p else None,
                "pf_deduction": float(p.pf_deduction) if p else None,
                "professional_tax": float(p.professional_tax) if p else None,
                "total_deductions": float(p.total_deductions) if p else None,
                "net_pay": float(p.net_pay) if p else None,
            }
            items.append(item)
            if p:
                totals["gross"] += float(p.gross_earnings)
                totals["deductions"] += float(p.total_deductions)
                totals["net"] += float(p.net_pay)
                totals["payslips"] += 1
            csv_rows.append([
                emp.login_id, emp.full_name, emp.department,
                s.monthly_wage if s else "", p.status if p else "not_generated",
                p.working_days if p else "", p.payable_days if p else "",
                *([getattr(p, k) for k in COMPONENTS]
                  if p else ["" for _ in COMPONENTS]),
                p.gross_earnings if p else "", p.pf_deduction if p else "",
                p.professional_tax if p else "", p.total_deductions if p else "",
                p.net_pay if p else "",
            ])
        csv_rows.append([
            "TOTALS", "", "", "", "", "",
            totals["gross"], "", "",
            totals["deductions"],
            totals["net"]
        ])
        if export:
            header = (["Login ID", "Name", "Department", "Wage", "Status",
                       "Working Days", "Payable Days"]
                      + [c.replace("_", " ").title() for c in COMPONENTS]
                      + ["Gross", "PF", "Prof Tax", "Deductions", "Net Pay"])
            return _csv_response(f"payroll_register_{year}_{month:02d}.csv", header, csv_rows)
        return {"month": month, "year": year,
                "month_label": f"{calendar.month_name[month]} {year}",
                "totals": totals, "items": items}

    # ── 3. Leave summary ──────────────────────────────────────────────
    def leave_summary(self, params, export=False):
        cfg, today = self._cfg_today()
        year = _int(params.get("year"), "year", today.year)
        employees = self._employees(params.get("employee_id"), params.get("department"))
        balances = {b.employee_id: b for b in
                    LeaveBalance.objects.filter(employee__in=employees, year=year)}
        pending = dict(TimeOffRequest.objects.filter(
            employee__in=employees, status=TimeOffRequest.Status.PENDING)
            .values_list("employee_id").annotate(c=Count("id")))

        items, csv_rows = [], []
        totals = dict(paid_used=0, sick_used=0, unpaid_used=0, pending=0)
        for emp in employees:
            b = balances.get(emp.id)
            paid_t = b.paid_leave_total if b else cfg.paid_leave_total
            sick_t = b.sick_leave_total if b else cfg.sick_leave_total
            paid_u = b.paid_leave_used if b else 0
            sick_u = b.sick_leave_used if b else 0
            unpaid_u = b.unpaid_leave_used if b else 0
            pend = pending.get(emp.id, 0)
            totals.update(paid_used=totals["paid_used"] + paid_u,
                          sick_used=totals["sick_used"] + sick_u,
                          unpaid_used=totals["unpaid_used"] + unpaid_u,
                          pending=totals["pending"] + pend)
            items.append({
                "employee": {"id": str(emp.id), "login_id": emp.login_id,
                             "name": emp.full_name, "department": emp.department},
                "paid": {"total": paid_t, "used": paid_u, "available": paid_t - paid_u},
                "sick": {"total": sick_t, "used": sick_u, "available": sick_t - sick_u},
                "unpaid_used": unpaid_u, "pending_requests": pend,
            })
            csv_rows.append([emp.login_id, emp.full_name, emp.department,
                             paid_t, paid_u, paid_t - paid_u,
                             sick_t, sick_u, sick_t - sick_u, unpaid_u, pend])
        if export:
            header = ["Login ID", "Name", "Department",
                      "Paid Total", "Paid Used", "Paid Avail",
                      "Sick Total", "Sick Used", "Sick Avail",
                      "Unpaid Used", "Pending Requests"]
            return _csv_response(f"leave_summary_{year}.csv", header, csv_rows)
        return {"year": year, "totals": totals, "items": items}


report_service = ReportService()