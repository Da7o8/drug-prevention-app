from flask import request, jsonify
from . import auth_bp
from app.services.user_service import UserService
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.decorators import role_required

@auth_bp.route('/register', methods=['POST'])
def register():
    """Endpoint Đăng ký Người dùng Mới."""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    target_role = data.get('role_name', 'user')

    if not email or not password:
        return jsonify({"msg": "Thiếu email hoặc mật khẩu"}), 400
    
    try:
        user = UserService.register_user(email, password, name=name, role_name=target_role)
        return jsonify({
            "msg": "Đăng ký thành công", 
            "user_id": user.id, 
            "email": user.email
        }), 201
    except ValueError as e:
        return jsonify({"msg": str(e)}), 409 # Conflict
    except Exception as e:
        return jsonify({"msg": "Lỗi hệ thống", "error": str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Endpoint Đăng nhập và tạo JWT."""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"msg": "Thiếu email hoặc mật khẩu"}), 400

    try:
        auth_data = UserService.authenticate_user(email, password)
        # Trả về token và thông tin cơ bản
        return jsonify(auth_data), 200
    except ValueError as e:
        return jsonify({"msg": str(e)}), 401 # Unauthorized

@auth_bp.route('/profile', methods=['GET'])
@jwt_required() # Yêu cầu JWT hợp lệ để truy cập
def get_profile():
    """Endpoint Lấy thông tin hồ sơ (Cần JWT)."""
    current_user_id = get_jwt_identity()
    # Logic lấy thông tin người dùng từ DB dựa trên current_user_id
    
    return jsonify({
        "msg": "Truy cập thành công",
        "user_id": current_user_id
    }), 200

@auth_bp.route('/counselor-profile', methods=['POST'])
@jwt_required()
@role_required(['admin'])
# TODO: Thêm check role Admin/Counselor ở đây
def update_counselor_profile():
    data = request.get_json()
    required_fields = ['user_id', 'specialization', 'qualifications', 'contact_info']
    if not all(field in data for field in required_fields):
        return jsonify({"msg": "Thiếu các trường bắt buộc"}), 400

    try:
        profile = UserService.update_counselor_profile(
            data['user_id'],
            data['specialization'],
            data['qualifications'],
            data['contact_info']
        )
        return jsonify({"msg": "Cập nhật hồ sơ chuyên viên thành công", "profile": profile}), 200
    except ValueError as e:
        return jsonify({"msg": str(e)}), 400
    except Exception as e:
        return jsonify({"msg": "Lỗi hệ thống", "error": str(e)}), 500