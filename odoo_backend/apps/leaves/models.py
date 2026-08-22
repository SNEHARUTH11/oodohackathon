import uuid

from django.conf import settings
from django.db import models
from django.db.models import F, Q

from apps.leaves.managers import LeaveQuerySet


class TimeOffRequest(models.Model):
    class LeaveType(models.TextChoices):
        PAID = "paid", "Paid Time Off"
        SICK = "sick", "Sick Leave"
        UNPAID = "unpaid", "Unpaid Leave"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        CANCELLED = "cancelled", "Cancelled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                 related_name="time_off_requests")
    leave_type = models.CharField(max_length=10, choices=LeaveType.choices)
    start_date = models.DateField(db_index=True)
    end_date = models.DateField(db_index=True)
    days_count = models.PositiveIntegerField(default=0)  # working days only
    remarks = models.TextField(blank=True)
    attachment = models.FileField(upload_to="leave_attachments/%Y/%m/", null=True, blank=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.PENDING)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                    null=True, blank=True, related_name="reviewed_time_off")
    review_comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = LeaveQuerySet.as_manager()

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(
                condition=Q(start_date__lte=F("end_date")),
                name="timeoff_start_lte_end",
            ),
        ]

    def __str__(self):
        return f"{self.employee} · {self.leave_type} · {self.start_date}→{self.end_date} · {self.status}"


class LeaveBalance(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                 related_name="leave_balances")
    year = models.PositiveIntegerField()
    paid_leave_total = models.PositiveIntegerField(default=24)
    paid_leave_used = models.PositiveIntegerField(default=0)
    sick_leave_total = models.PositiveIntegerField(default=7)
    sick_leave_used = models.PositiveIntegerField(default=0)
    unpaid_leave_used = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("employee", "year")

    def __str__(self):
        return f"{self.employee} · {self.year}"