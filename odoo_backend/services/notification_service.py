import logging

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def send_email(subject, message, recipient_list, html_message=None):
    """Fire-and-forget email wrapper — never raises into request flow."""
    if not recipient_list:
        return False
    try:
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL,
                  recipient_list, html_message=html_message, fail_silently=False)
        return True
    except Exception as exc:
        logger.error(f"Email send failed to {recipient_list}: {exc}")
        return False