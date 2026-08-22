import logging
from datetime import date

from django.conf import settings
from django.utils.crypto import get_random_string
from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework.exceptions import ValidationError

from apps.company.models import Company
from apps.employees.models import BankDetail, Certification, Document, Skill
from services.notification_service import notify, send_email

logger = logging.getLogger(__name__)
User = get_user_model()


# ── Login ID generator ────────────────────────────────────────────────────────
def _safe_part(s, n=2):
    return (s or "").strip().upper()[:n].ljust(n, "X")


def generate_login_id(company, full_name, joining_year):
    """
    [PREFIX][F2 first][F2 last][year][serial 4]  e.g. OIJODO20220001
    Serial increments within the (prefix+initials+year) group; collision-safe.
    """
    parts = (full_name or "").strip().split(" ", 1)
    stem = (f"{(company.prefix or 'DF').upper()}{_safe_part(parts[0])}"
            f"{_safe_part(parts[1] if len(parts) > 1 else '')}{joining_year}")
    serial = 0
    for lid in User.objects.filter(login_id__startswith=stem).values_list("login_id", flat=True):
        try:
            serial = max(serial, int(lid[-4:]))
        except ValueError:
            continue
    return f"{stem}{serial + 1:04d}"


class EmployeeService:
    def reset_password(self, actor, employee, new_password=None):
        """Admin resets an employee's password. Forces change on next login,
        kills their sessions, emails them. Password returned ONCE in response."""
        if employee.id == actor.id:
            raise ValidationError({"detail": "Use change-password for your own account."})
        temp_password = new_password or settings.DEMO_TEMP_PASSWORD or get_random_string(12)
        employee.set_password(temp_password)
        employee.must_change_password = True
        employee.save(update_fields=["password", "must_change_password"])

        from services.auth_service import auth_service
        auth_service._blacklist_all_sessions(employee)   # log out everywhere

        send_email(
            subject="Your Dayflow password was reset",
            message=(f"Hi {employee.first_name},\n\nYour password was reset by "
                     f"{actor.full_name}.\nTemporary password: {temp_password}\n"
                     f"You will be asked to change it on next sign-in."),
            recipient_list=[employee.email],
        )
        from services.notification_service import notify
        notify(employee, "account", "Password reset",
               "Your password was reset by HR. Check your email for the temporary password.")
        logger.info(f"Password reset for {employee.login_id} by {actor.login_id}")
        return {"id": str(employee.id), "login_id": employee.login_id,
                "name": employee.full_name, "temp_password": temp_password,
                "must_change_password": True}

    # ── creation ─────────────────────────────────────────────────────────
    def create_employee(self, actor, data):
        email = data["email"].strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise ValidationError({"email": ["A user with this email already exists."]})

        company = actor.company or Company.objects.first()
        joining = data.get("date_of_joining") or date.today()
        full_name = f"{data['first_name']} {data['last_name']}".strip()
        temp_password = settings.DEMO_TEMP_PASSWORD or get_random_string(12)

        user = User.objects.create_user(
            email=email,
            password=temp_password,
            first_name=data["first_name"].strip(),
            last_name=data["last_name"].strip(),
            login_id=generate_login_id(company, full_name, joining.year),
            role=data.get("role", User.Role.EMPLOYEE),
            company=company,
            phone=data.get("phone", ""),
            department=data.get("department", ""),
            job_position=data.get("job_position", ""),
            location=data.get("location", ""),
            manager=data.get("manager"),
            date_of_joining=joining,
            must_change_password=True,
        )
        send_email(
            subject="Your Dayflow account is ready",
            message=(
                f"Hi {user.first_name},\n\n"
                f"Your Dayflow HRMS account has been created.\n\n"
                f"Email: {user.email}\nLogin ID: {user.login_id}\n"
                f"Temporary password: {temp_password}\n\n"
                f"Sign in at {settings.FRONTEND_URL}/sign-in — you will be "
                f"asked to change your password on first login."
            ),
            recipient_list=[user.email],
        )
        notify(user, "account", "Welcome to Dayflow",
               f"Your account is ready. Login ID: {user.login_id}. "
               f"Check your email for the temporary password.")
        logger.info(f"Employee created: {user.login_id} (by {actor.login_id})")
        payload = self.detail_payload(user)
        payload["temp_password"] = temp_password  # returned ONCE — never stored
        return payload

    # ── queries / payloads ───────────────────────────────────────────────
    def list_employees(self, params):
        qs = (User.objects.filter(is_superuser=False)
              .select_related("manager").order_by("-date_joined"))
        search = (params.get("search") or "").strip()
        if search:
            qs = qs.filter(Q(first_name__icontains=search) | Q(last_name__icontains=search)
                           | Q(email__icontains=search) | Q(login_id__icontains=search)
                           | Q(department__icontains=search))
        role = params.get("role")
        if role:
            qs = qs.filter(role=role)
        department = params.get("department")
        if department:
            qs = qs.filter(department__icontains=department)
        is_active = params.get("is_active")
        if is_active in ("true", "false"):
            qs = qs.filter(is_active=(is_active == "true"))
        return qs

    @staticmethod
    def _picture(u):
        return u.profile_picture.url if u.profile_picture else None

    def list_item(self, u):
        return {
            "id": str(u.id),
            "login_id": u.login_id,
            "name": u.full_name,
            "email": u.email,
            "phone": u.phone,
            "role": u.role,
            "department": u.department,
            "job_position": u.job_position,
            "location": u.location,
            "manager_name": u.manager.full_name if u.manager else None,
            "date_of_joining": u.date_of_joining,
            "profile_picture": self._picture(u),
            "is_active": u.is_active,
        }

    def detail_payload(self, u):
        return {
            "id": str(u.id),
            "login_id": u.login_id,
            "emp_code": u.emp_code,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "full_name": u.full_name,
            "email": u.email,
            "phone": u.phone,
            "role": u.role,
            "company": u.company.name if u.company else None,
            "department": u.department,
            "job_position": u.job_position,
            "location": u.location,
            "manager": ({"id": str(u.manager_id), "name": u.manager.full_name}
                        if u.manager else None),
            "date_of_joining": u.date_of_joining,
            "date_of_birth": u.date_of_birth,
            "gender": u.gender,
            "marital_status": u.marital_status,
            "nationality": u.nationality,
            "personal_email": u.personal_email,
            "residing_address": u.residing_address,
            "about": u.about,
            "what_i_love_about_job": u.what_i_love_about_job,
            "interests_hobbies": u.interests_hobbies,
            "profile_picture": self._picture(u),
        }

    def public_payload(self, u):
        """Public subset — visible to any colleague via dashboard card click."""
        return {
            "id": str(u.id),
            "name": u.full_name,
            "profile_picture": self._picture(u),
            "job_position": u.job_position,
            "department": u.department,
            "manager_name": u.manager.full_name if u.manager else None,
            "location": u.location,
        }

    # ── updates ──────────────────────────────────────────────────────────
    def update_employee(self, employee, data):
        for field, value in data.items():
            setattr(employee, field, value)
        employee.save(update_fields=list(data.keys()))
        return self.detail_payload(employee)

    def update_self_profile(self, user, data):
        for field, value in data.items():
            setattr(user, field, value)
        user.save(update_fields=list(data.keys()))
        return self.detail_payload(user)

    def upload_picture(self, user, image):
        if user.profile_picture:
            user.profile_picture.delete(save=False)  # remove old file from disk
        user.profile_picture = image
        user.save(update_fields=["profile_picture"])
        return user.profile_picture.url

    def toggle_employee_status(self, actor, employee):
        if employee.id == actor.id:
            raise ValidationError({"detail": "You cannot change your own account status."})
        if employee.is_active and employee.role == User.Role.ADMIN:
            if User.objects.filter(role=User.Role.ADMIN, is_active=True).count() <= 1:
                raise ValidationError({"detail": "Cannot deactivate the last active admin."})
        employee.is_active = not employee.is_active
        employee.save(update_fields=["is_active"])
        return {"id": str(employee.id), "is_active": employee.is_active}

    # ── bank ─────────────────────────────────────────────────────────────
    @staticmethod
    def bank_payload(bd):
        return {
            "account_number": bd.account_number,
            "bank_name": bd.bank_name,
            "ifsc_code": bd.ifsc_code,
            "pan_no": bd.pan_no,
            "uan_no": bd.uan_no,
            "updated_at": bd.updated_at,
        }

    def get_bank(self, employee):
        bd = BankDetail.objects.filter(employee=employee).first()
        return self.bank_payload(bd) if bd else None

    def upsert_bank(self, employee, data):
        bd, _ = BankDetail.objects.update_or_create(employee=employee, defaults=data)
        return self.bank_payload(bd)

    # ── resume ───────────────────────────────────────────────────────────
    def create_skill(self, employee, data):
        name = data["name"].strip()
        if Skill.objects.filter(employee=employee, name__iexact=name).exists():
            raise ValidationError({"name": ["This skill already exists."]})
        skill = Skill.objects.create(employee=employee, name=name)
        return {"id": str(skill.id), "name": skill.name}

    @staticmethod
    def certification_payload(c):
        return {
            "id": str(c.id),
            "name": c.name,
            "issuer": c.issuer,
            "issue_date": c.issue_date,
            "expiry_date": c.expiry_date,
            "certificate_file": c.certificate_file.url if c.certificate_file else None,
            "uploaded_at": c.uploaded_at,
        }

    def create_certification(self, employee, data):
        cert = Certification.objects.create(employee=employee, **data)
        return self.certification_payload(cert)

    @staticmethod
    def document_payload(d):
        return {
            "id": str(d.id),
            "doc_type": d.doc_type,
            "doc_type_display": d.get_doc_type_display(),
            "title": d.title,
            "file": d.file.url,
            "uploaded_by": d.uploaded_by.full_name if d.uploaded_by else None,
            "uploaded_at": d.uploaded_at,
        }

    def upload_document(self, actor, employee, data):
        doc = Document.objects.create(employee=employee, uploaded_by=actor, **data)
        return self.document_payload(doc)


employee_service = EmployeeService()