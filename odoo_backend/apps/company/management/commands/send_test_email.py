from django.core.management.base import BaseCommand

from services.notification_service import send_email


class Command(BaseCommand):
    help = "Sends a test email through the configured backend."

    def add_arguments(self, parser):
        parser.add_argument("--to", type=str, required=True, help="Recipient address")

    def handle(self, *args, **options):
        ok = send_email(
            subject="Dayflow SMTP test",
            message="If you can read this, Gmail integration works.",
            recipient_list=[options["to"]],
        )
        self.stdout.write(self.style.SUCCESS("✔ Sent") if ok
                          else self.style.ERROR("✖ Failed — check logs"))