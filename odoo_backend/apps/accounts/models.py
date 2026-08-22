import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models

from apps.company.models import Company
from apps.accounts.managers import UserManagerFromEmployeeQuerySet


class User(AbstractUser):
    class Role(models.TextChoices):
        EMPLOYEE = "employee", "Employee"
        ADMIN = "admin", "Admin"
        HR_OFFICER = "hr_officer", "HR Officer"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = None  # email is the username

    email = models.EmailField("email address", unique=True)
    login_id = models.CharField(          # e.g. OIJODO20220001 — also serves as emp_code
        max_length=20, unique=True, null=True, blank=True, editable=False,
        help_text="Auto-generated. Null only for system superusers.",
    )
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.EMPLOYEE)
    company = models.ForeignKey(Company, on_delete=models.PROTECT, related_name="employees",
                                null=True, blank=True)
    manager = models.ForeignKey("self", on_delete=models.SET_NULL, null=True, blank=True,
                                related_name="team_members")

    # Profile fields
    phone = models.CharField(max_length=15, blank=True)
    department = models.CharField(max_length=100, blank=True)
    job_position = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=100, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    date_of_joining = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True)
    marital_status = models.CharField(max_length=20, blank=True)
    nationality = models.CharField(max_length=60, blank=True)
    personal_email = models.EmailField(blank=True)
    residing_address = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to="profile_pictures/", null=True, blank=True)

    # Security
    must_change_password = models.BooleanField(
        default=False, help_text="Forced password change on first login."
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManagerFromEmployeeQuerySet()

    class Meta:
        ordering = ["-date_joined"]

    @property
    def is_admin_hr(self):
        return self.role in {self.Role.ADMIN, self.Role.HR_OFFICER}

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def emp_code(self):
        return self.login_id