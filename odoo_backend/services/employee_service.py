import logging

from django.contrib.auth import get_user_model

logger = logging.getLogger(__name__)


def _safe_part(s, n=2):
    return (s or "").strip().upper()[:n].ljust(n, "X")


def generate_login_id(company, full_name, joining_year):
    """
    Format: [PREFIX][F2 of first name][F2 of last name][year][serial 4 digits]
    e.g. Oaloo India / John Doe / 2022 → OIJODO20220001
    Serial increments within the (prefix+initials+year) group. Collision-safe.
    """
    User = get_user_model()
    parts = (full_name or "").strip().split(" ", 1)
    stem = f"{(company.prefix or 'DF').upper()}{_safe_part(parts[0])}" \
           f"{_safe_part(parts[1] if len(parts) > 1 else '')}{joining_year}"
    serial = 0
    for lid in User.objects.filter(login_id__startswith=stem).values_list("login_id", flat=True):
        try:
            serial = max(serial, int(lid[-4:]))
        except ValueError:
            continue
    return f"{stem}{serial + 1:04d}"