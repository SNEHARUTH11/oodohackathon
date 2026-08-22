import calendar
import logging
from datetime import date, timedelta
from decimal import Decimal

from django.conf import settings
from django.core.files.base import ContentFile
from django.db import transaction
from django.template.loader import get_template
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.attendance.models import Attendance, AttendanceSession
from apps.company.models import CompanyConfig, PublicHoliday
from apps.leaves.models import TimeOffRequest
from apps.payroll.models import Payslip, SalaryStructure
from common.utils.dates import company_today, month_date_range
from services.notification_service import send_email,notify

logger = logging.getLogger(__name__)

TWO = Decimal("0.01")
ALLOWED_COMPONENTS = ["basic", "hra", "standard_allowance",
                      "performance_bonus", "lta", "fixed_allowance"]
PAID_LEAVE_TYPES = {TimeOffRequest.LeaveType.PAID, TimeOffRequest.LeaveType.SICK}


def q2(v):
    return Decimal(v).quantize(TWO)


def inr(amount):
    """₹ with Indian lakh/crore grouping, 2 decimals."""
    d = q2(amount)
    neg = d < 0
    d = abs(d)
    whole, frac = divmod(d, Decimal("1"))
    s = str(int(whole))
    if len(s) > 3:
        head, tail = s[:-3], s[-3:]
        groups = []
        while len(head) > 2:
            groups.insert(0, head[-2:])
            head = head[:-2]
        if head:
            groups.insert(0, head)
        s = ",".join(groups + [tail])
    return ("-" if neg else "") + f"₹{s}{frac:.2f}"


def month_shift(d, k):
    total = d.month - 1 + k
    return date(d.year + total // 12, total % 12 + 1, 1)


class PayrollService:

    def _cfg(self):
        return CompanyConfig.load()

    # ── salary component engine ───────────────────────────────────────
    def compute_components(self, wage, cfg):
        """Applies cfg.salary_components rules. Remainder component absorbs
        everything so the total ALWAYS equals the wage exactly."""
        wage = q2(wage)
        if wage <= 0:
            raise ValidationError({"monthly_wage": ["Wage must be greater than zero."]})
        values, labels = {}, {}
        remainder_key = "fixed_allowance"
        for rule in cfg.salary_components:
            key = rule.get("key")
            if key not in ALLOWED_COMPONENTS:
                continue
            labels[key] = rule.get("label", key.replace("_", " ").title())
            if rule.get("basis") == "remainder":
                remainder_key = key
                continue
            base = wage if rule.get("basis") == "wage" else values.get("basic", Decimal("0"))
            percent = Decimal(str(rule.get("percent", 0)))
            values[key] = q2(base * percent / 100)
        remainder = wage - sum(values.values())
        if remainder < 0:
            raise ValidationError({
                "monthly_wage": ["Component rules exceed 100% of wage — "
                                 "check CompanyConfig.salary_components."]})
        values[remainder_key] = q2(remainder)
        for k in ALLOWED_COMPONENTS:
            values.setdefault(k, Decimal("0"))
            labels.setdefault(k, k.replace("_", " ").title())
        return values, labels, remainder_key

    # ── salary structure CRUD ─────────────────────────────────────────
    def structure_payload(self, struct, cfg=None):
        cfg = cfg or self._cfg()
        values, labels, _ = self.compute_components(struct.monthly_wage, cfg)
        pf_rate = cfg.pf_rate_percent
        return {
            "employee": {"id": str(struct.employee_id),
                         "name": struct.employee.full_name,
                         "login_id": struct.employee.login_id},
            "wage_type": struct.wage_type,
            "monthly_wage": struct.monthly_wage,
            "monthly_wage_display": inr(struct.monthly_wage),
            "yearly_wage": struct.yearly_wage,
            "yearly_wage_display": inr(struct.yearly_wage),
            "working_days_per_week": struct.working_days_per_week,
            "break_time_hrs": struct.break_time_hrs,
            "components": [{"key": k, "label": labels[k], "amount": values[k],
                            "amount_display": inr(values[k])} for k in ALLOWED_COMPONENTS],
            **{k: values[k] for k in ALLOWED_COMPONENTS},
            "pf_employee": struct.pf_employee,
            "pf_employer": struct.pf_employer,
            "pf_rate_percent": pf_rate,
            "professional_tax": struct.professional_tax,
            "updated_at": struct.updated_at,
        }

    def upsert_structure(self, employee, data):
        cfg = self._cfg()
        struct = SalaryStructure.objects.filter(employee=employee).first()
        created = struct is None
        if created:
            if data.get("monthly_wage") is None:
                raise ValidationError({"monthly_wage": ["Required to create a salary structure."]})
            struct = SalaryStructure(
                employee=employee,
                monthly_wage=q2(data["monthly_wage"]),
                working_days_per_week=len(cfg.working_weekdays),
                break_time_hrs=cfg.break_time_hrs,
                professional_tax=cfg.professional_tax,
            )
        else:
            if data.get("monthly_wage") is not None:
                struct.monthly_wage = q2(data["monthly_wage"])
        struct.working_days_per_week = data.get(
            "working_days_per_week", struct.working_days_per_week)
        struct.break_time_hrs = data.get("break_time_hrs", struct.break_time_hrs)
        struct.professional_tax = data.get("professional_tax", struct.professional_tax)

        values, _, _ = self.compute_components(struct.monthly_wage, cfg)
        for k in ALLOWED_COMPONENTS:
            setattr(struct, k, values[k])
        pf = q2(values["basic"] * cfg.pf_rate_percent / 100)
        struct.pf_employee = pf
        struct.pf_employer = pf
        struct.yearly_wage = q2(struct.monthly_wage * 12)
        struct.save()
        logger.info(f"Salary structure {'created' if created else 'updated'}: "
                    f"{employee.login_id} wage={struct.monthly_wage}")
        return self.structure_payload(struct, cfg)

    # ── payable days (attendance → payroll) ───────────────────────────
    def _compute_days(self, employee, cfg, month, year, today):
        m_start, m_end = month_date_range(year, month)
        if (year, month) > (today.year, today.month):
            raise ValidationError({"detail": "Payslips cannot be generated for a future month."})
        current = (year, month) == (today.year, today.month)
        eff_end = today if current else m_end
        start = max(m_start, employee.date_of_joining) if employee.date_of_joining else m_start
        if start > eff_end:
            return None

        holidays = set(PublicHoliday.objects.filter(
            company=cfg.company, date__range=(start, eff_end)).values_list("date", flat=True))
        weekdays = set(cfg.working_weekdays)
        dates = [start + timedelta(days=i) for i in range((eff_end - start).days + 1)]
        dates = [d for d in dates if d.isoweekday() in weekdays and d not in holidays]
        if not dates:
            return None

        rows = {a.date: a for a in Attendance.objects.filter(
            employee=employee, date__in=dates).select_related("linked_time_off")}

        payable = Decimal("0")
        flags = {"absent_days": 0, "half_days": 0, "unpaid_leave_days": 0,
                 "manual_leave_days": 0, "missed_checkout_days": 0,
                 "partial_month": current}
        for d in dates:
            att = rows.get(d)
            if att is None:
                flags["absent_days"] += 1
            elif att.status == Attendance.Status.PRESENT:
                payable += 1
            elif att.status == Attendance.Status.HALF_DAY:
                payable += Decimal("0.5")
                flags["half_days"] += 1
            elif att.status == Attendance.Status.LEAVE:
                lt = att.linked_time_off.leave_type if att.linked_time_off else None
                if lt in PAID_LEAVE_TYPES:
                    payable += 1
                elif lt == TimeOffRequest.LeaveType.UNPAID:
                    flags["unpaid_leave_days"] += 1     # 0 payable
                else:                                    # admin-set leave, no request link
                    payable += 1
                    flags["manual_leave_days"] += 1

        flags["missed_checkout_days"] = AttendanceSession.objects.filter(
            check_out__isnull=True, attendance__date__lt=today,
            attendance__date__range=(m_start, eff_end),
            attendance__employee=employee).count()

        return {"working_days": len(dates), "payable_days": q2(payable), "flags": flags}

    def _fill_payslip(self, payslip, struct, days, cfg):
        ratio = days["payable_days"] / Decimal(days["working_days"])
        total = Decimal("0")
        for k in ALLOWED_COMPONENTS:
            amount = q2(getattr(struct, k) * ratio)
            setattr(payslip, k, amount)
            total += amount
        payslip.gross_earnings = q2(total)
        payslip.pf_deduction = q2(struct.basic * ratio * cfg.pf_rate_percent / 100)
        payslip.professional_tax = struct.professional_tax
        payslip.total_deductions = q2(payslip.pf_deduction + payslip.professional_tax)
        payslip.net_pay = q2(payslip.gross_earnings - payslip.total_deductions)
        payslip.working_days = days["working_days"]
        payslip.payable_days = days["payable_days"]
        payslip.flags = days["flags"]

    # ── generate / regenerate ─────────────────────────────────────────
    def generate(self, actor, month, year):
        cfg = self._cfg()
        today = company_today(cfg.company.timezone)
        from django.contrib.auth import get_user_model
        employees = list(get_user_model().objects.filter(
            is_active=True, is_superuser=False).select_related("salary_structure")
            .order_by("login_id"))

        results, counts = [], {"generated": 0, "regenerated": 0, "skipped_sent": 0,
                               "skipped_no_structure": 0, "skipped_no_working_days": 0}
        for emp in employees:
            card = {"employee": {"id": str(emp.id), "login_id": emp.login_id,
                                 "name": emp.full_name}}
            struct = emp.salary_structure if hasattr(emp, "salary_structure") else None
            if struct is None:
                counts["skipped_no_structure"] += 1
                results.append({**card, "result": "skipped_no_structure"})
                continue
            existing = Payslip.objects.filter(employee=emp, month=month, year=year).first()
            if existing and existing.status == Payslip.Status.SENT:
                counts["skipped_sent"] += 1
                results.append({**card, "result": "skipped_sent",
                                "payslip_id": str(existing.id)})
                continue
            days = self._compute_days(emp, cfg, month, year, today)
            if days is None:
                counts["skipped_no_working_days"] += 1
                results.append({**card, "result": "skipped_no_working_days"})
                continue
            with transaction.atomic():
                payslip, _ = Payslip.objects.get_or_create(employee=emp, month=month, year=year)
                self._fill_payslip(payslip, struct, days, cfg)
                payslip.status = Payslip.Status.DRAFT
                payslip.generated_by = actor
                payslip.generated_at = timezone.now()
                if payslip.pdf_file:
                    payslip.pdf_file.delete(save=False)
                    payslip.pdf_file = None
                payslip.save()
            outcome = "regenerated" if existing else "generated"
            counts[outcome] += 1
            results.append({**card, "result": outcome, "payslip_id": str(payslip.id),
                            "payable_days": payslip.payable_days,
                            "working_days": payslip.working_days,
                            "net_pay": payslip.net_pay,
                            "net_pay_display": inr(payslip.net_pay),
                            "flags": payslip.flags})
        logger.info(f"Payroll generate {month:02d}/{year} by {actor.login_id}: {counts}")
        return {"month": month, "year": year, "counts": counts, "results": results}

    def regenerate(self, actor, payslip):
        if payslip.status != Payslip.Status.DRAFT:
            raise ValidationError({"detail": "Only draft payslips can be regenerated."})
        cfg = self._cfg()
        today = company_today(cfg.company.timezone)
        struct = SalaryStructure.objects.filter(employee=payslip.employee).first()
        if struct is None:
            raise ValidationError({"detail": "Employee no longer has a salary structure."})
        days = self._compute_days(payslip.employee, cfg, payslip.month, payslip.year, today)
        if days is None:
            raise ValidationError({"detail": "No working days in this period for this employee."})
        self._fill_payslip(payslip, struct, days, cfg)
        payslip.generated_by = actor
        payslip.generated_at = timezone.now()
        if payslip.pdf_file:
            payslip.pdf_file.delete(save=False)
            payslip.pdf_file = None
        payslip.save()
        return self.payslip_payload(payslip)

    # ── PDF ───────────────────────────────────────────────────────────
    def _pdf_context(self, payslip, cfg):
        values, labels, _ = self.compute_components(
            payslip.employee.salary_structure.monthly_wage
            if hasattr(payslip.employee, "salary_structure") else payslip.basic * 2, cfg)
        earnings = [{"label": labels[k],
                     "amount_display": inr(getattr(payslip, k))} for k in ALLOWED_COMPONENTS]
        return {
            "company": {"name": cfg.company.name},
            "logo_path": cfg.company.logo.path if cfg.company.logo else None,
            "employee": {"name": payslip.employee.full_name,
                         "login_id": payslip.employee.login_id,
                         "department": payslip.employee.department,
                         "job_position": payslip.employee.job_position,
                         "date_of_joining": payslip.employee.date_of_joining},
            "month_label": calendar.month_name[payslip.month],
            "year": payslip.year,
            "working_days": payslip.working_days,
            "payable_days": f"{payslip.payable_days.normalize():f}",
            "earnings": earnings,
            "gross_display": inr(payslip.gross_earnings),
            "pf_display": inr(payslip.pf_deduction),
            "pf_rate": f"{cfg.pf_rate_percent.normalize():f}%",
            "pt_display": inr(payslip.professional_tax),
            "deductions_display": inr(payslip.total_deductions),
            "net_display": inr(payslip.net_pay),
            "currency": "INR",
            "generated_at": timezone.localtime(payslip.generated_at).strftime("%d %b %Y, %H:%M"),
        }

    def render_pdf(self, payslip):
        from weasyprint import HTML

        cfg = self._cfg()
        html = get_template("payslip.html").render(self._pdf_context(payslip, cfg))
        return HTML(string=html, base_url=str(settings.BASE_DIR)).write_pdf()

    # ── send (lock + email) ───────────────────────────────────────────
    def send_one(self, actor, payslip):
        if payslip.status != Payslip.Status.DRAFT:
            raise ValidationError({"detail": f"Only draft payslips can be sent "
                                             f"(current: {payslip.status})."})
        pdf_bytes = self.render_pdf(payslip)
        filename = f"payslip_{payslip.employee.login_id}_{payslip.year}_{payslip.month:02d}.pdf"
        payslip.pdf_file.save(filename, ContentFile(pdf_bytes), save=False)
        payslip.status = Payslip.Status.SENT
        payslip.sent_at = timezone.now()
        payslip.save()
        month_label = calendar.month_name[payslip.month]
        send_email(
            subject=f"Your payslip for {month_label} {payslip.year} is ready",
            message=(f"Hi {payslip.employee.full_name},\n\n"
                     f"Your payslip for {month_label} {payslip.year} has been generated.\n"
                     f"Payable days: {payslip.payable_days} of {payslip.working_days}\n"
                     f"Net pay: {inr(payslip.net_pay)}\n\n"
                     f"The detailed payslip (PDF) is attached."),
            recipient_list=[payslip.employee.email],
            attachments=[(filename, pdf_bytes, "application/pdf")],
        )
        notify(payslip.employee, "payslip", "Payslip ready",
               f"Your payslip for {month_label} {payslip.year} is available "
               f"(net {inr(payslip.net_pay)}).", {"payslip_id": str(payslip.id)})
        logger.info(f"Payslip sent: {payslip} by {actor.login_id}")
        return self.payslip_payload(payslip)

    def send_bulk(self, actor, ids=None, month=None, year=None):
        qs = Payslip.objects.filter(status=Payslip.Status.DRAFT).select_related("employee")
        if ids:
            qs = qs.filter(id__in=ids)
        else:
            qs = qs.filter(month=month, year=year)
        results = {"sent": 0, "failed": 0, "items": []}
        for payslip in qs:
            try:
                self.send_one(actor, payslip)
                results["sent"] += 1
                results["items"].append({"payslip_id": str(payslip.id),
                                         "employee": payslip.employee.full_name,
                                         "status": "sent"})
            except ValidationError as exc:
                results["failed"] += 1
                results["items"].append({"payslip_id": str(payslip.id),
                                         "employee": payslip.employee.full_name,
                                         "status": "error",
                                         "error": str(exc.detail.get("detail", exc.detail))})
        return results

    # ── payloads / lists ──────────────────────────────────────────────
    def payslip_payload(self, p, detailed=True):
        data = {
            "id": str(p.id),
            "employee": {"id": str(p.employee_id), "name": p.employee.full_name,
                         "login_id": p.employee.login_id},
            "month": p.month, "year": p.year,
            "month_label": f"{calendar.month_name[p.month]} {p.year}",
            "working_days": p.working_days,
            "payable_days": p.payable_days,
            "status": p.status,
            "generated_at": p.generated_at,
            "sent_at": p.sent_at,
            "pdf_url": p.pdf_file.url if p.pdf_file else None,
        }
        if detailed:
            data.update({
                "earnings": {k: getattr(p, k) for k in ALLOWED_COMPONENTS},
                "gross_earnings": p.gross_earnings, "gross_earnings_display": inr(p.gross_earnings),
                "pf_deduction": p.pf_deduction, "pf_deduction_display": inr(p.pf_deduction),
                "professional_tax": p.professional_tax,
                "total_deductions": p.total_deductions,
                "net_pay": p.net_pay, "net_pay_display": inr(p.net_pay),
                "flags": p.flags,
            })
        return data

    def payroll_list(self, params):
        cfg = self._cfg()
        today = company_today(cfg.company.timezone)

        def _int(val, field, default):
            if val in (None, ""):
                return default
            try:
                return int(val)
            except (TypeError, ValueError):
                raise ValidationError({field: ["Must be an integer."]})

        month = _int(params.get("month"), "month", today.month)
        year = _int(params.get("year"), "year", today.year)
        if not 1 <= month <= 12:
            raise ValidationError({"month": ["Must be between 1 and 12."]})

        from django.contrib.auth import get_user_model
        employees = list(get_user_model().objects.filter(
            is_active=True, is_superuser=False).select_related("salary_structure")
            .order_by("login_id"))
        payslips = {p.employee_id: p for p in Payslip.objects.filter(month=month, year=year)}

        counts = {"draft": 0, "sent": 0, "not_generated": 0, "no_structure": 0}
        items = []
        for emp in employees:
            struct = emp.salary_structure if hasattr(emp, "salary_structure") else None
            p = payslips.get(emp.id)
            item = {
                "employee": {"id": str(emp.id), "login_id": emp.login_id,
                             "name": emp.full_name, "department": emp.department,
                             "profile_picture": emp.profile_picture.url
                             if emp.profile_picture else None},
                "monthly_wage": struct.monthly_wage if struct else None,
                "monthly_wage_display": inr(struct.monthly_wage) if struct else None,
                "payslip": self.payslip_payload(p, detailed=False) if p else None,
            }
            if p and p.status == Payslip.Status.DRAFT:
                item["payslip"].update({"net_pay": p.net_pay,
                                        "net_pay_display": inr(p.net_pay),
                                        "flags": p.flags})
                counts["draft"] += 1
            elif p:
                counts["sent"] += 1
            elif struct is None:
                counts["no_structure"] += 1
            else:
                counts["not_generated"] += 1
            items.append(item)
        return {"month": month, "year": year,
                "month_label": f"{calendar.month_name[month]} {year}", "counts": counts,
                "items": items}


payroll_service = PayrollService()