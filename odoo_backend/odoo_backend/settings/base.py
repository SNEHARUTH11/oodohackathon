from datetime import timedelta
from pathlib import Path

import environ

BASE_DIR = Path(__file__).resolve().parent.parent.parent
env = environ.Env(
    DEBUG=(bool, False),
    ALLOWED_HOSTS=(list, []),
    CORS_ALLOWED_ORIGINS=(list, []),
    FRONTEND_URL=(str, "http://localhost:5173"),
)
environ.Env.read_env(BASE_DIR / ".env")

SECRET_KEY = env("SECRET_KEY", default="insecure-dev-key-change-me")
DEBUG = env("DEBUG")
ALLOWED_HOSTS = env("ALLOWED_HOSTS")

DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]
THIRD_PARTY_APPS = [
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
]
LOCAL_APPS = [
    "apps.accounts",
    "apps.company",
    "apps.employees",
    "apps.attendance",
    "apps.leaves",
    "apps.payroll",
    "apps.notifications",
]
INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "common.middleware.RequestIDMiddleware",
]

ROOT_URLCONF = "odoo_backend.urls"
WSGI_APPLICATION = "odoo_backend.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

DATABASES = {
    "default": env.db("DATABASE_URL", default="postgres://odoo_db:odoo123456@13.203.169.251:5432/odoo_db_hrms"),
}
DATABASES["default"]["CONN_MAX_AGE"] = env.int("DB_CONN_MAX_AGE", default=60)       # reuse connections
DATABASES["default"]["CONN_HEALTH_CHECKS"] = True                                    # stale-conn safety

# ── Auth ─────────────────────────────────────────────────────────────
AUTH_USER_MODEL = "accounts.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "common.validators.PasswordPolicyValidator"},
]

# ── DRF ──────────────────────────────────────────────────────────────
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_PAGINATION_CLASS": "common.pagination.DefaultPagination",
    "PAGE_SIZE": 20,
    "EXCEPTION_HANDLER": "common.exception_handler.custom_exception_handler",
    "DEFAULT_THROTTLE_RATES": {"anon": "30/min"},
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# ── i18n / tz ────────────────────────────────────────────────────────
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"          # always store UTC; company tz (default Asia/Kolkata) applied in logic
USE_I18N = True
USE_TZ = True

# ── Static / media ───────────────────────────────────────────────────
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ── CORS (React/Vite frontend) ───────────────────────────────────────
CORS_ALLOWED_ORIGINS = env("CORS_ALLOWED_ORIGINS")
CORS_ALLOW_CREDENTIALS = True
FRONTEND_URL = env("FRONTEND_URL")

# ── Email ────────────────────────────────────────────────────────────
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", default="Dayflow HRMS <mrbrainophile@gmail.com>")

if env("EMAIL_HOST", default=""):
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    EMAIL_HOST = env("EMAIL_HOST")
    EMAIL_PORT = env.int("EMAIL_PORT", default=587)
    EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="")
    EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default="")
    EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)
else:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"   # fallback: prints to console

# ── Logging (request-id + user context on every line) ────────────────
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "filters": {"context": {"()": "common.logging_context.LoggingContextFilter"}},
    "formatters": {
        "standard": {
            "format": "%(asctime)s %(levelname)-7s [%(request_id)s] user=%(user_id)s %(name)s: %(message)s"
        },
    },
    "handlers": {
        "console": {"class": "logging.StreamHandler", "formatter": "standard", "filters": ["context"]},
    },
    "root": {"handlers": ["console"], "level": "INFO"},
}
DEMO_TEMP_PASSWORD = env("DEMO_TEMP_PASSWORD", default="")
