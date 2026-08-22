import json
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from services.config_service import load_config, seed_onboarding


class Command(BaseCommand):
    help = "Idempotently seeds company, config, holidays and first admin from onboarding config."

    def add_arguments(self, parser):
        parser.add_argument("--config", type=str, default=None,
                            help="Path to onboarding JSON (default: config/onboarding/default.json)")

    def handle(self, *args, **options):
        path = Path(options["config"] or settings.BASE_DIR / "config" / "onboarding" / "default.json")
        config = load_config(path)
        summary = seed_onboarding(config)

        self.stdout.write(self.style.SUCCESS(f"✔ Company   : {summary['company']} "
                                             f"({'created' if summary['company_created'] else 'already existed'})"))
        self.stdout.write(self.style.SUCCESS(f"✔ Config    : updated"))
        self.stdout.write(self.style.SUCCESS(f"✔ Holidays  : {summary['holidays_created']} new added"))
        self.stdout.write(self.style.SUCCESS(f"✔ Admin     : {summary['admin_email']} "
                                             f"(login_id: {summary['admin_login_id']}, "
                                             f"{'created' if summary['admin_created'] else 'already existed'})"))
        if summary.get("admin_temp_password"):
            self.stdout.write(self.style.WARNING(
                f"⚠ Admin temp password: {summary['admin_temp_password']}  "
                f"(must change on first login — copy it now, it is not stored)"
            ))