import calendar
from datetime import date, timedelta
from zoneinfo import ZoneInfo


def company_today(timezone_str="Asia/Kolkata"):
    """Current date in the company's timezone (DB stores UTC)."""
    from django.utils import timezone as dj_tz
    return dj_tz.now().astimezone(ZoneInfo(timezone_str)).date()


def month_date_range(year, month):
    last = calendar.monthrange(year, month)[1]
    return date(year, month, 1), date(year, month, last)


def weekdays_in_month(year, month, weekdays):
    """Count of days whose isoweekday (Mon=1..Sun=7) is in `weekdays`."""
    start, end = month_date_range(year, month)
    count, d, step = 0, start, timedelta(days=1)
    while d <= end:
        if d.isoweekday() in weekdays:
            count += 1
        d += step
    return count