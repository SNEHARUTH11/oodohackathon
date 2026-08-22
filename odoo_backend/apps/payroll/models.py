import uuid
from datetime import timezone as dt_timezone
from decimal import Decimal

from django.conf import settings
from django.db import models
from django.utils import timezone

from apps.payroll.managers import PayslipQuerySet


class SalaryStructure(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                    related_name="salary_structure")
    wage_type = models.CharField(max_length=10, default="fixed")  # fixed only in v1
    monthly_wage = models.DecimalField(max_digits=12, decimal_places=2)
    yearly_wage = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0"))
    working_days_per_week = models.PositiveSmallIntegerField(default=5)
    break_time_hrs = models.DecimalField(max_digits=4, decimal_places=2, default=Decimal("1"))

    # auto-computed from CompanyConfig.salary_components — never edit directly
    basic = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    hra = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    standard_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    performance_bonus = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    lta = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    fixed_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    pf_employee = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    pf_employer = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    professional_tax = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("200"))

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.employee} · {self.monthly_wage}/mo"


class Payslip(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        GENERATED = "generated", "Generated"   # reserved (schema parity with PRD)
        SENT = "sent", "Sent"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                 related_name="payslips")
    month = models.PositiveSmallIntegerField()
    year = models.PositiveIntegerField()
    working_days = models.PositiveSmallIntegerField(default=0)
    payable_days = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("0"))

    basic = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    hra = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    standard_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    performance_bonus = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    lta = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    fixed_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    gross_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    pf_deduction = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    professional_tax = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0"))
    total_deductions = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    net_pay = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))

    status = models.CharField(max_length=10, choices=Status.choices, default=Status.DRAFT)
    flags = models.JSONField(default=dict, blank=True)
    pdf_file = models.FileField(upload_to="payslips/%Y/%m/", null=True, blank=True)
    generated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                     null=True, blank=True, related_name="generated_payslips")
    generated_at = models.DateTimeField(default=timezone.now)
    sent_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = PayslipQuerySet.as_manager()

    class Meta:
        unique_together = ("employee", "month", "year")
        ordering = ["-year", "-month"]

    def __str__(self):
        return f"{self.employee} · {self.month:02d}/{self.year} · {self.status}"