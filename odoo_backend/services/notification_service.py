import logging

from django.conf import settings
from django.core.mail import EmailMessage

logger = logging.getLogger(__name__)


def send_email(subject, message, recipient_list, html_message=None, attachments=None):
    """attachments: list of (filename, bytes/content, mimetype). Never raises."""
    if not recipient_list:
        return False
    try:
        mail = EmailMessage(subject=subject, body=message,
                            from_email=settings.DEFAULT_FROM_EMAIL, to=recipient_list)
        if html_message:
            mail.content_subtype = "html"
            mail.body = html_message
        for item in (attachments or []):
            mail.attach(*item)
        mail.send(fail_silently=False)
        return True
    except Exception as exc:
        logger.error(f"Email send failed to {recipient_list}: {exc}")
        return False