import uuid

from common.logging_context import clear_log_context, update_log_context


class RequestIDMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request_id = uuid.uuid4().hex[:12]
        request.request_id = request_id
        clear_log_context()
        update_log_context(request_id=request_id)
        response = self.get_response(request)
        response["X-Request-ID"] = request_id
        clear_log_context()
        return response