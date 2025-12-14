from flask import request, jsonify
from . import appointment_bp
from app.services.appointment_service import AppointmentService
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt 
from app.utils.decorators import role_required 
import logging
from app.utils.errors import BusinessError, NotFoundError

# --- ROUTE LẤY DANH SÁCH CHUYÊN VIÊN ---
@appointment_bp.route('/counselors', methods=['GET'])
def get_counselors():
    """Lấy danh sách các chuyên viên tư vấn."""
    counselors = AppointmentService.get_available_counselors()
    return jsonify(counselors), 200

# Thiết lập logger
logger = logging.getLogger(__name__)

# [1] Xử lý GET: Lấy danh sách lịch hẹn 
@appointment_bp.route('/', methods=['GET'])
@jwt_required()
def get_my_appointments():
    current_user_id = int(get_jwt_identity())
    try:
        current_user_role = get_jwt()['role']
    except Exception:
        return jsonify({"msg": "Token không hợp lệ hoặc thiếu claim role"}), 401

    # Query params
    page = request.args.get('page', default=1, type=int)
    limit = request.args.get('limit', default=10, type=int)

    try:
        result = AppointmentService.get_appointments_by_role(
            user_id=current_user_id,
            role=current_user_role,
            page=page,
            limit=limit
        )
        return jsonify(result), 200
    except Exception:
        return jsonify({
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "Lỗi hệ thống khi tải lịch hẹn."
        }), 500

# [2] Xử lý POST: Đặt lịch hẹn mới
@appointment_bp.route('/', methods=['POST'])
@jwt_required()
@role_required('user')
def book_appointment():
    data = request.get_json()
    current_user_id = int(get_jwt_identity())

    required_fields = ['counselor_user_id', 'start_time', 'reason']
    if not all(field in data for field in required_fields):
        return jsonify({"msg": "Thiếu các trường bắt buộc"}), 400

    try:
        result = AppointmentService.create_appointment(
            user_id=current_user_id,
            counselor_user_id=data['counselor_user_id'],
            start_time_str=data['start_time'],
            reason=data['reason']
        )
        return jsonify({
            "message": "Đã gửi yêu cầu hẹn lịch thành công",
            "data": result
        }), 201

    except BusinessError as e:
        return jsonify({
            "error_code": e.error_code,
            "message": e.message
        }), 400

    except NotFoundError as e:
        return jsonify({
            "error_code": e.error_code,
            "message": e.message
        }), 404

    except Exception:
        return jsonify({
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "Lỗi hệ thống."
        }), 500



# --- ROUTE CẬP NHẬT TRẠNG THÁI ---
@appointment_bp.route('/<int:appointment_id>/status', methods=['POST'])
@jwt_required()
@role_required(['admin', 'counselor'])
def update_appointment_status(appointment_id):
    data = request.get_json()
    status = data.get('status')

    if status not in ['pending', 'confirmed', 'canceled', 'completed']:
        return jsonify({"msg": "Trạng thái không hợp lệ"}), 400

    current_user_id = int(get_jwt_identity())
    current_role = get_jwt().get('role')

    try:
        updated_appointment = AppointmentService.update_status(
            appointment_id=appointment_id,
            new_status=status,
            current_user_id=current_user_id,
            role=current_role
        )
        return jsonify({
            "data": updated_appointment
        }), 200

    except BusinessError as e:
        return jsonify({
            "error_code": e.error_code,
            "message": e.message
        }), 400

    except NotFoundError as e:
        return jsonify({
            "error_code": e.error_code,
            "message": e.message
        }), 404

    except Exception:
        return jsonify({
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "Lỗi hệ thống."
        }), 500
