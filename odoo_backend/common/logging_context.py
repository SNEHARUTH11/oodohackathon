import threading

_local = threading.local()


def update_log_context(**kwargs):
    if not hasattr(_local, "context"):
        _local.context = {}
    _local.context.update(kwargs)


def clear_log_context():
    _local.context = {}


def get_log_context():
    return getattr(_local, "context", {})


class LoggingContextFilter:
    """Injects request/user context into every log record."""

    def filter(self, record):
        ctx = get_log_context()
        record.request_id = ctx.get("request_id", "-")
        record.user_id = ctx.get("user_id", "-")
        record.login_id = ctx.get("login_id", "-")
        record.role = ctx.get("role", "-")
        return True