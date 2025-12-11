from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt, verify_jwt_in_request

def role_required(required_roles):
    """
    Decorator tùy chỉnh yêu cầu vai trò người dùng cụ thể.
    @role_required(['admin', 'counselor'])
    """
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            # 1. Xác minh JWT
            try:
                verify_jwt_in_request()
            except Exception:
                return jsonify(msg="Thiếu hoặc Token không hợp lệ"), 401

            # 2. Lấy Claims và Role
            claims = get_jwt()
            user_role = claims.get("role")

            # 3. Kiểm tra vai trò
            if user_role not in required_roles:
                return jsonify(msg="Truy cập bị từ chối: Không có quyền"), 403

            return fn(*args, **kwargs)
        return decorator
    return wrapper