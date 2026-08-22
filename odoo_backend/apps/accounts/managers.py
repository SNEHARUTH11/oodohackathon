from django.contrib.auth.base_user import BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create(self, email, password, **extra):
        if not email:
            raise ValueError("Email is required")
        user = self.model(email=self.normalize_email(email), **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra):
        extra.setdefault("is_staff", False)
        extra.setdefault("is_superuser", False)
        return self._create(email, password, **extra)

    def create_superuser(self, email, password=None, **extra):
        extra.setdefault("is_staff", True)
        extra.setdefault("is_superuser", True)
        extra.setdefault("role", "admin")
        if extra.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        return self._create(email, password, **extra)


class EmployeeQuerySet(models.QuerySet):
    def for_request(self, request):
        """Employees see only themselves; Admin/HR see everyone."""
        user = request.user
        if not user.is_authenticated:
            return self.none()
        if user.is_admin_hr:
            return self.filter(is_active=True)
        return self.filter(id=user.id, is_active=True)

class UserManagerFromEmployeeQuerySet(
    UserManager.from_queryset(EmployeeQuerySet)
):
    pass