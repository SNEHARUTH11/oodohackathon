import logging

from rest_framework.exceptions import AuthenticationFailed, ValidationError
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import User

logger = logging.getLogger(__name__)


class AuthService:

    # ── tokens ────────────────────────────────────────────────────────
    def issue_tokens(self, user):
        refresh = RefreshToken.for_user(user)
        return {"refresh": str(refresh), "access": str(refresh.access_token)}

    def user_payload(self, user):
        return {
            "id": str(user.id),
            "login_id": user.login_id,
            "name": user.full_name,
            "email": user.email,
            "role": user.role,
            "profile_picture": user.profile_picture.url if user.profile_picture else None,
            "must_change_password": user.must_change_password,
        }

    def _blacklist_all_sessions(self, user):
        for token in OutstandingToken.objects.filter(user=user):
            BlacklistedToken.objects.get_or_create(token=token)

    # ── flows ─────────────────────────────────────────────────────────
    def login(self, identifier, password):
        identifier = (identifier or "").strip()
        user = (User.objects.filter(email__iexact=identifier).first()
                or User.objects.filter(login_id__iexact=identifier).first())
        if user is None or not user.check_password(password):
            raise AuthenticationFailed("Invalid credentials. Check your email/Login ID and password.")
        if not user.is_active:
            raise AuthenticationFailed("Your account has been deactivated. Contact your HR admin.")
        logger.info(f"Login success: {user.login_id} ({user.role})")
        return {"tokens": self.issue_tokens(user), "user": self.user_payload(user)}

    def logout(self, refresh_str):
        try:
            RefreshToken(refresh_str).blacklist()
        except TokenError:
            raise ValidationError({"refresh": ["Invalid or expired refresh token."]})
        logger.info("Logout: refresh token blacklisted")
        return True

    def change_password(self, user, data):
        if not user.check_password(data["current_password"]):
            raise ValidationError({"current_password": ["Current password is incorrect."]})
        user.set_password(data["new_password"])
        user.must_change_password = False
        user.save(update_fields=["password", "must_change_password"])
        self._blacklist_all_sessions(user)   # kill every other session…
        tokens = self.issue_tokens(user)     # …but hand this session fresh tokens
        logger.info(f"Password changed for {user.login_id}")
        return {"tokens": tokens, "user": self.user_payload(user)}


auth_service = AuthService()