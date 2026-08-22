import logging

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

from common.response import error_response

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    response = drf_exception_handler(exc, context)

    if response is not None:
        data = response.data
        # Single "detail" errors (auth, 404, 403...) → message only
        if isinstance(data, dict) and set(data.keys()) == {"detail"}:
            message = str(data["detail"])
            errors = None
        else:
            message = "Validation failed" if response.status_code == 400 else "Request failed"
            errors = data
        response.data = error_response(message=message, errors=errors, code=response.status_code)
        return response

    logger.error("Unhandled exception", exc_info=True)
    return Response(
        error_response(message="Internal server error", code=500),
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )