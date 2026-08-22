import uuid
from decimal import Decimal

from django.conf import settings
from django.db import models

from apps.attendance.managers import AttendanceQuerySet


class Attendance(models.Model):
    class Status(models.TextChoices):
        PRESENT = "present", "Present"
        ABSENT = "absent", "Absent"
        HALF_DAY = "half_day", "Half Day"
        LEAVE = "leave", "Leave"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="attendance_records"
    )
    date = models.DateField(db_index=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PRESENT)
    work_hours = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("0.00"))
    extra_hours = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("0.00"))
    # linked_time_off FK → added in Milestone 4 (leaves app)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="attendance_corrections",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = AttendanceQuerySet.as_manager()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["employee", "date"], name="uniq_attendance_employee_date")
        ]
        ordering = ["-date"]

    def __str__(self):
        return f"{self.employee} · {self.date} · {self.status}"


class AttendanceSession(models.Model):
    class Source(models.TextChoices):
        SELF = "self", "Self (check-in/out)"
        ADMIN = "admin", "Admin correction"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    attendance = models.ForeignKey(
        Attendance, on_delete=models.CASCADE, related_name="sessions"
    )
    check_in = models.DateTimeField()
    check_out = models.DateTimeField(null=True, blank=True)
    source = models.CharField(max_length=10, choices=Source.choices, default=Source.SELF)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="attendance_sessions_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["check_in"]

    def __str__(self):
        return f"{self.attendance.employee} · {self.check_in:%Y-%m-%d %H:%M}"