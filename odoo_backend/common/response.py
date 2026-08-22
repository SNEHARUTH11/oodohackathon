def success_response(data=None, message="Success", code=200):
    return {"success": True, "code": code, "message": message, "data": data}


def error_response(message="Something went wrong", errors=None, code=400):
    return {"success": False, "code": code, "message": message, "errors": errors}