from decimal import Decimal

from django.db import models

DEFAULT_SALARY_COMPONENTS = [
    {"key": "basic", "label": "Basic Salary", "basis": "wage", "percent": 50},
    {"key": "hra", "label": "House Rent Allowance", "basis": "basic", "percent": 50},
    {"key": "standard_allowance", "label": "Standard Allowance", "basis": "wage", "percent": 8.33},
    {"key": "performance_bonus", "label": "Performance Bonus", "basis": "basic", "percent": 8.33},
    {"key": "lta", "label": "Leave Travel Allowance", "basis": "basic", "percent": 8.33},
    {"key": "fixed_allowance", "label": "Fixed Allowance", "basis": "remainder"},
]


class Company(models.Model):
    name = models.CharField(max_length=120, unique=True)
    logo = models.ImageField(upload_to="company/", null=True, blank=True)
    prefix = models.CharField(max_length=5, default="DF", help_text="Login ID generation prefix")
    timezone = models.CharField(max_length=60, default="Asia/Kolkata")

    def __str__(self):
        return self.name

def default_working_weekdays():
    return [1, 2, 3, 4, 5]


def default_salary_components():
    return list(DEFAULT_SALARY_COMPONENTS)

class CompanyConfig(models.Model):
    """Single row — every rule in the system reads from here (config-driven)."""
    company = models.OneToOneField(Company, on_delete=models.CASCADE, related_name="config")

    # Attendance
    working_weekdays = models.JSONField(default=default_working_weekdays)  # Mon=1 … Sun=7
    standard_hours_per_day = models.DecimalField(max_digits=4, decimal_places=2, default=Decimal("8"))
    half_day_threshold_hours = models.DecimalField(max_digits=4, decimal_places=2, default=Decimal("4"))
    break_time_hrs = models.DecimalField(max_digits=4, decimal_places=2, default=Decimal("1"))

    # Leave
    sick_leave_backdate_days = models.PositiveIntegerField(default=30)
    paid_leave_total = models.PositiveIntegerField(default=24)
    sick_leave_total = models.PositiveIntegerField(default=7)

    # Payroll
    pf_rate_percent = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("12"))
    professional_tax = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("200"))
    salary_components = models.JSONField(default=default_salary_components)

    updated_at = models.DateTimeField(auto_now=True)

    @classmethod
    def load(cls):
        obj = cls.objects.select_related("company").first()
        if obj is None:
            raise RuntimeError("CompanyConfig missing — run: python manage.py seed_onboarding")
        return obj

    def __str__(self):
        return f"Config: {self.company.name}"


class PublicHoliday(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="public_holidays")
    name = models.CharField(max_length=120)
    date = models.DateField()

    class Meta:
        unique_together = ("company", "date")
        ordering = ["date"]

    def __str__(self):
        return f"{self.name} ({self.date})"