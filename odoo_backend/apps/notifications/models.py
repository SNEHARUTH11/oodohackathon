import uuid

from django.conf import settings
from django.db import models


class Notification(models.Model):
    class Type(models.TextChoices):
        LEAVE = "leave", "Leave"
        PAYSLIP = "payslip", "Payslip"
        ACCOUNT = "account", "Account"
        SYSTEM = "system", "System"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                  related_name="notifications")
    title = models.CharField(max_length=150)
    message = models.TextField()
    type = models.CharField(max_length=10, choices=Type.choices, default=Type.SYSTEM)
    data = models.JSONField(default=dict, blank=True)   # e.g. {"request_id": "..."}
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["recipient", "is_read"])]

    def __str__(self):
        return f"{self.recipient} · {self.title}"