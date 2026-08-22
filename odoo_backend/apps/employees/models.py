import uuid

from django.conf import settings
from django.db import models


class BankDetail(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bank_detail"
    )
    account_number = models.CharField(max_length=50)
    bank_name = models.CharField(max_length=120)
    ifsc_code = models.CharField(max_length=11)
    pan_no = models.CharField(max_length=10, blank=True)
    uan_no = models.CharField(max_length=20, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.employee} — {self.bank_name}"


class Skill(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="skills"
    )
    name = models.CharField(max_length=80)

    class Meta:
        unique_together = ("employee", "name")
        ordering = ["name"]

    def __str__(self):
        return self.name


class Certification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="certifications"
    )
    name = models.CharField(max_length=120)
    issuer = models.CharField(max_length=120, blank=True)
    issue_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    certificate_file = models.FileField(upload_to="certifications/%Y/%m/", null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-issue_date", "name"]

    def __str__(self):
        return f"{self.name} ({self.employee})"


class Document(models.Model):
    class DocType(models.TextChoices):
        OFFER_LETTER = "offer_letter", "Offer Letter"
        ID_PROOF = "id_proof", "ID Proof"
        CONTRACT = "contract", "Contract"
        RESUME = "resume", "Resume"
        OTHER = "other", "Other"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="documents"
    )
    doc_type = models.CharField(max_length=20, choices=DocType.choices)
    title = models.CharField(max_length=150, blank=True)
    file = models.FileField(upload_to="documents/%Y/%m/")
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True,
        related_name="uploaded_documents",
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self):
        return f"{self.get_doc_type_display()} — {self.employee}"