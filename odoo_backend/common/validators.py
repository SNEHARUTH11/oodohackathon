from django.core.exceptions import ValidationError


class PasswordPolicyValidator:
    """Min 8 chars, upper + lower + digit + symbol. Usable in
    AUTH_PASSWORD_VALIDATORS and manual serializer validation."""

    def validate(self, password, user=None):
        problems = []
        if len(password) < 8:
            problems.append("at least 8 characters")
        if not any(c.isupper() for c in password):
            problems.append("an uppercase letter")
        if not any(c.islower() for c in password):
            problems.append("a lowercase letter")
        if not any(c.isdigit() for c in password):
            problems.append("a digit")
        if not any(not c.isalnum() for c in password):
            problems.append("a symbol")
        if problems:
            raise ValidationError(f"Password must contain {', '.join(problems)}.")

    def get_help_text(self):
        return "Minimum 8 characters with uppercase, lowercase, digit and symbol."


def validate_password_policy(password):
    PasswordPolicyValidator().validate(password)